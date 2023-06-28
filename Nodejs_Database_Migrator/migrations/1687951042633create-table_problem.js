const { Table } = require('../templates/Migration.class')

let newTable = new Table("problem")
newTable.setID('id')
newTable.addColumn('statementFileURL', 'text')
newTable.addColumn('title', 'varchar(255)')
newTable.addColumn('testcaseFileURL', 'text')
newTable.addColumn('outputFileURL', 'text')
newTable.addColumn('contestId', 'int')
newTable.addColumn('points', 'int')
newTable.addColumn('numSolutions', 'int')
newTable.addColumn('code', 'varchar(255)')

newTable.addForeignKey('contestId', 'contest', 'id')

module.exports = async () => {
    newTable.create()
}