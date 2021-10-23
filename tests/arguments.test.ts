import CliParserMock from "./parserMock"
import {objectLength} from "../src/utils"

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
            p.addArgument('root', {alias: 'r'})
            expect(() => {
                p.addArgument('other', {alias: 'r'})
            }).toThrowError()
        })
        it('alias not well formated', () => {
            const p = new CliParserMock("name", "description")
            expect(() => {
                p.addArgument('other', {alias: 'root'})
            }).toThrowError()
        })
    })
    describe('well arguments', () => {
        it('multiple', () => {
            const fnc = () => { console.log('yop') }
            const p = new CliParserMock("name", "description",  {defaultArg: false})
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
            const p = new CliParserMock("name", "description", {defaultArg: false})
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
        expect(fnc).toBeCalledWith(p.jestMockContext())
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
        expect(fnc).toBeCalledWith(p.jestMockContext())
    })
})
