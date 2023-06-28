const { Table } = require('../templates/Migration.class')

let newTable = new Table("user")
newTable.setID('id')
newTable.addColumn('userName', 'varchar(255)').setUnique(true)
newTable.addColumn('password', 'varchar(255)')
module.exports = async () => {
    newTable.create()
}