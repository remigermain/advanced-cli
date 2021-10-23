import CliParserMock from "./parserMock"
import {objectLength} from "../src/utils"


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
        expect(objectLength(commands)).toEqual(1)
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

    it('command not first but help', () => {
        const p = new CliParserMock("name", "description")
        p.addCommand('init', 'description')
        console.info = jest.fn()
        const results = p.parse(['--help', 'init'])

        expect(results).toBeTruthy()
        const errors = p.jestMockErrors()
        expect(errors.length).toEqual(0)

        expect(console.info).toBeCalled()
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
