const config = require('config-yml');
const redis = require('redis');

const redisHost = config.redis.host;
const redisPort = config.redis.port;

const client = redis.createClient(redisPort, redisHost, redis)


var guildID = "695008516590534758"
var userID = "267452404528709632"
var prefix = ","

key = `prefix_${guildID}`
prefix = `["<@!${userID}>", "<@!${guildID}>", "${prefix}"]`

client.set(key, prefix, 'EX', 28800, redis.print)

client.quit();