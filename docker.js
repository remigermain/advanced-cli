const CliParser = require('./dist/index')

const options = {
    version: "1.0.1",
    footer: "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
    inline: true
}

const parser = new CliParser("docker", "A self-sufficient runtime for containers", options)
parser.addArgument("config", {
    description: "Location of client config files",
    params: [{ type: Number }],
})
parser.addArgument("debug", {
    alias: 'D',
    description: "Enable debug mode"
})


parser.addCommand("run", "Run a command in a new container", {
    call(context) {
        if (context.flags.debug) {
            console.log('rou are in debug mode')
        }
        // do
    }
})

parser.addCommand("search", "Search the Docker Hub for images", {
    arguments: {
        local: {
            alias: 'l',
            params: [{
                type: String,
                default: '/home/local'
            }]
        },
        group: {
            params: [{
                type: String,
                validator(value) {
                    const choices = ["root", "user", "dev"]
                    if (choices.includes(value)) {
                        return "all"
                    }
                    throw new Error("invalid group")
                }
            }, {
                type: Boolean,
                default: false
            }]
        }
    },
    call(context) {
        if (context.flags.debug) {
            console.log('rou are in debug mode')
        }
        // do something
    }
})

const argv = process.argv.slice(2)
if (!parser.parse(argv)) {
    parser.printError()
}