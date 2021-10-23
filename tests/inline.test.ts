import CliParserMock from "./parserMock"

describe('inline arguments', () => {
    it('inline disable', () => {
        const p = new CliParserMock("name", "description", { inline: false })
        p.addArgument('foo=bar')
        expect(p.parse(['--foo=bar'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl['foo=bar']).toBeTruthy()
    })

    it('inline name arguments with =', () => {
        const p = new CliParserMock("name", "description", { inline: true })
        expect(() => {
            p.addArgument('foo=bar')
        }).toThrowError()
    })

    it('inline enable', () => {
        const p = new CliParserMock("name", "description", { inline: true })
        p.addArgument('foo', {
            params: [
                {
                    type: String,
                }
                
        ]})
        expect(p.parse(['--foo=bar'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual(["bar"])
    })
    it('inline default value', () => {
        const p = new CliParserMock("name", "description", { inline: true })
        p.addArgument('foo', {
            params: [
                {
                    type: String,
                },
                {
                    type: String,
                    default:42
                }
                
        ]})
        expect(p.parse(['--foo=bar'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual(["bar", 42])
    })
    it('inline no arguments length', () => {

        const p = new CliParserMock("name", "description", { inline: true })
        p.addArgument('foo', {
            params: [
                {
                    type: String,
                    validator: () => 4242
                },
                {
                    type: String,
                    validator: () => 101
                }
                
        ]})
        expect(p.parse(['--foo=bar'])).toBeFalsy()
    })
    it('inline validator and default', () => {

        const p = new CliParserMock("name", "description", { inline: true })
        
        const fnc = jest.fn()
        const fnc2 = jest.fn(() => 4242)
        
        p.addArgument('foo', {
            params: [
                {
                    type: String,
                    validator: (value, arr) => {
                        fnc(String(value), [...arr])
                        return 101
                    }
                },
                {
                    type: String,
                    default: 42,
                    validator: fnc2
                }
                
        ]})
        expect(p.parse(['--foo=bar'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual([101, 42])
        expect(fnc).toBeCalledWith("bar", [])
        expect(fnc2).toBeCalledTimes(0)
    })
    
    it('inline validator', () => {

        const p = new CliParserMock("name", "description", { inline: true })
        
        const fnc = jest.fn()
        const fnc2 = jest.fn()
        
        p.addArgument('foo', {
            params: [
                {
                    type: String,
                    validator: (value, arr) => {
                        fnc(String(value), [...arr])
                        return 101
                    }
                },
                {
                    type: Number,
                    validator: (value, arr) => {
                        fnc2(String(value), [...arr])
                        return 4242
                    }
                }
                
        ]})
        expect(p.parse(['--foo=bar,pi'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual([101, 4242])
        expect(fnc).toBeCalledWith("bar", [])
        expect(fnc2).toBeCalledWith("pi", [101])
    })

    it('inline no validator', () => {

        const p = new CliParserMock("name", "description", { inline: true })
        
        p.addArgument('foo', {
            params: [
                {type: Number},{type: String},{type: String},{type: Boolean},{type: String},
        ]})
        expect(p.parse(['--foo=6774,PI,88699,true,poitou'])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual([6774, "PI", "88699", true, "poitou"])
    })

    it('inline with alias', () => {

        const p = new CliParserMock("name", "description", { inline: true })
        
        p.addArgument('foo', {
            alias: 'f',
            params: [
                {type: Number},{type: String},{type: String},{type: Boolean},{type: String},
        ]})
        expect(p.parse(['-f', "6774","PI","88699","true","poitou"])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual([6774, "PI", "88699", true, "poitou"])
    })
    it('no inline', () => {

        const p = new CliParserMock("name", "description", { inline: false })
        
        p.addArgument('foo', {
            alias: 'f',
            params: [
                {type: Number},{type: String},{type: String},{type: Boolean},{type: String},
        ]})
        expect(p.parse(['--foo', "6774","PI","88699","true","poitou"])).toBeTruthy()
        const fl = p.context.flags
        expect(fl.foo).toEqual([6774, "PI", "88699", true, "poitou"])
    })
})