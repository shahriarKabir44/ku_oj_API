const {
    parentPort
} = require("worker_threads");
const { runPython } = require("../../executors/runPython");
const { initConnection } = require("../../utils/dbConnection");
require('dotenv').config()
initConnection(process.env)
const JudgeRepository = require("../Judge.repository");
const { executeCPP } = require("../../executors/executeCPP");
const ContestRepository = require("../Contest.repository");
const { ContestResult } = require("../ContestResult.class");


parentPort.on('message', ({ submissions, problem, contestId, contestantId, contestResult }) => {
    let userSubmissionReEvaluator = new UserSubmissionReEvaluator(submissions, problem, contestId, contestantId, contestResult)
    userSubmissionReEvaluator.judgeSubmissions()
        .then(() => {
            parentPort.postMessage(userSubmissionReEvaluator.contestResult)
        })
})

class UserSubmissionReEvaluator {
    constructor(_submissions, _problem, _contestId, _contestantId, _contestResult) {
        this.submissions = _submissions
        this.problem = _problem
        this.contestId = _contestId
        this.contestantId = _contestantId
        this.contestResult = _contestResult

    }
    async judgeSubmissions() {

        let promises = []

        this.submissions.forEach((submission) => {
            const judgeRepository = new JudgeRepository({
                submissionId: submission.id,
                contestId: this.contestId
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
        return Promise.all([
            this.processOfficialSubmissions(this.submissions.filter(submission => submission.isOfficial)),
            this.setUnofficialScores(this.submissions.filter(submission => !submission.isOfficial))
        ])

    }


    async processSubmissionGroup(submissions) {
        const { problem } = this

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

            let contest = await ContestRepository.findContestById({ id: this.problem.contestId })
            let timeDiff = Math.max(parseInt((oldestAcSubmission.time - contest.startTime) / (3600 * 1000 * 10)), 0)
            let obtained = Math.max(problem.points - timeDiff * 5, 10)

            score += obtained
            finalVerdict = 'AC'
        }
        return { score, rejectCounter, finalVerdict }
    }
    async processOfficialSubmissions(submissions) {
        let { score, rejectCounter, finalVerdict } = await this.processSubmissionGroup(submissions)
        this.officialScore = score
        this.setOfficialScores(rejectCounter, finalVerdict == 'AC' ? 1 : 0, finalVerdict)
    }
    async processUnofficialSubmissions(submissions) {
        let { score, rejectCounter, finalVerdict } = await this.processSubmissionGroup(submissions)
        this.unoffialScore = score
        this.setUnofficialScores(rejectCounter, finalVerdict == 'AC' ? 1 : 0, finalVerdict)
    }
    /**
     * 
     * @param {[any]} submissions 
     */
    setOfficialScores(errorCount, hasAC, finalVerdict) {
        let { official_description, officialVerdicts } = this.contestResult
        officialVerdicts[problemId] = finalVerdict == 'AC' ? 1 : -1
        official_description[problemId] = [hasAC, errorCount, this.officialScore]
    }


    /**
     * 
     * @param {[any]} submissions 
     */
    setUnofficialScores(errorCount, hasAC, finalVerdict) {
        let { description, verdicts } = this.contestResult
        verdicts[problemId] = finalVerdict == 'AC' ? 1 : -1
        description[problemId] = [hasAC, errorCount, this.officialScore]


    }
}






