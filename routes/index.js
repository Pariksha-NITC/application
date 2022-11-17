var express = require('express');
var router = express.Router();
let {timer} = require('../utils');
let {beautifyTime} = require('../utils')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {layout: 'home'});
});

router.get('/members', function(req, res, next) {
  res.render('members', {layout: 'home'});
});

router.get('/about', function(req, res, next) {
  res.render('about', {layout: 'home'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {layout: 'home'});
});

router.get('/resources', function(req, res, next) {
  res.render('resources', {layout: 'home'});
});

module.exports = router;
