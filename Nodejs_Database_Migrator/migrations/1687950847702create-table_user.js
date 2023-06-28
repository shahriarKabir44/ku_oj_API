const {Table} = require('../templates/Migration.class')

let newTable = new Table("user")

module.exports = async () => {
    newTable.create()
}