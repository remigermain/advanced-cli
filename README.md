# Advanced-cli

[![CI](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml)
[![build](https://img.shields.io/npm/v/advanced-cli)](https://www.npmjs.com/package/advanced-cli)

A Cli parser whise advanced arguments/command, very fast execution (more than [mri](https://raw.githubusercontent.com/lukeed/mri)), usage and error message formated like docker/cargo cli.

## Installation

```bash
yarn add advanced-cli
```

# Usage

```js
const CliParser = require("AdvancedCli");

const options = {
  version: "1.0.1",
  footer:
    "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
};

const parser = new CliParser(
  "docker",
  "A self-sufficient runtime for containers",
  options
);
parser.addArgument("config", {
  description: "Location of client config files",
  params: [{ type: Number }],
});
parser.addArgument("debug", {
  alias: "D",
  description: "Enable debug mode",
});

parser.addCommand("run", "Run a command in a new container", {
  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
    // do something
  },
});

parser.addCommand("search", "Search the Docker Hub for images", {
  arguments: {
    local: {
      alias: "l",
      params: [
        {
          type: String,
          default: "/home/local",
        },
      ],
    },
    group: {
      params: [
        {
          type: String,
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
  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
    // do something
  },
});

const argv = process.argv.slice(2);
if (!parser.parse(argv)) {
  parser.printError();
} else {
  const { flags, anyArgs } = parser.context;
  if (flags.debug) {
    // do something
  }
}
```

## Options

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
    type: Number | Boolean | String, // the arguments type, is convert to it
    default?: boolean | number | string,// if is not have arguments,it get the default value
    validator?: (value: string, params: any[]) // pass the value in funciton, and do complex validation on it
}

// Arguments
{
    description: string, // a description for your arguments
    alias: string, // a alais
    params: CliArgParam[], // a list with object arguments
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

## Usage

With previous configuration, the usage output look like this

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

#### Usage command

```bash
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

## Errors Exenple

**inline mode enable**

## Benchmarks

Script made by [mri](https://raw.githubusercontent.com/lukeed/mri)

> nodejs v14.18.0

**inline mode disable**

```
Load Times:
nopt: 4.226ms
yargs-parser: 7.521ms
minimist: 2.652ms
mri: 0.021ms
advanced-cli: 2.248ms

Benchmark: small: [-b, --bool, --no-meep, --multi=baz]
minimist      x 204,030 ops/sec ±12.29% (85 runs sampled)
mri (1.1.1)   x 835,731 ops/sec ±0.29% (89 runs sampled)
mri           x 837,101 ops/sec ±0.36% (89 runs sampled)
nopt          x 536,992 ops/sec ±0.33% (91 runs sampled)
yargs-parser  x 23,128 ops/sec ±3.52% (87 runs sampled)
advanced-cli  x 1,002,990 ops/sec ±0.28% (90 runs sampled)

Benchmark: big: [-b, --bool, --no-meep, --multi=baz, -a, hellow, world, --pop, youpiii, --soulapa, gooogg, poeppd, ofoooo, --poloiepdi, doouicll, -e, -t, i, -i]
minimist      x 92,031 ops/sec ±0.26% (91 runs sampled)
mri (1.1.1)   x 315,755 ops/sec ±0.15% (90 runs sampled)
mri           x 313,307 ops/sec ±0.21% (92 runs sampled)
nopt          x 253,122 ops/sec ±0.38% (92 runs sampled)
yargs-parser  x 8,395 ops/sec ±2.84% (90 runs sampled)
advanced-cli  x 387,811 ops/sec ±0.39% (90 runs sampled)
Done in 66.48s.
```

**inline mode enable**

```
Load Times:
nopt: 2.443ms
yargs-parser: 4.62ms
minimist: 2.014ms
mri: 0.011ms
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
