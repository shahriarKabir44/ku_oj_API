const express = require('express')
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const { initConnection } = require('./utils/dbConnection');
const { RedisClient } = require('./utils/RedisClient');
const { executeSqlAsync } = require('./utils/executeSqlAsync');
const workers = []
const commands = process.argv.filter((item, index) => index > 1)
if (commands) {
    process.env.mode = commands[0]
    if (process.env.mode == 'dev') {
        require('dotenv').config({ path: `${__dirname}/.env.dev` })

    } else if (process.env.mode == 'prod')
        require('dotenv').config({ path: `${__dirname}/.env.prod` })

}

if (cluster.isMaster) {

    for (let i = 0; i < totalCPUs; i++) {
        const worker = cluster.fork();

        worker.id = i
        workers.push(worker)
    }


    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();

}

function startExpress() {

    const app = express()

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        initConnection()
        RedisClient.init()

    })
    app.use(require('cors')({
        origin: '*'
    }))

    app.use(express.json())
    app.use(express.static(__dirname + '/problemStatements'))
    app.use('/uploadFile', require('./routers/Upload.router'))
    app.use('/contests', require('./routers/Contest.router'))
    app.use('/submission', require('./routers/Submission.router'))
    app.use('/user', require('./routers/User.router'))
    app.get('/test', (req, res) => {
        executeSqlAsync({
            sql: `select * from user;`,
            values: []
        }).then(data => {
            res.send(data)

        })
    })

}

