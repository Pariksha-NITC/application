const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {teacherProtected} = require('../utils');

router.get('/', teacherProtected, async(req,res) => {
	const quizzes = await db.any('SELECT * FROM quiz WHERE TeacherId=$1',[req.session.userID]);
	const logMessage = 'Quizzes displayed to student';
	console.log(quizzes);
	//const quizzes = await executeQuery(query,logMessage)
	res.render('teacherHome', {quizArray:quizzes});
	/*console.log(quizzes);
	for(let quiz of quizzes)
	{
		console.log(qui)
	}
	res.send(msg);*/ 
});

router.post('/createQuiz', teacherProtected, async(req,res) => {
	res.render('createQuiz');
})

router.post('/createQuestions', teacherProtected,async(req,res) => {
	let qtitle = req.body.qtitle;
	let duration = req.body.duration;
	let marks = req.body.marks;
	let passkey = req.body.passkey;
	let instructions = req.body.instructions;
	console.log('alertbvdhvhfd');
	await db.none('INSERT INTO quiz(quizname,duration,totalmarks,passkey,instructions,userId) VALUES ($1,$2,$3,$4,$5)', [qtitle,duration,marks,passkey,{instructions}]);
	res.send('hello');
})

module.exports = router