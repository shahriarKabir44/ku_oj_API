const path = require('path')
const fs = require('fs')
function writeLog(req, messageJson) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    let dateStr = new Intl.DateTimeFormat('en-CA').format(date);
    let logFileDir = path.join(__dirname, '..', 'logs');
    //  console.log(logFileDir)
    if (!fs.existsSync(logFileDir)) {
        fs.mkdirSync(logFileDir, { recursive: true })
    }
    let logFileContent = `\n[${(new Date()).toLocaleString()}] ${req.url} ${JSON.stringify(messageJson)}`;

    fs.appendFileSync(path.join(logFileDir, dateStr + '.txt'), logFileContent, { encoding: 'utf-8' });
}


module.exports = { writeLog }