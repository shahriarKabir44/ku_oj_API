const { RedisClient } = require('../utils/RedisClient')
const { executeSqlAsync } = require('../utils/executeSqlAsync')
const QueryBuilder = require('../utils/queryBuilder')
const jwt = require('jsonwebtoken')
module.exports = class UserRepository {
    static async findUser(param, value) {
        let [user] = await executeSqlAsync({ sql: `select * from user where ${param}=?`, values: [value] })
        return user
    }
    static async register({ userName, password }) {
        try {
            await executeSqlAsync({
                sql: QueryBuilder.insertQuery('user', ['userName', 'password']),
                values: [userName, password]
            })
            let user = await UserRepository.findUser('userName', userName)
            user.password = null
            let token = jwt.sign(user, process.env.jwtSecret)
            return { user, token }

        } catch (error) {
            return null
        }
    }
    static async findById({ id }) {
        let _user = await RedisClient.queryCache(`user_${id}`)
        if (_user != null) return _user
        let [userInfo] = await executeSqlAsync({ sql: `select user from userName,id where id=?`, values: [id] })

        RedisClient.store(`user_${id}`, userInfo)
        return userInfo
    }
    static async authenticate({ userName, password }) {
        let [user] = await executeSqlAsync({
            sql: `select * from user where userName=? and password=?;`,
            values: [userName, password]
        })
        if (!user) return {
            user: null,
            token: null
        }
        user.password = null
        let token = jwt.sign(user, process.env.jwtSecret)
        return { user, token }
    }
    static async getHostedContests({ id }) {
        return executeSqlAsync({
            sql: `select * from contest where contest.hostId=? order by startTime desc;`,
            values: [id]
        })
    }
    static async getUsersContestSubmissions({ contestId, userId, pageNumber }) {
        return executeSqlAsync({
            sql: `select id,time,verdict,language, execTime,problemId, (select title from problem
                where problem.id=submission.problemId
                ) as problemName from submission where contestId=? and submittedBy=? order by time desc limit ?,10;`,
            values: [contestId, userId, pageNumber]
        })
    }
}