const JudgeRouter = require('express').Router()
const runPython = require('../executors/runPython');
const JudgeRepository = require('../repositories/Judge.repository');


JudgeRouter.get('/judgeSubmission', (req, res) => {

})


module.exports = JudgeRouter