interface AdvCliCommand {
    arguments: {
        [key: string]: any;
    };
}
interface AdvCliContext {
    _: string[];
    flags: {
        [key: string]: any;
    };
    errors: any[];
    options: AdvClioptions;
    cmd?: AdvCliCommand;
    arguments: {
        [key: string]: any;
    };
    commands: {
        [key: string]: any;
    };
    argv: string[];
}
interface AdvClioptions {
    name?: string;
    description?: string;
    version?: string;
    stopFlags?: string | null;
    inline?: boolean;
    arguments?: {};
    commands?: {};
    convertValue?: boolean;
    anyFlags?: boolean;
}
export declare function parser(argv: string[], options?: AdvClioptions): AdvCliContext;
export declare function haveErrors(cliObj: AdvCliContext): boolean;
export declare function printErrors(cliObj: AdvCliContext): void;
export declare function usage(cliObj: AdvCliContext): void;
export declare function usageCommand(cliObj: AdvCliContext): void;
export declare function debug(cliObj: AdvCliContext): void;
export {};
