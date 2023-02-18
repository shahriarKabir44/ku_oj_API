const promisify = require('../utils/promisify')
module.exports = class UserRepository {
    static async findUser(id) {
        let [user] = await promisify(`select * from user where id=?`, [id])
        return user
    }
}