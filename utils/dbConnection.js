const mysql = require('mysql2');
let connection;


function initConnection(env) {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: env.dbPassword,
        database: 'ku_oj',
        port: 3306
    })
}


module.exports = { connection, initConnection }