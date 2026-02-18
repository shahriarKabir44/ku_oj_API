const { runCPP } = require("./runCPP")
const { runJava } = require("./runJava")
const { runPython } = require("./runPython")
const { testOutput } = require("./utils/testOutput")


async function executeCode(submission) {
    if (submission.language == 'c++') {
        return runCPP(submission.problemId, submission.submissionFileURL)
    }
    else if (submission.language == 'java') {
        return runJava(submission.problemId, submission.submissionFileURL)
    }

    testOutput(submission.problemId, submission.language, submission.submissionFileURL);

}

module.exports = { executeCode }