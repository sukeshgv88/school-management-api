const Redis = require("ioredis");

let redisClient;

const createClient = ({ prefix, url }) => {
    if (!redisClient) {
        redisClient = new Redis(url, { keyPrefix: prefix + ":" });

        redisClient.on("error", (error) => {
            console.error("Redis Error:", error);
        });

        redisClient.on("end", () => {
            console.warn("Redis Connection Lost");
        });
    }
    return redisClient;
};

module.exports = { createClient };