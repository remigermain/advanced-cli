import { bold } from "cli-color"
import CliParserMock from "./parserMock"


describe('context getters', () => {

    test('get context before parse', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('lopa', {alias: 'a'})
        p.addArgument('fol', {params: [{type:Number, default: 101}]})
        p.addCommand('doc', 'description')
        expect(() => {
            const ctx = p.context
        }).toThrowError()
    })

    test('get context before parse witout args', () => {
        const p = new CliParserMock("name", "description")
        expect(() => {
            const ctx = p.context
        }).toThrowError()
    })

    test('get context afer parse', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('lopa', {alias: 'a'})
        p.addArgument('fol', {params: [{type:Number, default: 101}]})
        p.addCommand('doc', 'description')
        p.parse(['doc', 'any', 'args', '-a', 'p'])
        const ctx = p.context
        expect(ctx.parser).toEqual(p)
        expect(ctx.anyArgs).toEqual(['any', 'args', 'p'])
        expect(ctx.cmd).toBeTruthy()
        expect(ctx.description).toEqual("description")
        expect(ctx.name).toEqual("name")
    })
})