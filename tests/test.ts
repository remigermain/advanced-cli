import CliParserMock from "./parserMock"

function length(obj: object): number {
    return Object.keys(obj).length
}

describe('commands', () => {
    it('default arguments', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        const commands = p.jestMockCommands()
        expect(commands.init.arguments).toEqual({})
    })
    it('set', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        const commands = p.jestMockCommands()
        expect(length(commands)).toEqual(1)
        expect(commands.init).toEqual({
            name: 'init',
            description: 'description',
            arguments: {}
        })
    })
    it('duplicate', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        expect(() => {
            p.addCommand('init', 'description')
        }).toThrowError()
    })

    it('arguments', () => {
        const p = new CliParserMock("name", "description", {defaultArg: false})
        p.addCommand('init', 'description', {
            arguments: {
                root: {
                    alias: 'r',
                    description: 'root-description'
                }
            }
        })
        const commands = p.jestMockCommands()
        const args = p.jestMockArguments()

        expect(length(commands)).toEqual(1)
        expect(length(args)).toEqual(0)
        const root = {
            name: 'root',
            description: 'root-description',
            alias: 'r',
            params: []
        }
        expect(commands.init).toEqual({
            name: 'init',
            description: 'description',
            arguments: {
                root,
                r: root,
            }
        })
    })
    it('call', () => {
        const p = new CliParserMock("name", "description")
        const fn = jest.fn()
        p.addCommand('init', 'description', { call: fn })
        const results = p.parse(['init'])
        expect(results).toBeTruthy()
        expect(fn).toBeCalledTimes(1)
        expect(fn).toBeCalledWith(p.jestMockContext())
    })

    it('command not first', () => {
        const p = new CliParserMock("name", "description")
        const fn = jest.fn()
        p.addCommand('init', 'description', { call: fn })
        const results = p.parse(['--flag', 'init'])
        expect(results).toBeFalsy()
        const errors = p.jestMockErrors()
        expect(errors.length).toEqual(1)
        expect(fn).toBeCalledTimes(0)
    })
    it('command unknow', () => {
        const p = new CliParserMock("name", "description")
        const fn = jest.fn()
        p.addCommand('init', 'description', { call: fn })
        const results = p.parse(['wrong'])
        expect(results).toBeFalsy()
        const errors = p.jestMockErrors()
        expect(errors.length).toEqual(1)
        expect(fn).toBeCalledTimes(0)
    })

    // test args

})

describe('arguments', () => {
    describe('default', () => {
        it('help set', () => {
            const p = new CliParserMock("name", "description")
            const args = p.jestMockArguments()
            expect(args.help).toBeTruthy()
        })
        it('version not set ', () => {
            const p = new CliParserMock("name", "description")
            const args = p.jestMockArguments()
            expect(args.version).toBeFalsy()
        })
        it('version set ', () => {
            const p = new CliParserMock("name", "description", {version: "1.0.1"})
            const args = p.jestMockArguments()
            expect(args.version).toBeTruthy()
        })
        it('help and verison is not set ', () => {
            const p = new CliParserMock("name", "description", {version: "1.0.1", defaultArg: false})
            const args = p.jestMockArguments()
            expect(args.help).toBeFalsy()
            expect(args.version).toBeFalsy()
        })
    })

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
            expect(length(args)).toEqual(4)

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
            expect(length(args)).toEqual(1)
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

describe('parser', () => {
    test('check usage output', () => {
        const p = new CliParserMock("name", "description")
        console.info = jest.fn()
        p.parse(['-h'])
        p.usage()
        // @ts-ignore
        expect(console.info.mock.calls[0][0]).toEqual(console.info.mock.calls[1][0])
    })
    test('check version output', () => {
        const version = "1.0.3.45"
        const p = new CliParserMock("name", "description", {version})
        console.info = jest.fn()
        p.parse(['--version'])
        // @ts-ignore
        expect(console.info.mock.calls[0][0]).toEqual(`name ${version}`)
    })
    test('empty arguments', () => {
        const p = new CliParserMock("name", "description")
        console.info = jest.fn()
        p.parse([])
        p.usage()
        // @ts-ignore
        expect(console.info.mock.calls[0][0]).toEqual(console.info.mock.calls[1][0])
    })

})