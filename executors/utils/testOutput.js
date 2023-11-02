const { getFiles } = require("../getFiles")
const { executeInput } = require("./executeInput")
/**
* 
* @param {ChildProcessWithoutNullStreams} processChild 
* @param {*} problemId 
*/
async function testOutput(processChild, problemId) {
    let testInputs = ""
    let expectedOutputs = ""
    await Promise.all([
        getFiles(`/testcases/${problemId}/in.txt`)
            .then(data => testInputs = data),

        getFiles(`/testcases/${problemId}/out.txt`)
            .then(data => expectedOutputs = data.split("\n"))

    ])
    let outputs = []
    return new Promise((resolve, reject) => {
        executeInput(processChild, testInputs)
            .then(output => {
                if (!output.result) {
                    resolve(output)
                }
                outputs.push(output.data)

                if (output.data.length != expectedOutputs.length) {
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
}

module.exports = { testOutput }