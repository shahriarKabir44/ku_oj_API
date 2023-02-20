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
        .split('\n');

async function execInput(processChild, args) {
    return new Promise((resolve, reject) => {
        try {
            processChild.stdin.write(args);
            processChild.stdin.end();
            processChild.stdout.on("data", (data) => {
                let val = data.toString().replace('\n', '')
                resolve(val)
            });
        } catch (error) {

        }

    })
}
module.exports = function (problemId, filePath) {
    const testCaseFile = readFileLines(`${__dirname}/files/testcases/${problemId}/in.txt`)
    let outputs = []
    return new Promise((resolve, reject) => {

        try {
            const child = spawn("python", [__dirname + filePath]);
            child.on('error', (e) => {
                console.log(error, "here")
            })
            let promises = []
            testCaseFile.forEach(testcase => {
                promises.push(execInput(child, testcase)
                    .then(data => {
                        outputs.push(data)
                    }))
            })
            Promise.all(promises).then(() => {
                resolve(outputs)
            })



        } catch (error) {

        }

    })

}


