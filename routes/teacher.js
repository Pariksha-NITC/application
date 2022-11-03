const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {teacherProtected} = require('../utils');

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
	let duration = req.body.duration;
	let marks = req.body.marks;
	let passkey = req.body.passkey;
	let instructions = req.body.instructions;
	if(req.body.qzid != null){
		await db.none('UPDATE quiz SET quizname=$1,duration=$2,totalmarks=$3,passkey=$4,instructions=$5 WHERE quizid=$6',[qtitle,duration,marks,passkey,instructions,req.body.qzid]);
		res.render('createQues',{qzid:req.body.qzid,qtitle:qtitle,duration:duration,marks:marks,passkey:passkey,instructions:instructions});
	}
	else{
		let x=await db.any('INSERT INTO quiz(quizname,duration,totalmarks,passkey,instructions,teacherid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING quizid', [qtitle,duration,marks,passkey,instructions,req.session.userID]);
		res.render('createQues',{qzid:x['quizid'],qtitle:qtitle,duration:duration,marks:marks,passkey:passkey,instructions:instructions});
	}	
})

router.post('/makeQuestions', teacherProtected,async (req,res) => {
	if(req.body.qtypes != null){
		let x=await db.any('INSERT  INTO question(quizid,duration,type,marks,feedback,fromprecision,toprecision,answers,options) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[req.body.qzid,req.body.duration,req.body.qtypes,req.body.marks,req.body.feedback,req.body.fromprecision,req.body.toprecision,req.body.answers,req.body.options]);
		x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
		res.render('createQues',{qzid:x[0]['quizid'],qtitle:x[0]['quizname'],duration:x[0]['duration'],marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
	
	}
	else{
		let x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
		res.render('createQues',{qzid:x[0]['quizid'],qtitle:x[0]['quizname'],duration:x[0]['duration'],marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
	}
})

module.exports = router