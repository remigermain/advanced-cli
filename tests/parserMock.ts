import CliParser from "../src"

class CliParserMock extends CliParser {

    get jestMockArguments() {
        return this.arguments
    }

    get jestMockCommands() {
        return this.commands
    }

    get jestMockErrors() {
        return this.errors
    }
    get jestMockOptions() {
        return this.options
    }
    get jestMockErrorsLength() {
        return this.errors.reduce((c, e) => c + e.text.length, 0)
    }
}

export default CliParserMock