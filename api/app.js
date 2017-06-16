var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Promise = require('bluebird');

const pg = require('pg');
const db = new pg.Pool({
  user: 'temp', //env var: PGUSER
  database: 'temp', //env var: PGDATABASE
  password: 'temp', //env var: PGPASSWORD
  host: 'db', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
});

var api = require('./routes/api');

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req,res,next) {
    req.db = db;
    req.querydb = Promise.promisify(db.query, {context: db});
    next();
});

app.use('/', api);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    err: err.stack
  });
});

module.exports = app;
