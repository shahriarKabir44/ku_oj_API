const JudgeRepository = require("../Judge.repository");
const ContestRepository = require("../Contest.repository");
const { executeCode } = require("../../executors/executeCode");


async function rejudgeUserSubmissions({ submissions, problem, contestId, contestantId, contestResult }) {
    let userSubmissionReEvaluator = new UserSubmissionReEvaluator(submissions, problem, contestId, contestantId, contestResult)
    return userSubmissionReEvaluator.judgeSubmissions()

}


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
            if (submission.isOfficial) {
                this.contestResult.hasAttemptedOfficially = 1
            }
            else this.contestResult.hasAttemptedUnofficially = 1
            const judgeRepository = new JudgeRepository({
                submissionId: submission.id,
                contestId: this.contestId,
                problemId: this.problem.id,
                userId: this.contestantId,
                isOfficial: submission.isOfficial,
                time: submission.time,
                points: this.problem.points
            })
            judgeRepository.contestResult = this.contestResult
            judgeRepository.time = submission.time
            promises.push((async () => {
                let data = await executeCode(submission)
                submission.verdict = data.verdict
                submission.execTime = data.execTime
                judgeRepository.verdictType = data.type
                judgeRepository.execTime = data.execTime
                judgeRepository.verdict = data.verdict
                judgeRepository.setVerdict()


            })())

        })

        await Promise.all(promises)
        await Promise.all([
            this.processOfficialSubmissions(this.submissions.filter(submission => submission.isOfficial)),
            this.processUnofficialSubmissions(this.submissions.filter(submission => !submission.isOfficial))
        ])
        return this.contestResult

    }


    async processSubmissionGroup(submissions) {
        const { problem } = this
        let oldestAcSubmission = null
        let latestRejection = null
        let rejectCounter = 0
        if (!submissions.length)
            return null
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
        let oldestACTime = null
        if (oldestAcSubmission) {

            let contest = await ContestRepository.findContestById({ id: this.problem.contestId })
            let timeDiff = Math.max(parseInt((oldestAcSubmission.time - contest.startTime) / (3600 * 1000 * 10)), 0)
            let obtained = Math.max(problem.points - timeDiff * 5, 10)
            oldestACTime = parseInt((oldestAcSubmission.time - contest.startTime) / (1))
            score += obtained
            finalVerdict = 'AC'
        }
        return { score, rejectCounter, finalVerdict, oldestACTime }
    }
    async processOfficialSubmissions(submissions) {
        let data = await this.processSubmissionGroup(submissions)
        if (!data) return

        this.contestResult.official_ac_time[this.problem.id] = data.oldestACTime
        this.contestResult.official_description[this.problem.id][2] = data.score
        this.contestResult.officialVerdicts[this.problem.id] = (data.finalVerdict == 'AC' ? 1 : 0)
    }
    async processUnofficialSubmissions(submissions) {
        let data = await this.processSubmissionGroup(submissions)
        if (!data) return
        this.contestResult.unofficial_ac_time[this.problem.id] = data.oldestACTime
        this.contestResult.description[this.problem.id][2] = data.score
        this.contestResult.officialVerdicts[this.problem.id] = (data.finalVerdict == 'AC' ? 1 : 0)
    }
}

module.exports = { rejudgeUserSubmissions }




