const UploadRouter = require('express').Router()
const runPython = require('../executors/runPython')
const { upload } = require('../utils/uploadManager')
UploadRouter.post('/upload', upload.single('file'), (req, res) => {
    if (req.headers.filetype == 'submission') {
        let file = req.fileDir + '/' + req.filename

        runPython('11', file)
            .then(data => {
                console.log(data)
                res.send({ data })
            })
    }

})

module.exports = UploadRouter