const { Table } = require('../templates/Migration.class')

let newTable = new Table("submission")
newTable.setID('id')
newTable.addColumn('time', 'double')
newTable.addColumn('verdict', 'varchar(10)')
newTable.addColumn('execTime', 'varchar(10)')
newTable.addColumn('language', 'varchar(10)')
newTable.addColumn('submissionFileURL', 'text')
newTable.addColumn('problemId', 'int')
newTable.addColumn('submittedBy', 'int')
newTable.addColumn('contestId', 'int')
newTable.addColumn('errorMessage', 'text')

newTable.addForeignKey('problemId', 'problem', 'id')
newTable.addForeignKey('submittedBy', 'user', 'id')
newTable.addForeignKey('contestId', 'contest', 'id')

module.exports = async () => {
    newTable.create()
}