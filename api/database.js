const express = require('express');
const {catchAsync} = require('../utils/utils');
const sqlite = require('sqlite3');
const {Pool} = require('pg');
const config = require('config-yml');
const fetch = require('node-fetch');
const redis = require('redis');

const db = new sqlite.Database('./database/api-auth.db');

const router = express.Router();



const user = config.db.user;
const host = config.db.host;
const database = config.db.database;
const password = config.db.password;
const port = config.db.port;
const botToken = config.app.bot_token;
const clientID = config.app.CLIENT_ID;
const redisHost = config.redis.host;
const redisPort = config.redis.port;



const pool = new Pool({
    user: user,
    host: host,
    database: database,
    password: password,
    port: port
})

router.get('/account', (req, res) => {
    if (!req.query.token) throw new Error('NoTokenProvided');
    if (!req.query.id) throw new Error('NoUserIDProvided');
    const token = req.query.token;
    const id = req.query.id;

    var sql = `SELECT token FROM auth WHERE token='${token}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw new Error("ErrorWithDatabase");
        }

        if (rows.length === 0) {
            res.json({code: 401, "message": "That is not a valid token."})
        }

        if (rows[0].token === token) {
            pool.query(`SELECT username FROM discord_user WHERE id='${id}'`)
            .then(response => res.json({code: 200, "username": response.rows[0].username}))
            .catch(e => console.error(e))
        } else {
            res.json({code: 401, "message": "That is not a valid token."})
        }

    });
})

router.get('/accountUpdate', (req, res) => {
    if (!req.query.token) throw new Error('NoTokenProvided');
    if (!req.query.id) throw new Error('NoUserIDProvided');
    if (!req.query.username) throw new Error('NoUsernameProvided');
    const token = req.query.token;
    const id = req.query.id;
    const username = req.query.username;

    var sql = `SELECT token FROM auth WHERE token='${token}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw new Error("ErrorWithDatabase");
        }

        if (rows.length === 0) {
            res.json({code: 401, "message": "That is not a valid token."})
        }
        
        if (rows[0].token === token) {
            pool.query(`SELECT username FROM discord_user WHERE id='${id}'`)
            .then((response) => {
                if (response.rows[0]) {
                    pool.query(`UPDATE discord_user SET username = '${username}' WHERE id='${id}'`)
                    .then(response => res.json({code: 200, "message": "Successfully updated linked user account."}))
                    .catch(e => console.error(e))
                } else {
                    pool.query(`INSERT INTO discord_user (id, username) VALUES ('${id}', '${username}')`)
                    .then(response => res.json({code: 200, "message": "Successfully updated linked user account."}))
                    .catch(e => console.error(e))
                }
            })
        } else {
            res.json({code: 401, "message": "That is not a valid token."})
        }

    });
})

router.get('/discordGuild', (req, res) => {
    if (!req.query.token) throw new Error('NoTokenProvided');
    if (!req.query.guildid) throw new Error('NoGuildIDProvided');

    const token = req.query.token;
    const guildID = req.query.guildid;

    var sql = `SELECT token FROM auth WHERE token='${token}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw new Error("ErrorWithDatabase");
        }

        if (rows.length === 0) {
            res.json({code: 401, "message": "That is not a valid token."})
        }

        if (rows[0].token === token) {
            fetch(`https://discord.com/api/v6/guilds/${guildID}/members/${clientID}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bot ${botToken}`
                }
            }).then(response => response.json()).then((discordResponse) => {
                if (discordResponse.message === 'Missing Access') {
                    res.json({code: 200, 'message': 'Bot is not in that guild.'})
                } else {
                    res.json({code: 200, 'message': 'Bot is in that guild.'})
                }
            })
            .catch(e => console.error(e))
        } else {
            res.json({code: 401, "message": "That is not a valid token."})
        }

    });
})

router.get('/prefix', (req, res) => {
    if (!req.query.token) throw new Error('NoTokenProvided');
    if (!req.query.guildid) throw new Error('NoGuildIDProvided');
    const token = req.query.token;
    const guildid = req.query.guildid;

    var sql = `SELECT token FROM auth WHERE token='${token}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw new Error("ErrorWithDatabase");
        }

        if (rows.length === 0) {
            res.json({code: 401, "message": "That is not a valid token."})
        }

        if (rows[0].token === token) {
            pool.query(`SELECT prefix FROM guild WHERE id='${guildid}'`)
            .then(response => {
                if (!response.rows[0]) {
                    return res.json({code: 404, "message": "User has not setup a custom prefix."})
                } else {
                    return res.json({code: 200, "prefix": response.rows[0].prefix})
                }
            })
            .catch(e => console.error(e))
        } else {
            res.json({code: 401, "message": "That is not a valid token."})
        }

    });
})

router.get('/prefixUpdate', (req, res) => {
    if (!req.query.token) throw new Error('NoTokenProvided');
    if (!req.query.guildid) throw new Error('NoGuildIDProvided');
    if (!req.query.prefix) throw new Error('NoPrefixProvided');
    if (!req.query.userid) throw new Error('NoUserIDProvided');
    const token = req.query.token;
    const guildid = req.query.guildid;
    const prefix = req.query.prefix;
    const userid = req.query.userid;

    var sql = `SELECT token FROM auth WHERE token='${token}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw new Error("ErrorWithDatabase");
        }

        if (rows.length === 0) {
            res.json({code: 401, "message": "That is not a valid token."})
        }

        if (rows[0].token === token) {
            pool.query(`SELECT prefix FROM guild WHERE id='${guildid}'`)
            .then((response) => {
                if (response.rows[0]) {
                    pool.query(`UPDATE guild SET prefix = '${prefix}' WHERE id='${guildid}'`)
                    .then((response) => {
                        const client = redis.createClient(redisPort, redisHost, redis);
                        var key = `prefix_${guildid}`
                        var prefixUpdate = `["<@!${userid}>", "<@${userid}>", "${prefix}"]`
                        client.set(key, prefixUpdate, 'EX', 28800, redis.print);
                        client.quit();
                        return res.json({code: 200, "message": "Successfully updated linked prefix for guild."})
                    })
                    .catch(e => res.json({code: 404, "message": "An error has occurred please try again later."}))
                } else {
                    pool.query(`INSERT INTO guild (id, prefix) VALUES ('${guildid}', '${prefix}')`)
                    .then((response) => {
                        const client = redis.createClient(redisPort, redisHost, redis);
                        var key = `prefix_${guildid}`
                        var prefixUpdate = `["<@!${userid}>", "<@${userid}>", "${prefix}"]`
                        client.set(key, prefixUpdate, 'EX', 28800, redis.print);
                        client.quit();
                        return res.json({code: 200, "message": "Successfully updated linked prefix for guild."})
                    })
                    .catch(e => console.error(e))
                }
            })
        } else {
            res.json({code: 401, "message": "That is not a valid token."})
        }

    });
})

module.exports = router;