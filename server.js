'use strict';

// Load array of notes

const express = require('express');

const morgan = require('morgan');

const router = require('./router/notes.router');

const app = express();

app.use(morgan('dev'));

app.use(express.static('public'));
app.use('/api', router);


app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});

