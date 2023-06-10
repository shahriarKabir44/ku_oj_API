const { connection } = require('./dbConnection')

function Promisify({ sql, values }) {
    return new Promise(function (resolve, reject) {
        connection.query({
            sql, values
        }, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}
module.exports = Promisify