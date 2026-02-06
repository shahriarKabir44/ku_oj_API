const { connection } = require('./dbConnection')


function executeSqlAsync({ sql, values }, transactionConnection = null) {
    let connectionObj = transactionConnection ?? connection.connection;
    return new Promise(function (resolve, reject) {
        connectionObj.query({
            sql, values
        }, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}
module.exports = { executeSqlAsync }