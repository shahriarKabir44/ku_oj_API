const { exec, spawn } = require("child_process");
const fs = require('fs');
const { executeInput } = require("./utils/executeInput");

async function executeCPP(problemId, filePath) {
    exec(`g++ ${__dirname + filePath} -o ${__dirname + filePath.replace('.cpp', '')}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const testcases = readFileLines(`${__dirname}/testcases/${problemId}/in.txt`)
        const expectedOutputs = readFileLines(`${__dirname}/testcases/${problemId}/out.txt`).split('\n')
        let outputs = []
        const child = spawn(__dirname + filePath.replace('.cpp', ''));

    });
}


module.exports = { executeCPP }