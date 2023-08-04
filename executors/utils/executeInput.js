/**
 * 
 * @param {ChildProcessWithoutNullStreams} processChild 
 * @param {String} args 
 * @returns 
 */
async function executeInput(processChild, args) {
    return new Promise((resolve, reject) => {
        try {
            let begin = new Date()
            let messages = []
            processChild.stdin.write(args);
            let isExecutionCompleted = false
            processChild.stdin.end();
            processChild.stderr.on('data', e => {
                let message = e.toString()
                messages.push(message)

            })
            processChild.stderr.on('end', e => {
                reject({
                    type: 3,
                    result: false,
                    message: messages,
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
            setTimeout(() => {
                if (!isExecutionCompleted) {
                    processChild.stdin.write("^c");
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