const promisify = require('../utils/promisify')
const QueryBuilder = require('../utils/queryBuilder')
const jwt = require('jsonwebtoken')
module.exports = class UserRepository {
    static async findUser(param, value) {
        let [user] = await promisify({ sql: `select * from user where ${param}=?`, values: [value] })
        return user
    }
    static async register({ userName, password }) {
        try {
            await promisify({
                sql: QueryBuilder.insertQuery('user', ['userName', 'password']),
                values: [userName, password]
            })
            let user = await UserRepository.findUser('userName', userName)
            user.password = null
            let token = jwt.sign(user, process.env.jwtSecret)
            return { user, token }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async authenticate({ userName, password }) {
        let [user] = await promisify({
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
        return promisify({
            sql: `select * from contest where contest.hostId=? order by startTime desc;`,
            values: [id]
        })
    }
}