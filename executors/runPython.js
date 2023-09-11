const { exec, spawn } = require("child_process");
const fs = require('fs');
const { testOutput } = require("./utils/testOutput");


async function runPython(problemId, filePath) {
    const child = spawn("python", [__dirname + filePath]);
    child.on('error', (e) => {
        console.log(e)
    })
    try {
        let data = await testOutput(child, problemId)
        if (data.message) {
            data.message = data.message.replace(new RegExp(__dirname + filePath, 'g'), '***.py')
        }
        return data

    } catch (error) {
        if (error.message) {
            error.message = error.message.replace(new RegExp(__dirname + filePath, 'g'), '***.py')
        }
        return error
    }


}


module.exports = { runPython }