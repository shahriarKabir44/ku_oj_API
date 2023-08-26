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
        try {
            await this.client.set(key, JSON.stringify(value))

        } catch (error) {
        }
        //  this.client.expire(key, 3600 * 2 * 1000, (err, data) => { })
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

