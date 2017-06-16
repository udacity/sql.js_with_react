const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const fs = require('fs');

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

const parch = fs.readFileSync('dbs/parch.sql').toString();

const configFile = '/opt/sqlwidget/config';
let config = {};

router.all('/tables', function(req, res, next) {
  req.querydb("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
    .then(result => {
      res.json({tables: result.rows.map(row => row.table_name)});
    }).catch(err => {
      err.status = 500;
      next(err);
    });
});

router.all('/initdb', function(req, res, next) {
  // In the future, posting the desired db might be required somehow; ie {"db":"parch"}
  req.querydb("drop owned by temp cascade;")
    .then(function(result) {
      return req.querydb(parch);
    }).then(function(result) {
      res.json({ok:1});
    }).catch(err => {
      err.status = 500;
      next(err);
    });
});

router.get('/history', function(req, res, next) {
  let viewId = req.query.viewId;
  getConfig()
    .then(config => {
      if (config[viewId] && config[viewId].history) {
        res.json({query:config[viewId].history[0].query});
      } else {
        res.json({query: ""});
      }
    })
    .catch(err => {
      res.json({query: ""});
    })
});

router.post('/history', function(req, res, next) {
  saveHistory(req.body.viewId, req.body.query, false)
    .then(() => res.json({ok:1}))
    .catch(err => {
      err.status = 500;
      next(err);
    });
});

router.post('/query', function(req, res, next) {
  req.querydb(req.body.query)
    .tap(() => saveHistory(req.body.viewId, req.body.query, true)
                 .catch(e=>console.log("Failed to save config:", e)))
    .then(result => res.json(result))
    .catch(err => {
      if (!err.status) {
        err.status = 400;
      }
      next(err);
    });
});

function getConfig() {
  return new Promise(resolve => {
    readFile(configFile)
      .then(data => resolve(JSON.parse(data)))
      .catch(err => resolve({}));
  });
}

function saveHistory(viewId, query, executed) {
  getConfig()
    .then(config => {
      config[viewId] = config[viewId] || { };
      config[viewId].history = config[viewId].history || [ ];
      let history = config[viewId].history;
      let newRecord = {query, executed};
      if (history[0] && !history[0].executed) {
        history[0] = newRecord;
      } else {
        history.unshift(newRecord);
        history.length > 20 && history.pop();
      }
      return Promise.resolve(config);
    })
    .then(config => writeFile(configFile, JSON.stringify(config)));
}

module.exports = router;
