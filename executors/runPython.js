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
module.exports = function (problemId, filePath) {
    const testCaseFile = readFileLines(`${__dirname}/files/testcases/${problemId}/in.txt`)
    let outputs = []
    console.log(filePath)
    return new Promise((resolve, reject) => {

        try {
            const child = spawn("python", [__dirname + '/submissions' + filePath]);
            child.on('error', (e) => {
                console.log(error)
            })
            //testCaseFile.forEach(testcase => {
            //console.log(testcase)
            child.stdin.write('12');
            child.stdin.end();
            child.stdout.on("data", (data) => {
                console.log(data.toString())
                outputs.push(data.toString())
            });
            //})
            resolve(outputs)

        } catch (error) {

        }

    })

}


