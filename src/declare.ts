import CliParser from './index'

// object for defined arguments after flags
export interface CliArgParam {
    type: NumberConstructor | StringConstructor | BooleanConstructor
    default?: boolean | number | string,
    validator?: (value: string, params: any[]) => any
}

export type CliFunc = (ctx: CliContext) => void

//-------------------
// Arguments
//-------------------

// when user passer arguments to class
export interface CliArgSet {
    description?: string,
    alias?: string,
    params?: CliArgParam[],
    call?: CliFunc
}

// convert arguments user by final args
export interface CliArg extends CliArgSet {
    name: string,
    params: CliArgParam[]
}


//-------------------
// Comamnd
//-------------------

// user
export interface CliCmdSet {
    arguments?:  Obj<CliArgSet>,
    call?: CliFunc
}

// final
export interface CliCmd extends CliCmdSet {
    name: string,
    description: string,
    arguments: Obj<CliArg>,
    call?: (ctx: CliContext) => void
}


// utils


export interface CliParserOptions {
    info?: string,
    footer?: string,
    version?: string,
    stopFlags?: "--" | ";" | undefined,
    defaultArg?: boolean,
    inline?: boolean,
}

export interface CliError {
    text: string[],
    argvi: number,
    start?: number,
    end?: number,
}

export interface CliContext {
    cmd?: CliCmd,
    flags: CliFinal,
    anyArgs: string[],
    parser: CliParser,
    name: string,
    description: string,
    options: CliParserOptions,
    argv: string[]
}


// final args

export type CliFinal = Obj<any>

export interface Obj<Type> {
    [key:string]: Type
}