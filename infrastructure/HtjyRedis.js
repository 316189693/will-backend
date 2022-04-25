let {createClient} = require('redis');

class HtjyRedis {
    client;
     constructor(options, logger=null) {
        let url = `redis://${options.host}:${options.port}`;
        this.client = createClient({url: url, password:options.password});
        this.client.on('error', (err) => console.log('Redis Client Error', err));

    }
    async setKey(key, value, expire){
            await this.client.connect();
        let rst= await this.client.set(key, value);
          await this.client.expire(key, expire);
        await this.client.quit();
        return rst;
    }
    async getKey(key) {
        await this.client.connect();
        let rst= await this.client.get(key);
        await this.client.quit();
        return rst;
    }

    async expireKey(key, expire) {
        await this.client.connect();
        await this.client.expire(key, expire);
        await this.client.quit();
    }
}



module.exports = HtjyRedis;