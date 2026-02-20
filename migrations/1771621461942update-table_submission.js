const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("submission")
newTable.updateExistingColumn('verdict').setDataType('varchar(50)');
module.exports = async () => {
    return newTable.update()
}