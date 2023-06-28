const { Table } = require('../templates/Migration.class')

let newTable = new Table("contest")
newTable.setID('id')
newTable.addColumn('title', 'varchar(255)').setUnique(true)
newTable.addColumn('startTime', 'double')
newTable.addColumn('endTime', 'double')
newTable.addColumn('hostId', 'int')
newTable.addColumn('code', 'varchar(255)')

newTable.addForeignKey('hostId', 'user', 'id')

module.exports = async () => {
    newTable.create()
}