const UploadRouter = require('express').Router()
const { getFileDir } = require('../executors/getFiles')
const { upload } = require('../utils/fileManager')
const fs = require('fs')
UploadRouter.post('/upload', upload.single('file'), (req, res) => {
    let fileURL = req.fileDir + '/' + req.filename
    res.send({ fileURL })

})



module.exports = UploadRouter