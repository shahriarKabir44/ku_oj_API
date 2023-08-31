const { RedisClient } = require("../utils/RedisClient")
const { executeSqlAsync } = require("../utils/executeSqlAsync")
const QueryBuilder = require("../utils/queryBuilder")

class ContestResult {
    static fields = ['points', 'description', 'official_description', 'official_points', 'official_points', 'officialVerdicts', 'verdicts']
    constructor({ _contestId, _contestantId }) {
        this.contestId = _contestId
        this.contestantId = _contestantId
        this.points = 0
        this.description = {}
        this.official_description = {}
        this.official_points = 0
        this.officialVerdicts = {}
        this.verdicts = {}
    }
    static extractData(_contestResult) {
        let contestResult = new ContestResult({ _contestResult })

        contestResult.points = _contestResult.points
        contestResult.description = JSON.stringify(_contestResult.description)
        contestResult.official_description = JSON.stringify(_contestResult.official_description)
        contestResult.official_points = _contestResult.official_points
        contestResult.officialVerdicts = JSON.stringify(_contestResult.officialVerdicts)
        contestResult.verdicts = JSON.stringify(_contestResult.verdicts)
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
                JSON.stringify(this.officialVerdicts), JSON.stringify(this.verdicts)]
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
                sql: QueryBuilder.createUpdateQuery('contestResult', ContestResult.fields) + `
                where contestId=? and contestantId=?;`,
                values: [
                    this.points, description, official_description, official_points, this.official_points, officialVerdicts, verdicts,
                    this.contestId, this.contestantId
                ]
            }),
            this.storeInRedis()
        ])
    }
    async storeInRedis() {
        return RedisClient.store(`contestResult_${this.contestId}_${this.contestantId}`, {
            'contestId': this.contestId,
            'contestantId': this.contestantId,
            'points': this.points,
            'description': JSON.stringify(this.description),
            'official_description': JSON.stringify(this.official_description),
            'official_points': this.official_points,
            'officialVerdicts': JSON.stringify(this.officialVerdicts),
            'verdicts': JSON.stringify(this.verdicts)
        }).catch(e => {
            console.log(e, "here")
        })
    }
}

module.exports = { ContestResult }