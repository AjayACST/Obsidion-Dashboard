const cookieParser = require('cookie-parser');
const { static } = require('express');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/public'));

app.use(express.static(__dirname + '/public/dashboard'));


app.use('/api/discord', require('./api/discord'));
app.use('/api/database', require('./api/database'));

app.use((err, req, res, next) => {
    switch (err.message) {
      case 'NoCodeProvided':
        return res.status(400).send({
          status: 'ERROR',
          error: err.message,
        });
      default:
        return res.status(500).send({
          status: 'ERROR',
          error: err.message,
        });
    }
  });

app.use(cookieParser());



app.listen(5000, () => {
  console.info('Running on port 5000');
});