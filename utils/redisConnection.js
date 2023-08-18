const redis = require('redis');

class RedisClient {
    static client = {}
    static initClient() {
        client = redis.createClient()
    }
    static async queryCache(key) {
        return new Promise((resolve, reject) => {
            client.get(key, (err, data) => {
                if (err) reject()
                else resolve(data)
            })
        })
    }
}

module.exports = { RedisClient }

