const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");
async function executeCPP(problemId, filePath) {
    return new Promise((resolve, reject) => {
        exec(`g++ ${__dirname + filePath} -o ${__dirname + filePath.replace('.cpp', '')}`, (error, stdout, stderr) => {
            if (error) {
                return;
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
                    reject(err)
                })

        });
    })

}


module.exports = { executeCPP }