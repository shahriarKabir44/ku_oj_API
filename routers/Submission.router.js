const SubmissionRouter = require('express').Router()

const { upload, uploader } = require('../utils/uploadManager')


SubmissionRouter.post('/upload', upload.single('file'), (req, res) => {
    res.send("abcd")
})


module.exports = SubmissionRouter