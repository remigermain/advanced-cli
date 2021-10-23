
const advCli = require('./dist/index');


const args = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world', '--pop', 'youpiii', '--soulapa', 'gooogg', 'poeppd', 'ofoooo', '--poloiepdi', 'doouicll', '-e', '-t', 'i', '-i']
const args2 = ['-b', '--bool', '--no-meep', '--multi=baz', '-a', 'hellow', 'world']
const args3 = ['-b', '--bool', '--no-meep', '--multi=baz']

const selec = args3


const parser = new advCli()
parser.addArgument('other', { alias: 'b' })
parser.addArgument('bool')
parser.addArgument('no-meep')
parser.addArgument('multi=baz')
// parser.addArgument('aa', { alias: 'a' })

// parser.addArgument('tt', { alias: 'e' })
// parser.addArgument('ee', { alias: 't' })
// parser.addArgument('rr', { alias: 'i' })
// parser.addArgument('pop')
// parser.addArgument('soulapa')
// parser.addArgument('poloiepdi')

console.log(parser.parse(selec))
console.log(parser.context)