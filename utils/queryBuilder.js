class QueryBuilder {
    static insertQuery(tableName, fields) {

        return `insert into ${tableName} (${fields.toString()}) values(${new Array(fields.length).fill('?').toString()})`


    }
    static getLastInsertedRow(tableName) {
        return `select * from ${tableName} where Id=(select max(Id) from ${tableName})`
    }

    static createUpdateQuery(tableName, fields) {
        fields = fields.map(el => el + '=?')
        let updateList = fields.toString()

        return `update ${tableName} set ${updateList}`
    }
}

module.exports = QueryBuilder