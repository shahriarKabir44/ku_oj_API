const UploadRouter = require('express').Router()
const runPython = require('../executors/runPython')
const { upload } = require('../utils/uploadManager')
UploadRouter.post('/upload', upload.single('file'), (req, res) => {
    if (req.headers.filetype == 'submission') {
        let file = req.filePath + req.filename

        runPython('11', file)
            .then(data => {
                res.send({ data })
            })
    }

})

module.exports = UploadRouter