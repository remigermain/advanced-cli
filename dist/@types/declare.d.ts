import CliParser from './index';
export declare type CliArgType = NumberConstructor | StringConstructor | BooleanConstructor | DateConstructor;
export declare type CliArgTypeValue = number | string | boolean | Date;
export interface CliArgParam {
    type: CliArgType;
    default?: CliArgTypeValue;
    validator?: (value: string, params: any[]) => any;
}
export declare type CliFunc = (ctx: CliContext) => void;
export interface CliArgSet {
    description?: string;
    alias?: string;
    params?: CliArgParam[];
    depends?: string[];
    call?: CliFunc;
}
export interface CliArg extends CliArgSet {
    name: string;
    params: CliArgParam[];
}
export interface CliCmdSet {
    arguments?: Obj<CliArgSet>;
    call?: CliFunc;
}
export interface CliCmd extends CliCmdSet {
    name: string;
    description: string;
    arguments: Obj<CliArg>;
    call?: (ctx: CliContext) => void;
}
export interface CliParserOptions {
    info?: string;
    footer?: string;
    version?: string;
    stopFlags?: "--" | ";" | undefined;
    defaultArg?: boolean;
    inline?: boolean;
}
export interface CliError extends CliPos {
    text: string[];
}
export interface CliContext {
    cmd?: CliCmd;
    flags: CliFinal;
    anyArgs: string[];
    parser: CliParser;
    name: string;
    description: string;
    options: CliParserOptions;
    argv: string[];
}
export interface CliFinal {
    [key: string]: any;
    _?: Obj<CliPos>;
}
export interface CliPos {
    argvi: number;
    start?: number;
    end?: number;
}
export interface Obj<Type> {
    [key: string]: Type;
}
