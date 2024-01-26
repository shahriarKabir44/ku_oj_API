const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("problem")
newTable.updateExistingColumn('numSolutions').setDefaultValue('0')
module.exports = async () => {
    return newTable.update()
}