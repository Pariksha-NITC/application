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
		duration = req.body.duration1 * 60 * 1000;
		await db.none('UPDATE quiz SET quizname=$1,duration=$2,totalmarks=$3,passkey=$4,instructions=$5 WHERE quizid=$6',[qtitle,duration,marks,passkey,instructions,req.body.qzid]);
		duration = duration / (60 * 1000) ; 	
		res.render('createQues',{qexistence: "false",questions:questions,qzid:req.body.qzid,qtitle:qtitle,duration1:duration,marks:marks,passkey:passkey,instructions:instructions});
	}
	else{
		let x=await db.any('INSERT INTO quiz(quizname,duration,totalmarks,passkey,instructions,teacherid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING quizid', [qtitle,duration,marks,passkey,instructions,req.session.userID]);
		duration = duration / (60 * 1000) ;
		res.render('createQues',{qexistence: "false",questions:questions,qzid:x[0]['quizid'],qtitle:qtitle,duration1:duration,marks:marks,passkey:passkey,instructions:instructions});
	}	
})

router.post('/makeQuestions', teacherProtected,async (req,res) => {
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	let dur = x[0]['duration'] / (60 * 1000) ;
	res.render('createQues',{qexistence: "false",questions:questions,qzid:x[0]['quizid'],qtitle:x[0]['quizname'],duration1:dur,marks:x[0]['totalmarks'],passkey:x[0]['passkey'],instructions:x[0]['instructions']});
})

router.post('/evaluate',async (req,res) => {
	qzcode = req.body.qzcode;
	evaluate(qzcode);
})

router.post('/createQues',teacherProtected,async (req,res) => {
	if(req.body.qexistence == 'true'){
		let x=await db.any('UPDATE question SET quizid=$1,duration=$2,type=$3,marks=$4,feedback=$5,fromprecision=$6,toprecision=$7,question=$8,answers=$9,options=$10 WHERE qnid=$11',[req.body.qzid,req.body.duration,req.body.qtypes,req.body.marks,req.body.feedback,req.body.fromprecision,req.body.toprecision,req.body.question,req.body.answers,req.body.options,req.body.qnid]);
		let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
		x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]);
		let y = await db.any('SELECT * FROM question where qnid=$1',[req.body.qnid]);
		x = await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
		let dur = x[0]['duration'] / (60 * 1000) ;
		res.render('createQues',{questions:questions,
		qzid:x[0]['quizid'],
		qnid:req.body.qnid,
		qtitle:x[0]['quizname'],
		duration1:dur,
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
	}
	else{
		let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
		let x=await db.any('INSERT  INTO question(quizid,duration,type,marks,feedback,fromprecision,toprecision,question,answers,options) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING qnid',[req.body.qzid,req.body.duration,req.body.qtypes,req.body.marks,req.body.feedback,req.body.fromprecision,req.body.toprecision,req.body.question,req.body.answers,req.body.options]);
		let qnid=x[0]['qnid'];
		x=await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
		let y = await db.any('SELECT * FROM question where qnid=$1',[qnid]);
		res.status(400).json({'qnid':qnid});
	}
})

