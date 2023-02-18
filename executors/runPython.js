const { exec, spawn } = require("child_process");
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

const child = spawn("python", ['cp.py']);
child.stdin.write("4");
child.stdin.end();
child.stdout.on("data", (data) => {
    console.log(`child stdout:\n${data}`);
});

