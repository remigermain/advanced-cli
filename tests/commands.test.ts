import CliParserMock from "./parserMock"
import { objectLength } from "../src/utils"
import { CliArg, CliArgSet } from "../src/declare"


describe('commands', () => {
    it('default arguments false', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addCommand('init', 'description')
        const commands = p.jestMockCommands
        expect(commands.init.arguments).toEqual({})
    })
    it('default arguments true', () => {
        const p = new CliParserMock("name", "description", { defaultArg: true })
        p.addCommand('init', 'description')
        const commands = p.jestMockCommands
        expect(commands.init.arguments.help).toBeTruthy()
    })

    it('set without arugments', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addCommand('init', 'description')
        const commands = p.jestMockCommands
        expect(objectLength(commands)).toEqual(1)
        expect(commands.init).toEqual({
            name: 'init',
            description: 'description',
            arguments: {}
        })
    })

    it('set with arugments', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })

        const root: CliArgSet = {
            alias: 'l',
            description: 'my description',
            params: [
                { type: Number, default: 5 },
            ]
        }
        p.addCommand('init', 'description', {
            arguments: {
                root,
            }
        })
        const commands = p.jestMockCommands
        expect(objectLength(commands)).toEqual(1)
        expect(commands.init).toEqual({
            name: 'init',
            description: 'description',
            arguments: {
                root: {
                    name: 'root',
                    ...root
                },
                // @ts-ignore
                [root.alias]: {
                    name: 'root',
                    ...root
                }
            }
        })
    })

    it('invalid name', () => {
        const p = new CliParserMock("name", "description")
        expect(() => {
            p.addCommand('i', 'description')
        }).toThrowError()
    })

    it('duplicate', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        expect(() => {
            p.addCommand('init', 'description')
        }).toThrowError()
    })

    it('arguments', () => {
        const p = new CliParserMock("name", "description", { defaultArg: false })
        p.addCommand('init', 'description', {
            arguments: {
                root: {
                    alias: 'r',
                    description: 'root-description'
                }
            }
        })
        const commands = p.jestMockCommands
        const args = p.jestMockArguments

        expect(objectLength(commands)).toEqual(1)
        expect(objectLength(args)).toEqual(0)
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
        expect(fn).toBeCalledWith(p.context)
    })

    it('command not first', () => {
        const p = new CliParserMock("name", "description")
        const fn = jest.fn()
        p.addCommand('init', 'description', { call: fn })
        const results = p.parse(['--flag', 'init'])
        expect(results).toBeFalsy()
        const errors = p.jestMockErrors
        expect(errors.length).toEqual(1)
        expect(fn).toBeCalledTimes(0)
    })

    it('command not first but help', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        const results = p.parse(['--help', 'init'])

        expect(results).toBeFalsy()
        const errors = p.jestMockErrors
        expect(errors.length).toEqual(1)
    })

    it('command unknow', () => {
        const p = new CliParserMock("name", "description")
        const fn = jest.fn()
        p.addCommand('init', 'description', { call: fn })
        const results = p.parse(['wrong'])
        expect(results).toBeFalsy()
        const errors = p.jestMockErrors
        expect(errors.length).toEqual(1)
        expect(fn).toBeCalledTimes(0)
    })

    it('command wrong flag', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description', {
            arguments: {
                'root': {}
            },
        })
        p.addCommand('run', 'description', {
            arguments: {
                'tru': {}
            },
        })

        const results = p.parse(['run', '--root'])
        expect(results).toBeFalsy()
    })

    it('command flag', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description', {
            arguments: {
                root: {}
            },
        })
        p.addCommand('run', 'description', {
            arguments: {
                tru: {}
            },
        })

        const results = p.parse(['run', '--tru'])
        expect(results).toBeTruthy()
        const flag = p.context.flags
        expect(flag.tru).toBeTruthy()
    })

})
