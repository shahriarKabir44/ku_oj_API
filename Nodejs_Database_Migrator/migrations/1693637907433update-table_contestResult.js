const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('unofficial_ac_time', 'varchar(16)')
newTable.addColumn('official_ac_time', 'varchar(16)')

module.exports = async () => {
    newTable.update()
}