const runPython = require("../executors/runPython");
const Promisify = require("../utils/promisify");
const QueryBuilder = require("../utils/queryBuilder");

module.exports = class JudgeRepository {

    static async judgeSubmission({ contestId, userId, problemId, submissionId, submissionFileURL, points, isOfficial }) {

        try {
            const path = `/${submissionFileURL}`;
            const data = await runPython(problemId, path)
            this.setVerdict(contestId, userId, problemId, submissionId, data.type, data.execTime, points, isOfficial)
            return { ...data, id: submissionId }
        } catch (error) {
            this.setVerdict(contestId, userId, problemId, submissionId, error.type, 'N/A', -5, isOfficial)
            return { ...error, id: submissionId }
        }
    }
    static async setVerdict(contestId, userId, problemId, submissionId, status, execTime, points, isOfficial) {
        await Promisify({
            sql: `${QueryBuilder.createUpdateQuery('submission', ['verdict', 'execTime'])}
                 where id=?;`,
            values: [this.getVertictName(status), execTime, submissionId]
        })
        if (status == 1) { //when AC

            this.setScoreWhenAccepted(problemId, userId, points, contestId, isOfficial)
        }
        else {
            this.setScoreWhenRejected(problemId, userId, points, contestId, isOfficial)
        }
    }

    static async setScoreWhenRejected(problemId, userId, points, contestId, isOfficial) {
        this.updateSubmissionResult(userId, problemId, points, isOfficial)
        this.updateContestResult(contestId, userId, points, problemId, isOfficial)
    }


    static async setScoreWhenAccepted(problemId, userId, points, contestId, isOfficial) {
        const [{ acCounter }] = await Promisify({
            sql: `select count(id) as acCounter from submission where verdict='AC' and
                    problemId=? and submittedBy=?;`,
            values: [problemId, userId]

        })
        if (acCounter == 1) {
            Promisify({
                sql: `update problem set numSolutions=numSolutions+1 where id=?;`,
                values: [problemId]
            })
            this.updateSubmissionResult(userId, problemId, points, isOfficial)
            this.updateContestResult(contestId, userId, points, problemId, isOfficial)
        }
    }
    static async updateContestResult(contestId, contestantId, points, problemId, isOfficial) {
        let [contestResult] = await Promisify({
            sql: `select * from contestResult where contestId=? and contestantId=?;`,
            values: [contestId, contestantId]
        })
        if (!contestResult) {
            let description = {}
            description[problemId] = points
            await Promisify({
                sql: `insert into contestResult(points,description,contestId,contestantId) values(?,?,?,?) ;`,
                values: [points, JSON.stringify(description), contestId, contestantId]
            })
        }
        else {
            let { description } = contestResult
            description = JSON.parse(description)
            description[problemId] = points
            await Promisify({
                sql: `update contestResult set points=points+?, description=? where contestId=? and contestantId=?;`,
                values: [points, JSON.stringify(description), contestId, contestantId]
            })
        }
        if (!isOfficial) return
        Promisify({
            sql: `update contestResult set official_points=points,official_description=description
                  where contestId=? and contestantId=?;`,
            values: [contestId, contestantId]
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
            values: [userId, problemId, points, finalVerdict, points, finalVerdict, finalVerdict]
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