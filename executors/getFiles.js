const fs = require('fs');
const path = require('path');
async function getFiles(dir) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + dir, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data.toString('utf8'))
        })
    })

}

function getTestFileNamesInDir(problemId) {
    let relativePath = `/testcases/${problemId}`;
    let dir = path.join(__dirname, relativePath);
    if (!fs.existsSync(dir)) {
        throw new Error("Path does not exist!");
    }
    let fileNames = fs.readdirSync(dir);
    if (!fileNames.length) {
        throw new Error("Path has no input files!");
    }
    return fileNames;
}

function getFileDir() {
    return __dirname
}
module.exports = { getFiles, getFileDir, getTestFileNamesInDir }