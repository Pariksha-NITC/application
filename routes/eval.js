const express = require('express');
const { db,  QueryResultError, qrec } = require('../db');
const router = express.Router();
const {executeQuery} = require('../helpers');
const {teacherProtected} = require('../utils');
async function evaluate(qzcode)
{
    let marks;
    let questions = await db.any('SELECT * FROM question WHERE quizid=$1',[qzcode]);
    for(let i=0;i<questions.length;i++)
    {
        let question = questions[i];
        let responses = await db.any('SELECT * FROM response WHERE qnid=$1',[question.qnid]);
        for(let j=0;j<responses.length;j++)
        {
            let response=responses[j];
            if(question.type == 'subjective')
            {	
                if(!response.response || (response.response).length == 0)
                    marks = 0
                else if((response.response)[0] == question.correctanswer[0])
                    marks = question.marks;
                else
                    marks = -1*question.penalty;
                
            }
            else if(question.type == 'mcq')
            {   
                if(!response.response || (response.response).length == 0)
                    marks = 0
                else if((response.response)[0] == question.correctanswer[0])
                    marks = question.marks;
                else
                    marks = -1*question.penalty;
                
            }
            else if(question.type == 'msq')		
            {
                if(!(response.response) || (response.response).length == 0)
                    marks = 0
                else if((question.correctanswer).length != (response.response).length)
                    marks = -1*question.penalty;
                else
                {
                    let k;
                    for(k = 0;i<(question.correctanswer).length;k++)
                    {
                        if((response.response)[k] != question.correctanswer[k])
                        {
                            marks = -1*question.penalty;
                            break;
                        }
                    }
                    if(k == (question.correctanswer).length)
                        marks = question.marks;
                }
                
            }
            await db.none('UPDATE response set marksawarded=$2 WHERE responseid=$1',[response.responseid,marks]);
        }
        //console.log(questions);
    }
}
module.exports.evaluate = evaluate;