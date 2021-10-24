# Advanced-cli

[![CI](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml)
[![build](https://img.shields.io/npm/v/advanced-cli)](https://www.npmjs.com/package/advanced-cli)

A Cli parser with advanced arguments/command, very fast execution (more than [mri](https://github.com/lukeed/mri)).
The parser is inspired by python argsparser, the output is look like docker or cargo(rust lang) cli.

## Installation

```bash
yarn add advanced-cli
```

# Example

```js
const CliParser = require("advanced-cli");

const options = {
  version: "1.0.1",
  footer:
    "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
};

// initialize parser
const parser = new CliParser(
  "docker",
  "A self-sufficient runtime for containers",
  options
);

// add global arguments ( is can be used with all commands like --help)

// flag "config" need a number after it like: "--config 42"
parser.addArgument("config", {
  description: "Location of client config files",
  params: [{ type: Number }],
});

// flag "debug" need no arguments, so ou can use like "--debug" or "-D"
parser.addArgument("debug", {
  alias: "D",
  description: "Enable debug mode",
});

// add command, the command need to be the first params in argv
// the "run" command when is set, call function with context( see #context )
parser.addCommand("run", "Run a command in a new container", {
  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
    // do something
  },
});

// the command "search", the command have 2 arguments (only availabe in search  command )
parser.addCommand("search", "Search the Docker Hub for images", {
  arguments: {
    // first flags: "local"
    // command have a alias "l" so is can be set like "--local ..." or "-l"
    // the command need 1 arguments with type String, but if not have value, the default is "/home/local"
    // ex:  "--local", "--local otherparams",  "-l", "-l path" all work
    local: {
      alias: "l",
      params: [
        {
          type: String,
          default: "/home/local",
        },
      ],
    },

    // second flags: "group"
    // command have not alias so you os is can only setlike "--group"
    // the command need 2 arguments with type String, and boolean"
    // type string need to be validate by a function, first fucntions arguments is the arugmments string,
    // if you dont throw a error, the arguments is valid, and is set by the return value
    // the second arguments need boolean, if is not exist is set to "false" by defaul
    // ex:  "--group" // dont work need first string arguments
    // "--group user", "--group dev true", "--group root false" // work
    // "group other" // other match in validator,  "--group dev dev" // invalid boolean
    group: {
      params: [
        {
          validator(value) {
            const choices = ["root", "user", "dev"];
            if (choices.includes(value)) {
              return "all";
            }
            throw new Error("invalid group");
          },
        },
        {
          type: Boolean,
          default: false,
        },
      ],
    },
  },

  // if the command "search" is set
  // we call this function at the end of parser with context data (see #context)

  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
    // do something
  },
});

const argv = process.argv.slice(2);
if (parser.parse(argv)) {
  const { flags, anyArgs } = parser.context;
  // do something
} else {
  parser.printError();
}
```

```js
const parser = new CliParser(
  "docker",
  "A self-sufficient runtime for containers",
  options
);
parser.addArgument("config", {
  description: "Location of client config files",
  params: [{ type: Number }, {type:string}, {type:boolean}, {type:string, default: "all"}],
});
parser.parse(['hello', '--config', '6', 'user', 'true']

const {flags, anyArgs} = parser.context

# output flags:
# {config: [6, 'user', true, 'all']}

# anyArgs represant others arguments
# output anyArgs
# ['hello']

```

## Options

various options is available

```ts
// Parser
{
    info: string, // your information for use your programm
    footer: string, // display a footer message when usage is call
    version: string, // you version of your app
    stopFlags: "--" | ";" | null // stop parsing flag , default null
  	inline: false, // add posibility the flags are format like this  --foo=bar,booz,bo
    // inline mdoe have a big execution cost ( cause need to split )
}

// Params
{
    type?: Number | Boolean | String, // the arguments type, is convert to it
    default?: boolean | number | string,// if is not have arguments,it get the default value
    validator?: (value: string, params: any[]) // pass the value in funciton, and do complex validation on it
    // you need to set type or validator, no both
}

// Arguments
{
    description: string, // a description for your arguments
    alias: string, // a alais
    params: [ #Params ], // a list with object Params
    call: Function // function, get the context,do the thing , and quit
}

// Command
{
	arguments: {
		// name is your flags name like 'help'
		name: {
			#Arguments
		},
		...
	}
    call?: (context) // function, get the context,do the thing , and quit
}
```

## Ouput

With previous configuration, the usage output look like this

**Usage**

```
Usage: docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
-h, --help             Prints help information
-v, --version          Print version info and exit
    --config <string>  Location of client config files
-D, --debug            Enable debug mode


Commands:
  run    Run a command in a new container
  search Search the Docker Hub for images


To get more help with docker, check out our guides at https://docs.docker.com/go/guides/
```

**Usage command**

```
Usage: docker search [OPTIONS]

Search the Docker Hub for images

Global options:
-h, --help             Prints help information
-v, --version          Print version info and exit
    --config <number>  Location of client config files
-D, --debug            Enable debug mode


Command options:
-l, --local <string>            no information.
    --group <string> <boolean>  no information.


To get more help with docker, check out our guides at https://docs.docker.com/go/guides/
```

## Errors example

```
error: Invalid arugments for flag 'config', need 1 arguments.
docker search --config
                       ^
```

```
error: Invalid arugments for flag 'config', need a valid number.
docker search --config tre
                       ^^^
```

```
error: Invalid arugments for flag 'sh', need a valid boolean, choice are 'true' or 'false'
docker search --sh 44
                   ^^
```

```
error: no such command: 'seade'
docker seade --config r
       ^^^^^
```

```
error: Invalid arugments for flag 'group', invalid group
docker search --group hupio
                      ^^^^^
```

```
error: Found argument '--prop' which wasn't expected, or isn't valid in this context.
docker search --prop
              ~~^^^^
```

**with inline mode**

```
error: Invalid arugments for flag 'group', invalid group
docker search --group=tu,54
              ~~~~~~~~^^~~~
```

```
error: Invalid arugments for flag 'group', need a valid boolean, choice are 'true' or 'false'
docker search --group=tu,54
              ~~~~~~~~~~~^^
```

## Benchmarks

Script made by [mri](https://github.com/lukeed/mri), **nodejs v14.18.0**

**inline mode disable**

```
nopt: 2.163ms
yargs-parser: 4.11ms
minimist: 0.722ms
mri: 1.827ms
advanced-cli: 2.469ms

Benchmark: small: [-b, --bool, --no-meep, --multi=baz]
minimist      x 214,159 ops/sec ±2.52% (88 runs sampled)
mri           x 802,334 ops/sec ±0.46% (91 runs sampled)
nopt          x 539,295 ops/sec ±0.43% (90 runs sampled)
yargs-parser  x 24,081 ops/sec ±1.06% (89 runs sampled)
advanced-cli  x 1,009,619 ops/sec ±0.62% (94 runs sampled)

Benchmark: big: [-b, --bool, --no-meep, --multi=baz, -a, hellow, world, --pop, youpiii, --soulapa, gooogg, poeppd, ofoooo, --poloiepdi, doouicll, -e, -t, i, -i]
minimist      x 88,641 ops/sec ±0.37% (92 runs sampled)
mri           x 310,990 ops/sec ±0.31% (90 runs sampled)
nopt          x 258,311 ops/sec ±0.60% (89 runs sampled)
yargs-parser  x 8,319 ops/sec ±1.56% (85 runs sampled)
advanced-cli  x 387,050 ops/sec ±0.76% (87 runs sampled)
Done in 55.78s.
```

**inline mode enable**

```
Load Times:
nopt: 2.443ms
yargs-parser: 4.62ms
minimist: 2.014ms
mri: 1.918ms
advanced-cli: 2.586ms

Benchmark: small: [-b, --bool, --no-meep, --multi=baz]
minimist      x 213,273 ops/sec ±2.39% (89 runs sampled)
mri (1.1.1)   x 827,837 ops/sec ±0.25% (87 runs sampled)
mri           x 833,752 ops/sec ±0.26% (93 runs sampled)
nopt          x 540,303 ops/sec ±0.25% (93 runs sampled)
yargs-parser  x 23,048 ops/sec ±2.55% (86 runs sampled)
advanced-cli  x 699,021 ops/sec ±0.25% (94 runs sampled)

Benchmark: big: [-b, --bool, --no-meep, --multi=baz, -a, hellow, world, --pop, youpiii, --soulapa, gooogg, poeppd, ofoooo, --poloiepdi, doouicll, -e, -t, i, -i]
minimist      x 89,358 ops/sec ±0.38% (92 runs sampled)
mri (1.1.1)   x 312,792 ops/sec ±0.21% (94 runs sampled)
mri           x 315,247 ops/sec ±0.30% (95 runs sampled)
nopt          x 260,410 ops/sec ±0.29% (92 runs sampled)
yargs-parser  x 8,284 ops/sec ±1.08% (89 runs sampled)
advanced-cli  x 300,114 ops/sec ±0.39% (92 runs sampled)
Done in 66.32s.
```

## License

[MIT](https://github.com/remigermain/advanced-cli/blob/main/LICENSE)
