const { Table } = require('../templates/Migration.class')

let newTable = new Table("problem")
newTable.addColumn('createdOn', 'long')
module.exports = async () => {
    newTable.update()
}