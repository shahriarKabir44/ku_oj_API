const redis = require('redis');

class RedisClient {
    static client = {}
    static initClient() {
        this.client = redis.createClient()
        this.client.connect()
    }
    static async queryCache(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then(data => {
                    if (!data) reject({})
                    resolve(JSON.parse(data))
                })

        })

    }
    static async store(key, value) {
        this.client.set(key, JSON.stringify(value), { expiresIn: 3600 * 2 })
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

