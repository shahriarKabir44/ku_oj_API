const { Table } = require('../templates/Migration.class')

let newTable = new Table("submission")
newTable.addColumn('isOfficial', 'int').setDefaultValue('0')
module.exports = async () => {
    newTable.update()
}