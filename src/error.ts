
import { italic, yellow } from 'colorette'

export const INVALID_FLAG = (flag: string) => `Found argument '${yellow(`-${flag}`)}' which wasn't expected, or isn't valid in this context.`

export const EMPTY_ARG = (t: string) => `Empty argument '${yellow(t)}' which wasn't expected.`

export const CMD_NOT_FOUND = (cmd: string) => `No Such command '${yellow(cmd)}'`

export const CMD_FIRST = (cmd: string) => `first argument '${yellow(cmd)}' need to be a command, not flags`

export const INVALID_ARG = (name: string, msg: string) => `Invalid arugments for flag '${yellow(name)}', ${msg}`

export const INVALID_LENGTH_ARG = (name: string, length: number | string) => `Need ${yellow(length)} arguments after flag '${yellow(`--${name}`)}'.`

export const INVALID_FORMATING = `Invalid formating flag, need to be '${yellow('flag')}=${yellow('value')}(${yellow(',value...')})'`

export const NEED_ARGUMENT = (type: NumberConstructor | BooleanConstructor | StringConstructor) => `need '${yellow(type.constructor.name.toLowerCase())}' arguments.`

export const INVALID_BOOL = `need a valid boolean, choice are '${yellow('true')}' or '${yellow('false')}'`

export const INVALID_NUMBER = `need a valid ${italic(yellow('number'))}.`