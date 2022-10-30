const express = require('express');
const { db } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');

router.get('/', async(req,res) => {
	console.log('Inside student');
	const quizzes = await db.any('SELECT * FROM quiz WHERE quizid IN(SELECT quizid FROM studentquiz WHERE studentid=$1)',[req.session.userID]);
	const logMessage = 'Quizzes displayed to student';
	console.log(quizzes);
	//const quizzes = await executeQuery(query,logMessage)
	res.render('studentHome', {layout: null, quizArray:quizzes});
	/*console.log(quizzes);
	for(let quiz of quizzes)
	{
		console.log(qui)
	}
	res.send(msg);*/  
});

router.post('/addQuiz', async(req,res) => {
	let quizzes = await db.any('SELECT * FROM quiz WHERE quizid=$1',[req.body.qzcode]);
	//let logMessage = 'User trying to add quiz';
	//let quizzes = await executeQuery(query,logMessage)
	if(quizzes && quizzes[0].passkey === req.body.qzpwd)
	{
		await db.none('INSERT INTO studentquiz(studentid,quizid) VALUES($1,$2)',[req.session.userID,req.body.qzcode]);
		logMessage = 'Quiz added to view';
		//await executeQuery(query,logMessage);
		res.redirect(303,'/student'); 
	}
	else
		res.render("Can't be added");
	
})

router.post('/viewQuiz',async(req,res) =>{
	let quizid = req.body.qzcode;
	const quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[quizid]);
	let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);;
	quizDetails.instructor = instructor.name;
	//console.log(quizDetails)
	res.render('qhmp',{layout:null,quiz:quizDetails})
})

module.exports = router;