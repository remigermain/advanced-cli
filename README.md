# Advanced-cli

[![CI](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml)
[![build](https://img.shields.io/npm/v/advanced-cli)](https://www.npmjs.com/package/advanced-cli)

A Cli parser with advanced arguments/command, very fast execution (more than [mri](https://github.com/lukeed/mri)).
The parser is inspired by python argsparser, the output is look like docker or cargo(rust lang) cli.
You can add arguments, command, command arguments, efficiency errors, very fast, chained alias ( ex: `-lah` ), inline arguments (ex: `--foo=bar,boo,baz`)

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

/*
	initialize parser
*/
const parser = new CliParser(
  "docker",
  "A self-sufficient runtime for containers",
  options
);

/*
	add global arguments ( is can be used with all commands like --help)
	flag `config` need a number after it like: "--config 42"
*/
parser.addArgument("config", {
  description: "Location of client config files",
  params: [{ type: Number }],
});

/*
	flag `debug` need no arguments, so ou can use like `--debug` or `-D`
*/
parser.addArgument("debug", {
  alias: "D",
  description: "Enable debug mode",
});

/*
	add command, the command need to be the first params in argv
	the `run` command if is set, the `call` function is called, you put all your thing in
*/
parser.addCommand("run", "Run a command in a new container", {
  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
    // do something
  },
});

/*
	the command `search`, the command have 2 arguments (only availabe in `search`  command )
*/
parser.addCommand("search", "Search the Docker Hub for images", {
  arguments: {
    /*
	first flags: `local`
	command have a alias `l` so is can be set like `--local` or `-l`
	the command need 1 arguments with type `String`, but if not have value, the default is `/home/local`
	ex:  `--local`, `--local otherparams`,  `-l`, `-l path` all work
    */
    local: {
      alias: "l",
      params: [
        {
          type: String,
          default: "/home/local",
        },
      ],
    },

/*
    second flags: `group`
    command have not alias so you os is can only set like `--group`
    the command need 2 arguments with type `String`, and `boolean`
    type string need to be validate by a function, first fucntions arguments is the arugmments string,
    if you dont throw a error, the arguments is valid, and is set by the return value
    the second arguments need boolean, if is not exist is set to `false` by default
    ex: 	
    		BAD:
    		`--group`		dont work need first string arguments
    		`--group other`	the  `other` not match in validator
		`--group dev dev`	have a invalid `boolean`
		
    		OK:
    	 	`--group user`
		`--group dev true`
		`--group root false`
*/
    group: {
      params: [
        {
          type: String,
          validator(value) {
            const choices = ["root", "user", "dev"];
            if (choices.includes(value)) {
              return value;
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

  /*
  	if the command `search` is set
  	we call this function at the end of parser with context data (see #context)
  */
  call(context) {
    if (context.flags.debug) {
      console.log("rou are in debug mode");
    }
   ...
  },
});

const argv = process.argv.slice(2)
if (!parser.parse(argv)) {
  parser.printError()
}
```

if you dont want to use `call` attribute in command or flags, you can do this
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
if (parser.parse(['hello', '--config', '6', 'user', 'true']) {
  const {flags, anyArgs, cmd} = parser.context

/*
	flags output:
	{config: [6, 'user', true, 'all']}

	anyArgs represant others arguments
	output anyArgs:
	['hello']
*/

} else {
  parser.printError()
}
```

## Options

various options is available

```ts
/*	Parser		*/
{
    info: string,				//	your usage of your programm ( used when `usage()` is call)
    footer: string,				//	display a footer message ( used when `usage()` is call)
    version: string,				//	you version of your app ( used when `--version` or `-v` is set)
    stopFlags: "--" | ";" | undefined	//	stop parsing flag , default null
    inline: false,				//	add posibility the flags are format like this  `--foo=bar,booz,bo`
    						//	inline mdoe have a big execution cost ( cause need to split )
}

/*	Arguments		*/
{
    description: string,	//	a description for your arguments
    alias: string,		//	a alias (ex: `h` for `help`)
    params: [ #Params ],	//	a list with object Params
    depends: string[], // list for depended arguments (like `--cert-path` needed for `--cert-enable`)
    multiple: false, // a arguments can be set multiple time (like `--player remi --player renaud --player flo`), the results `[ ["remi"], ["renaud"], ["flo"] ]`
    call: Function		//	function is calling if arguments is set (like `--help` is print usage and exit)
}

/*	Params		*/
{
    type: Number | Boolean | String, 		// 	the arguments type, is convert to it, is required!
    default: boolean | number | string,  	//	if arguments are not available, it get the default value
    validator: (value: string, params: any[])  //	pass the value in funciton, and do complex validation on it, the params is liste with previous value of old arguments
}

/*	Command		*/
{
	arguments: {
		/*
			object with key is ne name of your falgs
			and argument is the options for your flags
		*/
		
		name: {
			#Arguments
		},
		...
	}
    call?: Fucntion // function is calling if command is set
}
```

## Usage

In parser you have `p.usage()` or `p.commandUsage('search')` provide output like bellow, with options `defaultArg: true` the parser add `--help/-h` arguments and if is set, is print `usage` or `commandUsage`

```js
/*
	with example above the usage output look this
*/

`Usage: docker COMMAND [OPTIONS]

A self-sufficient runtime for containers

Options:
-h, --help             Prints help information
-v, --version          Print version info and exit
    --config <string>  Location of client config files
-D, --debug            Enable debug mode


Commands:
  run    Run a command in a new container
  search Search the Docker Hub for images


To get more help with docker, check out our guides at https://docs.docker.com/go/guides/`

/*
	command usage
*/


`Usage: docker search [OPTIONS]

Search the Docker Hub for images

Global options:
-h, --help             Prints help information
-v, --version          Print version info and exit
    --config <number>  Location of client config files
-D, --debug            Enable debug mode


Command options:
-l, --local <string>            no information.
    --group <string> <boolean>  no information.


To get more help with docker, check out our guides at https://docs.docker.com/go/guides/`
```

## Error output

When a flags/command/arguments is invalid the output generate is very helpful.

```
error: Invalid arugments for flag 'config', need 1 arguments.
docker search --config
                       ^

--------------------------|

error: Invalid arugments for flag 'config', need a valid number.
docker search --config tre
                       ^^^

--------------------------|

error: Invalid arugments for flag 'sh', need a valid boolean, choice are 'true' or 'false'
docker search --sh 44
                   ^^

--------------------------|

error: no such command: 'seade'
docker seade --config r
       ^^^^^

--------------------------|

error: Invalid arugments for flag 'group', invalid group
docker search --group hupio
                      ^^^^^

--------------------------|

error: Found argument '--prop' which wasn't expected, or isn't valid in this context.
docker search --prop
              ~~^^^^

--------------------------|
// options `depends`

error: flags '--ssl-key' need flags '--ssl-cert'
name file root --ssl-key 0xiiifr4353
               ~~^^^^^^^

--------------------------|
// options `multiple` disabled

error: flags '--root' as already set.
name 42 --root ddd 32 true --root rrge 44 false
                           ~~^^^^

--------------------------|
// options `inline` enable

error: Invalid arugments for flag 'group', invalid group
docker search --group=tu,54
              ~~~~~~~~^^~~~

--------------------------|

error: Invalid arugments for flag 'group', need a valid boolean, choice are 'true' or 'false'
docker search --group=tu,54
              ~~~~~~~~~~~^^
```

## Benchmarks

Benchmarks script made by [mri](https://github.com/lukeed/mri), run various cli/argsparser

```
##  nodejs v14.18.0

/---------------
/  inline mode disabe
/---------------
nopt: 2.163ms
yargs-parser: 4.11ms
minimist: 0.722ms
mri: 1.827ms
advanced-cli: 2.469ms

Benchmark: small: [-b, --bool, --no-meep, --multi=baz]
advanced-cli  x 1,009,619 ops/sec ±0.62% (94 runs sampled)
mri           x 802,334 ops/sec ±0.46% (91 runs sampled)
nopt          x 539,295 ops/sec ±0.43% (90 runs sampled)
minimist      x 214,159 ops/sec ±2.52% (88 runs sampled)
yargs-parser  x 24,081 ops/sec ±1.06% (89 runs sampled)

Benchmark: big: [-b, --bool, --no-meep, --multi=baz, -a, hellow, world, --pop, youpiii, --soulapa, gooogg, poeppd, ofoooo, --poloiepdi, doouicll, -e, -t, i, -i]
advanced-cli  x 387,050 ops/sec ±0.76% (87 runs sampled)
mri           x 310,990 ops/sec ±0.31% (90 runs sampled)
nopt          x 258,311 ops/sec ±0.60% (89 runs sampled)
minimist      x 88,641 ops/sec ±0.37% (92 runs sampled)
yargs-parser  x 8,319 ops/sec ±1.56% (85 runs sampled)

/---------------
/  inline mode enable
/---------------

Benchmark: small: [-b, --bool, --no-meep, --multi=baz]
mri           x 833,752 ops/sec ±0.26% (93 runs sampled)
advanced-cli  x 699,021 ops/sec ±0.25% (94 runs sampled)
nopt          x 540,303 ops/sec ±0.25% (93 runs sampled)
minimist      x 213,273 ops/sec ±2.39% (89 runs sampled)
yargs-parser  x 23,048 ops/sec ±2.55% (86 runs sampled)

Benchmark: big: [-b, --bool, --no-meep, --multi=baz, -a, hellow, world, --pop, youpiii, --soulapa, gooogg, poeppd, ofoooo, --poloiepdi, doouicll, -e, -t, i, -i]
mri           x 315,247 ops/sec ±0.30% (95 runs sampled)
advanced-cli  x 300,114 ops/sec ±0.39% (92 runs sampled)
nopt          x 260,410 ops/sec ±0.29% (92 runs sampled)
minimist      x 89,358 ops/sec ±0.38% (92 runs sampled)
yargs-parser  x 8,284 ops/sec ±1.08% (89 runs sampled)
```

## License

[MIT](https://github.com/remigermain/advanced-cli/blob/main/LICENSE)
