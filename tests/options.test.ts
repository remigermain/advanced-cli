import CliParserMock from "./parserMock"

describe('options', () => {
    it('stop flags -- ', () => {
        const p = new CliParserMock("name", "description", { stopFlags: '--' })
        p.addArgument('root', {alias: 'r'})
        p.addArgument('fol', {alias: 'f'})
        p.addArgument('drop', {
            alias: 'd',
            params: [
                {
                    type: Boolean
                }
            ]
        })

        expect(p.parse(['foo', '--root', 'bar', '-d', 'true', '--', 'hello', '--fol', '-', 'loo'])).toBeTruthy()
        const fl = p.context

        expect(fl.flags.root).toBeTruthy()
        expect(fl.flags.r).toBeTruthy()
        expect(fl.flags.drop).toBeTruthy()
        expect(fl.flags.d).toBeTruthy()
        expect(fl.flags.fol).toBeFalsy()
        expect(fl.flags.f).toBeFalsy()

        expect(fl.anyArgs).toEqual(['foo', 'bar', 'hello', '--fol', '-', 'loo'])
    })

    it('stop flags -- ', () => {
        const p = new CliParserMock("name", "description", { stopFlags: ';' })
        p.addArgument('root', {alias: 'r'})
        p.addArgument('fol', {alias: 'f'})
        p.addArgument('drop', {
            alias: 'd',
            params: [
                {
                    type: Boolean
                }
            ]
        })

        expect(p.parse(['foo', '--root', 'bar', '-d', 'true', ';', 'hello', '--fol', '-', 'loo'])).toBeTruthy()
        const fl = p.context

        expect(fl.flags.root).toBeTruthy()
        expect(fl.flags.r).toBeTruthy()
        expect(fl.flags.drop).toBeTruthy()
        expect(fl.flags.d).toBeTruthy()
        expect(fl.flags.fol).toBeFalsy()
        expect(fl.flags.f).toBeFalsy()

        expect(fl.anyArgs).toEqual(['foo', 'bar', 'hello', '--fol', '-', 'loo'])
    })


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
})