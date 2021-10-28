import { red, bold, italic } from 'colorette'


import { objectIsEmpty, optimizedSplit, contains } from './utils'

import { CliArgSet, CliArg, CliCmdSet, CliCmd, CliParserOptions, CliError, CliContext, CliFinal, Obj, CliArgParam, CliFunc } from "./declare"

import {
    INVALID_FLAG,
    EMPTY_ARG,
    CMD_NOT_FOUND,
    CMD_FIRST,
    INVALID_ARG,
    INVALID_LENGTH_ARG,
    INVALID_FORMATING,
    NEED_ARGUMENT,
    INVALID_NUMBER,
    INVALID_BOOL,
    INVALID_DATE
} from "./error"

class CliParser {

    protected commands: Obj<CliCmd> = {}
    protected arguments: Obj<CliArg> = {}

    protected errors: CliError[] = []

    protected ctx: CliContext | undefined

    protected options: CliParserOptions

    protected argv: string[] = []

    constructor(public name: string, public description: string, options: CliParserOptions = {}) {

        this.options = { defaultArg: true, ...options }

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

    protected checkArguments(choices: Obj<CliArg>, arg: CliArg) {


        if (arg.name in this.arguments) {
            throw new Error(`duplicate options '${arg.name}'`)
        } else if (arg.name.length < 2) {
            throw new Error(`name arguments '${arg.name}' need to be upper than one char`)
        } else if (this.options.inline && contains(arg.name, '=')) {
            throw new Error(`name arguments '${arg.name}' can't contains '=' in here name`)
        }

        // set empty params
        if (!arg.params) {
            arg.params = []
        }
        else {
            // check type/validator
            arg.params.forEach(p => {
                if (p.type === undefined) {
                    throw new Error(`arguments '${arg.name}' not have 'type'`)
                }
            })
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
        } else if (name.length <= 1) {
            //TODO
            throw new Error(`Command '${name}' need to be more length`)
        }

        // convert
        const tcmd = cmd as CliCmd

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

        // add default help with usage command
        if (this.options.defaultArg && !tcmd.arguments.help) {
            tcmd.arguments.help = { ...this.arguments.help }
            tcmd.arguments.help.call = () => {
                this.commandUsage(tcmd.name)
            }
        }

        this.commands[name] = tcmd
    }

    protected checkDefault(param: CliArgParam): any {
        if (param.default !== undefined)
            return param.default
        throw new Error(NEED_ARGUMENT(param.type))
    }

    protected convertValue(allParams: any[], param: CliArgParam, value: string): any {
        if (param.validator) {
            return param.validator(value, allParams)
        }
        if (param.type == Number) {
            const num = Number(value)
            if (Number.isNaN(num)) {
                throw new Error(INVALID_NUMBER)
            }
            return num
        } else if (param.type === Boolean) {
            switch (value) {
                case "true":
                case "yes":
                    return true
                case "false":
                case "no":
                    return false
                default:
                    throw new Error(INVALID_BOOL)
            }
        } else if (param.type == Date) {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
                throw new Error(INVALID_DATE)
            }
            return date
        }
        return value
    }

    protected advFlagInline(argv: string[], index: number, choices: Obj<CliArg>, cliArgs: CliFinal, _spliter: string[]): number {
        const arg = choices[_spliter[0]]
        const allParams: any[] = []

        // addf lag
        cliArgs[arg.name] = allParams
        if (arg.alias) {
            cliArgs[arg.alias] = allParams
        }

        // check key=val,... == [key, val, ....]
        if (_spliter.length != 2) {
            this.addError(INVALID_FORMATING, index, 2)
            return index + 1
        }

        const subArgv = optimizedSplit(_spliter[1], ',')
        if (subArgv.length > arg.params.length) {
            this.addError(INVALID_LENGTH_ARG(arg.name, arg.params.length), index, _spliter[0].length + 2)
            return index + 1
        }

        let arrow = 2 + arg.name.length + 1
        for (let i = 0; i < arg.params.length; i++) {

            const param = arg.params[i]
            const isOverFlow = (i >= subArgv.length)

            try {
                if (isOverFlow)
                    allParams.push(this.checkDefault(param))
                else
                    allParams.push(this.convertValue(allParams, param, subArgv[i]))
            } catch (e: any) {
                this.addError(INVALID_ARG(arg.name, e.message), index, arrow, (isOverFlow ? 0 : subArgv[i].length))
            } finally {
                if (!isOverFlow) {
                    arrow += subArgv[i].length + 1
                }
            }
        }
        return index + 1
    }

