const JudgeRouter = require('express').Router()
const runPython = require('../executors/runPython')


JudgeRouter.get('/judgeSubmission', (req, res) => {
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.write(JSON.stringify({ status: 0, message: 'judging' }))
    runPython(31, '/files/submissions/26/1/31/1.py')
        .then(data => {
            data.message = data.message.split('\n').filter((message, index) => index != 0).join('\n')
            res.write(JSON.stringify({ data }))
            res.end()
        })

})


module.exports = JudgeRouter