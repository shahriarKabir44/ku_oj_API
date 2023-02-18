const connection = require('./db')

module.exports = function ({ sql, values }) {
    return new Promise(function (resolve, reject) {
        connection.query({
            sql, values
        }, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}