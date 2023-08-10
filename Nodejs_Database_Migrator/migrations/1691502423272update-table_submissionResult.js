const { Table } = require('../templates/Migration.class')

let newTable = new Table("submissionResult")
newTable.addColumn("acCount_official", "int").setDefaultValue("0")
newTable.addColumn("errorCount_official", "int").setDefaultValue("0")
newTable.addColumn("acCount_unofficial", "int").setDefaultValue("0")
newTable.addColumn("errorCount_unofficial", "int").setDefaultValue("0")

module.exports = async () => {
    newTable.update()
}