    protected advFlag(argv: string[], index: number, cliArgs: CliFinal, arg: CliArg, match: string): number {
        const allParams: any[] = []

        // asign flag
        cliArgs[arg.name] = allParams
        if (arg.alias) {
            cliArgs[arg.alias] = allParams
        }

        if (!arg.params.length) {
            return index
        }

        let undef = 0
        for (let i = 0; i < arg.params.length; i++) {

            const param = arg.params[i]
            const isOverFlow = (index + i) >= argv.length
            // check arguments is not flag (start with '-') and type is not number (cause '-' for negative value)
            const isFlag = !isOverFlow && param.type !== Number && argv[index + i][0] === '-' || false

            try {
                if (isFlag) {
                    undef++
                    allParams.push(this.checkDefault(param))
                }
                else if (isOverFlow)
                    allParams.push(this.checkDefault(param))
                else
                    allParams.push(this.convertValue(allParams, param, argv[index + i]))
            } catch (e: any) {
                this.addError(INVALID_ARG(match, e.message), index)
                return index
            }

        }
        return index + arg.params.length - undef
    }

    protected parseMulti(flags: CliFinal, argv: string[], val: string, choices: Obj<CliArg>, index: number) {
        if (val.length == 2) {
            this.addError(EMPTY_ARG('--'), index, 2, val.length - 2)
            return index + 1
        }
        const name = val.substring(2)

        // split for falg key=value,value...
        const spli = (this.options.inline ? optimizedSplit(name, '=') : [name])

        if (choices[spli[0]] === undefined) {
            this.addError(INVALID_FLAG(name), index, 2, val.length - 2)
            return index + 1
        }
        if (!this.options.inline || spli.length == 1) {
            return this.advFlag(argv, index + 1, flags, choices[name], name)
        }
        return this.advFlagInline(argv, index, choices, flags, spli)
    }

    protected parseSimple(flags: CliFinal, argv: string[], val: string, choices: Obj<CliArg>, index: number) {
        // simple

        let mem = index

        for (let i = 1; i <= val.length - 1; i++) {
            const value = choices[val[i]]

            if (value !== undefined) {
                mem = this.advFlag(argv, mem + 1, flags, value, val[i])
            } else {
                this.addError(INVALID_FLAG(val[i]), index, i, 1)
            }
        }
        return Math.max(index + 1, mem)

    }

    protected parseFlags(argv: string[], choices: Obj<CliArg>, index = 0): [CliFinal, string[]] {
        const flags: CliFinal = {}
        const anyArgs: string[] = []

        while (index < argv.length) {
            const val = argv[index]

            if (argv[index] === this.options.stopFlags) {
                index++
                break
            }
            if (val[0] != '-') {
                anyArgs.push(val)
                index++
            }
            else if (val[1] == '-') {
                index = this.parseMulti(flags, argv, val, choices, index)
            }
            else if (val.length != 1) {
                index = this.parseSimple(flags, argv, val, choices, index)
            } else {
                this.addError(EMPTY_ARG('-'), index++)
            }
        }
        // add all arguments after stopFlag
        while (index < argv.length) {
            anyArgs.push(argv[index++])
        }

        return [flags, anyArgs]
    }

    parse(argv: string[]): boolean {
        this.argv = argv
        if (argv.length == 0) {
            this.usage()
            return true
        }
        // command
        let args = this.arguments
        let cmd: CliCmd | undefined

        // replace cmd
        if (!objectIsEmpty(this.commands)) {
            if (!(argv[0] in this.commands)) {
                this.addError((argv[0][0] == '-' ? CMD_FIRST(argv[0]) : CMD_NOT_FOUND(argv[0])), 0)
                return false
            }
            cmd = this.commands[argv[0]]

            // merge global options with cmd options
            args = { ...args, ...cmd.arguments }
        }

        const [flags, anyArgs] = this.parseFlags(argv, args, cmd ? 1 : 0) // skip first argv command

        const ctx = this.createContext(flags, anyArgs, cmd)

        if (this.errors.length) {
            return false
        }

        const toCall = this.getCall(flags, args, cmd)
        if (toCall) {
            toCall(ctx)
        }
        return true
    }

    protected getCall(flags: CliFinal, args: Obj<CliArg>, cmd: CliCmd | undefined): CliFunc | undefined {
        for (const key in flags) {
            const toCall = args[key].call
            if (toCall) {
                return toCall
            }
        }
        if (cmd && cmd.call) {
            return cmd.call
        }
    }

    get context(): CliContext {
        if (this.ctx === undefined) {
            throw new Error("You need to call 'parse' before access context")
        }
        return this.ctx
    }

