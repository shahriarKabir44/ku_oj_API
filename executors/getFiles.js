const fs = require('fs');
module.exports = function (dir) {
    return fs.readFileSync(__dirname + dir, 'utf8');
}