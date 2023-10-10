const mysql = require('mysql2');
let connection = {};


function initConnection(env) {
    connection.connection = mysql.createConnection({
        host: env.dbHost,
        user: env.dbUser,
        password: env.dbPassword,
        database: env.dbName,
        port: env.dbPort,
        ssl: env.dbssl ? JSON.parse(env.dbssl) : null
    })
}


module.exports = { connection, initConnection }