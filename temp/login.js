const express = require('express');
const router = express.Router();
const {executeQuery} = require('./helpers');

router.get('/login',(req,res) => {
	res.render('login',{ layout: null });
})

router.post('/login',async(req,res) => {
	//if(req.cookies.cookie == )
	//res.send('Already logged in');
	let query = `SELECT * FROM login WHERE userid='${req.body.userID}';`;
	let logMessage = 'User trying to log in';
	let queryOutArrFromLogin = await executeQuery(query,logMessage)
	//console.log(msg);
	if(queryOutArrFromLogin)
	{
		if(queryOutArrFromLogin[0].password === req.body.password)
		{
			res.cookie('cookie', `${req.body.userID}`);
			query = `SELECT * FROM userdetails WHERE userid='${req.body.userID}';`;
			logMessage = 'User trying to log in';
			let Users = await executeQuery(query,logMessage)
			//console.log(Roles);
			if(Users[0].role === 'student')
				res.redirect(303,'/student')
			else
			res.send('Successful');
		}
		else
		{
			res.render('login',{layout:null,wrong:true});
		}
	}
	else
	{
		res.render('login',{layout:null,wrong:true});
	}
	
})

router.get('/logout',(req,res) => {
	//res.send(req.cookies.cookie)
	//res.render('login',{ layout: null });
	res.clearCookie('cookie')
	res.render('login',{ layout: null });
})

module.exports = router;