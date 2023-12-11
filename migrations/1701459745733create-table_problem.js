const {Table} = require('migratify/templates/Migration.class')
let newTable = new Table("problem");
newTable.setID('id');
<<<<<<<< HEAD:migrations/1702324160102create-table_problem.js
newTable.addColumn('statementFileURL','MEDIUMTEXT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
========
>>>>>>>> 965c3bc15a1a87877258ad4f7f5b5124959b3c24:migrations/1701459745733create-table_problem.js
newTable.addColumn('title','VARCHAR(255)')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
<<<<<<<< HEAD:migrations/1702324160102create-table_problem.js
newTable.addColumn('testcaseFileURL','MEDIUMTEXT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
newTable.addColumn('outputFileURL','MEDIUMTEXT')
	.setNullable(true)
	 .setDefaultValue('')
	 .setUnique(false)
========
>>>>>>>> 965c3bc15a1a87877258ad4f7f5b5124959b3c24:migrations/1701459745733create-table_problem.js
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
newTable.addForeignKey('contestId','contest','id');
newTable.addForeignKey('contestId','contest','id');
module.exports = async () => {
	return newTable.create()
}