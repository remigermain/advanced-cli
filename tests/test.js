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

p.addCommand(
    "images",
    {
        description: "Run a command in a new container",
        arguments: [
            {
                name: "volume-driver",
                description: "Optional volume driver for the container",
                arguments: [{
                    type: String
                }]
            }, {
                alias: "t",
                name: "tty",
                description: "Allocate a pseudo-TTY"
            },
        ],
        call({ flags, arguments }) {
            console.log("invokerrrrrrrrrr")
        }
    })

// p.addArgument({
//     alias: "i",
// })

// p.addArgument({
//     alias: "g",
//     name: "type",
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

pp.addArgument("vol", { name: "bar", arguments: [{ type: String }] })
pp.addCommand("images", { description: 'ddd' })

const arg = ["images", "-v", "--help"]
console.time("parser")
const r = pp.parse(arg)
console.timeEnd("parser")
console.log(r)


// const mri = require('mri');
// console.time("mri")
// const mr = mri(arg)
// console.timeEnd("mri")