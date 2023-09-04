const redis = require('redis');

class RedisClient {
    static client = {}
    static init() {
        let client = redis.createClient()
        this.client = client

        this.client.connect()


    }
    static async queryCache(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then(data => {
                    if (!data) reject(null)
                    resolve(JSON.parse(data))
                })
                .catch(e => {
                })

        })

    }
    static async store(key, value) {
        if (!value) return
        try {
            await this.remove(key)
            return this.client.set(key, JSON.stringify(value), {
                EX: 3600
            })

        } catch (error) {

            console.log(key, value, error)
        }
        //  this.client.expire(key, 3600 * 2 * 1000, (err, data) => { })
    }
    static async remove(key) {
        return new Promise((resolve, reject) => {
            this.client.set(key, "1", 'NX').then((res) => {
                resolve(res)
            })
        })
    }
}

module.exports = { RedisClient }

