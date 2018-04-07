const redis = require("redis");
const config = require("config");

const client = redis.createClient(config.get("redis").port, config.get("redis").host);

class CacheService {

    get() {
        return new Promise((resolve, reject) => {
            client.lrange(config.get("redis").key, 0, -1, (err, reply) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }

    set(val) {
        return client.rpush(config.get("redis").key, val);
    }

}

module.exports = new CacheService();