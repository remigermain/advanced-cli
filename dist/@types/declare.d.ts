import CliParser from './index';
export interface CliArgParam {
    type: NumberConstructor | StringConstructor | BooleanConstructor;
    default?: boolean | number | string;
    validator?: (value: string, params: any[]) => any;
}
export declare type CliFunc = (ctx: CliContext) => void;
export interface CliArgSet {
    description?: string;
    alias?: string;
    params?: CliArgParam[];
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
    stopFlags?: "--" | ";" | null;
    defaultArg?: boolean;
    inline?: boolean;
}
export interface CliError {
    text: string;
    argvi?: number;
    start?: number;
    end?: number;
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
export declare type CliFinal = Obj<any>;
export interface Obj<Type> {
    [key: string]: Type;
}
