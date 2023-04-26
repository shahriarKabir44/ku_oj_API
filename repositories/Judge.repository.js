const runPython = require("../executors/runPython");
const Promisify = require("../utils/promisify");
const QueryBuilder = require("../utils/queryBuilder");

module.exports = class JudgeRepository {
    static async judgeSubmission({ contestId, userId, problemId, submissionId, extName }, responseObject) {
        responseObject.write(JSON.stringify({ status: 0, message: 'judging' }))
        try {
            const path = `/submissions/${contestId}/${userId}/${problemId}/${submissionId}.${extName}`;
            const data = await runPython(problemId, path)
            console.log(data)
            responseObject.write(JSON.stringify(data))


        } catch (error) {
            responseObject.write(JSON.stringify(error))

        }
    }
    static async setVerdict(contestId, userId, problemId, submissionId, status, execTime, points) {
        await Promisify({
            sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime'])}
                 where id=?;`,
            values: [this.getVertictName(status), execTime, submissionId]
        })
        if (status == 1) { //when AC

            this.setScoreWhenAccepted(problemId, userId, points, contestId)
        }
        else {
            this.setScoreWhenRejected(problemId, userId, -5, contestId)
        }
    }

    static async setScoreWhenRejected(problemId, userId, points, contestId) {
        this.updateSubmissionResult(userId, problemId, -points)
        this.updateContestResult(contestId, userId, -points)
    }


    static async setScoreWhenAccepted(problemId, userId, points, contestId) {
        const [{ acCounter }] = await Promisify({
            sql: `select count(id) as acCounter from submission where verdict=AC and
                    problemId=? and submittedBy=?;`,
            values: [problemId, userId]

        })
        if (acCounter == 1) {
            this.updateSubmissionResult(userId, problemId, points)
            this.updateContestResult(contestId, userId, points)
        }
    }
    static async updateContestResult(contestId, contestantId, points) {
        Promisify({
            sql: `insert into contestResult(contestId,contestantId,points)
                values(?,?,?) on DUPLICATE key UPDATE points = points+?;`,
            values: [contestId, contestantId, points, points]
        })
    }

    static async updateSubmissionResult(userId, problemId, points) {
        Promisify({
            sql: `INSERT into submissionResult(
                                contestantId,
                                problemId,
                                points
                            )
                        values(?, ?, ?) 
                        on DUPLICATE key UPDATE points = points+?;`,
            values: [userId, problemId, points, points]
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
}