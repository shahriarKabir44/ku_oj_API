const {Table} = require('../templates/Migration.class')

let newTable = new Table("contest")

module.exports = async () => {
    newTable.create()
}