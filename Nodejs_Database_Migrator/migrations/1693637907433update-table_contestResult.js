const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('unofficial_ac_time', 'TEXT')
newTable.addColumn('official_ac_time', 'TEXT')

module.exports = async () => {
    newTable.update()
}