const { RedisClient } = require("../utils/RedisClient")
const { executeSqlAsync } = require("../utils/executeSqlAsync")
const QueryBuilder = require("../utils/queryBuilder")

class ContestResult {
    static fields = ['points', 'description', 'official_description', 'official_points', 'officialVerdicts', 'verdicts', 'hasAttemptedOfficially', 'hasAttemptedUnofficially', 'unofficial_ac_time', 'official_ac_time']
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
        this.unofficial_ac_time = {}
        this.official_ac_time = {}
    }
    static async find({ contestId, contestantId }) {
        let redisQueryString = `contestResult_${contestId}_${contestantId}`
        try {
            return this.extractDataFromRedis(await RedisClient.queryCache(redisQueryString))
        } catch (error) {
            let _contestResult = this.extractDataFromDB(await executeSqlAsync({
                sql: `select * from contestResult where contestId=? and contestantId=?;`,
                values: [contestId, contestantId]
            }))
            if (_contestResult) {
                _contestResult.storeInRedis()
                return _contestResult

            }
            else {
                return null
            }
        }
    }
    /**
     * 
     * @param {ContestResult} _contestResult 
     */
    static extractDataFromRedis(_contestResult) {
        let { contestId, contestantId } = _contestResult
        let contestResult = new ContestResult({ _contestantId: contestantId, _contestId: contestId })
        for (let key in _contestResult) {
            contestResult[key] = _contestResult[key]
        }
        return contestResult
    }
    static extractDataFromDB([_contestResult]) {
        if (!_contestResult) return null
        let contestResult = new ContestResult({ _contestId: _contestResult.contestId, _contestantId: _contestResult.contestantId })
        contestResult.points = _contestResult.points
        contestResult.description = (_contestResult.description) ? JSON.parse(_contestResult.description) : {}
        contestResult.official_description = (_contestResult.official_description) ? JSON.parse(_contestResult.official_description) : {}
        contestResult.official_points = _contestResult.official_points
        contestResult.officialVerdicts = (_contestResult.officialVerdicts) ? JSON.parse(_contestResult.official_description) : {}
        contestResult.verdicts = (_contestResult.verdicts) ? JSON.parse(_contestResult.verdicts) : {}
        contestResult.hasAttemptedOfficially = _contestResult.hasAttemptedOfficially
        contestResult.hasAttemptedUnofficially = _contestResult.hasAttemptedUnofficially
        contestResult.official_ac_time = _contestResult.official_ac_time ? JSON.parse(_contestResult.official_ac_time) : {}
        contestResult.unofficial_ac_time = _contestResult.unofficial_ac_time ? JSON.parse(_contestResult.unofficial_ac_time) : {}
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
                JSON.stringify(this.officialVerdicts), JSON.stringify(this.verdicts), this.hasAttemptedOfficially, this.hasAttemptedUnofficially,
                JSON.stringify(this.unofficial_ac_time), JSON.stringify(this.official_ac_time)]
            }),
            this.storeInRedis()
        ])
    }
    clone() {
        let contestResult = new ContestResult({ _contestId: this.contestId, _contestantId: this.contestantId })
        contestResult.points = this.points
        contestResult.description = structuredClone(this.description)
        contestResult.official_description = structuredClone(this.official_description)
        contestResult.official_points = this.official_points
        contestResult.officialVerdicts = structuredClone(this.officialVerdicts)
        contestResult.verdicts = structuredClone(this.verdicts)
        contestResult.hasAttemptedOfficially = this.hasAttemptedOfficially
        contestResult.hasAttemptedUnofficially = this.hasAttemptedUnofficially
        contestResult.official_ac_time = structuredClone(this.official_ac_time)
        contestResult.unofficial_ac_time = structuredClone(this.unofficial_ac_time)

        return contestResult

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
                    'official_points', 'officialVerdicts', 'verdicts',
                    'hasAttemptedUnofficially', 'hasAttemptedOfficially', 'official_ac_time', 'unofficial_ac_time']) + `
                where contestId=? and contestantId=?;`,
                values: [
                    this.points, description, official_description, this.official_points, officialVerdicts, verdicts,
                    this.hasAttemptedUnofficially, this.hasAttemptedOfficially, JSON.stringify(this.official_ac_time), JSON.stringify(this.unofficial_ac_time), this.contestId, this.contestantId
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
            'description': (this.description),
            'official_description': (this.official_description),
            official_points,
            'officialVerdicts': (this.officialVerdicts),
            'verdicts': (this.verdicts),
            hasAttemptedOfficially,
            hasAttemptedUnofficially,
            'official_ac_time': (this.official_ac_time),
            'unofficial_ac_time': (this.unofficial_ac_time),

        }).catch(e => {
            console.log(e, "here")
        })
    }
}

module.exports = { ContestResult }