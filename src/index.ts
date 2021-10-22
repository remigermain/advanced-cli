import clc from 'colorette'

interface CliParserOptions {
    info?: string,
    footer?: string,
    version?: string,
    maxError?: number,
    stopFlags?: "--" | ";" | null,
    defaultArg?: boolean
}

interface CliError {
    text: string,
    argvi?: number,
    start?: number,
    end?: number,
}
interface CliContext {
    cmd?: Command,
    flags: CliArguments,
    anyArgs: string[],
    parser: CliParser,
    name: string,
    description: string,
    options: CliParserOptions
}

interface CliArgParams {
    type: Object | Number | Boolean
    default?: string | number | boolean,
    validator?: (value: string) => any,
}

interface CliArg {
    name?: string
    alias?: string,
    description?: string,
    params?: CliArgParams[],
    call?: (ctx: CliContext) => void
}

interface CliArguments {
    [key:string]: CliArg
}


interface Command {
    name: string,
    description: string,
    arguments?: CliArguments,
    call: (ctx: CliContext) => void
}
interface CliCommand {
    [key:string]: Command
}

class CliParser {

    protected commands: CliCommand = {}
    protected arguments: CliArguments = {}
    protected argumentsAlias: {[key:string]: true} = {}
    
    protected argv: string[] = []
    
    protected errors: CliError[] = []

    protected _ctx: CliContext | null = null

    protected options: CliParserOptions
    
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
    
    addArgument(name: string, arg: CliArg = {}) {
        
        if (name in this.arguments) {
            throw new Error(`duplicate options '${name}'`)
        }
        if (arg.alias && arg.alias.length != 1) {
            throw new Error(`alias options '${arg.alias}' need to be only one char`)
        }
        // TODO check command alerady exist
        this.arguments[name] = arg
    }

