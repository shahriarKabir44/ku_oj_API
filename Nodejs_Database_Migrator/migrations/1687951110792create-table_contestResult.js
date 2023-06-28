const {Table} = require('../templates/Migration.class')

let newTable = new Table("contestResult")

module.exports = async () => {
    newTable.create()
}