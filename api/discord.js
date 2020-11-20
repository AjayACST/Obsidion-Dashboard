const express = require('express');
const fetch = require('node-fetch');
const { catchAsync, encodeFormData } = require('../utils/utils');
const sqlite = require('sqlite3');
const SHA512 = require('crypto-js/sha512');
const config = require('config-yml');

const router = express.Router();



const CLIENT_ID = config.app.CLIENT_ID;
const CLIENT_SECRET = config.app.CLIENT_SECRET;
const redirect = config.app.redirect;
const sqlpath = config.sql;


const db = new sqlite.Database(sqlpath);


db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS auth ( token varchar(255) NOT NULL);");
})

router.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`);
});

router.get('/callback', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect,
        'scope': 'identify'
      }
    const response = await fetch(`https://discord.com/api/v6/oauth2/token`,
      {
        method: 'POST',
        body:    encodeFormData(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
      });

    //set discord token in cookies to use later
    const json = await response.json();
    res.cookie('token', json.access_token, {
      maxAge: 604800000,
      httpOnly: false
    });

    //set logged in cookie to true so we know not to redirect away from dashboard.
    res.cookie('loggedin', true, {
      maxAge: 604800000,
      httpOnly: false
    });

    //generate a MD5 hash for use with database API and store in cookies and DB
    var dbToken = SHA512(json.access_token);
    res.cookie('dbToken', `${dbToken}`, {
      httpOnly: false
    });

    db.run(`INSERT INTO auth (token) VALUES ('${dbToken}');`);

    res.redirect("/");
  }));

module.exports = router;