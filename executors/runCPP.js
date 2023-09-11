const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");
async function runCPP(problemId, filePath) {
    return new Promise((resolve, reject) => {
        let dir = (__dirname + filePath).replace('.cpp', '')

        exec(`g++ ${dir}.cpp -o ${dir}`, (error, stdout, stderr) => {
            if (error) {
                resolve({
                    type: 3,
                    result: false,
                    message: error.toString().replace(new RegExp(dir, 'g'), '***'),
                    verdict: 'ERROR',
                    execTime: 'N/A'
                })

            }
            if (stderr) {

                return;
            }
            const child = spawn(__dirname + filePath.replace('.cpp', ''));
            testOutput(child, problemId)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    resolve(err)
                })

        });
    })

}


module.exports = { runCPP }