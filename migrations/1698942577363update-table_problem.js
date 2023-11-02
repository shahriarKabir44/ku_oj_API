const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("problem")
newTable.removeProperty('testcaseFileURL')
newTable.removeProperty('statementFileURL')
newTable.removeProperty('outputFileURL')

module.exports = async () => {
    newTable.update()
}