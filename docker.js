const CliAdv = require('./dist/index')

const argv = process.argv.slice(2)


const options = {
    name: 'docker',
    description: "A self-sufficient runtime for containers",
    version: "1.0.1",
    footer: "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
    inline: true,
    arguments: {
        config: {
            description: "Location of client config files",
            params: [{ type: Number }],
        },
        debug: {
            alias: 'D',
            description: 'Enable debug mode',
        }
    },
    commands: {
        run: {
            description: "Run a command in a new container",
            call(context) {
                if (context.flags.debug) {
                    console.log('rou are in debug mode')
                }
                // do
            }
        },
        search: {
            description: "Search the Docker Hub for images",
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
        }
    }
}



const p = CliAdv.parser(argv, options)
if (CliAdv.haveErrors(p)) {
    CliAdv.printErrors(p)
} else {
    CliAdv.debug(p)
}