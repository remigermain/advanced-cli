import CliParserMock from "./parserMock"

describe('format', () => {
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
})