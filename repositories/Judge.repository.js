const { executeCPP } = require("../executors/executeCPP");
const { runPython } = require("../executors/runPython");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const QueryBuilder = require("../utils/queryBuilder");
const {
    Worker,

} = require("worker_threads");
module.exports = class JudgeRepository {
    constructor({ contestId, userId, problemId, submissionId, submissionFileURL, points, isOfficial, time, ext }) {
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
        this.verdictType = -1
        this.path = `${this.submissionFileURL}`;
        this.execTime = 0
    }
    async judgeSubmission() {
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
            this.setScoreWhenAccepted()

            return { ...data, id: this.submissionId }
        } catch (error) {
            this.verdictType = error.type
            this.execTime = 'N/A'
            this.verdict = error.verdict
            this.setVerdict()

            this.setScoreWhenRejected()
            return { ...error, id: this.submissionId }
        }
    }

    async setVerdict() {
        console.log(this)
        executeSqlAsync({
            sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime'])}
                 where id=?;`,
            values: [this.verdict, this.execTime, this.submissionId]
        })

    }

    async setScoreWhenRejected() {
        this.updateSubmissionResult()
        this.updateContestResult()
    }

    async calculateScore() {
        let [problem] = await executeSqlAsync({
            sql: `select * from problem where id=?;`,
            values: [this.problemId]
        })
        let [contest] = await executeSqlAsync({
            sql: `select * from contest where id=?;`,
            values: [this.contestId]
        })

        let timeDiff = Math.max(parseInt((this.time - contest.startTime) / (3600 * 1000 * 10)), 0)

        return Math.max(problem.points - timeDiff * 5, 10)
    }
    async setScoreWhenAccepted() {
        console.log(this)
        const [{ acCounter }] = await executeSqlAsync({
            sql: `select count(id) as acCounter from submission where verdict='AC' and
                    problemId=? and submittedBy=?;`,
            values: [this.problemId, this.userId]

        })
        if (acCounter == 1) {
            executeSqlAsync({
                sql: `update problem set numSolutions=numSolutions+1 where id=?;`,
                values: [this.problemId]
            })

            const score = await this.calculateScore()
            this.score = score
            this.updateSubmissionResult()
            this.updateContestResult()
        }
    }
    async updateContestResult() {
        let [contestResult] = await executeSqlAsync({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [this.contestId, this.userId]
        })
        if (!contestResult) {
            let description = {}
            description[this.problemId] = this.score
            let verdicts = {}
            verdicts[this.problemId] = this.verdict
            await executeSqlAsync({
                sql: `insert into contestResult(points,description,contestId,contestantId,verdicts) values(?,?,?,?,?) ;`,
                values: [this.score, JSON.stringify(description), this.contestId, this.userId, JSON.stringify(verdicts)]
            })
        }
        else {
            let { description, verdicts } = contestResult
            description = JSON.parse(description)
            verdicts = JSON.parse(verdicts)
            description[this.problemId] = this.points
            verdicts[this.problemId] = this.verdict

            await executeSqlAsync({
                sql: `update contestResult set points=points+?, description=?, verdicts=? where contestId=? and contestantId=?;`,
                values: [this.points, JSON.stringify(description), JSON.stringify(verdicts), this.contestId, this.userId]
            })
        }
        if (!this.isOfficial) return
        executeSqlAsync({
            sql: `update contestResult set official_points=points,official_description=description, officialVerdicts=verdicts
                  where contestId=? and contestantId=?;`,
            values: [this.contestId, this.userId]
        })
    }

    async updateSubmissionResult() {
        let finalVerdict = this.score > 0 ? 1 : 0;

        await executeSqlAsync({
            sql: `INSERT into submissionResult(
                                contestantId,
                                problemId,
                                points,
                                finalVerdict
                            )
                        values(?, ?, ?,?) 
                        on DUPLICATE key UPDATE points = points+?, finalVerdict=(select case when finalVerdict>? then finalVerdict else ? end )  ;`,
            values: [this.userId, this.problemId, this.score, finalVerdict, this.score, finalVerdict, finalVerdict]
        })
        if (!this.isOfficial) return
        executeSqlAsync({
            sql: `update submissionResult set finalVerdictOfficial=finalVerdict, official_points=points
                where problemId=? and contestantId=? ;`,
            values: [this.problemId, this.userId]
        })
    }



    getVertictName() {
        switch (this.verdictType) {
            case 1:
                return 'AC'
                break;
            case 2:
                return 'WA'
            case 3:
                return 'ERROR'
            case 4:
                return 'TLE'

        }
    }

    static async rejudgeContestSubmissions({ contestId }) {

        let worker = new Worker(__dirname + '/workerThreads/RejudgeAllSubmissionOfContest.worker.js')

        worker.postMessage({
            contestId
        })


    }

}