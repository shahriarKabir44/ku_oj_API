const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("problem")
newTable.addColumn('createById', 'int');

module.exports = async () => {
    return newTable.update()
}