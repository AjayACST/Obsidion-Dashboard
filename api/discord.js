const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../utils');

const router = express.Router();

const CLIENT_ID = "691589447074054224";
const CLIENT_SECRET = "Rs66DQq7lIinWQO6soilX_CrzullCMX3";
const redirect = 'http://localhost:50451/api/discord/callback';

const encodeFormData = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

}


router.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20email%20connections%20guilds`);
});

router.get('/callback', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    console.log(code)
    const data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect,
        'scope': 'identify email connections guilds'
      }
    const response = await fetch(`https://discord.com/api/v6/oauth2/token`,
      {
        method: 'POST',
        body:    encodeFormData(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
      });
      console.log(response)
    const json = await response.json();
    sessionStorage.setItem("token", json.access_token);
    res.redirect("/");
  }));

module.exports = router;