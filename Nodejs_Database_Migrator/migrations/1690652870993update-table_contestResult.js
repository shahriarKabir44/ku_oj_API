const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('officialVerdicts', 'varchar(5)')
newTable.addColumn('verdicts', 'varchar(5)')

module.exports = async () => {
    newTable.update()
}