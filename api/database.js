const express = require('express');
const {catchAsync} = require('../utils/utils');
const sqlite = require('sqlite3');
const {Pool} = require('pg');
const config = require('config-yml');

const db = new sqlite.Database('./database/api-auth.db');

const router = express.Router();



const user = config.db.user;
const host = config.db.host;
const database = config.db.database;
const password = config.db.password;
const port = config.db.port;



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

        rows.forEach((row) => {
            if (row.token === token) {
                pool.query(`SELECT username FROM discord_user WHERE id='${id}'`)
                .then(response => res.json({code: 200, "username": response.rows[0].username}))
                // .catch(e => res.json({code: 404, "message": "User has not linked their account."}))
            } else {
                res.json({code: 401, "message": "That is not a valid token."})
            }
        })

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

        rows.forEach((row) => {
            if (row.token === token) {
                pool.query(`SELECT username FROM discord_user WHERE id='${id}'`)
                .then((response) => {
                    if (response.rows[0]) {
                        pool.query(`UPDATE discord_user SET username = '${username}' WHERE id='${id}'`)
                        .then(response => res.json({code: 200, "message": "Successfully updated linked user account."}))
                        .catch(e => res.json({code: 404, "message": "An error has occurred please try again later."}))
                    } else {
                        pool.query(`INSERT INTO discord_user (id, username) VALUES ('${id}', '${username}')`)
                        .then(response => res.json({code: 200, "message": "Successfully updated linked user account."}))
                        .catch(e => res.json({code: 404, "message": "An error has occurred please try again later."}))
                    }
                })
                .catch(e => res.json({code: 404, "message": "User has not linked their account."}))
            } else {
                res.json({code: 401, "message": "That is not a valid token."})
            }
        })

    });
})

module.exports = router;