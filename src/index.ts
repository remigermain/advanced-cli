import clc from 'cli-color'

type stopParseChoices = "--" | ";" | null

interface CliParserOptions {
    name?: string,
    description?: string,
    info?: string,
    footer?: string,
    version?: string,
    maxError?: number
    stopFlags?: stopParseChoices
}

interface ArgParams {
    type: Object | Number | Boolean
    default?: string | number | boolean,
    validator?: (value: string) => any,
}

interface Arg {
    mFlag?: string,
    sFlag?: string,
    description: string,
    params?: ArgParams[],
    call?: (ctx: CliParserContext) => void
}

interface Command {
    name: string,
    description: string,
    arguments?: Arg[],
    call: (ctx: CliParserContext) => void
}

interface infoFlag {
    _declare: Arg,
    params?: any[]
}


const helpFlag: Arg = {
    sFlag: "h",
    mFlag: "help",
    description: "print help",
    call ({parser}) {
        parser.usage()
        return true
    }
}

const versionFlag: Arg = {
    sFlag: "v",
    mFlag: "version",
    description: "display version",
    call ({options}) {
        console.info(options.version)
    }
}

interface CliParserContext {
    flags:  {[key: string]: infoFlag},
    arguments: string[],
    options: CliParserOptions,
    parser: CliParser,
    cmd?: Command,
}

const findOptions = (mfl: string | undefined, sfl: string | undefined) => (opt: Arg) => {
    if (opt.sFlag) {
        return opt.sFlag === sfl
    }
    return opt.mFlag === mfl
}


interface ErrorCliParser {
    text: string,
    idxArgv: number,
    start?: number,
    end?: number,
}

const g: ArgParams = {
    type: Object
}

class CliParser {

    protected options : CliParserOptions
    protected arguments : Arg[] = []
    protected commands: Command[] = []
    
    protected argv: string[] = []
    
    protected errors : ErrorCliParser[] = []
    
    protected final: {[key: string]: infoFlag} = {}
    protected anyArgs: string[] = []


    constructor (options: CliParserOptions = {}) {

        this.options = options

        // add default help
        this.addArgument({...helpFlag})
        if (this.options.version) {
            this.addArgument({...versionFlag})
        }
    }

    protected checkArguments(args: Arg[], cmd: Command | null = null) {
        const duplicate: {[key:string]: boolean} = {}

        args.forEach((a, idx) => {
            const key = a.sFlag || a.mFlag

            // @ts-ignore
            if (key in duplicate) {
                throw new Error(`duplicate options '${key}' ${cmd? `from '${cmd.name}' command` : ""}`)
            }
            if (!a.sFlag && !a.mFlag) {
                throw new Error("sFlag or mFlag need to be set")
            }
            // @ts-ignore
            if (a.sFlag?.length > 1) {
                throw new Error("sFlag need to be only one char")
            }

            // @ts-ignore
            duplicate[key] = true
        })
    }
    
    addArgument(arg: Arg) {
        // check command alerady exist
        this.arguments.push(arg)
        this.checkArguments(this.arguments)

    }

