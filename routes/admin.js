const express = require('express');
const router = express.Router();
const {db, QueryResultError, qrec} = require('../db');
const bcrypt = require('bcrypt');
const {adminProtected} = require('../utils');
const Redis = require("ioredis");

router.get('/', adminProtected, function(req, res, next){
  res.render('adminHome')
});


router.get('/adduser', adminProtected, function (req,res,next) {
  res.render('adminAddUser')
});

router.get('/approveapps', adminProtected, async function (req,res,next) {
  let data = await db.any('SELECT * FROM userdetails WHERE approved=FALSE');
  let apps = [];
  data.forEach((user)=> {
      user.role = user.role.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
      apps.push({'userID': user.userid, 'name': user.name, 'role':user.role, 'email':user.email})
  })
  res.render('adminApproveApps', {apps: apps});
});

router.get('/getapps', adminProtected, async function (req,res,next) {
  let data = await db.any('SELECT * FROM userdetails WHERE approved=FALSE');
  let apps = [];
  data.forEach((user)=> {
      user.role = user.role.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
      apps.push({'userID': user.userid, 'name': user.name, 'role':user.role, 'email':user.email})
  })
  res.json({'users': apps});
});

router.post('/approveapp', adminProtected, async function (req,res,next) {
  let userID = req.body.userID;
  let approved = req.body.approved;
  try {
    user = await db.one('SELECT * from userdetails where userID=$1', [userID]);
    if (approved) {
      await db.none('UPDATE userdetails SET approved=TRUE where userID=$1', [userID]);
    }
    else {
      await db.none('DELETE from userdetails where userID=$1', [userID]);
    }
    res.status(200).json({'message':"DONE"});
  }
  catch(e) {
    if (e instanceof QueryResultError && e.code === qrec.noData)
       res.status(400).json({'message':"INVALID"});
     else
       throw e;
  }
});

router.get('/removeuser', adminProtected, function (req,res,next) {
  res.render('adminRemoveUser')
});

router.post('/getuser', adminProtected, async function(req, res, next){
    let userID = req.body.userID;
    try {
      users = await db.many('SELECT * from userdetails where userID=$1', [userID])
      let data = [];
      users.forEach((user)=> {
        if (user.role !== 'admin'){
          user.role = user.role.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
          data.push({'userID': user.userid, 'name': user.name, 'role':user.role, 'email':user.email})
        }
      })
      if (data.length === 0) {
	 		  res.status(400).json({'message':"ADMIN"});
      } 
      else {
        res.json({'users':data});
      }
    }
    catch(e) {
      if (e instanceof QueryResultError && e.code === qrec.noData)
	 		  res.status(400).json({'message':"INVALID"});
	 	  else
	 		  throw e;
    }
});

router.post('/removeuser', adminProtected, async function(req, res, next){
  let userID = req.body.userID;
  try {
    await db.none('DELETE FROM login where userID=$1', [userID])
    let redisClient = new Redis();
    let sessKeys = await redisClient.zrangebyscore(userID, '0', '+inf');
    sessKeys.forEach(async key => {
      redisClient.del(key)
    });
    redisClient.del(userID);
    res.status(200).send('SUCCESS');
  }
  catch(e) {
    throw e;
  }

});


router.post('/adduser', adminProtected, async (req,res) => {
	let userID = req.body.uid;
	let passwd = req.body.pwd;
	let role = req.body.role;
	try {
		await db.none('SELECT userid from login where userid=$1', [userID]);
		const hashedPasswd = await bcrypt.hash(passwd, parseInt(process.env.SALT_ROUNDS));
		await db.none('INSERT INTO login(userid,password,loggedin) VALUES ($1,$2,FALSE)', [userID, hashedPasswd]);
		await db.none('INSERT INTO userdetails(userid,role) VALUES ($1,$2)', [userID,role]);
		console.log('User successfully added');
		res.status(200).json({'message':"SUCCESS"});
	}
	catch(e) {
		if (e instanceof QueryResultError && e.code === qrec.notEmpty)
	 		res.status(400).json({'message':"TAKEN"});
	 	else
	 		throw e;
	}
});


module.exports = router