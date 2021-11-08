import CliParserMock from "./parserMock"
import * as Err from "../src/error"

describe('multiple options', () => {
    it('whitout arguments', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {multiple: true})
        expect(p.parse(['usr', "--root", "42"])).toBeTruthy()
        expect(p.context.flags.root).toEqual([[]])
    })
    it('whitout arguments multiple', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {alias: 'r', multiple: true})
        expect(p.parse(['usr', "--root", "42", "-r"])).toBeTruthy()
        expect(p.context.flags.root).toEqual([[], []])
    })
    it('whit arguments', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {multiple: true, params: [{type: Number}]})
        expect(p.parse(['usr', "--root", "42"])).toBeTruthy()
        expect(p.context.flags.root).toEqual([[42]])
    })
    it('whit arguments', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {alias: 'r', multiple: true, params: [{type: Number}]})
        expect(p.parse(['usr', "--root", "42", "-r", "-1", "--root", "101"])).toBeTruthy()
        expect(p.context.flags.root).toEqual([[42], [-1], [101]])
    })
    it('whit multiple arguments', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {alias: 'r', multiple: true, params: [{type: Number}, {type: String, default: "default"}]})
        expect(p.parse(['usr', "--root", "42", "user", "-r", "-1", "apache", "--root", "101"])).toBeTruthy()
        expect(p.context.flags.root).toEqual([[42, "user"], [-1, "apache"], [101, "default"]])
    })

    it('error whitout arguments multiple', () => {
        const p = new CliParserMock("name", "dscription")
        p.addArgument('root', {alias: 'r'})
        expect(p.parse(['usr', "--root", "42", "-r"])).toBeFalsy()
    })
})