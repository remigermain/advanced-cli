import CliParser from "../src/index"

it('same arguments', () => {
    const p = new CliParser()
    p.addArgument("test", {
        name: "test",
        alias: "t",
        description: "description"
    })
    expect(() => {
        p.addArgument("test", {
            alias: "t",
            description: "description"
        })
    }).toThrowError()
})

it('alias is many char', () => {
    const p = new CliParser()
    expect(() => {
        p.addArgument("test", {
            alias: "dt",
            description: "description"
        })
    }).toThrowError()
})