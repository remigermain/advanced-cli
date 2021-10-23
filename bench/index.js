
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
const args2 = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world']
const args3 = ['-b', '--bool', '--no-meep', '--multi=baz']

const selec = args3


function fnc() {
	const parser = new advCli()
	parser.addArgument('other', { alias: 'b' })
	parser.addArgument('bool')
	parser.addArgument('no-meep')
	parser.addArgument('multi=baz')
	// 2
	// parser.addArgument('aa', { alias: 'a' })

	// 3
	// parser.addArgument('tt', { alias: 'e' })
	// parser.addArgument('ee', { alias: 't' })
	// parser.addArgument('rr', { alias: 'i' })
	// parser.addArgument('pop')
	// parser.addArgument('soulapa')
	// parser.addArgument('poloiepdi')

	return parser.parse(selec)
}
console.log(fnc())


bench
	.add('minimist     ', () => minimist(selec))
	.add('mri (1.1.1)  ', () => previous(selec))
	.add('mri          ', () => mri(selec))
	.add('nopt         ', () => nopt(selec))
	.add('yargs-parser ', () => yargs(selec))
	.add('advanced-cli ', fnc)
	.on('cycle', e => console.log(String(e.target)))
	.run();
