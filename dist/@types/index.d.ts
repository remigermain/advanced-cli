interface CliParserOptions {
    info?: string;
    footer?: string;
    version?: string;
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
    flags: CliFinal;
    anyArgs: string[];
    parser: CliParser;
    name: string;
    description: string;
    options: CliParserOptions;
    argv: string[];
}
interface CliArgParams {
    type: Object | Number | Boolean;
    default?: string | number | boolean;
    validator?: (value: string) => any;
}
interface CliArgSet {
    alias?: string;
    description?: string;
    params?: CliArgParams[];
    call?: (ctx: CliContext) => void;
}
interface CliArg extends CliArgSet {
    name: string;
}
interface Command {
    name?: string;
    description?: string;
    arguments?: CliArguments;
    call?: (ctx: CliContext) => void;
}
interface CliArguments {
    [key: string]: CliArg;
}
interface CliCommand {
    [key: string]: Command;
}
interface CliFinal {
    [key: string]: any[];
}
declare class CliParser {
    name: string;
    description: string;
    protected commands: CliCommand;
    protected arguments: CliArguments;
    protected argumentsAlias: CliArguments;
    protected argumentsCommandAlias: CliArguments;
    protected errors: CliError[];
    protected _ctx: CliContext | null;
    protected options: CliParserOptions;
    protected argv: string[];
    constructor(name: string, description: string, options?: CliParserOptions);
    checkAlias(choices: CliArguments, arg: CliArg): void;
    addArgument(name: string, arg?: CliArgSet): void;
    addCommand(name: string, description: string, cmd?: Command): void;
    protected convertType(type: any, value: string): string | boolean | number;
    advFlag(argv: string[], index: number, choices: CliArguments, cliArgs: CliFinal, name: string): number;
    parseFlags(argv: string[], choices: CliArguments, start?: number): [CliFinal, string[]];
    parseCommand(argv: string[]): boolean;
    parseArguments(argv: string[]): boolean;
    parse(argv: string[]): boolean;
    _getCallFlag(flags: CliFinal, args: CliArguments): Function | null;
    get context(): CliContext;
    _createContext(flags: CliFinal, anyArgs: string[], cmd?: Command | null): CliContext;
    printError(max?: number | null): void;
    protected formatOptions(options: CliArguments, prefix?: string): string;
    protected formatCommands(cmds: CliCommand): string;
    commandUsage(cmd: Command | string): void;
    usage(): void;
}
export default CliParser;
