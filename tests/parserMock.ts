import CliParser from "../src"

class CliParserMock extends CliParser {

    jestMockArguments() {
        return this.arguments
    }

    jestMockCommands() {
        return this.commands
    }

    jestMockErrors() {
        return this.errors
    }
    jestMockContext() {
        return this._ctx
    }
    jestMockOptions() {
        return this.options
    }
}

export default CliParserMock