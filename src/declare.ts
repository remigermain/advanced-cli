import CliParser from './index'

// object for defined arguments after flags
export interface CliArgParam {
    type: Boolean | Number | String,
    default?: boolean | Number | String,
    validator?: (value: string) => any
}

//-------------------
// Arguments
//-------------------

// when user passer arguments to class
export interface CliArgSet {
    description?: string,
    alias?: string,
    params?: CliArgParam[],
    call?: (ctx: CliContext) => void
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
    alias?: string,
    arguments?:  Obj<CliArgSet>,
    call?: (ctx: CliContext) => void
}

// final
export interface CliCmd extends CliCmdSet {
    name: string,
    description: string,
    alias?: string,
    arguments: Obj<CliArg>,
    call?: (ctx: CliContext) => void
}


// utils


export interface CliParserOptions {
    info?: string,
    footer?: string,
    version?: string,
    stopFlags?: "--" | ";" | null,
    defaultArg?: boolean
}

export interface CliError {
    text: string,
    argvi?: number,
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