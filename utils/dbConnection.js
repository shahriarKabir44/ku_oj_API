const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Abcd1234.',
    database: 'ku_oj',
    port: 3306
})

module.exports = connection