const fs = require('fs');
const path = require('path');
async function getFiles(dir) {
    return new Promise((resolve, reject) => {
        dir = dir.replaceAll('\\', '/');
        let filePath = path.join(__dirname, dir);
        console.log('getting file from path', filePath);
        fs.readFile(filePath, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data.toString('utf8'))
        })
    })

}
function getTestcaseFileNames(relativeDir) {
    relativeDir = relativeDir.replaceAll('\\', '/');
    let dir = path.join(__dirname, relativeDir);
    if (!fs.existsSync(dir)) return null;
    return fs.readdirSync(dir);
}

function getFileDir() {
    return __dirname
}
module.exports = { getFiles, getFileDir, getTestcaseFileNames }