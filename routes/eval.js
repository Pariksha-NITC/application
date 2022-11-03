let marks;
if(question.type == 'subjective')
{	
	if(req.body.ans == question.correctanswer[0])
		marks = question.marks;
	else
		marks = -1*penalty;
	await db.none('UPDATE response set marksawarded=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,marks]);
	req.session.marks += marks;
}
else if(question.type == 'mcq')
{
	if(req.body.ans == question.correctanswer[0])
		marks = question.marks;
	else
		marks = -1*penalty;
	await db.none('UPDATE response set marksawarded=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,marks]);
	req.session.marks += marks;
}
else if(question.type == 'msq')		
{
	if(question.correctanswer.length != req.body.ans)
		marks = -1*penalty;
	else
	{
		for(let i = 0;i<req.body.ans.length;i++)
		{
			if(req.body.ans[i] != question.correctanswer[i])
			{
				marks = -1*penalty;
				break;
			}
		}
		if(i == req.body.ans.length)
			marks = question.marks;
	}
	await db.none('UPDATE response set marksawarded=$3 WHERE qnid=$1 AND studentid=$2',[qnNumberArr[qnum],req.session.userID,marks]);
	req.session.marks += marks;
}