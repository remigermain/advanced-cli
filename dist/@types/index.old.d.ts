declare type stopParseChoices = "--" | ";" | null;
interface ArgParserOptions {
    stopFlags?: stopParseChoices;
    name?: string;
    description?: string;
    progStatus?: string;
    footer?: string;
    version?: string;
}
interface ArgParams {
    type: Object | Number | Boolean;
    default?: string | number | boolean;
    validator?: Function;
}
interface Arg {
    mFlag?: string;
    sFlag?: string;
    description: string;
    params?: ArgParams[];
    call?: Function;
}
interface Command {
    name: string;
    description: string;
    arguments?: Arg[];
    call: Function;
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
    min: number | null;
    max: number | null;
}
declare class ArgParser {
    protected options: ArgParserOptions;
    protected arguments: Arg[];
    protected commands: Command[];
    protected anyArgs: string[];
    protected errors: ErrorArgParser[];
    protected final: {
        [key: string]: infoFlag;
    };
    protected argv: string[];
    protected baseOptions: {
        [key: string]: Arg;
    };
    constructor(options?: ArgParserOptions);
    protected checkArguments(args: Arg[], cmd?: Command | null): void;
    addArgument(arg: Arg): void;
    addCommand(cmd: Command): void;
    protected convertType(type: any, value: string): string | boolean | number;
    protected parseFlag(acutal: string, flag: Arg, index: number): number;
    protected _parseOption(args: Arg[], i?: number): boolean;
    protected checkArgumentsCall(): Function | null;
    protected context(cmd?: Command | null): ArgParserContext;
    protected parseOptions(): boolean;
    protected parseSubCommand(): boolean;
    parse(argv: string[]): boolean;
    private addError;
    protected convCall(res: any): boolean;
    printError(): void;
    protected getNameType(type: Number | Object | Boolean): string;
    protected formatOptions(options: Arg[], prefix?: string): string[];
    protected formatSubCommands(sub: Command[]): string[];
    commandUsage(cmd: Command): void;
    usage(): void;
}
export default ArgParser;
