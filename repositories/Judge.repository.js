const { executeCPP } = require("../executors/executeCPP");
const { runPython } = require("../executors/runPython");
const { RedisClient } = require("../utils/RedisClient");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const { ContestResult } = require('./ContestResult.class')
const QueryBuilder = require("../utils/queryBuilder");
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
        execTime
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
    }
    async judgeSubmission() {
        await this.getContestResult()
        try {
            let data = null
            if (this.ext == 'py') {
                data = await runPython(this.problemId, this.path)
            }
            else if (this.ext == 'cpp') {
                data = await executeCPP(this.problemId, this.path)
            }
            this.verdictType = data.type
            this.execTime = data.execTime
            this.verdict = data.verdict
            this.setVerdict()
                .then(() => {
                    this.setScoreWhenAccepted()
                })

            return { ...data, id: this.submissionId }
        } catch (error) {
            this.verdictType = error.type
            this.execTime = 'N/A'
            this.verdict = error.verdict
            this.setVerdict()
                .then(() => {
                    this.setScoreWhenRejected()
                })
            return { ...error, id: this.submissionId }
        }
    }
    static async getContestResultFromCache({ contestId, userId }) {
        let redisQueryString = `contestResult_${contestId}_${userId}`
        try {
            return await RedisClient.queryCache(redisQueryString)
        } catch (error) {
            let [contestResult] = await executeSqlAsync({
                sql: `select * from contestResult where contestId=? and contestantId=?;`,
                values: [contestId, userId]
            })
            RedisClient.store(redisQueryString, contestResult)
            return contestResult
        }
    }



    async getContestResult() {

        this.contestResult = await JudgeRepository.getContestResultFromCache(this)
        if (!this.contestResult) {
            this.isNewContestSubmission = true
            let contestResult = new ContestResult({
                _contestId: this.contestId,
                _contestantId: this.userId
            })
            this.contestResult = contestResult
        }
        else {
            this.contestResult = ContestResult.extractData(this.contestResult)

        }
        if (!this.contestResult[this.problemId]) {
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
                sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime', 'isOfficial'])}
                 where id=?;`,
                values: [this.verdict, this.execTime, this.isOfficial, this.submissionId]
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
                console.log(e, "here")
            })
            return problem
        }
    }
    async setScoreWhenRejected() {
        this.updateContestResult()
    }

    async calculateScore() {
        this.updateACandErrorCount()

        this.score = - 5 * (this.isOfficial ? this.contestResult.official_description[this.problemId][1] :
            this.contestResult.description[this.problemId][1])
        if (this.verdict == 'AC') {
            let contestResult = this.contestResult.clone()
            let contest = await this.findContestById()
            let { startTime } = contest
            let timeDiff = Math.max(parseInt((this.time - startTime) / (3600 * 1000 * 10)), 0)
            if (this.isOfficial) {
                contestResult.official_ac_time[this.problemId] = parseInt((this.time - startTime) / 1000)
            }
            else {
                contestResult.unofficial_ac_time[this.problemId] = parseInt((this.time - startTime) / 1000)
            }

            this.contestResult = contestResult
            this.score += Math.max(this.points - timeDiff * 10, 10)
        }
        if (this.isOfficial) {
            this.contestResult.official_points = this.score
            this.contestResult.official_description[this.problemId][2] += this.score
        }
        else {
            this.contestResult.description[this.problemId][2] = this.score;
            this.contestResult.points += this.score

        }


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