import { CliArgSet, CliArg, CliCmdSet, CliCmd, CliParserOptions, CliError, CliContext, CliFinal, Obj, CliArgParam, CliFunc, CliPos } from "./declare";
declare class CliParser {
    name: string;
    description: string;
    protected commands: Obj<CliCmd>;
    protected arguments: Obj<CliArg>;
    protected errors: CliError[];
    protected ctx: CliContext | undefined;
    protected options: CliParserOptions;
    protected argv: string[];
    constructor(name: string, description: string, options?: CliParserOptions);
    protected checkArguments(choices: Obj<CliArg>, arg: CliArg): void;
    addArgument(name: string, arg?: CliArgSet): void;
    addCommand(name: string, description: string, cmd?: CliCmdSet): void;
    protected checkDefault(param: CliArgParam): any;
    protected convertValue(allParams: any[], param: CliArgParam, value: string): any;
    protected assginFlag(cliArgs: CliFinal, arg: CliArg, pos: Obj<CliPos[]>): any[];
    protected advFlagInline(index: number, choices: Obj<CliArg>, cliArgs: CliFinal, pos: Obj<CliPos[]>, _spliter: string[]): number;
    protected advFlag(argv: string[], index: number, cliArgs: CliFinal, arg: CliArg, pos: Obj<CliPos[]>, match: string): number;
    protected parseMulti(flags: CliFinal, argv: string[], val: string, choices: Obj<CliArg>, pos: Obj<CliPos[]>, index: number): number;
    protected parseSimple(flags: CliFinal, argv: string[], val: string, choices: Obj<CliArg>, pos: Obj<CliPos[]>, index: number): number;
    protected parseFlags(argv: string[], choices: Obj<CliArg>, index?: number): [CliFinal, string[], Obj<CliPos[]>];
    protected checkArgDepend(args: Obj<CliArg>): void;
    parse(argv: string[]): boolean;
    protected getCall(flags: CliFinal, args: Obj<CliArg>, cmd: CliCmd | undefined): CliFunc | undefined;
    protected checkDependFlags(pos: Obj<CliPos[]>, args: Obj<CliArg>, flags: CliFinal): void;
    get context(): CliContext;
    protected createContext(flags: CliFinal, anyArgs: string[], cmd?: CliCmd | undefined): CliContext;
    protected addError(text: string, argvi: number, start?: number | undefined, end?: number | undefined): void;
    printError(max?: number | undefined): void;
    protected formatOptions(options: Obj<CliArg>, prefix?: string): string;
    protected formatCommands(cmds: Obj<CliCmd>): string;
    commandUsage(cmd: CliCmd | string): void;
    usage(): void;
}
export default CliParser;
