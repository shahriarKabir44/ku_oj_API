const {Table} = require('migratify/templates/Migration.class')
let newTable = new Table("user");
newTable.setID('id');
newTable.addColumn('userName','VARCHAR(255)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(true)
newTable.addColumn('password','VARCHAR(255)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
module.exports = async () => {
	newTable.create()
}