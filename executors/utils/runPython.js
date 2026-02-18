const { exec, spawn } = require("child_process");
const path = require("path");


async function getPythonProcess(filePath) {
    return new Promise((resolve, reject) => {
        let contentPath = path.join(__dirname, filePath);
        const child = spawn('/usr/bin/python3', [contentPath]);
        child.on('error', (e) => {
            reject(e.message);
        });
        resolve(child);
    });
}


module.exports = { getPythonProcess }