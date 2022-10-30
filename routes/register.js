const express = require('express');
const router = express.Router();
const {db, QueryResultError, qrec} = require('../db');
const bcrypt = require('bcrypt');


const {executeQuery} = require('../helpers');

router.get('/', (req,res) => {
	res.render('registration');
});

router.post('/', async (req,res) => {
	let userID = req.body.uid;
	let passwd = req.body.pwd;
	let role = req.body.role;
	try {
		await db.none('SELECT userid from login where userid=$1', [userID]);
		const hashedPasswd = await bcrypt.hash(passwd, parseInt(process.env.SALT_ROUNDS));
		await db.none('INSERT INTO login(userid,password,loggedin) VALUES ($1,$2,FALSE)', [userID, hashedPasswd]);
		await db.none('INSERT INTO userdetails(userid,role) VALUES ($1,$2)', [userID,role]);
		console.log('User successfully added');
		res.send("You have successfully registered");
	}
	catch(e) {
		if (e instanceof QueryResultError && e.code === qrec.notEmpty)
	 		res.render('registration',{taken:true});
	 	else
	 		throw e;
	}
});

module.exports = router;
