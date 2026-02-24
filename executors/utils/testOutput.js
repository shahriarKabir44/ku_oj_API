const e = require("express")
const { getFiles, getTestFileNamesInDir } = require("../getFiles")
const { executeInput } = require("./executeInput")
/**
* 
* @param {ChildProcessWithoutNullStreams} processChild 
* @param {*} problemId 
*/

async function testOutput(problemId, language, submissionFileURL) {
    let processChild = null;


    try {
        let testCaseFileNames = getTestFileNamesInDir(problemId);

        if (language == 'python') {
            processChild = await getPythonProcess(submissionFileURL);
        }



        let testInputs = await getFiles(`/testcases/${problemId}/in.txt`);
        let expectedOutputs = await getFiles(`/testcases/${problemId}/out.txt`);
        let outputs = []
        return new Promise((resolve, reject) => {
            executeInput(processChild, testInputs)
                .then(output => {
                    if (!output.result) {
                        resolve(output)
                    }

                    output.data = output.data.filter(o => o != '');
                    if (output.data.length != expectedOutputs.trim().length) {
                        reject({
                            result: false,
                            type: 2,
                            verdict: 'WA',
                            execTime: 'N/A'

                        })
                    }
                    for (let n = 0; n < output.data.length; n++) {
                        if (output.data[n] != expectedOutputs[n]) {
                            reject({
                                result: false,
                                type: 2,
                                verdict: 'WA',
                                execTime: 'N/A'
                            })
                        }
                    }
                    resolve({
                        result: true,
                        type: 1,
                        verdict: 'AC',
                        execTime: output.execTime
                    })
                })
                .catch(err => {
                    reject(err)
                })
        })


    } catch (error) {

    }
    finally {
        if (processChild != null) {
            if (language == 'python') {
                processChild.kill();

            }
        }
    }

}

module.exports = { testOutput }