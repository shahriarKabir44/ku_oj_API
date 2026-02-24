const { getTestcaseFileNames } = require("./getFiles")
const { runCPP } = require("./runCPP")
const { runJava } = require("./runJava")
const { runPython } = require("./runPython")
const { testOutput } = require("./utils/testOutput")


async function executeCode(submission) {
    let testFilesDir = `/testcases/${submission.problemId}/`
    let fileList = getTestcaseFileNames(testFilesDir);
    if (fileList == null) {
        throw new Error("Invalid Dir!")
    }

    let inputFileNames = fileList.filter(x => x.includes('in'));
    let executionOutput = null;
    let index = 1;
    for (const inputFileName of inputFileNames) {
        let fileNo = inputFileName.split('.')[0].split('_')[1];
        let correspondingoutFileSuffix = fileNo ? `_${fileNo}` : '';
        let correspondingOutFile = `out${correspondingoutFileSuffix}.txt`;
        let input = testFilesDir + inputFileName;
        let output = testFilesDir + correspondingOutFile;
        if (submission.language == 'python') {
            executionOutput = await runPython(submission.problemId, submission.submissionFileURL, [input, output])
        }
        else if (submission.language == 'c++') {
            executionOutput = await runCPP(submission.problemId, submission.submissionFileURL, [input, output])
        }
        else if (submission.language == 'java') {
            executionOutput = await runJava(submission.problemId, submission.submissionFileURL, [input, output])
        }
        if (executionOutput.verdict != 'AC') {
            executionOutput.verdict += ` On Test ${index}`;
            return executionOutput;
        }
        index++;
    }
    return executionOutput;


}

module.exports = { executeCode }