router.post('/queryQuestions',teacherProtected,async (req,res) => {
	let qNumber = req.body.qnid;
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let y = await db.any('SELECT * FROM question where qnid=$1',[qNumber]);
	let x = await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	let dur = x[0]['duration'] / (60 * 1000) ;
	res.render('createQues',{questions:questions,
	qzid:x[0]['quizid'],
	qnid:qNumber,
	qtitle:x[0]['quizname'],
	duration1:dur,
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
})

router.post('/createPage',teacherProtected, async (req,res)=>{
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	let x = await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	let dur = x[0]['duration'] / (60 * 1000) ;
	res.render('createQues',{questions:questions,
		qzid:x[0]['quizid'],
		
		qtitle:x[0]['quizname'],
		duration1:dur,
		marks:x[0]['totalmarks'],
		passkey:x[0]['passkey'],
		instructions:x[0]['instructions'],
		qexistence: "false",
		
		});
})

router.post('/deleteQuestion',teacherProtected,async (req,res)=>{
	if(req.body.qnid){
		let x=await db.any('DELETE FROM question WHERE qnid=$1',[req.body.qnid]);
	}
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[req.body.qzid]);
	x = await db.any('SELECT * from quiz where quizid=$1',[req.body.qzid]); 
	let dur = x[0]['duration'] / (60 * 1000) ;
	res.render('createQues',{questions:questions,
		qzid:x[0]['quizid'],
		
		qtitle:x[0]['quizname'],
		duration1:dur,
		marks:x[0]['totalmarks'],
		passkey:x[0]['passkey'],
		instructions:x[0]['instructions'],
		qexistence: "false",
		
		});
})

router.get('/evaluatequestions', teacherProtected, async (req,res) => {
	if (req.query.quizid) {
		let quiz = await db.one('SELECT * FROM quiz where quizid=$1', [req.query.quizid]);
		let question,quesNo;
		quizQuestions = await db.many('SELECT * FROM question WHERE quizid=$1 ORDER BY qnid', [req.query.quizid]);

		if (req.query.quesno) {
			if (req.query.quesno <= quizQuestions.length && req.query.quesno >= 1)
				question = quizQuestions[req.query.quesno - 1]
			else {
				return res.status(400).json({'message': 'BADQNO'})
			}
			quesNo = req.query.quesno;
		}
		else {
			question = quizQuestions[0];
			quesNo = 1;
		}
		
		let response, respNo;
		if (req.query.studid){
			response = await db.one('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.query.studid]);
			respNo = (await db.one('SELECT COUNT(*) FROM response where qnid=$1 AND responseid<=$2', [question.qnid, response.responseid])).count;
		}
		else {
			quesResponses = await db.many('SELECT * FROM response WHERE qnid=$1 ORDER BY responseid',[question.qnid]);
			if (req.query.respno){
				respNo = req.query.respno;
				if (req.query.respno <= quesResponses.length && req.query.respno >= 1)
					response = quesResponses[req.query.respno - 1]
				else {
					return res.status(400).json({'message': 'BADRNO'})
				}
			}
			else {
				response = quesResponses[0];
				respNo = 1;
			}
		}
		let ans;
		if(question.type == 'subjective'){
			if((response.response).length != 0)
				ans = (response.response)[0];
			else
				ans = null;	
		}
		else if(question.type == 'mcq')
		{
			if((response.response).length != 0)
				ans = String((response.response)[0]);
			else
				ans = null;
		}
		else if(question.type == 'msq')
			ans = response.response;


		student = await db.one("SELECT * FROM userdetails WHERE userid=$1", [response.studentid])

		duration_minutes = Math.floor(response.duration/60000)
		duration_seconds = Math.floor(response.duration/1000) -  duration_minutes*60

		return res.render('teacherEvaluate',{
			quizid:req.query.quizid,
			numQuestions:quizQuestions.length,
			question:question,qnNumber:quesNo,
			respNumber: respNo,ans:ans,
			marks:response.marksawarded,
			feedback: response.feedback,
			comment:response.comment,
			numResponses: quesResponses.length,
			instructions:quiz.instructions,
			student: {id: student.userid, name: student.name}, 
			duration: {min: duration_minutes, sec: duration_seconds}
		});
	}
	// else{
	// 	res.render('quizAttempt',{layout:null,qzcode:qzcode,numiter:qnids.length,question:question,currentQnNumber:qnum,ans:null});		
	// }
});

router.post('/evaluatequestions', teacherProtected, async (req, res, next) => {
	let marks = parseInt(req.body.marks);
	let feedback = req.body.feedback;
	let correct = req.body.correct;
	let quizid = req.body.quizid;
	let quesno = req.body.quesno;
	let respno = req.body.respno;
	if (!correct)
		marks = 0;
	let stat = await db.tx(async t => {
		const questionsList = await db.many('SELECT * from question where quizid=$1', [quizid]);
		if (quesno < 1 || quesno > questionsList.length)
			return {'message': 'BADQNO'};
		const question = questionsList[quesno-1];

		const respList = await db.many('SELECT * from response where qnid=$1', [question.qnid]);
		if (respno < 1 || respno > respList.length)
			return {'message': 'BADRNO'};
		const response = respList[respno-1];
		
		await db.none('UPDATE response set marksawarded=$1, feedback=$2 where responseid=$3', [marks, feedback, response.responseid]);
		return {'message': 'OK'}
	});

	if (stat.message === 'OK')
		res.status(200).json(stat);

	else
		res.status(400).json(stat);
});


module.exports = router