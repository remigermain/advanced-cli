import { bold } from "cli-color"
import CliParserMock from "./parserMock"


describe('parser', () => {

    test('empty arguments', () => {
        const p = new CliParserMock("name", "description")
        p.usage = jest.fn()
        p.parse([])
        expect(p.usage).toBeCalled()
    })

    test('command may arguments', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('lopa', {alias: 'a'})
        p.addArgument('fol', {params: [{type:Number, default: 101}]})
        p.addCommand('doc', 'description', {
            arguments: {
                run: {
                    alias: 'r',
                    params: [
                        {type: String},
                        {type: Number},
                        {type: String, default: 'bazz'}
                    ]
                },
                prat: {
                    alias: 'p',
                    params: [
                        {
                            type: Number,
                            validator(value) {
                                return +value + 1
                            }
                        }
                    ]
                },
                group: {}
            }
        })

        const res = p.parse(['doc', '-a', '3', 'yhea', '--run', 's', '344', 'fe', 'd', 'rrreo', '-p', '42', 'lopilop', '--fol'])
        expect(res).toBeTruthy()
        const ctx = p.context

        expect(ctx.flags.a).toEqual([])
        expect(ctx.flags.run).toEqual(['s', 344, 'fe'])
        expect(ctx.flags.p).toEqual([43])
        expect(ctx.flags.fol).toEqual([101])
        expect(ctx.anyArgs).toEqual(['3', 'yhea', 'd', 'rrreo', 'lopilop'])

    })

    test('default with flags after', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', { params: [{ type: Boolean, default: true }] })
        p.addArgument('flop', {alias: 'f' })
        expect(p.parse(['--root', '-f'])).toBeTruthy()
        const ctx = p.context
        expect(ctx.flags.root).toEqual([true])
        expect(ctx.flags.f).toEqual([])
    })

    test('default with no flags after', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', { params: [{ type: Boolean, default: true }] })
        p.addArgument('flop', {alias: 'f' })
        expect(p.parse(['--root', 'after', '-f'])).toBeFalsy()
    })
})