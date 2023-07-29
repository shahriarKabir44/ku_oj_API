const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('officialVerdicts', 'TEXT')
newTable.addColumn('verdicts', 'TEXT')

module.exports = async () => {
    newTable.update()
}