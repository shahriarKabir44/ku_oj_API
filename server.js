const express = require('express')
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const { initConnection } = require('./utils/dbConnection');
const { RedisClient } = require('./utils/RedisClient');
const http = require('http');
const { executeSqlAsync } = require('./utils/executeSqlAsync');
const WebSocket = require('ws')
const workers = []

const clients = new Map()
require('dotenv').config({ path: `${__dirname}/.env.prod` })

if (cluster.isMaster) {

    for (let i = 0; i < totalCPUs; i++) {
        const worker = cluster.fork();

        worker.id = i
        workers.push(worker)
    }


    cluster.on('message', (worker, message, handle) => {
        console.log('mesaged', message)

    })
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();

}

function startExpress() {

    const app = express()
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    initConnection(process.env)
    RedisClient.init()
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
    });
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
    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {

                    client.send(message.toString());
                }
            });
        });

        // Handle WebSocket disconnections
        ws.on('close', () => {
        });
    });
}

