import { red, bold, italic, yellow } from 'picocolors'


import { objectIsEmpty, optimizedSplit , contains} from './utils'

import { CliArgSet, CliArg, CliCmdSet, CliCmd, CliParserOptions, CliError, CliContext, CliFinal, Obj, CliArgParam, CliFunc } from "./declare"

class CliParser {

    protected commands: Obj<CliCmd> = {}
    protected arguments: Obj<CliArg> = {}

    protected errors: CliError[] = []

    protected _ctx: CliContext | null = null

    protected options: CliParserOptions

    protected argv: string[] = []
    
    constructor(public name: string, public description: string, options: CliParserOptions = {}) {

        this.options = {defaultArg: true, ...options}

        if (this.options.defaultArg) {
            this.addArgument('help', {
                alias: 'h',
                description: 'Prints help information',
                call({ parser }) {
                    parser.usage()                
                }
            })
            if (this.options.version) {
                this.addArgument('version', {
                    alias: 'v',
                    description: 'Print version info and exit',
                    call({ options, name }) {
                        console.info(`${name} ${options.version}`)
                    }
                })
            }
        }
    }

    checkArguments(choices: Obj<CliArg>, arg: CliArg) {

                
        if (arg.name in this.arguments) {
            throw new Error(`duplicate options '${arg.name}'`)
        } else if (arg.name.length < 2) {
            throw new Error(`name arguments '${arg.name}' need to be upper than one char`)
        } else if (this.options.inline && contains(arg.name, '=')) {
            throw new Error(`name arguments '${arg.name}' can't contains '${yellow('=')}' in here name`)
        }

        // set empty params
        if (!arg.params) {
            arg.params = []
        }

        const alias = arg.alias
        if (alias) {

            // merge alias with arguments
            if (choices[alias] !== undefined) {
                throw new Error(`duplicate alias options '${alias}`)
            }
            if (alias.length != 1) {
                throw new Error(`alias options '${alias}' need to be only one char`)
            }
            choices[alias] = arg
        }
    }

    addArgument(name: string, arg: CliArgSet = {}) {

        // convert to CliArg
        const targ = arg as CliArg
        targ.name = name
    
        // check 
        this.checkArguments(this.arguments, targ)
        
        // add to global
        this.arguments[name] = targ

    }

    addCommand(name: string, description: string, cmd: CliCmdSet = {}) {

        if (name in this.commands) {
            throw new Error(`Command '${name}' already set`)
        }

        // convert
        const tcmd = cmd as CliCmd

        // asign
        tcmd.name = name
        tcmd.description = description

        //add global
        
        if (!cmd.arguments) {
            tcmd.arguments = {}
        } else {
            // set empty params
            const args = { ...tcmd.arguments }
            
            for (const key in cmd.arguments) {
                tcmd.arguments[key].name = key
                this.checkArguments(args, tcmd.arguments[key])
            }
            tcmd.arguments = args
        }
        
        this.commands[name] = tcmd
    }

    checkDefault(arg: CliArg, param: CliArgParam): any {
        if (param.default !== undefined)
            return param.default
        throw new Error(`need ${yellow(arg.params.length)} arguments after flag '${yellow(arg.name)}'.`)
    }

    checkValue(allParams: any[], param: CliArgParam, value: string): any {
        if (param.validator) {
            return param.validator(value, allParams)
        }

        switch (param.type) {
            // number type
            case Number: {
                const num = Number(value)
                if (Number.isNaN(num)) {
                    throw new Error(`need a valid ${italic(yellow('number'))}.`)
                }
                return num
            }
            // boolean type
            case Boolean: {

                switch (value) {
                    case "true":
                    case "yes": {
                        return true
                    }
                    case "false":
                    case "no": {
                        return false
                    }
                    default: {
                        throw new Error(`boolean type, choise are '${yellow('true')}' or '${yellow('true')}'`)
                    }
                }
            }
            default: {
                return value
            }
        }
    }

