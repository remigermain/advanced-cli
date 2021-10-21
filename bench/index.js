
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

console.time('advparser');
const ArgParser = require('../dist/index');
const par = new ArgParser()
par.addArgument({sFlag: 'b'})
par.addArgument({mFlag: 'bool'})
par.addArgument({mFlag: 'no-meep'})
par.addArgument({mFlag: 'multi=baz'})
console.timeEnd('advparser');


console.log('\nBenchmark:');
const bench = new Suite();
const args = ['-b', '--bool', '--no-meep', '--multi=baz'];
/*
bench
	.add('minimist     ', () => minimist(args))
	.add('mri (1.1.1)  ', () => previous(args))
	.add('mri          ', () => mri(args))
	.add('nopt         ', () => nopt(args))
	.add('yargs-parser ', () => yargs(args))
	.add('advparser ', () => par.parse(args))
	.on('cycle', e => console.log(String(e.target)))
	.run();

*/