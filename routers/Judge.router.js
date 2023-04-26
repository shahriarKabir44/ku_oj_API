const JudgeRouter = require('express').Router()
const runPython = require('../executors/runPython')


JudgeRouter.get('/judgeSubmission', (req, res) => {
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.write(JSON.stringify({ status: 0, message: 'judging' }))
    runPython(40, '/submissions/37/3/40/1.py')
        .then(data => {

            //data.message = data.message?.split('\n').filter((message, index) => index != 0).join('\n')
            res.write(JSON.stringify({ data }))
            res.end()
        })
        .catch(err => {
            res.write(JSON.stringify({ err }))
            res.end()
        })

})


module.exports = JudgeRouter