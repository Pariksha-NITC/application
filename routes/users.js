const db = require('../db');
var express = require('express');
var router = express.Router();
const {studentProtected} = require('../utils');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  // let conn = new DBConn;
  // await conn.connect();
  // let results = await conn.execute("SELECT * from login");
  let results = await db.any('SELECT * FROM login');
  // await conn.close();
  res.status(200).json(results);
})

router.get('/student', studentProtected, function(req,res){
  res.send("Hello Student");
});

module.exports = router;
