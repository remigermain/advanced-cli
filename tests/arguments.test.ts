import CliParserMock from "./parserMock"
import { objectLength } from "../src/utils"

describe('arguments', () => {
    describe('throw error', () => {
        it('duplicate', () => {
            const p = new CliParserMock("name", "description")
            p.addArgument('root')
            expect(() => {
                p.addArgument('root')
            }).toThrowError()
        })
        it('duplicate alias', () => {
            const p = new CliParserMock("name", "description")
            p.addArgument('root', { alias: 'r' })
            expect(() => {
                p.addArgument('other', { alias: 'r' })
            }).toThrowError()
        })
        it('alias not well formated', () => {
            const p = new CliParserMock("name", "description")
            expect(() => {
                p.addArgument('other', { alias: 'root' })
            }).toThrowError()
        })
    })
    describe('well arguments', () => {
        it('multiple', () => {
            const fnc = () => { console.log('yop') }
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', description: 'my-description' })
            p.addArgument('gulp', { alias: 'g', description: 'my-other-description', call: fnc })
            const args = p.jestMockArguments()
            expect(objectLength(args)).toEqual(4)

            const root = {
                name: 'root',
                alias: 'r',
                description: 'my-description',
                params: []
            }
            const gulp = {
                name: 'gulp',
                alias: 'g',
                description: 'my-other-description',
                params: [],
                call: fnc
            }
            expect(args.root).toEqual(root)
            expect(args.r).toEqual(root)
            expect(args.root).toEqual(root)
            expect(args.g).toEqual(gulp)
        })
        it('no alias', () => {
            const fnc = () => { console.log('yop') }
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { description: 'my-description' })
            const args = p.jestMockArguments()
            expect(objectLength(args)).toEqual(1)
            expect(args.root).toEqual({
                name: 'root',
                description: 'my-description',
                params: []
            })
        })
    })
    test('call', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        const fnc = jest.fn()
        p.addArgument('root', { call: fnc })
        const resuls = p.parse(['--root'])
        expect(resuls).toBeTruthy()
        expect(fnc).toBeCalledTimes(1)
        expect(fnc).toBeCalledWith(p.context)
    })
    test('multiple call', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        const fnc = jest.fn()
        const fnc2 = jest.fn()
        p.addArgument('root', { call: fnc })
        p.addArgument('blob', { call: fnc2 })
        const resuls = p.parse(['--root', '--blob'])
        expect(resuls).toBeTruthy()
        expect(fnc).toBeCalledTimes(1)
        expect(fnc2).toBeCalledTimes(0)
    })
    test('call alias', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        const fnc = jest.fn()
        p.addArgument('root', { alias: 'r', call: fnc })
        const resuls = p.parse(['-r'])
        expect(resuls).toBeTruthy()
        expect(fnc).toBeCalledTimes(1)
        expect(fnc).toBeCalledWith(p.context)
    })

    test('validator and type set', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addArgument('root', { alias: 'r', params: [{ type: Boolean, validator() { } }] })
    })
    test('validator and type not set', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        expect(() => {
            // @ts-ignore
            p.addArgument('root', { alias: 'r', params: [{}] })
        }).toThrowError()
    })
    test('type set', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addArgument('root', { alias: 'r', params: [{ type: String }] })
    })
    test('validator set no type', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        expect(() => {
            // @ts-ignore
            p.addArgument('root', { alias: 'r', params: [{ validator() { } }] })
        }).toThrowError()
    })

    test('type invalid number', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addArgument('root', { alias: 'r', params: [{ type: Number }] })
        expect(p.parse(['-r', 'true'])).toBeFalsy()
        expect(p.jestMockErrorsLength).toEqual(1)
    })
    test('type invalid boolean', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addArgument('root', { alias: 'r', params: [{ type: Boolean }] })
        expect(p.parse(['-r', '1'])).toBeFalsy()
        expect(p.jestMockErrorsLength).toEqual(1)
    })
    test('type invalid date', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addArgument('root', { alias: 'r', params: [{ type: Date }] })
        expect(p.parse(['-r', 'invalidate'])).toBeFalsy()
        expect(p.jestMockErrorsLength).toEqual(1)
    })

    describe('type valid number', () => {
        it('positive', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Number }] })
            expect(p.parse(['-r', '44'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([44])
        })
        it('negative', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Number }] })
            expect(p.parse(['-r', '-44'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([-44])
        })
        it('float', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Number }] })
            expect(p.parse(['-r', '44.590'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([44.590])
        })
        it('negative float', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Number }] })
            expect(p.parse(['-r', '-44.590'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([-44.590])
        })
    })

    describe('type valid boolean', () => {
        it('positive', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Boolean }] })
            expect(p.parse(['-r', 'true'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([true])
        })
        it('negative', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Boolean }] })
            expect(p.parse(['-r', 'yes'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([true])
        })
        it('float', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Boolean }] })
            expect(p.parse(['-r', 'false'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([false])
        })
        it('negative float', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Boolean }] })
            expect(p.parse(['-r', 'no'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([false])
        })
    })

    describe('type valid date', () => {
        it('year', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Date }] })
            expect(p.parse(['-r', '2021'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([new Date('2021')])
        })
        it('month day', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Date }] })
            expect(p.parse(['-r', '2021-01-04'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([new Date('2021-01-04')])
        })
        it('hour', () => {
            const p = new CliParserMock("name", "description", { defaultArg: false })
            p.addArgument('root', { alias: 'r', params: [{ type: Date }] })
            expect(p.parse(['-r', '2021-10-26T09:58:03.379Z'])).toBeTruthy()
            expect(p.context.flags.root).toEqual([new Date('2021-10-26T09:58:03.379Z')])
        })
    })

})
