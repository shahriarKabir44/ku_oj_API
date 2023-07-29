const fs = require('fs');
async function getFiles(dir) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + dir, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data.toString())
        })
    })

}
function getFileDir() {
    return __dirname
}
module.exports = { getFiles, getFileDir }