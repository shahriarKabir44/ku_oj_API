const {Table} = require('migratify/templates/Migration.class')
let newTable = new Table("contestMessage");
newTable.addColumn('contestId','INT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('senderId','INT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('senderName','VARCHAR(20)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('message','MEDIUMTEXT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('time','VARCHAR(20)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addForeignKey('contestId','contest','id');
newTable.addForeignKey('senderId','user','id');
newTable.addForeignKey('contestId','contest','id');
newTable.addForeignKey('senderId','user','id');
module.exports = async () => {
	newTable.create()
}