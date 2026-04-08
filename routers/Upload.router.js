const UploadRouter = require('express').Router()
const { getFileDir } = require('../executors/getFiles')
const { upload } = require('../utils/fileManager')
const fs = require('fs')
const multer = require('multer')
const { sendSuccess, sendError } = require('../utils/responseHelper')

function singleUploadMiddleware(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) return sendError(req, res, err.message, 400)
            return sendError(req, res, 'File upload failed', 500)
        }
        // if fileFilter rejected the file, multer doesn't set req.file
        if (!req.file) return sendError(req, res, 'No file uploaded or invalid file type. Only images and PDFs allowed.', 400)
        next()
    })
}

UploadRouter.post('/upload', singleUploadMiddleware, (req, res) => {
    let fileURL = req.fileDir + '/' + req.filename
    return sendSuccess(res, { fileURL })

})

module.exports = UploadRouter