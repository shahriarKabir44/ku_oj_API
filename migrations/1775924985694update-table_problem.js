const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("problem")
newTable.addColumn('statementText', 'text')
module.exports = async () => {
    return newTable.update()
}