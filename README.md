# Advanced-cli

[![CI](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/remigermain/advanced-cli/actions/workflows/node.js.yml)
[![build](https://img.shields.io/npm/v/advanced-cli)](https://www.npmjs.com/package/advanced-cli)

library for advanced cli

## Installation

```bash
# with yarn
yarn add advanced-cli
# npm
npm install advanced-cli
```

# Usage

```js
//es module
import CliParser from "advanced-cli"

const options = {
	name: "my-program",
	description: "this is a description"
	version: "1.0.1",
	footer: "For more help you can go to exemple.com"
}

const parser = new CliParser(options)
parser.addArgument({
	sFlag: "f",
	mFlag: "foo",
	description: "foo options"
})
parser.addCommand({
	name: "info"
	description: "you get informations",
	arguments: [
		{
			sFlag: "m",
			mFlag: "more",
			description: "more informations"
		}
	]
})

const argv = process.argv.slice(2)
parser.parse(argv)
```

### Options

```ts
const options = {
    name: string, // your app name
    description: string,
    info: string, // your information for use your programm
    footer: string, // display a footer message when usage is call
    version: string, // you version of your app
    maxError: number // displaying max errors
    stopFlags: "--" | ";" | null // stop parsing flag , default null
}
```
