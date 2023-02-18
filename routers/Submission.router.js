const SubmissionRouter = require('express').Router()

const { upload, uploader } = require('../utils/uploadManager')


SubmissionRouter.post('/upload', [upload.single('file'), (req, res, next) => {
    uploader(req, res)
    next()
}], (req, res) => {
    res.send("abcd")
})


module.exports = SubmissionRouter