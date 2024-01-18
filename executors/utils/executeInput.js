/**
 * 
 * @param {ChildProcessWithoutNullStreams} processChild 
 * @param {String} args 
 * @returns 
 */
async function executeInput(processChild, args) {
    let processTimer;
    let outputs = ""
    let hasError = false
    return new Promise((resolve, reject) => {
        try {
            clearTimeout(processTimer)
            let begin = new Date()
            let errorMessage = ""
            processChild.stdin.write(args);
            processChild.stdin.end();
            let isExecutionCompleted = false

            processChild.stderr.on('data', e => {
                hasError = true
                let message = e.toString()
                errorMessage += message

            })
            processChild.stdout.on("data", (data) => {
                let val = data.toString()
                outputs += val
            });
            processChild.stdout.on('end', (e) => {
                let execTime = (new Date()) - begin

                isExecutionCompleted = true
                resolve({ data: outputs.split('\n').filter(o => o != ''), result: true, execTime })
            })
            processChild.stderr.on('end', e => {
                if (!hasError) return
                isExecutionCompleted = true
                reject({
                    type: 3,
                    result: false,
                    message: errorMessage,
                    verdict: 'ERROR',
                    execTime: 'N/A'

                })
            })

            processTimer = setTimeout(() => {
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