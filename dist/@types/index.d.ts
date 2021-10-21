declare type stopParseChoices = "--" | ";" | null;
interface ArgParserOptions {
    stopFlags?: stopParseChoices;
    name?: string;
    description?: string;
    progStatus?: string;
    footer?: string;
    version?: string;
    maxError?: number;
}
interface ArgParams {
    type: Object | Number | Boolean;
    default?: string | number | boolean;
    validator?: (value: string) => any;
}
interface Arg {
    mFlag?: string;
    sFlag?: string;
    description: string;
    params?: ArgParams[];
    call?: (ctx: ArgParserContext) => void;
}
interface Command {
    name: string;
    description: string;
    arguments?: Arg[];
    call: (ctx: ArgParserContext) => void;
}
interface infoFlag {
    _declare: Arg;
    params?: any[];
}
interface ArgParserContext {
    flags: {
        [key: string]: infoFlag;
    };
    arguments: string[];
    options: ArgParserOptions;
    parser: ArgParser;
    cmd?: Command;
}
interface ErrorArgParser {
    text: string;
    idxArgv: number;
    start?: number;
    end?: number;
}
declare class ArgParser {
    protected options: ArgParserOptions;
    protected arguments: Arg[];
    protected commands: Command[];
    protected argv: string[];
    protected errors: ErrorArgParser[];
    protected final: {
        [key: string]: infoFlag;
    };
    protected anyArgs: string[];
    constructor(options?: ArgParserOptions);
    protected checkArguments(args: Arg[], cmd?: Command | null): void;
    addArgument(arg: Arg): void;
    addCommand(cmd: Command): void;
    protected convertType(type: any, value: string): string | boolean | number;
    protected parseFlag(acutal: string, flag: Arg, index: number): number;
    protected _parseOption(args: Arg[], i?: number): boolean;
    protected checkArgumentsCall(): Function | null;
    protected context(): ArgParserContext;
    protected parseOptions(): boolean;
    protected parseCommand(): boolean;
    parse(argv: string[]): boolean;
    printError(): void;
    protected formatOptions(options: Arg[], prefix?: string): string[];
    protected formatSubCommands(sub: Command[]): string[];
    commandUsage(cmd: Command): void;
    usage(): void;
}
export default ArgParser;
