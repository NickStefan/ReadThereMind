var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { cache: false, title: 'ReadThereMind' });
});

module.exports = router;
