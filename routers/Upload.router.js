const UploadRouter = require('express').Router()
const { upload } = require('../utils/fileManager')
UploadRouter.post('/upload', upload.single('file'), (req, res) => {
    let fileURL = req.fileDir + '/' + req.filename
    console.log(req.body)
    res.send({ fileURL })

})

module.exports = UploadRouter