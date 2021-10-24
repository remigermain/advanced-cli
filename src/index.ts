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
    commands?: {}
}

function parseMultiArg(cliObj: AdvCliContext, argv: string[], index: number): number {
    return index + 1
}
function parseSimpleArg(cliObj: AdvCliContext, argv: string[], index: number): number {
    return index + 1
}

function parseMultiAll(cliObj: AdvCliContext, argv: string[], index: number, name: string): number {
    if (!name.length)
        return index + 1

    if (cliObj.options.inline) {
        const [key, ...other] = optimizedSplit(name, '=')
        
        if (!other.length) {
            cliObj.flags[name] = []
        }
        else if (other.length == 1) {
            cliObj.flags[key] = optimizedSplit(other[0], ',')
        } else {
            cliObj.errors.push({
                text: `invalid formating flag`,
                argv: index
            })
        }
    } else {
        cliObj.flags[name] = []
    }
    return index + 1
}

function parseSimpleAll(cliObj: AdvCliContext, argv: string[], index: number): number {
    for (let i = 1; i < argv[index].length; i++) {
        const fl = argv[index][i]
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
            inline: true,
            stopFlags: null,
            ...options
        },
    }
    if (!cliObj.options.arguments) {
        cliObj.options.arguments = {}
    }
    if (!cliObj.options.commands) {
        cliObj.options.commands = {}
    }

    let parseMulti
    let parseSimple
    if (objectIsEmpty(cliObj.options.arguments)) {
        parseMulti = parseMultiAll
        parseSimple = parseSimpleAll
    } else {
        parseMulti = parseMultiArg
        parseSimple = parseSimpleArg
    }

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
        console.log(`\t${k}: [ ${cliObj.flags[k].join(', ')} ]`)
    })
    console.log(`}`)
    console.log(`errors: [ ${cliObj.errors.join(', ')} ]`)
}