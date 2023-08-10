const { executeCPP } = require("../executors/executeCPP");
const { runPython } = require("../executors/runPython");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const QueryBuilder = require("../utils/queryBuilder");
const {
    Worker,

} = require("worker_threads");
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
        this.isNewSubmission = true
        console.log(problemId)
    }
    async judgeSubmission() {
        await this.calculateErrorsAndACs()
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


    async calculateErrorsAndACs() {

        let [submissionResult] = await executeSqlAsync({
            sql: `select * from submissionResult where contestantId=? and problemId=?;`,
            values: [this.userId, this.problemId]
        })
        if (!submissionResult) {
            this.errorCount_official = 0
            this.acCount_unofficial = 0
            this.errorCount_unofficial = 0
            this.acCount_official = 0
        }
        else {
            this.isNewSubmission = false
            let { errorCount_official, acCount_unofficial, errorCount_unofficial, acCount_official } = submissionResult
            this.errorCount_official = errorCount_official
            this.acCount_unofficial = acCount_unofficial
            this.errorCount_unofficial = errorCount_unofficial
            this.acCount_official = acCount_official
        }
    }
    async setVerdict() {
        return Promise.all([
            this.calculateScore(),
            executeSqlAsync({
                sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime'])}
                 where id=?;`,
                values: [this.verdict, this.execTime, this.submissionId]
            })
        ])



    }

    async setScoreWhenRejected() {
        this.updateSubmissionResult()
        this.updateContestResult()
    }

    async calculateScore() {
        this.updateACandErrorCount()

        this.score = - 5 * (this.isOfficial ? this.errorCount_official : this.errorCount_unofficial)
        if (this.verdict == 'AC') {
            let [{ startTime }] = await executeSqlAsync({
                sql: `select startTime from contest where id=?;`,
                values: [this.contestId]
            })

            let timeDiff = Math.max(parseInt((this.time - startTime) / (3600 * 1000 * 10)), 0)


            this.score += Math.max(this.points - timeDiff * 10, 10)
        }
    }
    async setScoreWhenAccepted() {
        if ((this.isOfficial && this.acCount_official == 1) || (!this.isOfficial && this.acCount_unofficial == 1)) {
            executeSqlAsync({
                sql: `update problem set numSolutions=numSolutions+1 where id=?;`,
                values: [this.problemId]
            })

            this.updateSubmissionResult()
            this.updateContestResult()
        }
    }
    async createContestRestult() {
        if (this.isOfficial) {
            let official_description = {}
            let officialVerdicts = {}
            officialVerdicts[this.problemId] = this.verdict
            official_description[this.problemId] = this.score
            executeSqlAsync({
                sql: QueryBuilder.insertQuery('contestResult', ['official_points', 'official_description', 'contestId', 'contestantId', 'officialVerdicts']),
                values: [this.score, JSON.stringify(official_description), this.contestId, this.userId, JSON.stringify(officialVerdicts)]
            })
        }
        else {
            let description = {}
            description[this.problemId] = this.score
            let verdicts = {}
            verdicts[this.problemId] = this.verdict
            await executeSqlAsync({
                sql: `insert into contestResult(points,description,contestId,contestantId,verdicts) values(?,?,?,?,?) ;`,
                values: [this.score, JSON.stringify(description), this.contestId, this.userId, JSON.stringify(verdicts)]
            })
        }
    }
    async updateContestResult() {
        let [contestResult] = await executeSqlAsync({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [this.contestId, this.userId]
        })
        if (!contestResult) {
            this.createContestRestult()
        }
        else {
            if (this.isOfficial) {
                let { official_description, officialVerdicts } = contestResult
                official_description = JSON.parse(official_description)
                officialVerdicts = JSON.parse(officialVerdicts)
                official_description[this.problemId] = this.score
                officialVerdicts[this.problemId] = this.verdict

                await executeSqlAsync({
                    sql: `update contestResult set official_points=official_points+?, official_description=?, officialVerdicts=? where contestId=? and contestantId=?;`,
                    values: [this.score, JSON.stringify(official_description), JSON.stringify(officialVerdicts), this.contestId, this.userId]
                })
                return
            }
            let { description, verdicts } = contestResult
            description = JSON.parse(description)
            verdicts = JSON.parse(verdicts)
            description[this.problemId] = this.score
            verdicts[this.problemId] = this.verdict

            await executeSqlAsync({
                sql: `update contestResult set points=points+?, description=?, verdicts=? where contestId=? and contestantId=?;`,
                values: [this.score, JSON.stringify(description), JSON.stringify(verdicts), this.contestId, this.userId]
            })
        }

    }
    updateACandErrorCount() {
        if (this.isOfficial) {
            if (this.verdict != 'AC') {
                this.errorCount_official++;

            }
            else {
                this.acCount_official++
            }
        }
        else {
            if (this.verdict != 'AC') {
                this.errorCount_unofficial++;

            }
            else {
                this.acCount_unofficial++
            }
        }
    }
    async updateSubmissionResult() {
        let finalVerdict = this.verdict == 'AC' ? 1 : 0


        if (this.isOfficial) {
            if (this.isNewSubmission) {
                executeSqlAsync({
                    sql: QueryBuilder.insertQuery('submissionResult', ['contestantId',
                        'problemId',
                        'official_points',
                        'finalVerdictOfficial',
                        'acCount_official',
                        'errorCount_official']),
                    values: [this.userId, this.problemId, this.score, finalVerdict,
                    this.acCount_official, this.errorCount_official]
                })
            }
            else {
                const { acCount_official, errorCount_official, score, userId, problemId } = this
                executeSqlAsync({
                    sql: `${QueryBuilder.createUpdateQuery('submissionResult', [
                        'official_points',
                        'finalVerdictOfficial',
                        'acCount_official',
                        'errorCount_official'])} where contestantId=? and problemId=?`,
                    values: [score, finalVerdict, acCount_official, errorCount_official, userId, problemId]
                })
            }
            return
        }

        if (this.isNewSubmission) {
            executeSqlAsync({
                sql: QueryBuilder.insertQuery('submissionResult', ['contestantId',
                    'problemId',
                    'points',
                    'finalVerdict',
                    'acCount_unofficial',
                    'errorCount_unofficial']),
                values: [this.userId, this.problemId, this.score, finalVerdict,
                this.acCount_unofficial, this.errorCount_unofficial]
            })
        }
        else {
            const { acCount_unofficial, errorCount_unofficial, score, userId, problemId } = this
            executeSqlAsync({
                sql: `${QueryBuilder.createUpdateQuery('submissionResult', [
                    'points',
                    'finalVerdict',
                    'acCount_unofficial',
                    'errorCount_unofficial'])} where contestantId=? and problemId=?`,
                values: [score, finalVerdict, acCount_unofficial, errorCount_unofficial, userId, problemId]
            })
        }

    }



    static async rejudgeContestSubmissions({ contestId }) {

        let worker = new Worker(__dirname + '/workerThreads/RejudgeAllSubmissionOfContest.worker.js')

        worker.postMessage({
            contestId
        })


    }

}