const promisify = require('../utils/promisify')
const QueryBuilder = require('../utils/queryBuilder')
const jwt = require('jsonwebtoken')
module.exports = class UserRepository {
    static async findUser(param, value) {
        let [user] = await promisify(`select * from user where ${param}=?`, [value])
        return user
    }
    static async register({ userName, password }) {
        try {
            await promisify(
                QueryBuilder.insertQuery('user', ['userName', 'password']),
                [userName, password]
            )
            let user = await UserRepository.findUser('userName', userName)
            user.password = null
            let token = jwt.sign(user, process.env.jwtSecret)
            return { user, token }

        } catch (error) {
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

}