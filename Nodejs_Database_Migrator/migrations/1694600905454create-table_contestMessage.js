const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestMessage")
newTable.addColumn('contestId', 'int')
newTable.addColumn('senderId', 'int')
newTable.addColumn('senderName', 'varchar(20)')
newTable.addColumn('message', 'text')
newTable.addForeignKey('contestId', 'contest', 'id')
newTable.addForeignKey('senderId', 'user', 'id')
newTable.addColumn('time', 'varchar(20)')
module.exports = async () => {
    newTable.create()
}