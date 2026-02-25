const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");
const path = require("path");


async function runPython(problemId, filePath, testcase) {
    // console.log(filePath);
    let contentPath = path.join(__dirname, filePath);
    let workDir = path.dirname(contentPath);
    const dockerArgs = [
        "run",
        "--rm",
        "--network=none",
        "--memory=256m",
        "--cpus=0.5",
        "--pids-limit=64",
        "--security-opt=no-new-privileges",
        "-v", `${workDir}:/app`,
        "-w", "/app",
        "python:3.11",
        "python3", `${path.basename(contentPath)}`
    ];

    //let pythonDir = (process.env.compilersRootDir ?? "") + "python";
    //const child = spawn('/usr/bin/python3', [contentPath]);
    const child = spawn("docker", dockerArgs);

    child.on('error', (e) => {
        return null;
    })
    try {
        let data = await testOutput(child, problemId, testcase)
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