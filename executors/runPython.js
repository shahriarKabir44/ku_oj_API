const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");
const path = require("path");


async function runPython(problemId, filePath) {
    let contentPath = path.join(__dirname, filePath);
    //let pythonDir = (process.env.compilersRootDir ?? "") + "python";
    const child = spawn('/usr/bin/python3', [contentPath]);

    child.on('error', (e) => {
        return null;
    })
    try {
        let data = await testOutput(child, problemId)
        if (data.message) {
            data.message = data.message.replace(new RegExp(contentPath, 'g'), '***.py')
        }
        return data

    } catch (error) {
        if (error.message) {
            error.message = error.message.replace(new RegExp(contentPath, 'g'), '***.py')
        }
        return error
    }


}


module.exports = { runPython }