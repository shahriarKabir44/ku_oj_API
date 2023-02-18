const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({})

const upload = multer({ storage })

function uploader(req, res) {
    const { uploadpath, filename } = req.headers
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('executors/submissions/' + uploadpath)) {
            fs.mkdirSync('executors/submissions/' + uploadpath, { recursive: true });
        }
        let base64Image = req.body.file.split(';base64,').pop();
        fs.writeFile('executors/submissions/' + uploadpath + filename + '.py', base64Image, { encoding: 'base64' }, function (err) {
            resolve()
        });
    })
}
module.exports = { upload, uploader };