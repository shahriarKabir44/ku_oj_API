const UploadRouter = require('express').Router()
const { getFileDir } = require('../executors/getFiles')
const { upload } = require('../utils/fileManager')
const fs = require('fs')
UploadRouter.post('/upload', upload.single('file'), (req, res) => {
    let fileURL = req.fileDir + '/' + req.filename
    res.send({ fileURL })

})

UploadRouter.post('/storeContent', async (req, res) => {
    await writeTestcaseFileContents(req.body.problemId, req.body.testcaseFileContent, 'in')
    await writeTestcaseFileContents(req.body.problemId, req.body.outputFileContent, 'out')
    res.send({ success: 1 })
})


function writeTestcaseFileContents(problemId, content, type) {
    return new Promise((resolve, reject) => {
        const filePath = getFileDir() + `/testcases/${problemId}`
        fs.mkdir(filePath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
            } else {
                fs.writeFile(filePath + `/${type}.txt`, content, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    resolve()
                })
            }
        });

    })
}

module.exports = UploadRouter