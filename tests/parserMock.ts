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
    jestMockOptions() {
        return this.options
    }
    jestMockErrorsLength() {
        return this.errors.reduce((c, e) => c + e.text.length, 0)
    }
}

export default CliParserMock