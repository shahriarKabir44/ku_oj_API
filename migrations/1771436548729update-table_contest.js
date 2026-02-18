const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("contest")
newTable.addColumn('isPublished', 'int').setDefaultValue('1')
module.exports = async () => {
    return newTable.update()
}