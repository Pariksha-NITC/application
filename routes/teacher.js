const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {teacherProtected} = require('../utils');
const {evaluate} = require('./eval');

router.get('/', teacherProtected, async(req,res) => {
	const quizzes = await db.any('SELECT * FROM quiz WHERE TeacherId=$1 ORDER BY quizid',[req.session.userID]);
	const logMessage = 'Quizzes displayed to student';
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

router.post('/addQuizDetails', teacherProtected,async(req,res) => {
	let qtitle = req.body.qtitle;
	let duration = parseInt(req.body.duration) * 60 * 1000;
	let marks = req.body.marks;
	let passkey = req.body.passkey;
	let instructions = req.body.instructions;
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	if(req.body.qzid != null){
		await db.none('UPDATE quiz SET quizname=$1,duration=$2,totalmarks=$3,passkey=$4,instructions=$5 WHERE quizid=$6',[qtitle,duration,marks,passkey,instructions,req.body.qzid]);
		res.render('createQues',{qexistence: "false",questions:questions,qzid:req.body.qzid,qtitle:qtitle,duration:duration,marks:marks,passkey:passkey,instructions:instructions});
	}
	else{
		let x=await db.any('INSERT INTO quiz(quizname,duration,totalmarks,passkey,instructions,teacherid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING quizid', [qtitle,duration,marks,passkey,instructions,req.session.userID]);
		res.render('createQues',{qexistence: "false",questions:questions,qzid:x[0]['quizid'],qtitle:qtitle,duration:duration,marks:marks,passkey:passkey,instructions:instructions});
	}	
})

router.post('/makeQuestions', teacherProtected,async (req,res) => {
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	res.render('createQues',{qexistence: "false",questions:questions,qzid:x[0]['quizid'],qtitle:x[0]['quizname'],duration:x[0]['duration'],marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
})

router.post('/evaluate',async (req,res) => {
	qzcode = req.body.qzcode;
	evaluate(qzcode);
})

router.post('/createQues',teacherProtected,async (req,res) => {
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let x=await db.any('INSERT  INTO question(quizid,duration,type,marks,feedback,fromprecision,toprecision,question,answers,options) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[req.body.qzid,req.body.duration,req.body.qtypes,req.body.marks,req.body.feedback,req.body.fromprecision,req.body.toprecision,req.body.question,req.body.answers,req.body.options]);
	x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	res.render('createQues',{qexistence: "false",questions:questions,qzid:x[0]['quizid'],qtitle:x[0]['quizname'],duration:x[0]['duration'],marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
})

router.post('/queryQuestions',teacherProtected,async (req,res) => {
	let qNumber = req.body.qnid;
	console.log(qNumber);
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let y = await db.any('SELECT * FROM question where qnid=$1',[qNumber]);
	let x = await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	res.render('createQues',{questions:questions,
	qzid:x[0]['quizid'],
	qtitle:x[0]['quizname'],
	duration:x[0]['duration'],
	marks:x[0]['totalmarks'],
	passkey:x[0]['passkey'],
	instructions:x[0]['instructions'],
	qexistence: "true",
	question:y[0]['question'],
	duration:y[0]['duration'],
	type:y[0]['type'],
	marks:y[0]['marks'],
	options:y[0]['options'],
	feedback:y[0]['feedback'],
	answers:y[0]['answers'],
	fromprecision:y[0]['fromprecision'],
	toprecision:y[0]['toprecision']
	});
	console.log('hello2');
})
module.exports = router