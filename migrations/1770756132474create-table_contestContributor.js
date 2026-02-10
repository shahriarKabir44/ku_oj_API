const { Table } = require('migratify/templates/Migration.class')

let newTable = new Table("contestContributor")

newTable.setID('id');
newTable.addColumn('contestId', 'int').setNullable(false);
newTable.addColumn('contributorId', 'int').setNullable(false);
newTable.addColumn('isActive', 'BOOLEAN').setDefaultValue('0').setNullable(false);
newTable.addColumn('createDate', 'DATETIME').setNullable(false);
newTable.addColumn('updateDate', 'DATETIME').setNullable(false);

newTable.addForeignKey('contestId', 'contest', 'id');


module.exports = async () => {
    return newTable.create()
}