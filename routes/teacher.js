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
	let x=await db.any('INSERT INTO quiz(quizname,duration,totalmarks,passkey,instructions,teacherid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING quizid', [qtitle,duration,marks,passkey,instructions,req.session.userID]);
	console.log(x['quizid']);
	res.render('createQuestions',{qid:x['quizid'],qtitle:qtitle,duration:duration,marks:marks,passkey:passkey,instructions:instructions});
})

router.post('/makeQuestions', teacherProtected,async (req,res) => {
	let x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	res.render('createQuestions',{qid:x[0]['quizid'],qtitle:x[0]['quizname'],duration:x[0]['duration'],marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
})
module.exports = router