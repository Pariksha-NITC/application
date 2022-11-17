const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {studentProtected} = require('../utils');
const {checkTime, checkAttemptStatus} = require('../utils')
const {secToPrettyTime, beautifyTime} = require('../utils')


router.get('/', studentProtected, async(req,res) => {
	console.log('Inside student');
	const quizzes = await db.any('SELECT * FROM quiz WHERE quizid IN(SELECT quizid FROM studentquiz WHERE studentid=$1)',[req.session.userID]);
	const logMessage = 'Quizzes displayed to student';
	// console.log(logMessage, quizzes);
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

router.get('/viewQuiz', studentProtected, async(req,res) =>{
	let quizid = req.query.qzcode;
	let response = await db.one('SELECT status FROM studentquiz WHERE quizid=$1 AND studentid=$2',[quizid,req.session.userID]);
	
	let quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[quizid]);
	let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);;
	quizDetails.instructor = instructor.name;
	//console.log(quizDetails)
	quizDetails.duration = Math.floor(quizDetails.duration / 60000);
	if(response.status == 'attempted')
	{	
		let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);
		quizDetails.attemptmarks = await db.one('SELECT SUM(marksawarded) FROM response,question WHERE studentid=$1 AND quizid=$2 AND response.qnid=question.qnid',[req.session.userID,quizid]);
		quizDetails.attemptmarks = quizDetails.attemptmarks.sum
		// console.log(quizDetails.attemptmarks)
		return res.render('reviewHome',{quiz:quizDetails});
	}
	else
		return res.render('qhmp',{quiz:quizDetails})
})

router.post('/initiateAttempt',async(req,res) => {
	let qzcode = req.body.qzcode;
	req.session.qzcode = qzcode;

	// check attempt status
	let statusRes = await db.one("SELECT status FROM studentquiz WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
	if (statusRes.status === 'attempted')
		return res.status(400).send('cannot reattempt');
	else if (statusRes.status !== 'attempting') {
		await db.none("UPDATE studentquiz SET status='attempting' WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
		req.session.startTime = Date.now();
	}

	//let quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[quizid]);
	let questions = await db.any('SELECT qnid FROM question WHERE quizid=$1',[qzcode]);
	if(!questions || questions.length==0)
	{
		res.redirect(303,'/student');
		return;
	}
	let quizTime = await db.one('SELECT Duration FROM quiz WHERE quizid=$1', [qzcode]);
	req.session.qnNumberArr=new Array(questions.length);
	req.session.qnNumber=0;
	req.session.quizDuration = quizTime.duration;
	
	req.session.startQuestTime = Date.now();
	
	
	// console.log(req.session.quizDuration);
	req.session.marks=0;
	//req.session.qzcode = qzcode;
	let qnNumberArr = req.session.qnNumberArr;
	for(let i = 0;i<questions.length;i++)
	{
		qnNumberArr[i] = questions[i].qnid;
	}
	let question = await db.one('SELECT * FROM question WHERE quizid=$1 AND qnid=$2',[qzcode,qnNumberArr[0]]);
	req.session.question=question;
	// console.log(qnNumberArr);
	// console.log(req.session.quizDuration);
	res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber, 
		quizTime:req.session.quizDuration, timeNow:req.session.startTime});
	//res.send("Successfully attempted");

	//Timer Starts here for first question
	

})

router.post('/saveAndNavigate',checkTime,async(req,res) => {
	// console.log(req.body);
	let qnNumberArr = req.session.qnNumberArr;
	let qnum = req.session.qnNumber;
	let question = req.session.question;

	let difference = Date.now() - req.session.startQuestTime;

	let duration;
	try {
		duration = await db.one('SELECT Duration FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	}
	catch(e) {
		duration = 0;
	}
	if (duration.duration == null)
		duration = 0;
	else
		duration = parseInt(duration.duration);

	if(isNaN(duration))
		duration = 0;
	
	console.log("hahahha",duration, difference);
	duration += difference;
	console.log("hahahha",duration, difference);

	

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
		// console.log(responses);
		//console.log("yes");
		if(question.type == 'subjective')
			await db.none('UPDATE response SET response=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'mcq')
			await db.none('UPDATE response set response=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'msq') {
			if (typeof req.body.ans == 'string') {
				req.body.ans = [req.body.ans]
			}
			await db.none('UPDATE response set response=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
	}
	else
	{
		if(question.type == 'subjective')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'mcq')
		{
			//console.log(typeof req.body.ans);
			//console.log(req.body.ans);
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'msq')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);

		}
		/*console.log("no");*/
	}
	await db.none('UPDATE response SET Duration=$3 WHERE qnid=$1 AND studentid=$2',
		[qnNumberArr[qnum],req.session.userID,duration]);
	qnum = parseInt(req.body.toQnum);
	if(qnum == -1)
		qnum=0;
	qnum = qnum % qnNumberArr.length
	 
	//res.send("Successfully attempted");
	req.session.qnNumber=qnum;
	req.session.startQuestTime = Date.now();
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
			if((responses[0].response) && (responses[0].response).length != 0)
				ans = (responses[0].response)[0];
			else
				ans=null			
		}
		else if(question.type == 'mcq')
		{
			if((responses[0].response) && (responses[0].response).length != 0)
				ans = String((responses[0].response)[0]);
			else
				ans=null
		}
		else if(question.type == 'msq')
			ans = responses[0].response;
		// console.log(ans);
		
		res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber,ans:ans,
			quizTime:req.session.quizDuration, timeNow:req.session.startTime});
	}
	else
	{
		res.render('quizAttempt',{layout:null,questions:questions,question:question,currentQnNumber:req.session.qnNumber,ans:null,
			quizTime:req.session.quizDuration, timeNow:req.session.startTime});
		/*console.log("no");*/
	}
	
});

