const {Table} = require('../templates/Migration.class')

let newTable = new Table("result")

module.exports = async () => {
    newTable.create()
}