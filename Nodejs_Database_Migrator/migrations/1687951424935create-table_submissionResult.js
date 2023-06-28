const { Table } = require('../templates/Migration.class')

let newTable = new Table("submissionResult")
newTable.addColumn('points', 'int')
newTable.addColumn('contestantId', 'int')
newTable.addColumn('problemId', 'int')
newTable.addColumn('official_points', 'int')
newTable.addColumn('finalVerdict', 'int')
newTable.addColumn('finalVerdictOfficial', 'int')

newTable.addForeignKey('contestantId', 'user', 'id')
newTable.addForeignKey('problemId', 'problem', 'id')

module.exports = async () => {
    newTable.create()
}