const { connection } = require('./dbConnection')

/**
 * 
 * @param {any} param
 * @returns Promise<[any]>
 */
function executeSqlAsync({ sql, values }) {
    return new Promise(function (resolve, reject) {
        connection.connection.query({
            sql, values
        }, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}
module.exports = { executeSqlAsync }