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
const { executeCPP } = require("../../executors/executeCPP");
const ContestRepository = require("../Contest.repository");
const { RedisClient } = require("../../utils/RedisClient");


parentPort.on('message', ({ submissions, problem }) => {
    let userSubmissionReEvaluator = new UserSubmissionReEvaluator(submissions, problem)
    userSubmissionReEvaluator.judgeSubmissions()
})

class UserSubmissionReEvaluator {
    constructor(_submissions, _problem) {
        this.submissions = _submissions
        this.problem = _problem
    }
    async judgeSubmissions() {

        let promises = []

        this.submissions.forEach((submission) => {
            const judgeRepository = new JudgeRepository({
                submissionId: submission.id
            })
            promises.push((async () => {
                try {
                    let data = null
                    if (submission.language == 'python') {
                        data = await runPython(submission.problemId, submission.submissionFileURL)
                    }
                    else if (submission.language == 'c++') {
                        data = await executeCPP(submission.problemId, submission.submissionFileURL)
                    }
                    submission.verdict = data.verdict
                    submission.execTime = data.execTime
                    judgeRepository.verdictType = data.type
                    judgeRepository.execTime = data.execTime
                    judgeRepository.verdict = data.verdict
                    judgeRepository.setVerdict()
                } catch (error) {
                    judgeRepository.verdictType = error.type
                    judgeRepository.execTime = error.execTime
                    judgeRepository.verdict = error.verdict
                    judgeRepository.setVerdict()
                    submission.verdict = error.verdict
                    submission.execTime = error.execTime
                }

            })())

        })

        await Promise.all(promises)
        this.setScores()
        this.setScores(false)

    }
    async setScores(isOfficial = true) {
        const { submissions, problem } = this

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

            let contest = await ContestRepository.findContestById(this.problem.contestId)
            let timeDiff = Math.max(parseInt((oldestAcSubmission.time - contest.startTime) / (3600 * 1000 * 10)), 0)
            let obtained = Math.max(problem.points - timeDiff * 5, 10)

            score += obtained
            finalVerdict = 'AC'
        }
        this.score = score
        this.finalVerdict = finalVerdict
        if (isOfficial) this.setOfficialScores(this.submissions.filter(submission => submission.isOfficial))
        else
            this.setUnofficialScores(this.submissions.filter(submission => !submission.isOfficial))
    }
    /**
     * 
     * @param {[any]} submissions 
     */
    async setOfficialScores(submissions) {
        let verdictNumber = this.finalVerdict == 'AC' ? 1 : 0
        if (!submissions.length) return
        const { submittedBy } = submissions[0]
        const problemId = this.problem.id
        const { score, finalVerdict } = this;
        const { contestId } = this.problem
        executeSqlAsync({
            sql: `update submissionResult set finalVerdictOfficial=?, official_points=?
                where problemId=? and contestantId=? ;`,
            values: [verdictNumber, score, problemId, submittedBy]
        }).then(() => {
            JudgeRepository.getSubmissionResult({ problemId, userId: submittedBy })
                .then(_submissionResult => {
                    _submissionResult = {
                        ..._submissionResult, finalVerdictOfficial: verdictNumber,
                        official_points: score
                    }
                    RedisClient.store(`submissionResult_${problemId}_${submittedBy}`, _submissionResult)

                })


        })
        letcontestResult = await JudgeRepository.getContestResult({ contestId, userId: submittedBy })
        let { official_description, officialVerdicts } = contestResult
        officialVerdicts = JSON.parse(officialVerdicts)
        officialVerdicts[problemId] = finalVerdict
        official_description = JSON.parse(official_description)
        official_description[problemId] = score
        executeSqlAsync({
            sql: `update contestResult set official_points=?,official_description=?, officialVerdicts=?
                  where contestId=? and contestantId=?;`,
            values: [score, JSON.stringify(official_description),
                JSON.stringify(officialVerdicts), contestId, submittedBy]
        }).then(() => {
            JudgeRepository.getContestResult({ contestId, userId: submittedBy })
                .then(_contestResult => {
                    _contestResult = {
                        ..._contestResult, official_points: score,
                        official_description: JSON.stringify(official_description),
                        officialVerdicts: JSON.stringify(officialVerdicts)
                    }
                    RedisClient.store(`contestResult_${contestId}_${submittedBy}`, _contestResult)
                })

        })
    }
    /**
     * 
     * @param {[any]} submissions 
     */
    async setUnofficialScores(submissions) {
        let verdictNumber = this.finalVerdict == 'AC' ? 1 : 0
        if (!submissions.length) return

        const { submittedBy } = submissions[0]
        const problemId = this.problem.id
        const { score, finalVerdict } = this;
        const { contestId } = this.problem;
        executeSqlAsync({
            sql: `update submissionResult set finalVerdict =?, points=?
                where problemId=? and contestantId=? ;`,
            values: [verdictNumber, score, problemId, submittedBy]
        })
        let [contestResult] = await executeSqlAsync({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [contestId, submittedBy]
        })
        let { description, verdicts } = contestResult
        verdicts = JSON.parse(verdicts)
        description = JSON.parse(description)
        verdicts[problemId] = finalVerdict
        description[problemId] = score
        executeSqlAsync({
            sql: `update contestResult set points=?,description=?,verdicts=?
                  where contestId=? and contestantId=?;`,
            values: [score, JSON.stringify(description), JSON.stringify(description), contestId, submittedBy]
        })
    }
}






