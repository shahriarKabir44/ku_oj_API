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

function beginTransaction(env) {
    const pool = mysql.createPool({
        host: env.dbHost,
        user: env.dbUser,
        password: env.dbPassword,
        database: env.dbName,
        port: env.dbPort,
        ssl: env.dbssl ? JSON.parse(env.dbssl) : null
    });
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {

            if (err) reject(err);
            resolve(connection);
        })
    })
        ;
}


module.exports = { connection, initConnection, beginTransaction }