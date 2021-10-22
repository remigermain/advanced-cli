interface CliParserOptions {
    info?: string;
    footer?: string;
    version?: string;
    maxError?: number;
    stopFlags?: "--" | ";" | null;
    defaultArg?: boolean;
}
interface CliError {
    text: string;
    argvi?: number;
    start?: number;
    end?: number;
}
interface CliContext {
    cmd?: Command;
    flags: CliArguments;
    anyArgs: string[];
    parser: CliParser;
    name: string;
    description: string;
    options: CliParserOptions;
}
interface CliArgParams {
    type: Object | Number | Boolean;
    default?: string | number | boolean;
    validator?: (value: string) => any;
}
interface CliArg {
    name?: string;
    alias?: string;
    description?: string;
    params?: CliArgParams[];
    call?: (ctx: CliContext) => void;
}
interface CliArguments {
    [key: string]: CliArg;
}
interface Command {
    name: string;
    description: string;
    arguments?: CliArguments;
    call: (ctx: CliContext) => void;
}
interface CliCommand {
    [key: string]: Command;
}
declare class CliParser {
    name: string;
    description: string;
    protected commands: CliCommand;
    protected arguments: CliArguments;
    protected argumentsAlias: {
        [key: string]: true;
    };
    protected argv: string[];
    protected errors: CliError[];
    protected _ctx: CliContext | null;
    protected options: CliParserOptions;
    constructor(name: string, description: string, options?: CliParserOptions);
    addArgument(name: string, arg?: CliArg): void;
    addCommand(name: string, cmd: Command): void;
    protected convertType(type: any, value: string): string | boolean | number;
    advFlag(argv: string[], index: number, choices: CliArguments, cliArgs: CliArguments, name: string): number;
    parseFlags(argv: string[], choices: CliArguments, start?: number): [CliArguments, string[]];
    parseCommand(argv: string[]): boolean;
    parseArguments(argv: string[]): boolean;
    parse(argv: string[]): boolean;
    _getCallFlag(flags: CliArguments): Function | null;
    get context(): CliContext;
    _createContext(flags: CliArguments, anyArgs: string[], cmd?: Command | null): CliContext;
    printError(argv: string[]): void;
    protected formatOptions(options: CliArguments, prefix?: string): string;
    protected formatCommands(cmds: CliCommand): string;
    commandUsage(cmd: Command | string): void;
    usage(): void;
}
export default CliParser;
