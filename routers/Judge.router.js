const JudgeRouter = require('express').Router()
const runPython = require('../executors/runPython')
JudgeRouter.get('/', (req, res) => {
    // res.setHeader("Access-Control-Allow-Headers", "*")
    // res.setHeader("Access-Control-Allow-Origin", "*");
    //res.setHeader("Cache-Control", "no-cache");
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    const data = JSON.stringify({ ticker: 1 });
    res.write(`id: ${(new Date()).toLocaleTimeString()}\ndata: ${data}\n\n`);

    setTimeout(() => {
        const data = JSON.stringify({ ticker: 1 });
        res.write(`id: ${(new Date()).toLocaleTimeString()}\ndata: ${data}\n\n`);
    }, 1000);
    setTimeout(() => {
        const data = JSON.stringify({ ticker: 1 });
        res.write(`id: ${(new Date()).toLocaleTimeString()}\ndata: ${data}\n\n`);
    }, 2000);
})

JudgeRouter.get('/judgeSubmission', (req, res) => {
    console.log(req.body)
    let begin = new Date()
    runPython(31, '/files/submissions/26/1/31/7.py')
        .then(data => {
            let end = new Date()
            console.log(end - begin, "herex")
        })
    res.send({ data: 1 })
})


module.exports = JudgeRouter