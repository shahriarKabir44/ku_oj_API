const promisify = require('../utils/promisify')
const QueryBuilder = require('../utils/queryBuilder')
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
            return UserRepository.findUser('userName', userName)
        } catch (error) {
            return null
        }
    }

}