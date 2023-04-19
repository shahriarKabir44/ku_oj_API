const express = require('express')
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const connection = require('./utils/dbConnection')
const validateJWT = require('./utils/validateJWT')
require('dotenv').config()
const workers = []
const clients = new Map()

connection.connect()
if (cluster.isMaster) {

    for (let i = 0; i < totalCPUs; i++) {
        const worker = cluster.fork();

        worker.id = i
        workers.push(worker)
    }


    cluster.on('message', (worker, message, handle) => {
        const { messageType, client } = message

    })
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();

}
function startExpress() {
    const app = express()
    app.listen(8080)
    app.use(require('cors')({
        origin: '*'
    }))
    app.use(express.json())
    app.use(express.static(__dirname + '/problemStatements'))
    app.use('/uploadFile', require('./routers/Upload.router'))
    app.use('/contests', require('./routers/Contest.router'))
    app.use('/judge', require('./routers/Judge.router'))
    app.use('/submission', require('./routers/Submission.router'))
    app.use('/user', require('./routers/User.router'))
}