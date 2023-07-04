const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const { runPython } = require("../../executors/runPython");
const JudgeRepository = require("../Judge.repository");


parentPort.on('message', message => { })

/**
 * 
 * @param {[any]} submissions 
 */
async function judgeSubmissions(submissions) {
    let promises = []
    let acceptedSubmissions = []
    let rejectedSubmissions = []

    submissions.forEach((submission) => {
        promises.push(async () => {
            if (submission.language == 'python') {
                try {
                    let data = await runPython(submission.problemId, submission.submissionFileURL)
                    acceptedSubmissions.push(submission)
                    JudgeRepository.setVerdict({
                        submissionId: submission.id,
                        status: data.type,
                        execTime: data.execTime
                    })
                    submission.status = data.verdict
                } catch (error) {
                    rejectedSubmissions.push(submission)
                    JudgeRepository.setVerdict({
                        submissionId: submission.id,
                        status: error.verdict,
                        execTime: error.execTime
                    })
                    submission.status = data.verdict

                }

            }
        })

    })

    await Promise.all(promises)

}