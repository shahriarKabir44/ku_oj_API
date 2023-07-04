const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");
const { runPython } = require("../../executors/runPython");
const { initConnection } = require("../../utils/dbConnection");
require('dotenv').config()
initConnection(process.env)
const JudgeRepository = require("../Judge.repository");


parentPort.on('message', ({ submissions, problem }) => {
    judgeSubmissions(submissions, problem)
})

/**
 * 
 * @param {[any]} submissions 
 */
async function judgeSubmissions(submissions, problem) {
    let promises = []

    submissions.forEach((submission) => {
        promises.push((async () => {
            console.log(submission.language == 'python')
            if (submission.language == 'python') {
                try {
                    let data = await runPython(submission.problemId, submission.submissionFileURL)
                    JudgeRepository.setVerdict({
                        submissionId: submission.id,
                        status: data.type,
                        execTime: data.execTime
                    })
                    submission.verdict = data.verdict
                } catch (error) {
                    JudgeRepository.setVerdict({
                        submissionId: submission.id,
                        status: error.type,
                        execTime: error.execTime
                    })
                    submission.verdict = error.verdict

                }

            }
        })())

    })

    await Promise.all(promises)
    console.log(submissions, 'herez')
    setScores(submissions.filter(submission => submission.isOfficial == 1), problem, true)
    setScores(submissions.filter(submission => submission.isOfficial == 0), problem, false)

}

/**
 * 
 * @param {[any]} submissions 
 */
async function setScores(submissions, problem, isOfficial = true) {
    let oldestAcSubmission = null
    let latestRejection = null
    let rejectCounter = 0
    if (!submissions.length)
        return
    submissions.forEach(submission => {
        if (submission.verdict == 'AC') {
            if (!oldestAcSubmission) {
                oldestAcSubmission = submission;
                return
            }
            if (oldestAcSubmission.time > submission.time) oldestAcSubmission = submission
        }
        else {
            rejectCounter += 1
            if (!latestRejection) {
                latestRejection = submission
                return
            }
            if (latestRejection.time < submission.time) latestRejection = submission
        }
    })
    let score = -rejectCounter * 5

    let finalVerdict = ''
    if (latestRejection) finalVerdict = latestRejection.verdict
    if (oldestAcSubmission) {
        let timeSpan = (oldestAcSubmission.time - problem.createdOn) / (1000 * 60 * 10)
        let obtained = Math.max(10, problem.points - timeSpan * 5)
        score += obtained
        finalVerdict = 'AC'
    }
    if (isOfficial) setOfficialScores(submissions[0].submittedBy, problem.id, score, finalVerdict, problem.contestId)
    else
        setUnofficialScores(submissions[0].submittedBy, problem.id, score, finalVerdict, problem.contestId)
}

async function setOfficialScores(submittedBy, problemId, score, verdict, contestId) {
    executeSqlAsync({
        sql: `update submissionResult set finalVerdictOfficial=?, official_points=?
                where problemId=? and contestantId=? ;`,
        values: [verdict, score, problemId, submittedBy]
    })
    let [contestResult] = await executeSqlAsync({
        sql: `select * from contestResult where contestId=? and contestantId=?;`,
        values: [contestId, submittedBy]
    })
    let { official_description } = contestResult
    official_description = JSON.parse(official_description)
    official_description[problemId] = score
    executeSqlAsync({
        sql: `update contestResult set official_points=?,official_description=?
                  where contestId=? and contestantId=?;`,
        values: [score, JSON.stringify(official_description), contestId, submittedBy]
    })
}


async function setUnofficialScores(submittedBy, problemId, score, verdict, contestId) {
    let verdictNumber = verdict == 'AC' ? 1 : 0
    executeSqlAsync({
        sql: `update submissionResult set finalVerdict =?, points=?
                where problemId=? and contestantId=? ;`,
        values: [verdictNumber, score, problemId, submittedBy]
    })
    let [contestResult] = await executeSqlAsync({
        sql: `select * from contestResult where contestId=? and contestantId=?;`,
        values: [contestId, submittedBy]
    })
    let { description } = contestResult
    description = JSON.parse(description)
    description[problemId] = score
    executeSqlAsync({
        sql: `update contestResult set points=?,description=?
                  where contestId=? and contestantId=?;`,
        values: [score, JSON.stringify(description), contestId, submittedBy]
    })
}