const { RedisClient } = require("../utils/RedisClient")
const { executeSqlAsync } = require("../utils/executeSqlAsync")
const QueryBuilder = require("../utils/queryBuilder")

class ContestResult {
    static fields = ['points', 'description', 'official_description', 'official_points', 'officialVerdicts', 'verdicts', 'hasAttemptedOfficially', 'hasAttemptedUnofficially']
    constructor({ _contestId, _contestantId }) {
        this.contestId = _contestId
        this.contestantId = _contestantId
        this.points = 0
        this.description = {}
        this.official_description = {}
        this.official_points = 0
        this.officialVerdicts = {}
        this.verdicts = {}
        this.hasAttemptedOfficially = 0
        this.hasAttemptedUnofficially = 0
    }
    static extractData(_contestResult) {
        let contestResult = new ContestResult({ _contestId: _contestResult.contestId, _contestantId: _contestResult.contestantId })
        contestResult.points = _contestResult.points
        contestResult.description = (_contestResult.description) ? JSON.parse(_contestResult.description) : {}
        contestResult.official_description = (_contestResult.official_description) ? JSON.parse((_contestResult.official_description)) : {}
        contestResult.official_points = _contestResult.official_points
        contestResult.officialVerdicts = (_contestResult.officialVerdicts) ? JSON.parse(_contestResult.officialVerdicts) : {}
        contestResult.verdicts = (_contestResult.verdicts) ? JSON.parse(_contestResult.verdicts) : {}
        contestResult.hasAttemptedOfficially = _contestResult.hasAttemptedOfficially
        contestResult.hasAttemptedUnofficially = _contestResult.hasAttemptedUnofficially
        return contestResult
    }
    async store() {
        return Promise.all([
            executeSqlAsync({
                sql: QueryBuilder.insertQuery('contestResult', ['contestId',
                    'contestantId',
                    ...ContestResult.fields
                ]),
                values: [this.contestId, this.contestantId, this.points, JSON.stringify(this.description),
                JSON.stringify(this.official_description), this.official_points,
                JSON.stringify(this.officialVerdicts), JSON.stringify(this.verdicts), this.hasAttemptedOfficially, this.hasAttemptedUnofficially]
            }),
            this.storeInRedis()
        ])
    }
    async updateAndStore() {
        let verdicts = JSON.stringify(this.verdicts)
        let description = JSON.stringify(this.description)
        let officialVerdicts = JSON.stringify(this.officialVerdicts)
        let official_description = JSON.stringify(this.official_description)
        return Promise.all([
            executeSqlAsync({
                sql: QueryBuilder.createUpdateQuery('contestResult', ['points',
                    'description',
                    'official_description',
                    'official_points', 'officialVerdicts', 'verdicts', 'hasAttemptedUnofficially', 'hasAttemptedOfficially']) + `
                where contestId=? and contestantId=?;`,
                values: [
                    this.points, description, official_description, this.official_points, officialVerdicts, verdicts,
                    this.hasAttemptedUnofficially, this.hasAttemptedOfficially, this.contestId, this.contestantId
                ]
            }),
            this.storeInRedis()
        ])
    }
    async storeInRedis() {
        const { hasAttemptedOfficially, hasAttemptedUnofficially, contestId, contestantId, points, official_points } = this
        return RedisClient.store(`contestResult_${this.contestId}_${this.contestantId}`, {
            contestId,
            contestantId,
            points,
            'description': JSON.stringify(this.description),
            'official_description': JSON.stringify(this.official_description),
            official_points,
            'officialVerdicts': JSON.stringify(this.officialVerdicts),
            'verdicts': JSON.stringify(this.verdicts),
            hasAttemptedOfficially,
            hasAttemptedUnofficially
        }).catch(e => {
            console.log(e, "here")
        })
    }
}

module.exports = { ContestResult }