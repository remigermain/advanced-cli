import { objectIsEmpty, optimizedSplit } from "./utils";

interface AdvCliContext {
    _: string[],
    flags: {[key:string]:any},
    errors: any[],
    options: AdvClioptions
}

interface AdvClioptions {
    name?: string,
    description?: string,
    version?: string,
    stopFlags?: string | null,
    inline?: boolean,
    arguments?: {},
    commands?: {},
    convertValue?: boolean
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

function parseMultiArg(cliObj: AdvCliContext, argv: string[], index: number): number {
    return index + 1
}
function parseSimpleArg(cliObj: AdvCliContext, argv: string[], index: number): number {
    return index + 1
}

function parseMultiAll(cliObj: AdvCliContext, argv: string[], index: number, name: string): number {
    if (!name.length) {
        cliObj.errors.push({
            text: `invalid formating flag`,
            argv: index
        })
        return index + 1
    }

    if (!cliObj.options.inline) {
        cliObj.flags[name] = []
        return index + 1
    }

    const arr = optimizedSplit(name, '=')
    
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
        cliObj.flags[fl] = []
    }
    return index + 1
}


export function parser(argv: string[], options: AdvClioptions = {}) {

    const cliObj: AdvCliContext = {
        _: [],
        flags: {},
        errors: [],
        options: {
            stopFlags: options.stopFlags
        },
    }
    cliObj.options.inline = options.inline ?? true

    cliObj.options.arguments = options.arguments ?? {}
    cliObj.options.commands = options.commands ?? {}

    const empty = objectIsEmpty(cliObj.options.arguments)
    const parseMulti = (empty ? parseMultiAll : parseMultiArg)
    const parseSimple = (empty ? parseSimpleAll : parseSimpleArg)

    let i = 0
    while (i < argv.length && argv[i] !== options.stopFlags) {
        const ele = argv[i]

        if (ele[0] !== '-') {
            cliObj._.push(argv[i++])
        } else if (ele[1] === '-') {
            i = parseMulti(cliObj, argv, i, ele.substring(2))
        } else {
            i = parseSimple(cliObj, argv, i)
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