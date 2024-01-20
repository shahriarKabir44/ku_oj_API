const redis = require('redis');

class RedisClient {
    static client = {}
    static init() {
        let config = {
            socket: {
                host: process.env.redisHost,
                port: parseInt(process.env.redisPort)
            }
        }
        if (process.env.redisPassword) {
            config['redisPassword'] = process.env.redisPassword
        }
        console.log(config)
        const client = redis.createClient(config)
        this.client = client

        client.connect()


    }
    static async queryCache(key) {
        // let data = await this.client.get(key)
        // if (data == null) return null
        // return (JSON.parse(data))
        return null

    }
    static async store(key, value) {
        // if (!value) return
        // try {
        //     await this.remove(key)
        //     return this.client.set(key, JSON.stringify(value), {
        //         EX: 3600
        //     })

        // } catch (error) {
        //     console.log('store', error, key, value)
        // }
        //  this.client.expire(key, 3600 * 2 * 1000, (err, data) => { })
    }
    static async remove(key) {
        // return new Promise((resolve, reject) => {
        //     this.client.set(key, "1", 'NX').then((res) => {
        //         resolve(res)
        //     })
        // })
    }
}

module.exports = { RedisClient }

