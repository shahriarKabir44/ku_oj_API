const { Table } = require('migratify/templates/Migration.class')
let newTable = new Table("contest");
newTable.setID('id');
newTable.addColumn('title', 'VARCHAR(255)')
	.setNullable(false)
	.setDefaultValue('')
	.setUnique(true)
newTable.addColumn('startTime', 'DOUBLE')
	.setNullable(true)
	.setDefaultValue('')
	.setUnique(false)
newTable.addColumn('endTime', 'DOUBLE')
	.setNullable(true)
	.setDefaultValue('')
	.setUnique(false)
newTable.addColumn('hostId', 'INT')
	.setNullable(true)
	.setDefaultValue('')
	.setUnique(false)
newTable.addColumn('code', 'VARCHAR(255)')
	.setNullable(true)
	.setDefaultValue('')
	.setUnique(false)
newTable.addColumn('status', 'INT')
	.setNullable(true)
	.setDefaultValue('0')
	.setUnique(false)
newTable.addForeignKey('hostId', 'user', 'id');
newTable.addForeignKey('hostId', 'user', 'id');
module.exports = async () => {
	newTable.create()
}