
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
const AdvCli = require('../dist/index');
console.timeEnd('advanced-cli');

const big = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world', '--pop', 'youpiii', '--soulapa', 'gooogg', 'poeppd', 'ofoooo', '--poloiepdi', 'doouicll', '-e', '-t', 'i', '-i']
const small = ['-b', '--bool', '--no-meep', '--multi=baz']

console.log(`\nBenchmark: small: [${small.join(", ")}]`);
const benchSmall = new Suite()
benchSmall
	.add('minimist     ', () => minimist(small))
	.add('mri (1.1.1)  ', () => previous(small))
	.add('mri          ', () => mri(small))
	.add('nopt         ', () => nopt(small))
	.add('yargs-parser ', () => yargs(small))
	.add('advanced-cli ', () => AdvCli.parser(small))
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
	.add('advanced-cli ', () => AdvCli.parser(big))
	.on('cycle', e => console.log(String(e.target)))
	.run();
