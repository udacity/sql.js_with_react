var express = require('express');
var fs = require('fs');
var router = express.Router();

var parch = fs.readFileSync('dbs/parch.sql').toString();

router.all('/tables', function(req, res, next) {
  req.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
    .then(result => {
      res.json({tables: result.rows.map(row => row.table_name)});
    }).catch(err => {
      err.status = 500;
      next(err);
    });
});

router.all('/initdb', function(req, res, next) {
  // In the future, posting the desired db might be required somehow; ie {"db":"parch"}
  req.query("drop owned by temp cascade;")
    .then(function(result) {
      return req.query(parch);
    }).then(function(result) {
      res.json({ok:1});
    }).catch(err => {
      err.status = 500;
      next(err);
    });
});

router.post('/query', function(req, res, next) {
  req.query(req.body.query)
    .then(result => {
      res.json(result);
    }).catch(err => {
      err.status = 400;
      next(err);
    });
});

module.exports = router;
