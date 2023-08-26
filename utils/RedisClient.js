const redis = require('redis');

class RedisClient {
    static client = {}
    static initClient() {
        this.client = redis.createClient()
    }
    static async queryCache(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, data) => {
                if (err) reject()
                else resolve((data))
            })
        })
    }
    static async store(key, value) {
        this.client.set(key, (value), { expiresIn: 3600 * 2 })
    }
    static async remove(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, res) => {
                if (err) reject(err)
                else resolve(res)
            })
        })
    }
}

module.exports = { RedisClient }

