const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('contestId', 'int')
newTable.addColumn('contestantId', 'int')
newTable.addColumn('points', 'int')
newTable.addColumn('description', 'text')
newTable.addColumn('official_description', 'text')
newTable.addColumn('official_points', 'int')

newTable.addForeignKey('contestId', 'contest', 'id')
newTable.addForeignKey('contestantId', 'user', 'id')



module.exports = async () => {
    newTable.create()
}