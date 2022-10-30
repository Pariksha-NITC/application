const express = require('express');
const router = express.Router();
const {executeQuery} = require('./helpers');
router.get('/', (req,res) => {
	res.render('registration',{ layout: null });
});
router.post('/', (req,res) => {
	//res.send(req.body);
	const query = `INSERT INTO login(userid,password,loggedin) VALUES ('${req.body.uid}','${req.body.pwd}',TRUE);
	INSERT INTO userdetails(userid,role) VALUES ('${req.body.uid}','${req.body.role}');`;
	
	//${response.StudId},${response.ans},${response.marks},${response.feedback});`;
	const logMessage = 'User successfully added';
	executeQuery(query,logMessage);
	res.send("You have successfully registered");
});
module.exports = router;
