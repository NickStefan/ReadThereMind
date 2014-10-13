var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'API' });
});

router.post('/', function(req, res) {
	var results = req.body.search;
  res.json({results: results});
});

module.exports = router;