(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('colorette')) :
    typeof define === 'function' && define.amd ? define(['colorette'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.index = factory(global.clc));
})(this, (function (clc) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var clc__default = /*#__PURE__*/_interopDefaultLegacy(clc);

    class CliParser {
        constructor(name, description, options = {}) {
            this.name = name;
            this.description = description;
            this.options = options;
            this.commands = {};
            this.arguments = {};
            this.argumentsAlias = {};
            this.argv = [];
            this.errors = [];
            this._ctx = null;
            this.addArgument('help', {
                alias: 'h',
                description: 'Prints help information',
                call({ parser }) {
                    parser.usage();
                }
            });
            if (options.version) {
                this.addArgument('version', {
                    alias: 'v',
                    description: 'Print version info and exit',
                    call({ options, name, description }) {
                        console.info(`${name} ${options.version}`);
                    }
                });
            }
        }
        checkAlias(alias, suffix = "") {
            if (alias !== undefined) {
                if (alias.length != 1) {
                    throw new Error(`alias options '${alias}' need to be only one char ${suffix}`);
                }
                if (alias in this.argumentsAlias) {
                    throw new Error(`duplicate alias options '${alias} ${suffix}`);
                }
            }
        }
        addArgument(name, arg = {}) {
            if (name in this.arguments) {
                throw new Error(`duplicate options '${name}'`);
            }
            if (arg.alias) {
                this.checkAlias(arg.alias);
            }
            // TODO check command alerady exist
            this.arguments[name] = arg;
            if (arg.alias) {
                this.argumentsAlias[arg.alias] = true;
            }
        }
        addCommand(name, cmd) {
            if (name in this.commands) {
                throw new Error(`Command '${name}' already set`);
            }
            if (cmd.arguments === undefined) {
                cmd.arguments = {};
            }
            const alias = {};
            Object.keys(cmd.arguments).forEach(key => {
                //@ts-ignore
                const opt = cmd.arguments[key];
                if (opt.alias) {
                    this.checkAlias(opt.alias, `from command '${name}'`);
                    alias[opt.alias] = true;
                }
            });
            cmd.name = name;
            this.commands[name] = cmd;
        }
        convertType(type, value) {
            if (type === Number) {
                const n = Number(value);
                if (Number.isNaN(n)) {
                    throw new Error("nedd valid number.");
                }
                return n;
            }
            else if (type === Boolean) {
                switch (value) {
                    case "true":
                    case "yes":
                        return true;
                    case "false":
                    case "no":
                        return false;
                    default:
                        throw new Error("boolean type, choise are 'true' or 'false'");
                }
            }
            else {
                return value;
            }
        }
        advFlag(argv, index, choices, cliArgs, name) {
            const info = { params: [] };
            const arg = choices[name];
            cliArgs[name] = info;
            if (arg.alias) {
                cliArgs[arg.alias] = info;
            }
            if (!arg.params || !arg.params.length) {
                return index + 1;
            }
            let i = 0;
            for (; i < arg.params.length; i++) {
                const param = arg.params[i];
                if ((index + i) >= argv.length) {
                    if ("default" in param) {
                        info.params.push(param.default);
                    }
                    else {
                        this.errors.push({
                            text: `need ${clc__default["default"].yellow(arg.params.length)} arguments after flag '${name}'.`,
                            argvi: index + i
                        });
                        break;
                    }
                }
                else {
                    const value = argv[index + i];
                    try {
                        if (param.validator) {
                            info.params.push(param.validator(value));
                        }
                        else {
                            this.convertType(param.type, value);
                        }
                    }
                    catch (e) {
                        this.errors.push({ text: `invalid arugments for flag "${name}", ${e.toString()}`, argvi: index + i });
                        break;
                    }
                }
            }
            return index + i;
        }
        parseFlags(argv, choices, start = 0) {
            const flags = {};
            const anyArgs = [];
            let stop = false;
            const keys = Object.keys(choices);
            while (start < argv.length) {
                const val = argv[start];
                if (!stop && val === this.options.stopFlags) {
                    stop = true;
                    start++;
                }
                else if (stop || val[0] != '-') {
                    anyArgs.push(val);
                    start++;
                }
                else if (val[1] == '-') {
                    if (val.length == 2) {
                        this.errors.push({
                            text: `Empty argument '${clc__default["default"].yellow('--')}' which wasn't expected.`,
                            argvi: start++,
                            start: 2,
                            end: val.length - 2
                        });
                        continue;
                    }
                    const name = val.substring(2);
                    if (!(name in choices)) {
                        this.errors.push({
                            text: `Found argument '${clc__default["default"].yellow(`--${name}`)}' which wasn't expected, or isn't valid in this context.`,
                            argvi: start++,
                            start: 2,
                            end: val.length - 2
                        });
                        continue;
                    }
                    start = this.advFlag(argv, start, choices, flags, name);
                }
                else if (val.length != 1) {
                    // simple
                    let memStart = start;
                    for (let i = 1; i <= val.length - 1; i++) {
                        const name = keys.find(k => choices[k].alias === val[i]);
                        if (!name) {
                            this.errors.push({
                                text: `Found argument '${clc__default["default"].yellow(`-${val[i]}`)}' which wasn't expected, or isn't valid in this context.`,
                                argvi: start,
                                start: i,
                                end: 1
                            });
                            continue;
                        }
                        memStart = this.advFlag(argv, memStart, choices, flags, name);
                    }
                    start += (memStart === start ? 1 : memStart);
                }
                else {
                    this.errors.push({
                        text: `Empty argument '${clc__default["default"].yellow('-')}' which wasn't expected.`,
                        argvi: start++
                    });
                }
            }
            return [flags, anyArgs];
        }
        parseCommand(argv) {
            var _a;
            const name = argv[0];
            if (name in this.commands) {
                const cmd = this.commands[name];
                // merge global options with cmd options
                const args = Object.assign(Object.assign({}, this.arguments), cmd.arguments);
                // change usage function to command usage
                if ("help" in args) {
                    args.help.call = ({ parser, cmd }) => {
                        if (cmd) {
                            parser.commandUsage(cmd);
                        }
                    };
                }
                //parse options
                const [flags, anyArgs] = this.parseFlags(argv, args, 1);
                if (!this.errors.length) {
                    const callFalg = this._getCallFlag(flags);
                    if (callFalg) {
                        callFalg(this._createContext(flags, anyArgs, cmd));
                    }
                    else if (cmd.call) {
                        cmd.call(this._createContext(flags, anyArgs, cmd));
                    }
                }
            }
            else if (name[0] == '-') {
                this.errors.push({ text: `${(_a = this.name) !== null && _a !== void 0 ? _a : 'programme'} need to start with command` });
            }
            else {
                this.errors.push({ text: `no such subcommand: '${clc__default["default"].yellow(name)}''`, argvi: 0 });
            }
        }
        parseArguments(argv) {
            //parse options
            const [flags, anyArgs] = this.parseFlags(argv, this.arguments, 0);
            if (!this.errors.length) {
                const call = this._getCallFlag(flags);
                if (call) {
                    call(this._createContext(flags, anyArgs));
                }
            }
        }
        parse(argv) {
            if (argv.length == 0) {
                this.usage();
            }
            else if (Object.keys(this.commands).length) {
                this.parseCommand(argv);
            }
            else {
                this.parseArguments(argv);
            }
            if (this.errors.length) {
                this.printError(argv);
                return false;
            }
            return true;
        }
        _getCallFlag(flags) {
            const keys = Object.keys(flags);
            for (let i = 0; i < keys.length; i++) {
                const fl = flags[keys[i]];
                if (fl.call) {
                    return fl.call;
                }
            }
            return null;
        }
        get context() {
            if (!this._ctx) {
                throw new Error("You need to call 'parse' before access context");
            }
            return this._ctx;
        }
        _createContext(flags, anyArgs, cmd = null) {
            const ctx = {
                flags,
                anyArgs,
                parser: this,
                name: this.name,
                description: this.description,
                options: this.options
            };
            if (cmd) {
                ctx.cmd = cmd;
            }
            this._ctx = ctx;
            return ctx;
        }
        //--------------
        // utils
        //--------------
        // format
        printError(argv) {
            const argvLine = argv.join(' ') + "\n";
            let errors = this.errors;
            if (this.options.maxError) {
                errors = [...this.errors].splice(0, this.options.maxError);
            }
            let str = "";
            errors.forEach(err => {
                str += `${clc__default["default"].red(clc__default["default"].bold('error'))}: ${err.text}\n`;
                if (err.argvi !== undefined) {
                    // calcul padding spaces
                    str += argvLine;
                    let spaces = err.argvi;
                    for (let i = 0; i < err.argvi; i++) {
                        spaces += argv[i].length;
                    }
                    // generate arrow
                    const len = argv[err.argvi].length;
                    let tild;
                    if (err.start != undefined && err.end != undefined) {
                        tild = clc__default["default"].red("~".repeat(err.start)) + clc__default["default"].red(clc__default["default"].bold("^".repeat(err.end)));
                        const fin = len - (err.start + err.end);
                        if (fin > 0) {
                            tild += clc__default["default"].red("~".repeat(fin));
                        }
                    }
                    else {
                        tild = clc__default["default"].red(clc__default["default"].bold("^".repeat(len)));
                    }
                    str += `${" ".repeat(spaces)}${tild}\n`;
                }
            });
            if (this.errors.length >= 5) {
                str += `total errors: ${clc__default["default"].red(clc__default["default"].bold(this.errors.length))}`;
            }
            console.error(str);
        }
        // formating
        formatOptions(options, prefix = "Options:") {
            const keys = Object.keys(options);
            // calcul padding space
            const mem = {};
            const padding = keys.reduce((num, key) => {
                const opt = options[key];
                mem[key] = key.length;
                if (opt.params && opt.params.length) {
                    mem[key] += opt.params.reduce((c, p) => c + p.type.constructor.name.length, 0);
                }
                return Math.max(num, mem[key]);
            }, 0);
            let str = prefix + '\n';
            keys.forEach(key => {
                var _a;
                const opt = options[key];
                str += (opt.alias ? `-${opt.alias}, ` : '    ');
                str += `--${key} `;
                if (opt.params) {
                    str += opt.params.reduce((s, p) => `${s}${p.type.constructor.name} `, "");
                }
                // space padding 
                str += " ".repeat(padding - mem[key] + 1);
                str += (_a = opt.description) !== null && _a !== void 0 ? _a : clc__default["default"].italic("no information.");
            });
            return str;
        }
        formatCommands(cmds) {
            const keys = Object.keys(cmds);
            const padding = keys.reduce((c, key) => Math.max(c, key.length), 0);
            let str = "";
            keys.forEach(key => {
                str += `  ${key}${" ".repeat(padding - key.length)} ${cmds[key].description}\n`;
            });
            return str;
        }
        commandUsage(cmd) {
            if (typeof cmd === "string") {
                const tcmd = this.commands[cmd];
                if (tcmd === undefined) {
                    throw new Error(`'${cmd}' not found in commands`);
                }
                cmd = tcmd;
            }
            let str = "";
            str += `Usage: ${this.name} ${cmd.name} `;
            if (this.options.info) {
                str += this.options.info;
            }
            else {
                str += `[OPTIONS]\n\n`;
            }
            str += cmd.description;
            if (this.arguments) {
                str += '\n\n' + this.formatOptions(this.arguments, "Global options:");
            }
            if (cmd.arguments) {
                str += '\n\n' + this.formatOptions(cmd.arguments, "Command options:");
            }
            if (this.options.footer) {
                str += `\n\n${this.options.footer}`;
            }
            console.log(str);
        }
        usage() {
            let str = "";
            const haveCommand = Object.keys(this.commands).length > 0;
            const haveArguments = Object.keys(this.arguments).length > 0;
            str += `Usage: ${this.name} `;
            if (this.options.info) {
                str += this.options.info;
            }
            else {
                str += `[OPTIONS] ${haveCommand ? "COMMAND" : ""}\n\n`;
            }
            str += this.description;
            if (haveArguments) {
                str += '\n\n' + this.formatOptions(this.arguments);
            }
            if (haveCommand) {
                str += '\n\n' + this.formatCommands(this.commands);
            }
            if (this.options.footer) {
                str += `\n\n${this.options.footer}`;
            }
            console.log(str);
        }
    }

    return CliParser;

}));
