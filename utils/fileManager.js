const multer = require('multer')

const fs = require('fs')
const storage = multer.diskStorage({
    destination: (req, res, cb) => cb(null, getUploadFilePath(req)[1]),
    filename: (req, res, cb) => cb(null, getUploadedFileName(req))
})

function getUploadFilePath(req) {
    const { filetype, problemid } = req.headers
    let path = 'executors/'
    let tempPath = ''
    if (filetype == 'submission') {
        const { postedby, contestid } = req.headers
        path += `/submissions/${contestid}/${postedby}/${problemid}`
        tempPath += `/submissions/${contestid}/${postedby}/${problemid}`
        const { submissionid, ext } = req.headers

        if (ext == 'cpp' || ext == 'java') {
            path += `/${submissionid}`
            tempPath += `/${submissionid}`
        }
    }
    else if (filetype == 'testcaseoutput' || filetype == 'testcaseinput') {
        path += `/testcases/${problemid}`
        tempPath += `/testcases/${problemid}`
    }
    else if (filetype == 'statementfile') {
        path = `problemStatements/`
        tempPath = ``

    }
    else return null

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    req.fileDir = tempPath
    return [tempPath, path]
}

function getUploadedFileName(req, submissionid = 0) {
    const { filetype, ext } = req.headers
    let filename = ""
    if (filetype == 'submission') {
        filename = submissionid
        if (req.headers.ext == 'java') {
            filename = 'Solution'
        }
    }
    else if (filetype == 'testcaseinput') {

        filename = 'in'
    }

    else if (filetype == 'testcaseoutput') {

        filename = 'out'
    }
    else if (filetype == 'statementfile') {
        const { problemid } = req.headers
        filename = problemid
    }
    else {
        return null;
    }
    req.filename = `${filename}.${ext}`
    return `${filename}.${ext}`

}

// allowed mimetypes: images and pdf
const ALLOWED_MIMETYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml'
]

function fileFilter(req, file, cb) {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) cb(null, true)
    else cb(null, false)
}

// limit to a single file upload
const upload = multer({ storage, fileFilter, limits: { files: 1 } })

module.exports = { upload, getUploadFilePath, getUploadedFileName };