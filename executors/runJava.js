const { exec, spawn } = require("child_process");
const { testOutput } = require("./utils/testOutput");
async function runJava(problemId, filePath) {
    return new Promise((resolve, reject) => {
        let tempPath = `${__dirname + filePath}`
        let compileProcess = spawn('javac', [tempPath])

        compileProcess.on('close', e => {

            const child = spawn('java', ['-cp', tempPath.replace('/Solution.java', ''), tempPath]);
            testOutput(child, problemId)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {

                    resolve(err)
                })


        })

    })

}


module.exports = { runJava }