    advFlagInline(argv: string[], index: number, choices: Obj<CliArg>, cliArgs: CliFinal, _spliter: string[]): number {
        const arg = choices[_spliter[0]]

        const allParams : any[] = []

        cliArgs[arg.name] = allParams
        if (arg.alias) {
            cliArgs[arg.alias] = allParams
        }

        if (_spliter.length != 2) {
            this.errors.push({
                text: `invalid formating flag, need to be '${yellow('flag')}=${yellow('value')}(${yellow(',value...')})'`,
                argvi: index,
                start: 2
            })
            return index + 1
        }

        const subArgv = optimizedSplit(_spliter[1], ',')
        if (subArgv.length > arg.params.length) {
            this.errors.push({
                text: `need ${yellow(arg.params.length)} arguments after flag '${yellow(`--${arg.name}`)}'.`,
                argvi: index,
                start: _spliter[0].length + 2,
            })
            return index + 1
        }

        let start = 2 + arg.name.length + 1
        for (let i = 0; i < arg.params.length; i++) {

            const param = arg.params[i]
            const isOverFlow = (i >= subArgv.length)

            try {
                if (isOverFlow)
                    allParams.push(this.checkDefault(arg, param))
                else
                    allParams.push(this.checkValue(allParams, param, subArgv[i]))
            } catch (e: any) {
                this.errors.push({
                    text: `invalid arugments for flag '${yellow(arg.name)}', ${e.message}`,
                    argvi: index,
                    start: start,
                    end: (isOverFlow) ? 0 : subArgv[i].length
                })
            } finally {
                if (!isOverFlow) {
                    start += subArgv[i].length + 1
                }
            }
        }
        return index + 1
    }

    advFlag(argv: string[], index: number, cliArgs: CliFinal, arg: CliArg, match: string): number {
        const allParams : any[]= []

        cliArgs[arg.name] = allParams
        if (arg.alias) {
            cliArgs[arg.alias] = allParams
        }

        index++

        if (!arg.params.length) {
            return index
        }

        let undef = 0
        for (let i = 0; i < arg.params.length; i++) {

            const param = arg.params[i]
            const isOverFlow = (index + i) >= argv.length
            const isFlag = !isOverFlow && argv[index + i][0] === '-' || false

            try {
                if (isFlag) {
                    undef++
                    allParams.push(this.checkDefault(arg, param))
                }
                else if (isOverFlow)
                    allParams.push(this.checkDefault(arg, param))
                else
                    allParams.push(this.checkValue(allParams, param, argv[index + i]))
            } catch (e: any) {
                this.errors.push({
                    text: `invalid arugments for flag '${yellow(match)}', ${e.message}`,
                    argvi: index,
                })
                return index
            }

        }
        return index + arg.params.length - undef
    }

