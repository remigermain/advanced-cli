interface AdvCliContext {
    _: string[];
    flags: {
        [key: string]: any;
    };
    errors: any[];
    options: AdvClioptions;
}
interface AdvClioptions {
    name?: string;
    description?: string;
    version?: string;
    stopFlags?: string | null;
    inline?: boolean;
    arguments?: {};
    commands?: {};
}
export declare function parser(argv: string[], options?: AdvClioptions): AdvCliContext;
export declare function haveErrors(cliObj: AdvCliContext): boolean;
export declare function printErrors(cliObj: AdvCliContext): void;
export declare function usage(cliObj: AdvCliContext): void;
export declare function usageCommand(cliObj: AdvCliContext): void;
export declare function debug(cliObj: AdvCliContext): void;
export {};
