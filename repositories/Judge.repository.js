const { RedisClient } = require("../utils/RedisClient");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const { ContestResult } = require('./ContestResult.class')
const QueryBuilder = require("../utils/queryBuilder");
const { executeCode } = require("../executors/executeCode");
module.exports = class JudgeRepository {
    constructor({
        contestId,
        userId,
        problemId,
        submissionId,
        submissionFileURL,
        points,
        isOfficial,
        time,
        ext,
        verdictType,
        execTime,
        languageName
    }) {
        this.contestId = contestId
        this.userId = userId
        this.problemId = problemId
        this.submissionId = submissionId
        this.submissionFileURL = submissionFileURL
        this.points = points
        this.isOfficial = isOfficial
        this.time = time
        this.ext = ext
        this.verdict = ""
        this.verdictType = verdictType
        this.path = `${this.submissionFileURL}`;
        this.execTime = execTime
        this.isNewContestSubmission = false
        this.languageName = languageName
    }
    async judgeSubmission() {
        await this.getContestResult()
        let data = await executeCode({ problemId: this.problemId, submissionFileURL: this.path, language: this.languageName })
        this.verdictType = data.type
        this.errorMessage = data.message
        this.execTime = data.execTime
        this.verdict = data.verdict
        this.setVerdict()
            .then(() => {
                if (this.verdict == 'AC')
                    this.setScoreWhenAccepted()
                else this.setScoreWhenRejected()
            })

        return { ...data, id: this.submissionId }

    }




    async getContestResult() {

        this.contestResult = await ContestResult.find({
            contestId: this.contestId,
            contestantId: this.userId
        })

        if (this.contestResult == null) {
            this.isNewContestSubmission = true
            this.contestResult = new ContestResult({
                _contestId: this.contestId,
                _contestantId: this.userId
            })
        }

        if (this.contestResult.official_description[this.problemId] == null) {
            this.contestResult.official_description[this.problemId] = [0, 0, 0]
            this.contestResult.description[this.problemId] = [0, 0, 0]
            this.contestResult.official_ac_time[this.problemId] = 0
            this.contestResult.unofficial_ac_time[this.problemId] = 0

        }

    }
    async setVerdict() {
        this.isOfficial ? this.contestResult.hasAttemptedOfficially = 1 : this.contestResult.hasAttemptedUnofficially = 1

        return Promise.all([
            this.calculateScore(),
            executeSqlAsync({
                sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime', 'isOfficial', 'errorMessage'])}
                 where id=?;`,
                values: [this.verdict, this.execTime, this.isOfficial, this.errorMessage, this.submissionId]
            })
        ])



    }
    async findContestById() {
        try {

            let contest = await RedisClient.queryCache(`contest_${this.contestId}`)
            return contest

        } catch (error) {

            let [contest] = await executeSqlAsync({
                sql: `select * from contest where id=?;`,
                values: [this.contestId]
            })
            RedisClient.store(`contest_${this.contestId}`, contest)
            return contest
        }
    }
    async findProblemById() {
        let query = `problem_${this.problemId}`
        try {

            let contest = await RedisClient.queryCache(query)
            return contest

        } catch (error) {

            let [problem] = await executeSqlAsync({
                sql: `select * from problem where id=?;`,
                values: [this.problemId]
            })
            RedisClient.store(query, problem).catch(e => {
            })
            return problem
        }
    }
    async setScoreWhenRejected() {
        this.updateContestResult()
    }
    async calculateScore() {
        this.updateACandErrorCount()
        let contestResult = this.contestResult.clone()
        if (this.verdict != 'AC') {
            if (this.isOfficial) {
                contestResult.official_points -= 5
                contestResult.official_description[this.problemId][2] -= 5
            }
            else {
                contestResult.description[this.problemId][2] -= 5;
                contestResult.points -= 5
            }
        }
        else {
            let contest = await this.findContestById()
            let { startTime } = contest
            let timeDiff = Math.max(parseInt((this.time - startTime) / (3600 * 1000 * 10)), 0)
            let score = Math.max(this.points - timeDiff * 10, 10)

            if (this.isOfficial) {
                contestResult.official_points += score
                contestResult.official_description[this.problemId][2] += score

                contestResult.official_ac_time[this.problemId] = parseInt((this.time - startTime) / 1)
            }
            else {
                contestResult.points += score
                contestResult.description[this.problemId][2] += score

                contestResult.unofficial_ac_time[this.problemId] = parseInt((this.time - startTime) / 1)
            }

        }
        this.contestResult = contestResult


    }
    async setScoreWhenAccepted() {
        if ((this.isOfficial && this.contestResult.official_description[this.problemId][0] == 1) || (!this.isOfficial && this.contestResult.description[this.problemId][0] == 1)) {
            executeSqlAsync({
                sql: `update problem set numSolutions=numSolutions+1 where id=?;`,
                values: [this.problemId]
            })

            this.updateContestResult()
        }
    }

    async updateContestResult() {
        if (this.isNewContestSubmission) {
            return this.contestResult.store()
        }
        return this.contestResult.updateAndStore()


    }
    updateACandErrorCount() {
        if (this.isOfficial) {
            if (this.verdict != 'AC') {
                this.contestResult.official_description[this.problemId][1] += 1
                if (this.contestResult.official_description[this.problemId][0] == 0) {
                    this.contestResult.officialVerdicts[this.problemId] = -1
                }
            }
            else {
                this.contestResult.official_description[this.problemId][0] += 1
                this.contestResult.officialVerdicts[this.problemId] = 1
            }
        }
        else {
            if (this.verdict != 'AC') {
                this.contestResult.description[this.problemId][1] += 1
                if (this.contestResult.description[this.problemId][0] == 0) {
                    this.contestResult.verdicts[this.problemId] = -1
                }
            }
            else {
                this.contestResult.description[this.problemId][0] += 1
                this.contestResult.verdicts[this.problemId] = 1
            }
        }
    }

}