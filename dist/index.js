'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function optimizedSplit(name, c) {
    const arr = [];
    let start = -1;
    let i = 0;
    if (!name) {
        return arr;
    }
    while (i < name.length) {
        if (name[i] == c) {
            arr.push(name.substring(start + 1, i));
            start = i;
        }
        i++;
    }
    arr.push(name.substring(start + 1, name.length));
    return arr;
}

function isDigit(val) {
    const num = Number(val);
    return [!Number.isNaN(num), num];
}
function isBool(val) {
    const tr = val === "true";
    const fl = val === "false";
    return [tr || fl, tr || !fl];
}
function convVal(val) {
    const [valid, num] = isDigit(val);
    if (valid) {
        return num;
    }
    const [valid2, bool] = isBool(val);
    if (valid2) {
        return bool;
    }
    return val;
}
function checkArgument(cliObj, name, index) {
    if (!cliObj.options.anyFlags) {
        if (cliObj.arguments[name] === undefined && (!cliObj.cmd || cliObj.cmd.arguments[name] === undefined)) {
            cliObj.errors.push({ text: 'arguments not found', argv: index });
            return false;
        }
    }
    return true;
}
function parseMultiAll(cliObj, argv, index, name) {
    if (!name.length) {
        cliObj.errors.push({ text: 'invalid formating flag', argv: index });
        return index + 1;
    }
    if (!cliObj.options.inline) {
        if (checkArgument(cliObj, name, index)) {
            cliObj.flags[name] = [];
        }
        return index + 1;
    }
    const arr = optimizedSplit(name, '=');
    if (!checkArgument(cliObj, arr[0], index)) {
        return index + 1;
    }
    if (arr.length == 1) {
        cliObj.flags[name] = [];
    }
    else if (arr.length == 2) {
        cliObj.flags[arr[0]] = [];
        const _sp = optimizedSplit(arr[1], ',');
        for (let j = 0; j < _sp.length; j++) {
            const val = _sp[j];
            if (!val) {
                cliObj.errors.push({
                    text: `invalid formating flag`,
                    argv: index,
                });
                continue;
            }
            cliObj.flags[arr[0]].push(cliObj.options.convertValue ? convVal(val) : val);
        }
    }
    else {
        cliObj.errors.push({
            text: `invalid formating flag`,
            argv: index,
            start: 2 + arr[0].length
        });
    }
    return index + 1;
}
function parseSimpleAll(cliObj, argv, index) {
    const val = argv[index];
    for (let i = 1; i < val.length; i++) {
        const fl = val[i];
        if (checkArgument(cliObj, fl, index)) {
            cliObj.flags[fl] = [];
        }
    }
    return index + 1;
}
function parser(argv, options = {}) {
    var _a, _b, _c, _d, _e;
    const cliObj = {
        _: [],
        flags: {},
        errors: [],
        options: {
            inline: (_a = options.inline) !== null && _a !== void 0 ? _a : true,
            stopFlags: options.stopFlags,
            anyFlags: (_b = options.anyFlags) !== null && _b !== void 0 ? _b : false,
            convertValue: (_c = options.convertValue) !== null && _c !== void 0 ? _c : true,
        },
        arguments: (_d = options.arguments) !== null && _d !== void 0 ? _d : {},
        commands: (_e = options.commands) !== null && _e !== void 0 ? _e : {},
        argv,
    };
    let i = 0;
    while (i < argv.length && argv[i] !== options.stopFlags) {
        const ele = argv[i];
        if (ele[0] !== '-') {
            cliObj._.push(argv[i++]);
        }
        else if (ele[1] === '-') {
            i = parseMultiAll(cliObj, argv, i, ele.substring(2));
        }
        else {
            i = parseSimpleAll(cliObj, argv, i);
        }
    }
    while (i < argv.length) {
        cliObj._.push(argv[i++]);
    }
    return cliObj;
}
function haveErrors(cliObj) {
    return cliObj.errors.length != 0;
}
function printErrors(cliObj) {
    console.log("printErrors");
    cliObj.errors.forEach(v => {
        console.log(v.text);
        console.log(cliObj.argv[v.argv]);
    });
    // console.log(`errors: [ ${cliObj.errors.join(', ')} ]`)
}
function usage(cliObj) {
    console.log("usage");
}
function usageCommand(cliObj) {
    console.log("usageCommand");
}
function debug(cliObj) {
    console.log(`_: [ ${cliObj._.join(', ')} ]`);
    console.log(`flags: {`);
    Object.keys(cliObj.flags).forEach(k => {
        console.log(`\t${k}:`, cliObj.flags[k]);
    });
    console.log(`}`);
    console.log(`errors: [ ${cliObj.errors.join(', ')} ]`);
}

exports.debug = debug;
exports.haveErrors = haveErrors;
exports.parser = parser;
exports.printErrors = printErrors;
exports.usage = usage;
exports.usageCommand = usageCommand;
