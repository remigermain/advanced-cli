import { red, bold, italic, yellow } from 'colorette'
import { objectIsEmpty, objectLength } from './utils'

import { CliArgSet, CliArg, CliCmdSet, CliCmd, CliParserOptions, CliError, CliContext, CliFinal, Obj } from "./declare"

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

    checkAlias(choices: Obj<CliArg>, arg: CliArg) {

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
        
        if (name in this.arguments) {
            throw new Error(`duplicate options '${name}'`)
        } else if (name.length < 2) {
            throw new Error(`name arguments '${name}' need to be upper than one char`)
        }

        // convert to CliArg
        const targ = arg as CliArg
        targ.name = name
    
        // add to global
        this.arguments[name] = targ

        // check 
        this.checkAlias(this.arguments, targ)

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
        this.commands[name] = tcmd

        if (!cmd.arguments) {
            tcmd.arguments = {}
        } else {
            // set empty params
            const args = { ...tcmd.arguments } as Obj<CliArg>

            for (const key in cmd.arguments) {
                this.checkAlias(args, tcmd.arguments[key] as CliArg)
                tcmd.arguments[key].name = key
            }
            tcmd.arguments = args
        }
    }

    protected convertType(type: any, value: string): string | boolean | number {

        if (type === Number) {
            const n = Number(value)
            if (Number.isNaN(n)) {
                throw new Error("nedd valid number.")
            }
            return n
        } else if (type === Boolean) {
            switch (value) {
                case "true":
                case "yes":
                    return true
                case "false":
                case "no":
                    return false
                default:
                    throw new Error("boolean type, choise are 'true' or 'false'")
            }
        } else  {
            return value
        }
    }

    advFlag(argv: string[], index: number, choices: Obj<CliArg>, cliArgs: CliFinal, name: string): number {
        const info : any[]= []
        const arg: CliArg = choices[name]

        cliArgs[name] = info
        if (arg.alias) {
            cliArgs[arg.alias] = info
        }

        if (!arg.params || !arg.params.length) {
            return index + 1
        }
        
        let i = 0
        for (; i < arg.params.length; i++) {
            const param = arg.params[i]
            if ((index + i) >= argv.length)
            {
                if (param.default !== undefined)
                {
                    info.push(param.default)
                }
                else
                {
                    this.errors.push({
                        text: `need ${yellow(arg.params.length)} arguments after flag '${name}'.`,
                        argvi: index + i
                    })
                }
            }
            else
            {
                const value = argv[index + i]
                try {
                    if (param.validator) {
                        info.push(param.validator(value))
                    } else {
                        this.convertType(param.type, value)
                    }
                } catch(e: any) {
                    this.errors.push({ text: `invalid arugments for flag "${name}", ${e.toString()}`, argvi: index + i })
                }
            }
        }
        return index + i
    }

    parseFlags(argv: string[], choices: Obj<CliArg>, start: number = 0): [CliFinal, string[]] {
        const flags: CliFinal = {}
        const anyArgs: string[] = []
        
        let stop = false
        const stopVal = this.options.stopFlags

        while (start < argv.length && argv[start] !== stopVal) {
            const val = argv[start]

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
                    if (choices[name] !== undefined)
                    {
                        start = this.advFlag(argv, start, choices, flags, name)
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
                        memStart = this.advFlag(argv, memStart, choices, flags, value.name)
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
                start += (memStart === start ? 1 : memStart)

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
        else if (argv[0][0] == '-') {
            this.errors.push({ text: `${this.name ?? 'programme'} need to start with command` })
        } else {
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
            return false
        }
        else if (objectIsEmpty(this.commands)) {
            return this.parseArguments(argv)
        } else {
            return this.parseCommand(argv)
        }
    }

    _getCallFlag(flags: CliFinal, args: Obj<CliArg>): Function | null {

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

    //--------------
    // utils
    //--------------


    // format

    printError(max: number | null = null) {
        
        const argv = this.argv
        const argvLine = argv.join(' ') + "\n"

        let errors = this.errors
        if (max !== null) {
            errors = [...this.errors].splice(0, max)
        }
        
        let str = ""
        // TODO
        errors.forEach(err => {
            str += `${red(bold('error'))}: ${err.text}\n`
            
            if (err.argvi !== undefined) {

                // calcul padding spaces
                str += argvLine
                let spaces = err.argvi
                for (let i = 0;i < err.argvi; i++) {
                    spaces += argv[i].length
                }
                
                // generate arrow
                const len = argv[err.argvi].length
                let tild
                if (err.start != undefined && err.end != undefined) {
                    tild = red("~".repeat(err.start)) + red(bold("^".repeat(err.end)))
                    const fin = len - (err.start + err.end)
                    if (fin > 0) {
                        tild += red("~".repeat(fin))
                    }
                } else {
                    tild = red(bold("^".repeat(len)))
                }
                
                str += `${" ".repeat(spaces)}${tild}\n`
            }
        })
        if (this.errors.length >= 5) {
            str += `total errors: ${red(bold(this.errors.length))}`
        }
        console.error(str)
    }

    // formating
    protected formatOptions(options: Obj<CliArg>, prefix: string = "Options:"): string {
        // calcul padding space

        const mem: {[key:string]: number} = {}

        let padding = 0
        for (const key in options) {

            const opt = options[key]
            mem[key] = key.length
            if (opt.params && opt.params.length) {
                mem[key] += opt.params.reduce((c, p) => c + p.type.constructor.name.length, 0)
            }
            padding = Math.max(padding, mem[key])
        }

        let str = prefix + '\n'

        for (const key in options) {
            const opt = options[key]

            str += (opt.alias ? `-${opt.alias}, ` : '    ')
            str += `--${key} `
            if (opt.params) {
                str += opt.params.reduce((s, p) => `${s}${p.type.constructor.name} `, "")
            }
            // space padding 
            str += " ".repeat(padding - mem[key] + 1)
            str += opt.description ?? italic("no information.")
        }
        return str
    }

    protected formatCommands(cmds: Obj<CliCmd>): string {
        const arr: string[] = ["Management Commands:"]

        let padding = 0
        for (const key in cmds) {
            padding =  Math.max(padding, key.length)
        }

        let str = ""
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
        let haveCommand = !objectIsEmpty(this.commands)
        let haveArguments = !objectIsEmpty(this.arguments)

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