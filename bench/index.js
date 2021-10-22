
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

console.log('\nBenchmark:');
const bench = new Suite();
const args = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world', '--pop', 'youpiii', '--soulapa', 'gooogg', 'poeppd', 'ofoooo', '--poloiepdi', 'doouicll', '-e', '-t', 'i', '-i']


bench
	.add('minimist     ', () => minimist(args))
	.add('mri (1.1.1)  ', () => previous(args))
	.add('mri          ', () => mri(args))
	.add('nopt         ', () => nopt(args))
	.add('yargs-parser ', () => yargs(args))
	.add('advanced-cli ', () => {
		const parser = new advCli()
		parser.addArgument('bool')
		parser.addArgument('other', { alias: 'b' })
		parser.addArgument('aa', { alias: 'a' })
		parser.addArgument('tt', { alias: 'e' })
		parser.addArgument('ee', { alias: 't' })
		parser.addArgument('rr', { alias: 'i' })
		parser.addArgument('no-meep')
		parser.addArgument('pop')
		parser.addArgument('soulapa')
		parser.addArgument('poloiepdi')
		parser.addArgument('multi=baz')

		return parser.parse(args)
	})
	.on('cycle', e => console.log(String(e.target)))
	.run();
