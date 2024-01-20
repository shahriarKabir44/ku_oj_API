const {Table} = require('migratify/templates/Migration.class')
let newTable = new Table("problem");
newTable.setID('id');
newTable.addColumn('title','VARCHAR(255)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('contestId','INT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('points','INT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('numSolutions','INT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('code','VARCHAR(255)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('createdOn','MEDIUMTEXT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('isAvailable','INT')
	.setNullable(true)
	 .setDefaultValue('0')
	 .setUnique(false)
newTable.addForeignKey('contestId','contest','id');
module.exports = async () => {
	return newTable.create()
}