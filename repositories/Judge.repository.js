const { runPython } = require("../executors/runPython");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const QueryBuilder = require("../utils/queryBuilder");
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require("worker_threads");
module.exports = class JudgeRepository {

    static async judgeSubmission({ contestId, userId, problemId, submissionId, submissionFileURL, points, isOfficial, time }) {
        try {
            const path = `/${submissionFileURL}`;
            const data = await runPython(problemId, path)
            this.setVerdictAndAssignScore(contestId, userId, problemId, submissionId, data.type, data.execTime, points, isOfficial, time)
            return { ...data, id: submissionId }
        } catch (error) {
            this.setVerdictAndAssignScore(contestId, userId, problemId, submissionId, error.type, 'N/A', -5, isOfficial, time)
            return { ...error, id: submissionId }
        }
    }
    static async setVerdictAndAssignScore(contestId, userId, problemId, submissionId, status, execTime, points, isOfficial, submissionTime) {
        this.setVerdict({ contestId, userId, problemId, submissionId, status, execTime, points, isOfficial, submissionTime })
        if (status == 1) { //when AC

            this.setScoreWhenAccepted(problemId, userId, points, contestId, isOfficial, submissionTime)
        }
        else {
            this.setScoreWhenRejected(problemId, userId, points, contestId, isOfficial)
        }
    }
    static async setVerdict({ submissionId, status, execTime }) {
        executeSqlAsync({
            sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime'])}
                 where id=?;`,
            values: [this.getVertictName(status), execTime, submissionId]
        })

    }

    static async setScoreWhenRejected(problemId, userId, points, contestId, isOfficial) {
        this.updateSubmissionResult(userId, problemId, points, isOfficial)
        this.updateContestResult(contestId, userId, points, problemId, isOfficial)
    }

    static async calculateScore(problemId, submissionTime) {
        const [problem] = await executeSqlAsync({
            sql: `select * from problem where id=?;`,
            values: [problemId]
        })
        let timeDiff = Math.max(parseInt((submissionTime - problem.createdOn) / (3600 * 1000 * 10)), 0)

        return Math.max(problem.points - timeDiff * 5, 10)
    }
    static async setScoreWhenAccepted(problemId, userId, points, contestId, isOfficial, submissionTime) {
        const [{ acCounter }] = await executeSqlAsync({
            sql: `select count(id) as acCounter from submission where verdict='AC' and
                    problemId=? and submittedBy=?;`,
            values: [problemId, userId]

        })
        console.log('accounter', acCounter)
        if (acCounter == 1) {
            executeSqlAsync({
                sql: `update problem set numSolutions=numSolutions+1 where id=?;`,
                values: [problemId]
            })

            const score = await this.calculateScore(problemId, submissionTime)
            this.updateSubmissionResult(userId, problemId, score, isOfficial)
            this.updateContestResult(contestId, userId, score, problemId, isOfficial)
        }
    }
    static async updateContestResult(contestId, contestantId, points, problemId, isOfficial) {
        let [contestResult] = await executeSqlAsync({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [contestId, contestantId]
        })
        if (!contestResult) {
            let description = {}
            description[problemId] = points
            await executeSqlAsync({
                sql: `insert into contestResult(points,description,contestId,contestantId) values(?,?,?,?) ;`,
                values: [points, JSON.stringify(description), contestId, contestantId]
            })
        }
        else {
            let { description } = contestResult
            description = JSON.parse(description)
            description[problemId] = points
            await executeSqlAsync({
                sql: `update contestResult set points=points+?, description=? where contestId=? and contestantId=?;`,
                values: [points, JSON.stringify(description), contestId, contestantId]
            })
        }
        if (!isOfficial) return
        executeSqlAsync({
            sql: `update contestResult set official_points=points,official_description=description
                  where contestId=? and contestantId=?;`,
            values: [contestId, contestantId]
        })
    }

    static async updateSubmissionResult(userId, problemId, points, isOfficial) {
        let finalVerdict = points > 0 ? 1 : 0;

        await executeSqlAsync({
            sql: `INSERT into submissionResult(
                                contestantId,
                                problemId,
                                points,
                                finalVerdict
                            )
                        values(?, ?, ?,?) 
                        on DUPLICATE key UPDATE points = points+?, finalVerdict=(select case when finalVerdict>? then finalVerdict else ? end )  ;`,
            values: [userId, problemId, points, finalVerdict, points, finalVerdict, finalVerdict]
        })
        if (!isOfficial) return
        executeSqlAsync({
            sql: `update submissionResult set finalVerdictOfficial=finalVerdict, official_points=points
                where problemId=? and contestantId=? ;`,
            values: [problemId, userId]
        })
    }

    static calculatePoints(status) {
        switch (status) {
            case 1:
                return 5

            default:
                return -5
        }
    }

    static getVertictName(type) {
        switch (type) {
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

    static async rejudgeProblemSubmissions({ problemId }) {

        let worker = new Worker(__dirname + '/workerThreads/RejudgeProblemsSubmissions.worker.js')

        worker.postMessage({
            problemId
        })


    }

}