const runPython = require("../executors/runPython");
const Promisify = require("../utils/promisify");
const QueryBuilder = require("../utils/queryBuilder");

module.exports = class JudgeRepository {

    static async judgeSubmission({ contestId, userId, problemId, id: submissionId, submissionFileURL, points }) {

        try {
            const path = `/${submissionFileURL}`;
            const data = await runPython(problemId, path)
            this.setVerdict(contestId, userId, problemId, submissionId, data.type, data.execTime, points)
            return { ...data, id: submissionId }
        } catch (error) {
            console.log(error)
            this.setVerdict(contestId, userId, problemId, submissionId, error.type, 'N/A', -5)
            return { ...error, id: submissionId }
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
            this.setScoreWhenRejected(problemId, userId, points, contestId)
        }
    }

    static async setScoreWhenRejected(problemId, userId, points, contestId) {
        this.updateSubmissionResult(userId, problemId, points)
        this.updateContestResult(contestId, userId, points, problemId)
    }


    static async setScoreWhenAccepted(problemId, userId, points, contestId) {
        const [{ acCounter }] = await Promisify({
            sql: `select count(id) as acCounter from submission where verdict='AC' and
                    problemId=? and submittedBy=?;`,
            values: [problemId, userId]

        })
        if (acCounter == 1) {
            this.updateSubmissionResult(userId, problemId, points)
            this.updateContestResult(contestId, userId, points, problemId)
        }
    }
    static async updateContestResult(contestId, contestantId, points, problemId) {
        let [contestResult] = await Promisify({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [contestId, contestantId]
        })
        if (!contestResult) {
            let description = {}
            description[problemId] = points
            return Promisify({
                sql: `insert into contestResult(points,description,contestId,contestantId) values(?,?,?,?) ;`,
                values: [points, JSON.stringify(description), contestId, contestantId]
            })
        }
        let { description } = contestResult
        description = JSON.parse(description)
        description[problemId] = points
        return Promisify({
            sql: `update contestResult set points=points+?, description=? where contestId=? and contestantId=?;`,
            values: [points, JSON.stringify(description), contestId, contestantId]
        })
    }

    static async updateSubmissionResult(userId, problemId, points, isOfficial) {
        let finalVerdict = points > 0 ? 1 : 0;

        await Promisify({
            sql: `INSERT into submissionResult(
                                contestantId,
                                problemId,
                                points,
                                finalVerdict
                            )
                        values(?, ?, ?,?) 
                        on DUPLICATE key UPDATE points = points+?, finalVerdict=(select case when finalVerdict>? then finalVerdict else ? end )  ;`,
            values: [userId, problemId, points, points, finalVerdict, finalVerdict]
        })
        if (!isOfficial) return
        Promisify({
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
}