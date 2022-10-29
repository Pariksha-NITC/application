const express = require('express');
const router = express.Router();
const {executeQuery} = require('./helpers');

router.get('/', async(req,res) => {
	const query = `SELECT * FROM quiz WHERE quizid IN(SELECT quizid FROM studentquiz WHERE studentid='${req.cookies.cookie}');`;
	const logMessage = 'Quizzes displayed to student';
	const quizzes = await executeQuery(query,logMessage)
	res.render('studentHome', {layout: null, quizArray:quizzes});
	/*console.log(quizzes);
	for(let quiz of quizzes)
	{
		console.log(qui)
	}
	res.send(msg);*/  
});

router.post('/addQuiz', async(req,res) => {
	let query = `SELECT * FROM quiz WHERE quizid='${req.body.qzcode}';`;
	let logMessage = 'User trying to add quiz';
	let quizzes = await executeQuery(query,logMessage)
	if(quizzes && quizzes[0].passkey === req.body.qzpwd)
	{
		query = `INSERT INTO studentquiz(studentid,quizid) VALUES ('${req.cookies.cookie}','${req.body.qzcode}');`;
		logMessage = 'Quiz added to view';
		await executeQuery(query,logMessage);
		res.redirect(303,'/student'); 
	}
	else
		res.render("Can't be added");
	
})

module.exports = router;