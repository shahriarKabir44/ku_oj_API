const { runCPP } = require("./runCPP")
const { runJava } = require("./runJava")
const { runPython } = require("./runPython")


async function executeCode(submission) {
    console.log(submission)
    if (submission.language == 'python') {
        return runPython(submission.problemId, submission.submissionFileURL)
    }
    else if (submission.language == 'c++') {
        return runCPP(submission.problemId, submission.submissionFileURL)
    }
    else if (submission.language == 'java') {
        return runJava(submission.problemId, submission.submissionFileURL)
    }
}

module.exports = { executeCode }