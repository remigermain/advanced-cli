"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cli_color_1 = __importDefault(require("cli-color"));
var findOptions = function (mfl, sfl) { return function (opt) {
    if (opt.sFlag) {
        return opt.sFlag === sfl;
    }
    return opt.mFlag === mfl;
}; };
var ArgParser = /** @class */ (function () {
    function ArgParser(options) {
        if (options === void 0) { options = {}; }
        this.arguments = [];
        this.commands = [];
        this.anyArgs = [];
        this.errors = [];
        this.final = {};
        this.argv = [];
        this.baseOptions = {
            help: {
                sFlag: "h",
                mFlag: "help",
                description: "print help",
                call: function (_a) {
                    var parser = _a.parser;
                    parser.usage();
                    return true;
                }
            },
            version: {
                sFlag: "v",
                mFlag: "version",
                description: "display version",
                // @ts-ignore
                // TODO call in arguments
                call: function (_a) {
                    var options = _a.options;
                    console.info(options.version);
                }
            }
        };
        this.options = options;
        // add default help
        var help = this.arguments.filter(findOptions("help", "h"))[0];
        if (!help) {
            this.addArgument(__assign({}, this.baseOptions.help));
        }
        if (this.options.version) {
            var version = this.arguments.filter(findOptions("version", "v"))[0];
            if (!version) {
                this.addArgument(__assign({}, this.baseOptions.version));
            }
        }
    }
    ArgParser.prototype.checkArguments = function (args, cmd) {
        if (cmd === void 0) { cmd = null; }
        var duplicate = {};
        args.forEach(function (a, idx) {
            var _a;
            var key = a.sFlag || a.mFlag || "not";
            if (key in duplicate) {
                throw new Error("duplicate options \"" + key + "\" " + (cmd ? "from \"" + cmd.name + "\" command" : ""));
            }
            if (!a.sFlag && !a.mFlag) {
                throw new Error("sFlag or mFlag need to be set");
            }
            // @ts-ignore
            if (((_a = a.sFlag) === null || _a === void 0 ? void 0 : _a.length) > 1) {
                throw new Error("sFlag need to be only one char");
            }
            duplicate[key] = true;
        });
    };
    ArgParser.prototype.addArgument = function (arg) {
        // check command alerady exist
        this.arguments.push(arg);
        this.checkArguments(this.arguments);
    };
    ArgParser.prototype.addCommand = function (cmd) {
        // check command alerady exist
        var f = this.commands.filter(function (s) { return s.name === cmd.name; });
        if (f.length > 0) {
            throw new Error("Command \"" + cmd.name + "\" already set\"");
        }
        if (cmd.arguments == null || !cmd.arguments.length) {
            cmd.arguments = [];
        }
        this.checkArguments(cmd.arguments, cmd);
        var help = cmd.arguments.filter(findOptions("help", "h"))[0];
        if (!help) {
            var baseHelp = __assign({}, this.baseOptions.help);
            baseHelp.call = function (_a) {
                var parser = _a.parser, cmd = _a.cmd;
                //@ts-ignore
                parser.commandUsage(cmd);
            };
            cmd.arguments.push(baseHelp);
        }
        this.commands.push(cmd);
    };
    ArgParser.prototype.convertType = function (type, value) {
        if (type === Number) {
            if (!value.match(/^-?\d+$/)) {
                throw new Error("nedd valid number.");
            }
            return parseInt(value);
        }
        else if (type === Boolean) {
            var isTrue = value === "true";
            var isFalse = value === "false";
            if (!isTrue || !isFalse) {
                throw new Error("boolean type, choise are \"true\" or \"false\"");
            }
            return isTrue || false;
        }
        else {
            return value;
        }
    };
    ArgParser.prototype.parseFlag = function (acutal, flag, index) {
        var _a, _b, _c;
        var info = { _declare: flag };
        if (flag.sFlag) {
            // @ts-ignore
            this.final[flag.sFlag] = info;
        }
        if (flag.mFlag) {
            // @ts-ignore
            this.final[flag.mFlag] = info;
        }
        // parse sub arguments
        if ((_a = flag.params) === null || _a === void 0 ? void 0 : _a.length) {
            info.params = [];
            var i = 0;
            for (; i < flag.params.length; i++) {
                var param = flag.params[i];
                if (this.argv.length <= (i + index + 1)) {
                    if ("default" in param) {
                        info.params[i] = param.default;
                    }
                    else {
                        this.addError((_b = flag.description) !== null && _b !== void 0 ? _b : "need " + flag.params.length + " arguments after flag \"" + acutal + "\".", index);
                    }
                    break;
                }
                else {
                    var value = this.argv[index + i + 1];
                    try {
                        if (param.validator) {
                            var v = param.validator(value);
                            info.params[i] = v;
                        }
                        else {
                            this.convertType(param.type, value);
                        }
                    }
                    catch (e) {
                        //@ts-ignore
                        var t = "invalid arugments for flag \"" + acutal + "\", " + e.toString();
                        this.addError(t, index + i + 1);
                    }
                }
            }
        }
        return index + (((_c = flag.params) === null || _c === void 0 ? void 0 : _c.length) || 0) + 1;
    };
    ArgParser.prototype._parseOption = function (args, i) {
        if (i === void 0) { i = 0; }
        var stopParse = false;
        var argStop = this.options.stopFlags || null;
        var _loop_1 = function () {
            var el = this_1.argv[i];
            if (el === argStop) {
                stopParse = true;
            }
            if (stopParse || el[0] != "-") {
                this_1.anyArgs.push(el);
                i++;
                return "continue";
            }
            // parse multi flag (start with --)
            if (el[1] == "-") {
                var flag_1 = el.substr(2);
                var mf = args.filter(function (e) { return e.mFlag === flag_1; })[0];
                if (!mf) {
                    this_1.addError("Found argument '" + cli_color_1.default.yellow("--" + flag_1) + "' which wasn't expected, or isn't valid in this context", i++);
                }
                else {
                    i = this_1.parseFlag(flag_1, mf, i);
                }
                // parse simple flag (start with -)
            }
            else {
                var _loop_2 = function (j) {
                    var fl = el[j];
                    var sf = args.filter(function (e) { return e.sFlag == fl; })[0];
                    if (!sf)
                        this_1.addError("Found argument '" + cli_color_1.default.yellow("-" + fl) + "' which wasn't expected, or isn't valid in this context", i++, j, j + 1);
                    else {
                        i = this_1.parseFlag(fl, sf, i);
                    }
                };
                // simple flag
                for (var j = 1; j < el.length; j++) {
                    _loop_2(j);
                }
            }
            i++;
        };
        var this_1 = this;
        while (i < this.argv.length) {
            _loop_1();
        }
        return this.errors.length == 0;
    };
    ArgParser.prototype.checkArgumentsCall = function () {
        var keys = Object.keys(this.final);
        for (var i = 0; i < keys.length; i++) {
            var obj = this.final[keys[i]];
            if (obj._declare.call) {
                return obj._declare.call;
            }
        }
        return null;
    };
    ArgParser.prototype.context = function (cmd) {
        if (cmd === void 0) { cmd = null; }
        // call subcommand function with context
        var ctx = {
            flags: this.final,
            arguments: this.anyArgs,
            options: this.options,
            parser: this,
        };
        if (cmd) {
            ctx.cmd = cmd;
        }
        return ctx;
    };
    ArgParser.prototype.parseOptions = function () {
        if (!this._parseOption(this.arguments)) {
            return false;
        }
        // TODO check if call
        var call = this.checkArgumentsCall();
        if (call) {
            call(this.context());
        }
        return true;
    };
    ArgParser.prototype.parseSubCommand = function () {
        if (this.argv.length == 0) {
            this.usage();
            return false;
        }
        var nameCmd = this.argv[0];
        var cmd = this.commands.filter(function (s) { return s.name === nameCmd; })[0];
        if (!cmd) {
            this.addError("no such subcommand: \"" + nameCmd + "\"", 0);
            return false;
        }
        // merge global arguments and command arguments
        var args = __spreadArray([], (cmd.arguments || []), true);
        this.arguments.forEach(function (gobalArg) {
            var exists = args.filter(findOptions(gobalArg.mFlag, gobalArg.sFlag))[0];
            if (!exists) {
                args.push(gobalArg);
            }
        });
        // 1 == remove command params
        var results = this._parseOption(args, 1);
        // error in options
        if (!results) {
            return false;
        }
        // generate context
        var ctx = this.context(cmd);
        var call = this.checkArgumentsCall();
        if (call) {
            // @ts-ignore
            call(ctx);
        }
        else {
            cmd.call(ctx);
        }
        return true;
    };
    ArgParser.prototype.parse = function (argv) {
        this.argv = argv;
        var results;
        if (this.commands.length > 0) {
            results = this.parseSubCommand();
        }
        else {
            results = this.parseOptions();
        }
        if (!results) {
            this.printError();
        }
        return results;
    };
    // errors
    ArgParser.prototype.addError = function (text, idxArgv, min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        this.errors.push({
            text: text,
            idxArgv: idxArgv,
            min: min,
            max: max
        });
    };
    ArgParser.prototype.convCall = function (res) {
        // convert return value
        if (res === undefined || res === null) {
            return true;
        }
        else if (typeof res === "boolean") {
            return res;
        }
        return !!res;
    };
    // formating
    ArgParser.prototype.printError = function () {
        var _this = this;
        var argvLine = this.argv.join(' ') + "\n";
        var str = "";
        this.errors.forEach(function (err) {
            str += cli_color_1.default.red(cli_color_1.default.bold('error')) + ": " + err.text + "\n";
            str += argvLine;
            // calcul padding spaces
            var spaces = (err.min || 0) + err.idxArgv;
            for (var i = 0; i < err.idxArgv; i++) {
                spaces += _this.argv[i].length;
            }
            var arrow = err.max || _this.argv[err.idxArgv].length;
            //@ts-ignore
            str += "" + " ".repeat(spaces) + cli_color_1.default.red(cli_color_1.default.bold('^')).repeat(arrow) + "\n";
            // console.error(`${clc.red(clc.bold('error'))}: ${err.text}`)
            // console.error(argvLine)
            // // calcul padding spaces
            // let spaces = (err.min || 0 ) + err.idxArgv
            // for (let i = 0;i < err.idxArgv; i++) {
            //     spaces += this.argv[i].length
            // }
            // const arrow = err.max || this.argv[err.idxArgv].length
            // //@ts-ignore
            // console.error(`${" ".repeat(spaces)}${clc.red(clc.bold('^')).repeat(arrow)}`)
        });
        // console.error(str)
    };
    ArgParser.prototype.getNameType = function (type) {
        if (type === Number) {
            return "number";
        }
        else if (type === Boolean) {
            return "boolean";
        }
        else {
            return "string";
        }
    };
    ArgParser.prototype.formatOptions = function (options, prefix) {
        var _this = this;
        if (prefix === void 0) { prefix = "Options:"; }
        var mflCount = {};
        // calcul padding space
        var paddingMflag = options.reduce(function (i, opt) {
            var _a;
            if (opt.mFlag) {
                mflCount[opt.mFlag] = opt.mFlag.length;
                if (opt.params) {
                    mflCount[opt.mFlag] += ((_a = opt.params) === null || _a === void 0 ? void 0 : _a.reduce(function (si, p) { return si + _this.getNameType(p.type).length; }, 0)) + 1;
                }
                return Math.max(i, mflCount[opt.mFlag]);
            }
            return i;
        }, 0);
        var arr = [prefix];
        return options.reduce(function (arr, opt) {
            var _a;
            var str = (opt.sFlag ? " -" + opt.sFlag : "   ");
            // separator
            str += ((opt.sFlag && opt.mFlag) ? ", " : "  ");
            // mflags
            if (opt.mFlag) {
                str += "--" + opt.mFlag + " ";
                if (opt.params) {
                    str += opt.params.reduce(function (s, p) { return "" + s + _this.getNameType(p.type) + " "; }, "");
                }
            }
            // @ts-ignore
            // space padding 
            str += " ".repeat((opt.mFlag ? paddingMflag - mflCount[opt.mFlag] : paddingMflag + 3) + 1);
            // help
            arr.push("" + str + ((_a = opt.description) !== null && _a !== void 0 ? _a : "no information."));
            return arr;
        }, arr);
    };
    ArgParser.prototype.formatSubCommands = function (sub) {
        var arr = ["Management Commands:"];
        var padding = sub.reduce(function (c, s) { return Math.max(c, s.name.length); }, 0);
        return sub.reduce(function (ar, s) {
            // ad paddding (+2 for space beetwen subcommand and description)
            // @ts-ignore
            ar.push("  " + s.name + " " + " ".repeat(padding - s.name.length + 2) + s.description);
            return ar;
        }, arr);
    };
    ArgParser.prototype.commandUsage = function (cmd) {
        var _a, _b;
        var str = "";
        str += "Usage: " + ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "") + " " + cmd.name + " ";
        if (this.options.progStatus) {
            str += this.options.progStatus;
        }
        else {
            str += "[OPTIONS]\n\n";
        }
        str += cmd.description;
        if (this.arguments) {
            str += '\n\n' + this.formatOptions(this.arguments, "Global options:").join("\n");
        }
        if (cmd.arguments) {
            str += '\n\n' + this.formatOptions(cmd.arguments, "Command options:").join("\n");
        }
        if (this.options.footer) {
            str += "\n\n" + this.options.footer;
        }
        console.log(str);
    };
    ArgParser.prototype.usage = function () {
        var _a, _b;
        var str = "";
        str += "Usage: " + ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "") + " ";
        if (this.options.progStatus) {
            str += this.options.progStatus;
        }
        else {
            str += "[OPTIONS] " + (this.commands.length > 0 ? "COMMAND" : "") + "\n\n";
        }
        if (this.options.description) {
            str += this.options.description;
        }
        if (this.arguments.length) {
            str += '\n\n' + this.formatOptions(this.arguments).join("\n");
        }
        if (this.commands.length) {
            str += '\n\n' + this.formatSubCommands(this.commands).join("\n");
        }
        if (this.options.footer) {
            str += "\n\n" + this.options.footer;
        }
        console.log(str);
    };
    return ArgParser;
}());
exports.default = ArgParser;
