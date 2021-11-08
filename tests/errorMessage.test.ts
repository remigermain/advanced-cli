import CliParserMock from "./parserMock"
import * as Err from "../src/error"

describe('arguments', () => {
    it('duplicate', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root')
        expect(p.parse(['42', 'arg', '--rot'])).toBeFalsy()
        expect(p.jestMockErrors[0]).toEqual({
            text: [Err.INVALID_FLAG('rot')],
            argvi: 2, 
            start: 2,
        })
    })
    it('depend', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {depends: ['user']})
        p.addArgument('user')
        expect(p.parse(['42', '--root'])).toBeFalsy()
        expect(p.jestMockErrors[0]).toEqual({
            text: [Err.DEPENDS_FLAGS('root', 'user')],
            argvi: 1, 
            start: 2,
        })
    })
    it('depend with arguments', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {depends: ['user'], params: [{type: Number}]})
        p.addArgument('user')
        expect(p.parse(['42', '--root', 'invalid-number'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [Err.INVALID_ARG('root', Err.INVALID_NUMBER)],
                argvi: 2, 
            },
            {
                text: [Err.DEPENDS_FLAGS('root', 'user')],
                argvi: 1,
                start: 2,
            }
        ])
    })
    it('inline depend with arguments', () => {
        const p = new CliParserMock("name", "description", {inline:true})
        p.addArgument('root', {depends: ['user'], params: [{type: Number}]})
        p.addArgument('user')
        expect(p.parse(['42', '--root=invalid'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [Err.INVALID_ARG('root', Err.INVALID_NUMBER)],
                argvi: 1, 
                start: 7,
                end: 7
            },
            {
                text: [Err.DEPENDS_FLAGS('root', 'user')],
                argvi: 1,
                start: 2,
                end: 4
            }
        ])
    })
    it('multiple inline arguments', () => {
        const p = new CliParserMock("name", "description", {inline:true})
        p.addArgument('root', {params: [{type: Number}, {type: String}, {type:String, validator () {throw new Error('is work !!')}}]})
        expect(p.parse(['42', '--root=4234,filepath,tructruc'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [Err.INVALID_ARG('root', 'is work !!')],
                argvi: 1, 
                start: 21,
                end: 8
            },
        ])
    })
    it('invalid bool', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {params: [{type: Boolean}]})
        expect(p.parse(['42', '--root', 'falsy'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [Err.INVALID_ARG('root', Err.INVALID_BOOL)],
                argvi: 2, 
            },
        ])
    })
    it('invalid date', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {params: [{type: Date}]})
        expect(p.parse(['42', '--root', '0101truc'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [Err.INVALID_ARG('root', Err.INVALID_DATE)],
                argvi: 2, 
            },
        ])
    })
    it('multiple missing args', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {params: [{type: String}, {type: Number},{type: Boolean}]})
        expect(p.parse(['42', '--root'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [
                    Err.INVALID_ARG('root', Err.NEED_ARGUMENT(String)),
                    Err.INVALID_ARG('root', Err.NEED_ARGUMENT(Number)),
                    Err.INVALID_ARG('root', Err.NEED_ARGUMENT(Boolean)),
                ],
                argvi: 2, 
            },
        ])
    })

    it('alias', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {alias: 'r', params: [{type: String}, {type: Number},{type: Boolean}]})
        expect(p.parse(['42', '-r'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [
                    Err.INVALID_ARG('r', Err.NEED_ARGUMENT(String)),
                    Err.INVALID_ARG('r', Err.NEED_ARGUMENT(Number)),
                    Err.INVALID_ARG('r', Err.NEED_ARGUMENT(Boolean)),
                ],
                argvi: 2, 
            },
        ])
    })

    it('unknow alias', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {alias: 'r'})
        expect(p.parse(['42', '-rf'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [
                    Err.INVALID_FLAG('f'),
                ],
                argvi: 1, 
                start: 2,
                end: 1
            },
        ])
    })

    it('miltiple unknow alias', () => {
        const p = new CliParserMock("name", "description")
        p.addArgument('root', {alias: 'r'})
        expect(p.parse(['42', '-rfgu'])).toBeFalsy()
        expect(p.jestMockErrors).toEqual([{
                text: [
                    Err.INVALID_FLAG('f'),
                ],
                argvi: 1, 
                start: 2,
                end: 1
            },
            {
                text: [
                    Err.INVALID_FLAG('g'),
                ],
                argvi: 1, 
                start: 3,
                end: 1
            },
            {
                text: [
                    Err.INVALID_FLAG('u'),
                ],
                argvi: 1, 
                start: 4,
                end: 1
            },
        ])
    })
})