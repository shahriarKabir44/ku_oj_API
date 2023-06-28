const { Table } = require('../templates/Migration.class')

let newTable = new Table("registration")

newTable.addColumn('contestId', 'int')
newTable.addColumn('userId', 'int')


newTable.addForeignKey('contestId', 'contest', 'id')
newTable.addForeignKey('userId', 'user', 'id')

module.exports = async () => {
    newTable.create()
}