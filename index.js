
const CliParserMock = require('./dist/index');


const p = new CliParserMock("name", "description")
p.addArgument('lopa', { alias: 'a' })
p.addArgument('fol', { params: [{ type: Number, default: 101 }] })
p.addCommand('doc', 'description', {
    arguments: {
        run: {
            alias: 'r',
            params: [
                { type: String },
                { type: Number },
                { type: String, default: 'bazz' }
            ]
        },
        prat: {
            alias: 'p',
            params: [
                {
                    type: Number,
                    validator(val) {
                        return val + 1
                    }
                }
            ]
        },
        group: {}
    }
})

const res = p.parse(['doc', '-a', '3', 'yhea', '--run', 's', '344', 'fe', 'd', 'rrreo', '-p', '42', 'lopilop', '--fol', '9', '-h'])
const ctx = p.context
p.printError()