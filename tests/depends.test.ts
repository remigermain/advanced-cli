import CliParserMock from "./parserMock"

describe('depends otpions', () => {
    it('depend arguments not found', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('foo', {depends: ['faa']})
        expect(() => {
            p.parse(['e'])
        }).toThrowError(Error)
    })
    it('alias depend', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('fa', {alias: 'l'})
        p.addArgument('foo', {depends: ['f']})
        expect(() => {
            p.parse(['e'])
        }).toThrowError(Error)
    })
    it('same depend', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('fa', {alias: 'l'})
        p.addArgument('foo', {depends: ['fa', 'fa']})
        expect(() => {
            p.parse(['e'])
        }).toThrowError(Error)
    })
    it('not a string', () => {
        const p = new CliParserMock("name", "description")
        // @ts-ignore
        p.addArgument('foo', {depends: [42]})
        expect(() => {
            p.parse(['e'])
        }).toThrowError(Error)
    })

    it('depend flags', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('ssl-cert', {depends: ['ssl-key']})
        p.addArgument('ssl-key', {depends: ['ssl-cert']})
        expect(p.parse(['--ssl-cert'])).toBeFalsy()
        expect(p.jestMockErrorsLength).toEqual(1)
    })
    
    it('depend flags alias', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('ssl-cert', {alias: 's', depends: ['ssl-key']})
        p.addArgument('ssl-key', {depends: ['ssl-cert']})
        expect(p.parse(['-s'])).toBeFalsy()
        expect(p.jestMockErrorsLength).toEqual(1)
    })
})
