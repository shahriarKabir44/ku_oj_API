const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");


async function runPython(problemId, filePath) {
    let errorMessage = []
    const child = spawn("python", [__dirname + filePath]);
    child.on('error', (e) => {
    })
    try {
        return await testOutput(child, problemId)

    } catch (error) {
        return error
    }


}


module.exports = { runPython }