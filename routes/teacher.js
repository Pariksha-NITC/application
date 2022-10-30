const express = require('express');
const router = express.Router();
const {db} = require('../db');

router.get('/', function(req, res, next){
	res.send("Hello Teacher");
});

module.exports = router