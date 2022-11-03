var express = require('express');
var router = express.Router();
let {timer} = require('../utils');
let {beautifyTime} = require('../utils')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
