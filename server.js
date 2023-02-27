const express = require('express')
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const connection = require('./utils/dbConnection')
const validateJWT = require('./utils/validateJWT')


connection.connect()
if (cluster.isMaster) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();
}
function startExpress() {
    const app = express()
    app.listen(8080)
    app.use(require('cors')())
    app.use(express.json())
    app.use(express.static(__dirname + '/problemStatements'))
    app.use('/uploadFile', require('./routers/Upload.router'))
    app.use('/contests', require('./routers/Contest.router'))
}