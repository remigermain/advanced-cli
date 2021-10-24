
const { Suite } = require('benchmark');
const previous = require('mri');

console.log('Load Times:');

console.time('nopt');
const nopt = require('nopt');
console.timeEnd('nopt');

console.time('yargs-parser');
const yargs = require('yargs-parser');
console.timeEnd('yargs-parser');

console.time('minimist');
const minimist = require('minimist');
console.timeEnd('minimist');

console.time('mri');
const mri = require('mri');
console.timeEnd('mri');

console.time('advanced-cli');
const advCli = require('../dist/index');
console.timeEnd('advanced-cli');


const big = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world', '--pop', 'youpiii', '--soulapa', 'gooogg', 'poeppd', 'ofoooo', '--poloiepdi', 'doouicll', '-e', '-t', 'i', '-i']
const small = ['-b', '--bool', '--no-meep', '--multi=baz']

const inline = false

console.log(`\nBenchmark: small: [${small.join(", ")}]`);
const benchSmall = new Suite()
benchSmall
	.add('minimist     ', () => minimist(small))
	.add('mri (1.1.1)  ', () => previous(small))
	.add('mri          ', () => mri(small))
	.add('nopt         ', () => nopt(small))
	.add('yargs-parser ', () => yargs(small))
	.add('advanced-cli ', () => {
		const parser = new advCli("name", "description", { inline })
		parser.addArgument('other', { alias: 'b' })
		parser.addArgument('bool')
		parser.addArgument('no-meep')
		if (inline) {
			parser.addArgument('multi', { params: [{ type: String }] })
		} else {
			parser.addArgument('multi=bazz')
		}
		return parser.parse(small)
	})
	.on('cycle', e => console.log(String(e.target)))
	.run();

console.log(`\nBenchmark: big: [${big.join(", ")}]`);
const benchBig = new Suite()
benchBig
	.add('minimist     ', () => minimist(big))
	.add('mri (1.1.1)  ', () => previous(big))
	.add('mri          ', () => mri(big))
	.add('nopt         ', () => nopt(big))
	.add('yargs-parser ', () => yargs(big))
	.add('advanced-cli ', () => {
		const parser = new advCli("name", "description", { inline })
		parser.addArgument('other', { alias: 'b' })
		parser.addArgument('bool')
		parser.addArgument('no-meep')
		if (inline) {
			parser.addArgument('multi', { params: [{ type: String }] })
		} else {
			parser.addArgument('multi=bazz')
		}

		parser.addArgument('aa', { alias: 'a' })
		parser.addArgument('tt', { alias: 'e' })
		parser.addArgument('ee', { alias: 't' })
		parser.addArgument('rr', { alias: 'i' })
		parser.addArgument('pop')
		parser.addArgument('soulapa')
		parser.addArgument('poloiepdi')

		return parser.parse(big)
	})
	.on('cycle', e => console.log(String(e.target)))
	.run();
