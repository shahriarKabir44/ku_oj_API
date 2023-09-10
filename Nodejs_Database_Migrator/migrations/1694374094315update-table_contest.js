const { Table } = require('../templates/Migration.class')

let newTable = new Table("contest")
newTable.addColumn('status', 'int').setDefaultValue('0')
module.exports = async () => {
    newTable.update()
}