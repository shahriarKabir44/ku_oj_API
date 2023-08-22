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
                else resolve(JSON.parse(data))
            })
        })
    }
    static async store(key, value) {
        this.client.set(key, JSON.stringify(value), { expiresIn: 3600 * 2 })
    }
}

module.exports = { RedisClient }