    parseFlags(argv: string[], choices: Obj<CliArg>, start = 0): [CliFinal, string[]] {
        const flags: CliFinal = {}
        const anyArgs: string[] = []
        
        const stopVal = this.options.stopFlags

        while (start < argv.length) {
            const val = argv[start]

            if (argv[start] === stopVal) {
                start++
                break
            }

            if (val[0] != '-')
            {
                anyArgs.push(val)
                start++
            }
            else if (val[1] == '-')
            {
                if (val.length != 2)
                {
                    const name = val.substring(2)
                    
                    // split for falg key=value,value...
                    let spliter
                    if (this.options.inline) {
                        spliter = optimizedSplit(name, '=')
                    } else {
                        spliter = [name]
                    }
                    if (choices[spliter[0]] !== undefined)
                    {
                        if (!this.options.inline || spliter.length == 1) {
                            start = this.advFlag(argv, start, flags, choices[name], name)
                        } else {
                            start = this.advFlagInline(argv, start, choices, flags, spliter)
                        }
                    }
                    else
                    {
                        this.errors.push({
                            text: `Found argument '${yellow(`--${name}`)}' which wasn't expected, or isn't valid in this context.`,
                            argvi: start++,
                            start: 2,
                            end: val.length - 2
                        })
                    }
                }
                else
                {
                    this.errors.push({
                        text: `Empty argument '${yellow('--')}' which wasn't expected.`,
                        argvi: start++,
                        start: 2,
                        end: val.length - 2
                    })
                }
            }
            else if (val.length != 1)
            {
                // simple
                let memStart = start
                for (let i = 1; i <= val.length - 1; i++)
                {
                    const value = choices[val[i]]
                    if (value !== undefined)
                    {
                        memStart = this.advFlag(argv, memStart, flags, value, val[i])
                    }
                    else
                    {
                        this.errors.push({
                            text: `Found argument '${yellow(`-${value}`)}' which wasn't expected, or isn't valid in this context.`,
                            argvi: start,
                            start: i,
                            end: 1
                        })
                    }
                }
                start = (memStart === start ? start + 1 : memStart)

            }
            else
            {
                this.errors.push({
                    text: `Empty argument '${yellow('-')}' which wasn't expected.`,
                    argvi: start++
                })
            }
        }
        // add all arguments after stopFlag
        while (start < argv.length) {
            anyArgs.push(argv[start++])
        }

        return [flags, anyArgs]
    }

    parseCommand(argv: string[]): boolean {
        if (argv[0] in this.commands) {
            const cmd = this.commands[argv[0]]
        
            // merge global options with cmd options
            const args = {...this.arguments, ...cmd.arguments}

            // change usage function to command usage
            if (args.help) {
                args.help.call = ({ parser, cmd }) => {
                    if (cmd) {
                        parser.commandUsage(cmd)
                    }
                }
            }

            //parse options
            const [flags, anyArgs] = this.parseFlags(argv, args, 1)

            const ctx = this._createContext(flags, anyArgs, cmd)

            if (this.errors.length) {
                return false
            }
            const callFalg = this._getCallFlag(flags, args)
            if (callFalg) {
                callFalg(ctx)
            }
            else if (cmd.call) {
                cmd.call(ctx)
            }
            return true
        }
        else {
            this.errors.push({ text: `no such subcommand: '${yellow(argv[0])}''`, argvi: 0})
        }
        return false
    }

    parseArguments(argv: string[]): boolean {

        //parse options
        const [flags, anyArgs] = this.parseFlags(argv, this.arguments, 0)
        
        const ctx = this._createContext(flags, anyArgs,)
        
        if (this.errors.length) {
            return false
        }
        
        const call = this._getCallFlag(flags, this.arguments)
        if (call) {
            call(ctx)
        }
        return true
    }

    parse(argv: string[]): boolean {
        this.argv = argv
        if (argv.length == 0) {
            this.usage()
            return true
        }
        // check first arguments
        else if (argv[0][0] !== '-' && !objectIsEmpty(this.commands)) {
            return this.parseCommand(argv)
        }
        return this.parseArguments(argv)
    }

    _getCallFlag(flags: CliFinal, args: Obj<CliArg>): CliFunc | null {

        for (const key in flags) {
            const call = args[key].call
            if (call) {
                return call
            }
        }
        return null
    }

    get context(): CliContext {
        if (!this._ctx) {
            throw new Error("You need to call 'parse' before access context")
        }
        return this._ctx
    }

    _createContext(flags: CliFinal, anyArgs: string[], cmd: CliCmd | null = null): CliContext {
        const ctx: CliContext = {
            flags,
            anyArgs,
            parser: this,
            name: this.name,
            description: this.description,
            options: this.options,
            argv: this.argv
        }
        if (cmd) {
            ctx.cmd = cmd
        }
        this._ctx = ctx
        return ctx
    }

    //------------------------------------------
    //      utils
    //------------------------------------------

    // format

