const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('hasAttemptedOfficially', 'int')
newTable.addColumn('hasAttemptedUnofficially', 'int')
module.exports = async () => {
    newTable.update()
}