router.post('/saveAndEnd',checkAttemptStatus,async(req,res) => {
	// console.log(req.body);
	let qnNumberArr = req.session.qnNumberArr;
	let qnum = req.session.qnNumber;
	let question = req.session.question;
	
	
	let difference = Date.now() - req.session.startQuestTime;

	let duration;
	try {
		duration = await db.one('SELECT Duration FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	}
	catch(e) {
		duration = 0;
	}
	if (duration.duration === null)
		duration = 0;
	else
		duration = parseInt(duration.duration);
	duration += difference;



	
	let responses = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[question.qnid,req.session.userID]);
	if(responses.length != 0)
	{
		console.log(responses);
		//console.log("yes");
		if(question.type == 'subjective')
			await db.none('UPDATE response SET response=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'mcq')
			await db.none('UPDATE response set response=ARRAY[$3] WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		else if(question.type == 'msq')
			await db.none('UPDATE response set response=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
	}
	else
	{
		if(question.type == 'subjective')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'mcq')
		{
			//console.log(typeof req.body.ans);
			//console.log(req.body.ans);
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,ARRAY[$3])',[qnNumberArr[qnum],req.session.userID,req.body.ans]);
		}
		else if(question.type == 'msq')
		{
			await db.none('INSERT INTO response(qnid,studentid,response) VALUES ($1,$2,$3)',[qnNumberArr[qnum],req.session.userID,req.body.ans]);

		}
		/*console.log("no");*/
	}

	await db.none('UPDATE response SET Duration=$3 WHERE qnid=$1 AND studentid=$2',
		[qnNumberArr[qnum],req.session.userID,duration]);

	await db.none("UPDATE studentquiz SET status='attempted' WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
	//res.send("Attempt has been recorded");
	//res.redirect(303,'/student');
	const quizDetails = await db.one('SELECT * FROM quiz WHERE quizid=$1',[question.quizid]);
	let instructor = await db.one('SELECT name FROM userdetails WHERE userid=$1',[quizDetails.teacherid]);;
	quizDetails.instructor = instructor.name;
	quizDetails.duration = Math.floor(quizDetails.duration / 60000);
	res.render('reviewHome',{quiz:quizDetails});
});

router.post('/navigate',async(req,res) => {
	console.log(req.body);
	let qzcode = req.body.qzcode;
	let qnum = parseInt(req.body.toQnum);
	
	//let respids =  await db.any('SELECT responseid,response.qnid FROM response,question WHERE question.qnid=response.qnid and quizid=$1 and studentid=$2',[qzcode,req.session.userID]);
	let qnids = await db.any('SELECT qnid FROM question WHERE quizid=$1',[qzcode]);
	if(qnum == -1)
		qnum=0;
	qnum = qnum % qnids.length;
	console.log(qnids);
	let response = await db.any('SELECT * FROM response WHERE qnid=$1 AND studentid=$2',[qnids[qnum].qnid,req.session.userID]);
	let question = await db.one('SELECT * FROM question WHERE qnid=$1',[qnids[qnum].qnid]);
	if(response && response.length != 0)
	{
		console.log(response[0]);
		//console.log("yes");
		let ans;
		if(question.type == 'subjective')
		{
			if((response[0].response) && (response[0].response).length != 0)
				ans = (response[0].response)[0];
			else
				ans = null;		
		}
		else if(question.type == 'mcq')
		{
			if((response[0].response) && (response[0].response).length != 0)
				ans = String((response[0].response)[0]);
			else
				ans = null;
		}
		else if(question.type == 'msq')
			ans = response[0].response;
		console.log(ans);
		res.render('quizReview',{layout:null,qzcode:qzcode,numiter:qnids.length,question:question,currentQnNumber:qnum,ans:ans});
	}
	else
	{
		res.render('quizAttempt',{layout:null,qzcode:qzcode,numiter:qnids.length,question:question,currentQnNumber:qnum,ans:null});
		/*console.log("no");*/
	}
});

module.exports = router;