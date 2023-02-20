const multer = require('multer')





const fs = require('fs')
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        const { filetype, problemid } = req.headers
        let path = 'executors/files'
        let tempPath = '/files'
        if (filetype == 'submission') {
            const { postedby } = req.headers
            path += `/submissions/${postedby}/${problemid}`
            tempPath += `/submissions/${postedby}/${problemid}`
        }
        else if (filetype == 'testcaseoutput' || filetype == 'testcaseinput') {
            path += `/testcases/${problemid}`
            tempPath += `/testcases/${problemid}`
        }
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        req.fileDir = tempPath
        return cb(null, path)

    },
    filename: (req, res, cb) => {
        const { filetype, ext } = req.headers
        let filename = ""
        if (filetype == 'submission') {
            const { submissionid } = req.headers
            filename = submissionid
        }
        else if (filetype == 'testcaseoutput') {

            filename = 'out'
        }
        else if (filetype == 'testcaseoutput') {

            filename = 'in'
        }
        req.filename = `${filename}.${ext}`
        cb(null, `${filename}.${ext}`)
    }
})

const upload = multer({ storage })

module.exports = { upload };