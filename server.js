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
    app.listen(4000)

    app.use('/submission', require('./routers/Submission.router'))

}