    addCommand(cmd: Command) {
        // check command alerady exist
        const f = this.commands.filter(s => s.name === cmd.name)
        if (f.length > 0) {
            throw new Error(`Command '${cmd.name}' already set`)
        }

        if (cmd.arguments?.length) {
            this.checkArguments(cmd.arguments, cmd)
        }

        this.commands.push(cmd)
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

    protected parseFlag(acutal: string, flag: Arg, index: number): number {

        const info: infoFlag = {_declare: flag}
        if (flag.sFlag) {
            // @ts-ignore
            this.final[flag.sFlag] = info
        }
        if (flag.mFlag) {
            // @ts-ignore
            this.final[flag.mFlag] = info
        }

        // parse sub arguments
        if (!flag.params || !flag.params.length) {
            return index + 1
        }

        info.params = []
        let i = 0
        for (;i < flag.params.length; i++) {
            const param = flag.params[i]

            if (this.argv.length <= (i + index + 1)) {
                if ("default" in param) {
                    info.params[i] = param.default
                } else {
                    this.errors.push({
                        text: flag.description || `need ${flag.params.length} arguments after flag "${acutal}".`,
                        idxArgv: index
                    })
                    break ;
                }
            } else {
                const value = this.argv[index + i + 1]
                try {
                    if (param.validator) {
                        const v = param.validator(value)
                        info.params[i] = v
                    } else {
                        this.convertType(param.type, value)
                    }
                } catch(e) {
                    //@ts-ignore
                    this.errors.push({ text: `invalid arugments for flag "${acutal}", ${e.toString()}`, idxArgv: index + i + 1 })
                    break;
                }
            }
        }
        return index + i
    }

    protected _parseOption(args: Arg[], i: number =0): boolean {

        let stopParse = false
        const stopStr = this.options.stopFlags || null

        while (i < this.argv.length) {
            const el = this.argv[i]

            if (el === stopStr) {
                stopParse = true
                i++
                continue
            }
            
            if (stopParse || el[0] != "-") {
                this.anyArgs.push(el)
                i++
                continue
            }
            // parse multi flag (start with --)
            if (el[1] == "-")
            {
                const flag = el.substr(2)

                const mf = args.filter(e => e.mFlag === flag)[0]
                if (!mf) {
                    this.errors.push({
                        text: `Found argument '${clc.yellow(`--${flag}`)}' which wasn't expected, or isn't valid in this context`,
                        idxArgv: i
                    })
                } else {
                    i  = this.parseFlag(flag, mf, i)
                }
            
            } else {
                // parse simple flag (start with -)
                if (el.length == 1) {
                    this.errors.push({
                        text: `Empty argument '${clc.yellow('-')}' which wasn't expected.`,
                        idxArgv: i,
                    })
                    i++
                    continue
                }
                let inde = i
                for(let j = 1; j < el.length; j++) {

                    const fl = el[j]
                    const sf = args.filter(e => e.sFlag == fl)[0]

                    if (!sf)
                        this.errors.push({
                            text: `Found argument '${clc.yellow(`-${fl}`)}' which wasn't expected, or isn't valid in this context.`,
                            idxArgv: i,
                            start: j,
                            end: 1
                        })
                    else {
                        inde = this.parseFlag(fl, sf, inde)
                    }
                }
                i = inde
            }
            i++
        }
        return this.errors.length == 0
    }

    protected checkArgumentsCall(): Function | null {
        const keys = Object.keys(this.final)
        
        for (let i = 0; i < keys.length; i++) {
            const obj: infoFlag = this.final[keys[i]]
            if (obj._declare.call) {
                return obj._declare.call
            }
        }

        return null
    }

    protected context(): CliParserContext {
        // call subcommand function with context
        return {
            flags: this.final,
            arguments: this.anyArgs,
            options: this.options,
            parser: this,
        }
    }

    protected parseOptions(): boolean {
        if (!this._parseOption(this.arguments)) {
            return false
        }

        // TODO check if call
        const call = this.checkArgumentsCall()
        if (call) {
            call(this.context())
        }

        return true
    }

    protected parseCommand(): boolean {
        if (this.argv.length == 0) {
            this.usage()
            return false
        }

        const nameCmd = this.argv[0]
        const cmd = this.commands.filter(s => s.name === nameCmd)[0]
        if (!cmd) {
            this.errors.push({text: `no such subcommand: '${clc.yellow(nameCmd)}''`, idxArgv: 0})
            return false
        }

        if (!cmd.arguments || !cmd.arguments.length) {
            cmd.arguments = []
        }
        // merge global arguments and command arguments
        const args: Arg[] = [...(cmd.arguments || [])]
        this.arguments.forEach(gobalArg => {
            const exists = args.filter(findOptions(gobalArg.mFlag, gobalArg.sFlag))[0]
            if (!exists) {
                args.push(gobalArg)
            }
        })
        // add help function command
        const help = cmd.arguments.filter(findOptions("help", "h"))[0]
        if (!help) {
            const baseHelp = {...helpFlag}
            baseHelp.call = ({parser, cmd}) => {
                //@ts-ignore
                parser.commandUsage(cmd)
            }
            cmd.arguments.push(baseHelp)
        }

        // 1 == remove command params
        const results = this._parseOption(args, 1)
        
        // error in options
        if (!results) {
            return false
        }
        
        // generate context
        const ctx = this.context()
        // set command
        ctx.cmd = cmd
        
        
        const call = this.checkArgumentsCall()
        if (call) {
            // @ts-ignore
            call(ctx)
        } else {
            cmd.call(ctx)
        }

        return true
    }

    parse(argv:string[]): boolean {
        this.argv = argv
        let results: boolean

        if (this.commands.length > 0) {
            results = this.parseCommand()
        } else {
            results = this.parseOptions()
        }
        if (!results) {
            this.printError()
        }
        return results
    }

    printError() {
        
        const argvLine = this.argv.join(' ') + "\n"

        let errors = this.errors
        if (this.options.maxError) {
            errors = [...this.errors].splice(0, this.options.maxError)
        }
        
        let str = ""
        errors.forEach(err => {
            str += `${clc.red(clc.bold('error'))}: ${err.text}\n`
            str += argvLine
            
            // calcul padding spaces
            let spaces = err.idxArgv
            for (let i = 0;i < err.idxArgv; i++) {
                spaces += this.argv[i].length
            }
            
            // generate arrow
            const len = this.argv[err.idxArgv].length
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
            
        })
        str += `total errors: ${clc.red(clc.bold(this.errors.length))}`
        console.error(str)
    }

    // formating
    protected formatOptions(options: Arg[], prefix: string = "Options:"): string[] {
        const mflCount: {[key: string]: number} = {}
        
        // calcul padding space
        const paddingMflag = options.reduce((i, opt) => {
            if (opt.mFlag) {
                mflCount[opt.mFlag] = opt.mFlag.length
                if (opt.params) {

                    mflCount[opt.mFlag] += opt.params?.reduce((si, p) => si + p.type.constructor.name.length, 0) + 1
                }
                return Math.max(i, mflCount[opt.mFlag])
            }
            return i
        }, 0)
        
        const arr: string[] = [prefix]
        return options.reduce((arr, opt) => {

            let str = (opt.sFlag ? ` -${opt.sFlag}` :  "   ")
            // separator
            str += ((opt.sFlag && opt.mFlag) ? ", " : "  ")
            // mflags
            if (opt.mFlag) {
                str += `--${opt.mFlag} `
                if (opt.params) {
                    str += opt.params.reduce((s, p) => `${s}${p.type.constructor.name} `, "")
                }
            }
            // space padding 
            str += " ".repeat((opt.mFlag ? paddingMflag - mflCount[opt.mFlag]: paddingMflag + 3) + 1)
            // help
            arr.push(`${str}${opt.description || "no information."}`)
            return arr
        }, arr)
    }

    protected formatSubCommands(sub: Command[]): string[] {
        const arr: string[] = ["Management Commands:"]

        const padding = sub.reduce((c, s) => Math.max(c, s.name.length), 0)
        return sub.reduce((ar, s) => {
            // ad paddding (+2 for space beetwen subcommand and description)
            ar.push(`  ${s.name} ${" ".repeat(padding - s.name.length + 2)}${s.description}`)
            return ar
        }, arr)
    }

    commandUsage(cmd: Command) {

        let str = ""

        str += `Usage: ${this.options?.name || ""} ${cmd.name} `
        if (this.options.info) {
            str += this.options.info
        } else {
            str += `[OPTIONS]\n\n`
        }
        str += cmd.description
        if (this.arguments) {
            str += '\n\n' + this.formatOptions(this.arguments, "Global options:").join("\n")
        }
        if (cmd.arguments) {
            str += '\n\n' + this.formatOptions(cmd.arguments, "Command options:").join("\n")
        }
        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.log(str)
    }


    usage() {
        let str = ""

        str += `Usage: ${this.options?.name || ""} `
        if (this.options.info) {
            str += this.options.info
        } else {
            str += `[OPTIONS] ${this.commands.length > 0 ? "COMMAND" : ""}\n\n`
        }
        if (this.options.description) {
            str += this.options.description
        }
        if (this.arguments.length) {
            str += '\n\n' + this.formatOptions(this.arguments).join("\n")
        }
        if (this.commands.length) {
            str += '\n\n' + this.formatSubCommands(this.commands).join("\n")
        }

        if (this.options.footer) {
            str += `\n\n${this.options.footer}`
        }
        console.log(str)
    }

}

export default  CliParser