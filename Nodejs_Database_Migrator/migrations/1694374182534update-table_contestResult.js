const { Table } = require('../templates/Migration.class')

let newTable = new Table("contestResult")
newTable.addColumn('position', 'int')
module.exports = async () => {
    newTable.update()
}