    printError(max: number | null = null) {
        
        const argv = this.argv
        const argvLine = argv.join(' ') + "\n"

        let errors = this.errors
        if (max !== null) {
            errors = [...this.errors].splice(0, max)
        }
        
        let str = ""
        errors.forEach(err => {
            str += `${red(bold('error'))}: ${err.text}\n`
            
            if (err.argvi !== undefined) {

                // calcul padding spaces
                str += argvLine
                let spaces = err.argvi
                for (let i = 0;i < err.argvi; i++) {
                    spaces += argv[i].length
                }
                
                str += " ".repeat(spaces)

                // generate arrow
                const len = argv[err.argvi]?.length || 1
                if (err.start === undefined) {
                    err.start = 0
                }
                if (err.end === undefined) {
                    err.end = len - err.start
                }
                str += red("~".repeat(err.start)) + red(bold("^".repeat(err.end)))
                const end = len - (err.start + err.end)
                if (end > 0) {
                    str += red("~".repeat(end))
                }
                
                str += '\n'
            }
        })
        if (this.errors.length >= 5) {
            str += `total errors: ${red(bold(this.errors.length))}`
        }
        console.error(str)
    }

    // formating
    protected formatOptions(options: Obj<CliArg>, prefix = "Options:"): string {
        
        // remove alais from command
        const nopt: Obj<CliArg> = {}
        for (const key in options) {
            nopt[options[key].name] = options[key]
        }
        
        const mem: Obj<number> = {}
        
        // calcul padding space
        let padding = 0
        for (const key in nopt) {

            const opt = nopt[key]
            mem[key] = key.length
            if (opt.params && opt.params.length) {
                // 3 === prefix and sufix "<>" and 1 space
                mem[key] += opt.params.reduce((c, p) => c + p.type.name.length + 3, 0)
            }
            padding = Math.max(padding, mem[key])
        }

        let str = prefix + '\n'

        for (const key in nopt) {
            const opt = nopt[key]

            str += (opt.alias ? `-${opt.alias}, ` : '    ')
            str += `--${key} `
            if (opt.params) {
                str += opt.params.reduce((s, p) => `${s}<${p.type.name.toLowerCase()}> `, "")
            }
            // space padding 
            str += " ".repeat(padding - mem[key] + 1)
            str += opt.description ?? italic("no information.")
            str += '\n'
        }
        return str
    }

    protected formatCommands(cmds: Obj<CliCmd>): string {
        let padding = 0
        for (const key in cmds) {
            padding =  Math.max(padding, key.length)
        }

        let str = "Management Commands:\n"
        for (const key in cmds) {
            str += `  ${key}${" ".repeat(padding - key.length)} ${cmds[key].description}\n`
        }
        return str
    }

    commandUsage(cmd: CliCmd | string) {

        if (typeof cmd === "string") {
            const tcmd = this.commands[cmd]
            if (!tcmd) {
                throw new Error(`'${cmd}' not found in commands`)
            }
            cmd = tcmd
        }

        let str = ""

        str += `Usage: ${this.name} ${cmd.name} `
        if (this.options.info) {
            str += this.options.info
        } else {
            str += `[OPTIONS]\n\n`
        }
        str += cmd.description
        if (this.arguments) {
            str += '\n\n' + this.formatOptions(this.arguments, "Global options:")
        }
        if (cmd.arguments) {
            str += '\n\n' + this.formatOptions(cmd.arguments, "Command options:")
        }
        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.log(str)
    }


    usage() {
        let str = ""

        // check if command and arguments exists, is more optimized to use this otherwise Object.key
        const haveCommand = !objectIsEmpty(this.commands)
        const haveArguments = !objectIsEmpty(this.arguments)

        str += `Usage: ${this.name} `
        if (this.options.info) {
            str += this.options.info
        } else {
            str += `[OPTIONS] ${haveCommand? "COMMAND" : ""}\n\n`
        }
        str += this.description
        if (haveArguments) {
            str += '\n\n' + this.formatOptions(this.arguments)
        }
        if (haveCommand) {
            str += '\n\n' + this.formatCommands(this.commands)
        }

        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.info(str)
    }


}

export default  CliParser