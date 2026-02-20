const fs = require('fs');
async function getFiles(dir) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + dir, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data.toString('utf8'))
        })
    })

}
function getTestcaseFileNames(relativeDir) {
    let dir = __dirname + relativeDir;
    if (!fs.existsSync(dir)) return null;
    return fs.readdirSync(dir);
}

function getFileDir() {
    return __dirname
}
module.exports = { getFiles, getFileDir, getTestcaseFileNames }