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


async function execInput(processChild, args) {
    return new Promise((resolve, reject) => {
        try {
            processChild.stdin.write(args);
            let isExecutionCompleted = false
            //processChild.stdin.write("1");
            processChild.stdin.end();
            processChild.stdout.on("data", (data) => {
                isExecutionCompleted = true
                let val = data.toString().split('\n').filter(e => e != '')

                resolve(val)
            });
            setTimeout(() => {
                processChild.stdin.write("^c");
                resolve(false)
            }, 1000);
        } catch (error) {

        }

    })
}
module.exports = function (problemId, filePath) {

    return new Promise((resolve, reject) => {

        try {
            const testcases = readFileLines(`${__dirname}/files/testcases/${problemId}/in.txt`)
            const expectedOutputs = readFileLines(`${__dirname}/files/testcases/${problemId}/out.txt`).split('\n')
            let outputs = []
            console.log(expectedOutputs)
            const child = spawn("python", [__dirname + filePath]);
            child.on('error', (e) => {
                console.log(error, "here")
            })
            let promises = []
            execInput(child, testcases)
                .then(data => {
                    outputs.push(data)
                    for (let n = 0; n < data.length; n++) {
                        if (data[n] != expectedOutputs[n]) {
                            resolve(false)
                        }
                    }
                    resolve(true)
                })




        } catch (error) {
            console.error(error)
        }

    })

}


