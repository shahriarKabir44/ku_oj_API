/**
 * 
 * @param {ChildProcessWithoutNullStreams} processChild 
 * @param {String} args 
 * @returns 
 */
async function executeInput(processChild, args) {
    let processTimer;
    return new Promise((resolve, reject) => {
        try {
            clearTimeout(processTimer)
            let begin = new Date()
            let errorMessage = ""
            processChild.stdin.write(args);
            processChild.stdin.end();
            let isExecutionCompleted = false

            processChild.stderr.on('data', e => {
                let message = e.toString()
                errorMessage += message

            })
            processChild.stderr.on('end', e => {
                isExecutionCompleted = true
                reject({
                    type: 3,
                    result: false,
                    message: errorMessage,
                    verdict: 'ERROR',
                    execTime: 'N/A'

                })
            })
            processChild.stdout.on("data", (data) => {
                let execTime = (new Date()) - begin

                isExecutionCompleted = true
                let val = data.toString().split('\n').filter(e => e != '')
                resolve({ data: val, result: true, execTime })
            });
            processTimer = setTimeout(() => {
                console.log('h')
                processChild.kill(); // stop the process after 1 second
                if (!isExecutionCompleted) {
                    reject({
                        result: false,
                        verdict: "TLE",
                        type: 4,
                        execTime: 'N/A'

                    })
                }
            }, 1000);

        } catch (error) {

        }

    })
}

module.exports = { executeInput }