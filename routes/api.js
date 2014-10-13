var express = require('express');
var router = express.Router();
var twitterMachine = require('../twitterHandler');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'API' });
});

router.post('/', function(req, res) {
  twitterMachine(req.body.search, function (data) {
    res.json(data);
  });
});

module.exports = router;