    protected createContext(flags: CliFinal, anyArgs: string[], cmd: CliCmd | undefined = undefined): CliContext {
        this.ctx = {
            flags,
            anyArgs,
            parser: this,
            name: this.name,
            description: this.description,
            options: this.options,
            argv: this.argv
        }
        if (cmd) {
            this.ctx.cmd = cmd
        }
        return this.ctx
    }


    //------------------------------------------
    //      utils
    //------------------------------------------

    protected addError(text: string, argvi: number, start: number | undefined = undefined, end: number | undefined = undefined) {

        const err = this.errors.find(e => (e.argvi === argvi && e.start === start && e.end === end))
        if (err) {
            err.text.push(text)
        } else {
            this.errors.push({ text: [text], argvi, start, end })
        }
    }

    // format
    printError(max: number | undefined = undefined) {
        const argvLine = `${this.name} ${this.argv.join(' ')}\n`
        // cut errors with max
        const errors = (max === undefined ? this.errors : [...this.errors].splice(0, max))

        let str = ""
        errors.forEach(err => {
            // generate errors message, 7 is length of "error: "
            str += `${red(bold('error'))}: ${err.text.join('\n' + ' '.repeat(7))}\n`

            // calcul padding spaces
            let spaces = err.argvi + this.name.length + 1
            for (let i = 0; i < err.argvi; i++) {
                spaces += this.argv[i].length
            }
            str += `${argvLine}${" ".repeat(spaces)}`

            // generate arrow
            const len = this.argv[err.argvi]?.length || 1
            err.start = err.start ?? 0
            err.end = err.end ?? len - err.start

            str += red("~".repeat(err.start)) + red(bold("^".repeat(err.end)))
            const end = len - (err.start + err.end)
            if (end > 0) {
                str += red("~".repeat(end))
            }
            str += '\n'
        })
        // add number error
        if (this.errors.length >= 5) {
            const total = this.errors.reduce((c, e) => e.text.length + c, 0)
            str += `total errors: ${red(bold(total))}`
        }
        console.error(str.trim())
    }

    // formating
    protected formatOptions(options: Obj<CliArg>, prefix = "Options:"): string {

        // remove alais from command
        const opts: Obj<CliArg> = {}
        for (const key in options) {
            opts[options[key].name] = options[key]
        }

        const mem: Obj<number> = {}

        // calcul padding space
        let padding = 0

        for (const key in opts) {

            const opt = opts[key]
            mem[key] = key.length
            if (opt.params && opt.params.length) {
                // 3 === prefix and sufix "<>" and 1 space
                mem[key] += opt.params.reduce((c, p) => c + p.type.name.length + 3, 0)
            }
            padding = Math.max(padding, mem[key])
        }

        let str = prefix + '\n'
        for (const key in opts) {
            const opt = opts[key]

            str += `${(opt.alias ? `-${opt.alias}, ` : '    ')}--${key}`

            if (opt.params) {
                str += opt.params.reduce((s, p) => `${s}<${p.type.constructor.name.toLowerCase()}> `, "")
            }
            // space padding 
            str += `${" ".repeat(padding - mem[key] + 1)}${opt.description ?? italic("no information.")}\n`
        }
        return str
    }

    protected formatCommands(cmds: Obj<CliCmd>): string {
        let padding = 0
        for (const key in cmds) {
            padding = Math.max(padding, key.length)
        }

        let str = `Commands:\n`
        for (const key in cmds) {
            str += `  ${key}${" ".repeat(padding - key.length)} ${cmds[key].description}\n`
        }
        return str
    }

    commandUsage(cmd: CliCmd | string) {

        if (typeof cmd === "string") {
            const tcmd = this.commands[cmd]
            if (!tcmd) {
                throw new Error(`not found '${cmd}' command.`)
            }
            cmd = tcmd
        }


        let str = `Usage: ${this.name} ${cmd.name} `
        str += `${this.options.info ?? '[OPTIONS]\n\n'}${cmd.description}`

        if (this.arguments) {
            str += '\n\n' + this.formatOptions(this.arguments, "Global options:")
        }
        if (cmd.arguments) {
            str += '\n\n' + this.formatOptions(cmd.arguments, "Command options:")
        }
        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.log(str.trim())
    }


    usage() {
        let str = `Usage: ${this.name} `
        str += this.options.info ?? `${!objectIsEmpty(this.commands) ? "COMMAND" : ""} [OPTIONS]\n\n`
        str += this.description
        if (!objectIsEmpty(this.arguments)) {
            str += '\n\n' + this.formatOptions(this.arguments)
        }
        if (!objectIsEmpty(this.commands)) {
            str += '\n\n' + this.formatCommands(this.commands)
        }

        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.info(str.trim())
    }


}

export default CliParser