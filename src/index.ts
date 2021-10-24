import { objectIsEmpty, optimizedSplit } from "./utils";

interface AdvCliCommand {
    arguments: {[key:string]: any}
}

interface AdvCliContext {
    _: string[],
    flags: {[key:string]:any},
    errors: any[],
    options: AdvClioptions,
    cmd?: AdvCliCommand,
    arguments: {[key:string]: any},
    commands: { [key: string]: any },
    argv: string[]
}

interface AdvClioptions {
    name?: string,
    description?: string,
    version?: string,
    stopFlags?: string | null,
    inline?: boolean,
    arguments?: {},
    commands?: {},
    convertValue?: boolean,
    anyFlags?: boolean
}

function isDigit(val: string): [boolean, number] {
    const num = Number(val)
    return [!Number.isNaN(num), num]
}

function isBool(val: string): [boolean, boolean] {
    const tr = val === "true"
    const fl = val === "false"
    return [tr || fl, tr || !fl]
}

function convVal(val: string): any {
    const [valid, num] = isDigit(val)
    if (valid) {
        return num
    }
    const [valid2, bool] = isBool(val)
    if (valid2) {
        return bool
    }
    return val
}

function convType(type: any, val: string): any {
    if (type === Number) {
        const [valid, value] = isDigit(val)
        if (valid)
            throw new Error('invalid number')
        return value

    } else if (type === Boolean) {
        const [valid, value] = isBool(val)
        if (valid)
            throw new Error('invalid boolean')
        return value
    }
    return val
}

function checkArgument(cliObj: AdvCliContext, name: string, index: number): boolean {
    if (!cliObj.options.anyFlags) {
        if (cliObj.arguments[name] === undefined && (!cliObj.cmd || cliObj.cmd.arguments[name] === undefined)) {
            cliObj.errors.push({ text: 'arguments not found', argv: index })
            return false
        }
    }
    return true
}

function parseMultiAll(cliObj: AdvCliContext, argv: string[], index: number, name: string): number {
    if (!name.length) {
        cliObj.errors.push({text: 'invalid formating flag', argv: index})
        return index + 1
    }

    if (!cliObj.options.inline) {
        if (checkArgument(cliObj, name, index)) {
            cliObj.flags[name] = []
        }
        return index + 1
    }

    const arr = optimizedSplit(name, '=')

    if (!checkArgument(cliObj, arr[0], index)) {
        return index +1
    }

    
    if (arr.length == 1) {
        cliObj.flags[name] = []
    }
    else if (arr.length == 2) {
        cliObj.flags[arr[0]] = []
        const _sp = optimizedSplit(arr[1], ',')
        for (let j = 0; j < _sp.length; j++) {
            const val = _sp[j]
            if (!val) {
                cliObj.errors.push({
                    text: `invalid formating flag`,
                    argv: index,
                })
                continue
            }
            cliObj.flags[arr[0]].push(cliObj.options.convertValue ? convVal(val) : val)
        }
    } else {
        cliObj.errors.push({
            text: `invalid formating flag`,
            argv: index,
            start: 2 + arr[0].length
        })
    }
    return index + 1
}

function parseSimpleAll(cliObj: AdvCliContext, argv: string[], index: number): number {
    const val = argv[index]
    for (let i = 1; i < val.length; i++) {
        const fl = val[i]
        if (checkArgument(cliObj, fl, index)) {
            cliObj.flags[fl] = []
        }
    }
    return index + 1
}


export function parser(argv: string[], options: AdvClioptions = {}) {

    const cliObj: AdvCliContext = {
        _: [],
        flags: {},
        errors: [],
        options: {
            inline: options.inline ?? true,
            stopFlags: options.stopFlags,
            anyFlags: options.anyFlags ?? false,
            convertValue: options.convertValue ?? true,
        },
        arguments: options.arguments ?? {},
        commands: options.commands ?? {},
        argv,
    }

    let i = 0
    while (i < argv.length && argv[i] !== options.stopFlags) {
        const ele = argv[i]

        if (ele[0] !== '-') {
            cliObj._.push(argv[i++])
        } else if (ele[1] === '-') {
            i = parseMultiAll(cliObj, argv, i, ele.substring(2))
        } else {
            i = parseSimpleAll(cliObj, argv, i)
        }
    }

    while (i < argv.length ) {
        cliObj._.push(argv[i++])
    }

    return cliObj
}

export function haveErrors(cliObj: AdvCliContext): boolean {
    return cliObj.errors.length != 0
}
export function printErrors(cliObj: AdvCliContext) {
    console.log("printErrors")
    cliObj.errors.forEach(v => {
        console.log(v.text)
        console.log(cliObj.argv[v.argv])
    })
    // console.log(`errors: [ ${cliObj.errors.join(', ')} ]`)
}
export function usage(cliObj: AdvCliContext) {
    console.log("usage")
}
export function usageCommand(cliObj: AdvCliContext) {
    console.log("usageCommand")
}

export function debug(cliObj: AdvCliContext) {
    console.log(`_: [ ${cliObj._.join(', ')} ]`)
    console.log(`flags: {`)
    Object.keys(cliObj.flags).forEach(k => {
        console.log(`\t${k}:`, cliObj.flags[k])
    })
    console.log(`}`)
    console.log(`errors: [ ${cliObj.errors.join(', ')} ]`)
}