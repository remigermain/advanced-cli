
import { italic, yellow } from 'colorette'

import { CliArgType } from './declare'

const prefix = (s: string): string => (s.length == 1 ? '-' : '--') + s


export const INVALID_FLAG = (flag: string) => `Found argument '${yellow(prefix(flag))}' which wasn't expected, or isn't valid in this context.`

export const EMPTY_ARG = (t: string) => `Empty argument '${yellow(t)}' which wasn't expected.`

export const CMD_NOT_FOUND = (cmd: string) => `No Such command '${yellow(cmd)}'.`

export const CMD_FIRST = (cmd: string) => `First argument '${yellow(cmd)}' need to be a command, not flags.`

export const INVALID_ARG = (name: string, msg: string) => `Invalid arugments for flag '${yellow(name)}', ${msg}.`

export const INVALID_LENGTH_ARG = (name: string, length: number | string) => `Need ${yellow(length)} arguments after flag '${yellow(prefix(name))}'.`

export const INVALID_FORMATING = `Invalid formating flag, need to be '${yellow('flag')}=${yellow('value')}(${yellow(',value...')})'.`

export const DUPLICATE_FLAGS = (name: string) => `flags '${yellow(prefix(name))}' as already set.`

export const DEPENDS_FLAGS = (name: string, depend: string) => `flags '${yellow(prefix(name))}' need flags '${yellow(prefix(depend))}'`

// error throw when arguments is invalid

export const NEED_ARGUMENT = (type: CliArgType) => `need '${yellow(type.name.toLowerCase())}' arguments.`

export const INVALID_BOOL = `need a valid boolean, choice are '${italic(yellow('true'))}' or '${italic(yellow('false'))}'.`

export const INVALID_NUMBER = `need a valid '${italic(yellow('number'))}'.`

export const INVALID_DATE = `need a valid '${italic(yellow('date'))}'.`
