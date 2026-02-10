const UploadRouter = require('express').Router()
const { getFileDir } = require('../executors/getFiles')
const { upload } = require('../utils/fileManager')
const fs = require('fs')
const multer = require('multer')

function singleUploadMiddleware(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) return res.status(400).send({ error: err.message })
            return res.status(500).send({ error: 'File upload failed' })
        }
        // if fileFilter rejected the file, multer doesn't set req.file
        if (!req.file) return res.status(400).send({ error: 'No file uploaded or invalid file type. Only images and PDFs allowed.' })
        next()
    })
}

UploadRouter.post('/upload', singleUploadMiddleware, (req, res) => {
    let fileURL = req.fileDir + '/' + req.filename
    res.send({ fileURL })

})

module.exports = UploadRouter