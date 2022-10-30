const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// QueryResultError error handling
const {db, QueryResultError, qrec} = require('../db');

const {executeQuery} = require('../helpers');

router.get('/login',(req,res) => {
	// if (req.session.userID) {
	// 	console.log(req.session.userID);
	// 	res.send("Successful");
	// }
	// else
		res.render('login',{ layout: null });
})

router.post('/login',async(req,res) => {	
	//if(req.cookies.cookie == )
	//res.send('Already logged in');
	//const query = `SELECT * FROM login WHERE userid='${req.body.userID}';`;
	const logMessage = 'User trying to log in';
	let userID = req.body.userID;
	let passwd = req.body.password;
	try {
	 	let user = await db.one('SELECT userid,password FROM login WHERE userid=$1', [userID]);
	 	let userRole = await db.one('SELECT role FROM userdetails WHERE userid=$1', [userID]);
		const match = await bcrypt.compare(passwd, user.password);
	 	if (match) {
	 		var session = req.session;
	 		session.userID=userID;
	 		session.role=userRole;
	 		console.log(req.session);
	 		console.log('Log in successful');
			await db.none('UPDATE login SET loggedin=TRUE WHERE userid=$1', [userID]);
			if(userRole.role === 'student')
				res.redirect(303,'/student')
		 	else
		 		res.send('Successful');
	 	}
	 	else {
	 		res.render('login',{layout:null,wrong:true});
	 	}
	 }
	 catch(e) {
	 	if (e instanceof QueryResultError && e.code === qrec.noData)
	 		res.render('login',{layout:null,wrong:true});
	 	else
	 		throw e;
	 }
	
	
})

router.get('/logout', async(req,res) => {
	await db.none('UPDATE login SET loggedin=FALSE WHERE userid=$1', [req.session.userID]);
	req.session.destroy();
	console.log("logged out successfully");
	res.redirect(303,'/login');
})

module.exports = router;