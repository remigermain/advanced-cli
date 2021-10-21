const ArgParser = require("../dist/index.js")

const p = new ArgParser(
    {
        name: "docker",
        description: "A self-sufficient runtime for containers",
        footer: "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
        version: "1.0.4"
    }
)

// p.addCommand({
//     name: "run",
//     description: "Run a command in a new container"
// })

p.addCommand({
    name: "images",
    description: "Run a command in a new container",
    arguments: [
        {
            mFlag: "volume-driver",
            description: "Optional volume driver for the container",
            arguments: [{
                type: String
            }]
        }, {
            sFlag: "t",
            mFlag: "tty",
            description: "Allocate a pseudo-TTY"
        },
    ],
    call({ flags, arguments }) {
        console.log("invokerrrrrrrrrr")
    }
})

// p.addArgument({
//     sFlag: "i",
// })

// p.addArgument({
//     sFlag: "g",
//     mFlag: "type",
//     params: [
//         {
//             type: Boolean,
//             default: true
//         }
//     ]
// })


// const arg = ["images", "f", "--type", "false", "rr", "rr", "-h"]
const pp = new ArgParser(
    {
        name: "docker",
        description: "A self-sufficient runtime for containers",
        footer: "To get more help with docker, check out our guides at https://docs.docker.com/go/guides/",
        version: "1.0.4",
        stopFlags: "--"
    }
)

pp.addArgument({ mFlag: "foo" })
pp.addArgument({ mFlag: "bar", arguments: [{ type: String }] })
pp.addArgument({ sFlag: "m" })
pp.addArgument({ sFlag: "t" })

const arg = ["--foo", "--bar", "baz", "-mt", "-", "hello", "world", "-myiiup"]
console.time("parser")
const r = pp.parse(arg)
console.timeEnd("parser")
console.log(r)

const mri = require('mri');

console.time("mri")
const mr = mri(arg)
console.timeEnd("mri")


// p.info()
// p.printError()
// p.usage()