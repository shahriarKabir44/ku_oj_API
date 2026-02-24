const JudgeRepository = require("../Judge.repository");
const ContestRepository = require("../Contest.repository");
const { executeCode } = require("../../executors/executeCode");
const { executeSqlAsync } = require("../../utils/executeSqlAsync");


async function rejudgeUserSubmissions({ submissions, problem, contestId, contestantId, contestResult }, transaction) {
    let userSubmissionReEvaluator = new UserSubmissionReEvaluator(submissions, problem, contestId, contestantId, contestResult, transaction)
    return userSubmissionReEvaluator.judgeSubmissions()

}


class UserSubmissionReEvaluator {
    constructor(_submissions, _problem, _contestId, _contestantId, _contestResult, transaction) {
        this.submissions = _submissions
        this.transaction = transaction;
        this.problem = _problem
        this.contestId = _contestId
        this.contestantId = _contestantId
        this.contestResult = _contestResult
    }
    async judgeSubmissions() {
        this.numSolutions = 0

        for (let n = 0; n < this.submissions.length; n++) {
            let submission = this.submissions[n]
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
                points: this.problem.points,

            })

            judgeRepository.transaction = this.transaction;
            judgeRepository.contestResult = this.contestResult
            judgeRepository.time = submission.time
            let executionOutput = null;
            try {
                executionOutput = await executeCode(submission)
            } catch (error) {
                continue;
            }
            submission.verdict = executionOutput.verdict
            if (executionOutput.verdict == 'AC') this.numSolutions++
            submission.execTime = executionOutput.execTime
            judgeRepository.verdictType = executionOutput.type
            judgeRepository.execTime = executionOutput.execTime
            judgeRepository.verdict = executionOutput.verdict
            judgeRepository.errorMessage = executionOutput.message;

            await judgeRepository.setVerdict();
        }
        await executeSqlAsync({
            sql: `update problem set numSolutions= (select count(DISTINCT submittedBy) from submission
                        where submission. problemId= problem.id and verdict='AC')
                        where problem.id=?;`,
            values: [this.problem.id]
        }, this.transaction);

        await this.processOfficialSubmissions(this.submissions.filter(submission => submission.isOfficial)),
            await this.processUnofficialSubmissions(this.submissions.filter(submission => !submission.isOfficial))

        return this.contestResult

    }


    async processSubmissionGroup(submissions) {
        const { problem } = this
        let oldestAcSubmission = null
        let latestRejection = null
        let rejectCounter = 0
        if (!submissions.length)
            return null

        submissions.sort((a, b) => a.time - b.time)
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




