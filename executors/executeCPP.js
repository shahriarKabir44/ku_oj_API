const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");
async function executeCPP(problemId, filePath) {
    return new Promise((resolve, reject) => {
        exec(`g++ ${__dirname + filePath} -o ${__dirname + filePath.replace('.cpp', '')}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            const child = spawn(__dirname + filePath.replace('.cpp', ''));
            testOutput(child, problemId)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    console.log(err, "fsf")
                    reject(err)
                })

        });
    })

}


module.exports = { executeCPP }