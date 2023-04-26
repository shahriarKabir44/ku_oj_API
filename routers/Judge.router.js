const JudgeRouter = require('express').Router()
const runPython = require('../executors/runPython');
const JudgeRepository = require('../repositories/Judge.repository');


JudgeRouter.get('/judgeSubmission', (req, res) => {
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    const contestId = 37,
        userId = 3,
        problemId = 40,
        submissionId = 1,
        extName = 'py'
    JudgeRepository.judgeSubmission({ contestId, userId, problemId, submissionId, extName }, res)
        .then(() => {
            res.end()
        })
        .catch(() => {
            res.end()
        })
})


module.exports = JudgeRouter