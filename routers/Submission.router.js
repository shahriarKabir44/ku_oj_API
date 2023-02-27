const SubmissionRouter = require('express').Router()

const { upload } = require('../utils/uploadManager')
const runPython = require('../executors/runPython')

SubmissionRouter.post('/upload', upload.single('file'), (req, res) => {

    runPython(1, '/pp/11/ppp.py')
        .then(data => {
            res.send({ data })
        })
})


module.exports = SubmissionRouter