    addCommand(name: string, cmd: Command) {

        if (name in this.commands) {
            throw new Error(`Command '${name}' already set`)
        }
        if (!cmd.arguments) {
            cmd.arguments = {}
        }
        cmd.name = name
        this.commands[name] = cmd
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

    advFlag(argv: string[], index: number, choices: CliArguments, cliArgs: CliArguments, name: string): number {
        const info = {params: [] as any[]}
        const arg: CliArg = choices[name]

        cliArgs[name] = info
        if (arg.alias) {
            cliArgs[arg.alias] = info
        }

        if (!arg.params || !arg.params.length) {
            return index + 1
        }
        
        let i = 0
        for (; i < arg.params.length; i++)
        {
            const param = arg.params[i]
            if ((index + i) >= argv.length)
            {
                if ("default" in param)
                {
                    info.params.push(param.default)
                }
                else
                {
                    this.errors.push({
                        text: `need ${clc.yellow(arg.params.length)} arguments after flag '${name}'.`,
                        argvi: index + i
                    })
                    break
                }
            }
            else
            {
                const value = argv[index + i]
                try {
                    if (param.validator) {
                        info.params.push(param.validator(value))
                    } else {
                        this.convertType(param.type, value)
                    }
                } catch(e: any) {
                    this.errors.push({ text: `invalid arugments for flag "${name}", ${e.toString()}`, argvi: index + i })
                    break
                }
            }
        }
        return index + i
    }

    parseFlags(argv: string[], choices: CliArguments, start: number = 0): [CliArguments, string[]] {
        const flags: CliArguments = {}
        const anyArgs: string[] = []
        
    
        // create a alias object form optimize search
        const alias: {[key:string]: CliArg} = {}
        for (const key in choices) {
            const name = choices[key]
            if (name.alias !== undefined) {
                // check alias doublon
                if (name.alias in alias) {
                    throw new Error(`duplicate alias options '${name.alias}`)
                }
                alias[name.alias] = choices[key]
                alias[name.alias].name = key
            }
        }

        let stop = false
        const stopVal = this.options.stopFlags

        while (start < argv.length) {
            const val = argv[start]

            if (val === stopVal)
            {
                stop = true
                start++
            }
            else if (stop || val[0] != '-')
            {
                anyArgs.push(val)
                start++
            }
            else if (val[1] == '-')
            {
                if (val.length != 2)
                {
                    const name = val.substring(2)
                    if (name in choices)
                    {
                        start = this.advFlag(argv, start, choices, flags, name)
                    }
                    else
                    {
                        this.errors.push({
                            text: `Found argument '${clc.yellow(`--${name}`)}' which wasn't expected, or isn't valid in this context.`,
                            argvi: start++,
                            start: 2,
                            end: val.length - 2
                        })
                    }
                }
                else
                {
                    this.errors.push({
                        text: `Empty argument '${clc.yellow('--')}' which wasn't expected.`,
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
                    if (val[i] in alias)
                    {
                        //@ts-ignore
                        memStart = this.advFlag(argv, memStart, choices, flags, alias[val[i]].name)
                    }
                    else
                    {
                        this.errors.push({
                            text: `Found argument '${clc.yellow(`-${val[i]}`)}' which wasn't expected, or isn't valid in this context.`,
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
                    text: `Empty argument '${clc.yellow('-')}' which wasn't expected.`,
                    argvi: start++
                })
            }
        }

        return [flags, anyArgs]
    }

    parseCommand(argv: string[]): boolean {
        if (argv[0] in this.commands) {
            const cmd = this.commands[argv[0]]
        
            // merge global options with cmd options
            const args = {...this.arguments, ...cmd.arguments}

            // change usage function to command usage
            if ('help' in args) {
                args.help.call = ({ parser, cmd }) => {
                    if (cmd) {
                        parser.commandUsage(cmd)
                    }
                }
            }
            //parse options
            const [flags, anyArgs] = this.parseFlags(argv, args, 1)

            if (!this.errors.length) {
                this.printError(argv)
                return false
            }
            const callFalg = this._getCallFlag(flags)
            if (callFalg) {
                callFalg(this._createContext(flags, anyArgs, cmd))
            }
            else if (cmd.call) {
                cmd.call(this._createContext(flags, anyArgs, cmd))
            }
        }
        else if (argv[0][0] == '-') {
            this.errors.push({ text: `${this.name ?? 'programme'} need to start with command` })
        } else {
            this.errors.push({ text: `no such subcommand: '${clc.yellow(argv[0])}''`, argvi: 0})
        }
        this.printError(argv)
        return false
    }

    parseArguments(argv: string[]):boolean {
        //parse options
        const [flags, anyArgs] = this.parseFlags(argv, this.arguments, 0)
        if (this.errors.length) {
            this.printError(argv)
            return false
        }
        const call = this._getCallFlag(flags)        
        if (call) {
            call(this._createContext(flags, anyArgs))
        }
        return true
    }

    parse(argv: string[]): boolean {
        if (argv.length == 0) {
            this.usage()
        }
        else if (Object.keys(this.commands).length) {
            return this.parseCommand(argv)
        } else {
            return this.parseArguments(argv)
        }
        return true
    }

    _getCallFlag(flags: CliArguments): Function | null {
        const keys = Object.keys(flags)
        for (let i = 0; i < keys.length; i++) {
            const fl = flags[keys[i]]
            if (fl.call) {
                return fl.call
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

    _createContext(flags: CliArguments, anyArgs: string[], cmd: Command | null = null): CliContext {
        const ctx: CliContext = {
            flags,
            anyArgs,
            parser: this,
            name: this.name,
            description: this.description,
            options: this.options
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

    printError(argv: string[]) {
        
        const argvLine = argv.join(' ') + "\n"

        let errors = this.errors
        if (this.options.maxError) {
            errors = [...this.errors].splice(0, this.options.maxError)
        }
        
        let str = ""
        errors.forEach(err => {
            str += `${clc.red(clc.bold('error'))}: ${err.text}\n`
            
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
                    tild = clc.red("~".repeat(err.start)) + clc.red(clc.bold("^".repeat(err.end)))
                    const fin = len - (err.start + err.end)
                    if (fin > 0) {
                        tild += clc.red("~".repeat(fin))
                    }
                } else {
                    tild = clc.red(clc.bold("^".repeat(len)))
                }
                
                str += `${" ".repeat(spaces)}${tild}\n`
            }
        })
        if (this.errors.length >= 5) {
            str += `total errors: ${clc.red(clc.bold(this.errors.length))}`
        }
        console.error(str)
    }

    // formating
    protected formatOptions(options: CliArguments, prefix: string = "Options:"): string {

        const keys = Object.keys(options)

        // calcul padding space

        const mem: {[key:string]: number} = {}
        const padding = keys.reduce((num, key) => {
            const opt = options[key]
            
            mem[key] = key.length
            if (opt.params && opt.params.length) {
                mem[key] += opt.params.reduce((c, p) => c + p.type.constructor.name.length, 0)
            }
            return Math.max(num, mem[key])
        }, 0)

        let str = prefix + '\n'
        keys.forEach(key => {
            const opt = options[key]

            str += (opt.alias ? `-${opt.alias}, ` : '    ')
            str += `--${key} `
            if (opt.params) {
                str += opt.params.reduce((s, p) => `${s}${p.type.constructor.name} `, "")
            }
            // space padding 
            str += " ".repeat(padding - mem[key] + 1)
            str += opt.description ?? clc.italic("no information.")
        })
        return str
    }

    protected formatCommands(cmds: CliCommand): string {
        const arr: string[] = ["Management Commands:"]

        const keys = Object.keys(cmds)
        const padding = keys.reduce((c, key) => Math.max(c, key.length), 0)

        let str = ""
        keys.forEach(key => {
            str += `  ${key}${" ".repeat(padding - key.length)} ${cmds[key].description}\n`
        })
        
        return str
    }

    commandUsage(cmd: Command | string) {

        if (typeof cmd === "string") {
            const tcmd = this.commands[cmd]
            if (tcmd === undefined) {
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

        const haveCommand = Object.keys(this.commands).length > 0
        const haveArguments = Object.keys(this.arguments).length > 0

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
        console.log(str)
    }


}

export default  CliParser