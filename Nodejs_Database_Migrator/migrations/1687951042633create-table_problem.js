const {Table} = require('../templates/Migration.class')

let newTable = new Table("problem")

module.exports = async () => {
    newTable.create()
}