const JudgeRouter = require('express').Router()

JudgeRouter.get('/', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.write("iuwbhfrbf")
    setTimeout(() => {
        res.write("poop")
    }, 1000)
    res.end()
})

module.exports = JudgeRouter