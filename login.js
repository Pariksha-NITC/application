const express = require('express');
const router = express.Router();
const {executeQuery} = require('./helpers');

router.get('/login',(req,res) => {
	res.render('login',{ layout: null });
})

router.post('/login',async(req,res) => {
	//if(req.cookies.cookie == )
	//res.send('Already logged in');
	const query = `SELECT * FROM login WHERE userid='${req.body.userID}';`;
	const logMessage = 'User trying to log in';
	const msg = await executeQuery(query,logMessage)
	//console.log(msg);
	if(msg)
	{
		if(msg[0].password === req.body.password)
		{
			res.cookie('cookie', `${req.body.userID}`);
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