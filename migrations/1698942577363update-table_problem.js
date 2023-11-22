const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("problem")
newTable.dropColumn('testcaseFileURL')
newTable.dropColumn('statementFileURL')
newTable.dropColumn('outputFileURL')

module.exports = async () => {
    newTable.update()
}