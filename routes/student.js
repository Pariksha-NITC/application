const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {studentProtected} = require('../utils');

router.get('/', studentProtected, async(req,res) => {
	console.log('Inside student');
	const quizzes = await db.any('SELECT * FROM quiz WHERE quizid IN(SELECT quizid FROM studentquiz WHERE studentid=$1)',[req.session.userID]);
	const logMessage = 'Quizzes displayed to student';
	console.log(quizzes);
	//const quizzes = await executeQuery(query,logMessage)
	res.render('studentHome', {quizArray:quizzes});
	/*console.log(quizzes);
	for(let quiz of quizzes)
	{
		console.log(qui)
	}
	res.send(msg);*/  
});

router.post('/addQuiz', studentProtected, async(req,res) => {
	try {
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
			res.send("Can't be added");
	}
	catch (e) {
		if (e instanceof QueryResultError && e.code === qrec.noData)
			res.send("Can't be added");
	 	else
	 		throw e;
	}
	
})

router.post('/viewQuiz', studentProtected, async(req,res) =>{
	let quizid = req.body.qzcode;
	let response = await db.one('SELECT status FROM studentquiz WHERE quizid=$1 AND studentid=$2',[req.body.qzcode,req.session.userID]);
	
	const quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[quizid]);
	let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);;
	quizDetails.instructor = instructor.name;
	//console.log(quizDetails)
	if(response.status == 'attempted')
		res.render('reviewHome',{quiz:quizDetails});
	else
		res.render('qhmp',{quiz:quizDetails})
})
router.post('/initiateAttempt',async(req,res) => {
	let qzcode = req.body.qzcode;
	req.session.qzcode = qzcode;
	await db.none("UPDATE studentquiz SET status='attempting' WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
	//let quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[quizid]);
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[qzcode]);
	req.session.qnNumberArr=new Array(questions.length);
	req.session.qnNumber=0;
	
	//req.session.qzcode = qzcode;
	let qnNumberArr = req.session.qnNumberArr;
	for(let i = 0;i<questions.length;i++)
	{
		qnNumberArr[i] = questions[i].qnid;
	}
	let question = await db.one('SELECT * FROM question WHERE quizid=$1 AND qnid=$2',[qzcode,qnNumberArr[0]]);
	req.session.question=question;
	console.log(qnNumberArr);
	res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber});
	//res.send("Successfully attempted");

})
router.post('/saveAndNavigate',async(req,res) => {
	console.log(req.body);
	let qnNumberArr = req.session.qnNumberArr;
	let qnum = req.session.qnNumber;
	let question = req.session.question;
	//console.log(question.qnid);
	//console.log(req.session.userID);
	let responses = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	/*if (req.session.userID)
	{	
		responses = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
		console.log(typeof responses)
	}
	else
	{
		console.log(timeout);
		res.redirect(303,'/logout');
	}	*/
	if(responses.length != 0)
	{
		console.log(responses);
		//console.log("yes");
		if(question.type == 'subjective')
			await db.none('UPDATE response SET response=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'mcq')
			await db.none('UPDATE response set options=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'msq')
			await db.none('UPDATE response set options=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
	}
	else
	{
		if(question.type == 'subjective')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'mcq')
		{
			//console.log(typeof req.body.ans);
			//console.log(req.body.ans);
			await db.none('INSERT INTO response(qnid,studentid,options) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'msq')
		{
			await db.none('INSERT INTO response(qnid,studentid,options) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);

		}
		/*console.log("no");*/
	}
	qnum = parseInt(req.body.toQnum);
	if(qnum == -1)
		qnum=0;
	qnum = qnum % qnNumberArr.length
	 
	//res.send("Successfully attempted");
	req.session.qnNumber=qnum;
	//console.log(qnNumberArr);
	//res.send("Successfully reached");
	question = await db.one('SELECT * FROM question WHERE qnid=$1',[qnNumberArr[qnum]]);
	req.session.question=question;
	//console.log(question.options);
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[question.quizid]);
	responses = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	if(responses.length != 0)
	{
		console.log(responses[0]);
		//console.log("yes");
		let ans;
		if(question.type == 'subjective')
		{
			ans = responses[0].response;			
		}
		else if(question.type == 'mcq')
			ans = String((responses[0].options)[0]);
		else if(question.type == 'msq')
			ans = responses[0].options;
		console.log(ans);
		res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber,ans:ans});
	}
	else
	{
		res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber,ans:null});
		/*console.log("no");*/
	}
	
});
router.post('/saveAndEnd',async(req,res) => {
	console.log(req.body);
	let qnNumberArr = req.session.qnNumberArr;
	let qnum = req.session.qnNumber;
	let question = req.session.question;
	let responses = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	if(responses.length != 0)
	{
		if(question.type == 'subjective')
			await db.none('UPDATE response SET response=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'mcq')
			await db.none('UPDATE response set options=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'msq')
			await db.none('UPDATE response set options=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
	}
	else
	{
		if(question.type == 'subjective')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'mcq')
		{
			await db.none('INSERT INTO response(qnid,studentid,options) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'msq')
		{
			await db.none('INSERT INTO response(qnid,studentid,options) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);

		}
	}
	await db.none("UPDATE studentquiz SET status='attempted' WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
	//res.send("Attempt has been recorded");
	//res.redirect(303,'/student');
	const quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[question.quizid]);
	let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);;
	quizDetails.instructor = instructor.name;
	res.render('reviewHome',{quiz:quizDetails});
});


module.exports = router;