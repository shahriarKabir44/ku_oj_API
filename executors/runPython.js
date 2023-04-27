const { exec, spawn } = require("child_process");
const fs = require('fs')
// exec("g++ a.cpp -o a", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     const child = spawn("./a");
//     child.stdin.write("4 5");
//     child.stdin.end();
//     child.stdout.on("data", (data) => {
//         console.log(`child stdout:\n${data}`);
//     });
//     console.log(`stdout: ${stdout}`);
// });
// Intitializing the readFileLines with the file
const readFileLines = filename =>
    fs.readFileSync(filename)
        .toString('UTF8')

/**
 * 
 * @param {ChildProcessWithoutNullStreams} processChild 
 * @param {String} args 
 * @returns 
 */
async function execInput(processChild, args) {
    return new Promise((resolve, reject) => {
        try {
            let begin = new Date()
            let messages = []
            processChild.stdin.write(args);
            let isExecutionCompleted = false
            processChild.stdin.end();
            processChild.stderr.on('data', e => {
                let message = e.toString()
                messages.push(message)

            })
            processChild.stderr.on('end', e => {
                reject({
                    type: 3,
                    result: false,
                    message: messages,
                    verdict: 'ERROR',
                    execTime: 'N/A'

                })
            })
            processChild.stdout.on("data", (data) => {
                let execTime = (new Date()) - begin
                isExecutionCompleted = true
                let val = data.toString().split('\n').filter(e => e != '')
                resolve({ data: val, result: true, execTime })
            });
            setTimeout(() => {
                if (!isExecutionCompleted) {
                    processChild.stdin.write("^c");
                    reject({
                        result: false,
                        verdict: "TLE",
                        type: 4,
                        execTime: 'N/A'

                    })
                }

            }, 1000);
        } catch (error) {

        }

    })
}
module.exports = function (problemId, filePath) {
    let errorMessage = []
    return new Promise((resolve, reject) => {

        try {
            const testcases = readFileLines(`${__dirname}/testcases/${problemId}/in.txt`)
            const expectedOutputs = readFileLines(`${__dirname}/testcases/${problemId}/out.txt`).split('\n')
            let outputs = []

            const child = spawn("python", [__dirname + filePath]);
            child.on('error', (e) => {
            })
            execInput(child, testcases)
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




        } catch (error) {

            reject(error)
        }

    })

}


