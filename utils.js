const {db} = require('./db')

function verifyRole(req, res, next, expectedRoles) {
    // console.log(req.session);
    if (expectedRoles.includes(req.session.role))
        return next();
    else {
        console.log('session invalid');
        res.redirect('/login');
    }
}





function checkTime(req, res, next){
    let startTime = req.session.startTime;
    const quizTime = req.session.quizDuration;
    
    let currTime = Date.now();
    let buff = process.env.BUFFER
    console.log(currTime-startTime, quizTime, "jhggj");
    if(currTime-startTime > quizTime){
        
        
        db.none("UPDATE studentquiz SET status='attempted' WHERE studentid=$1 AND quizid=$2",[req.session.userID,req.session.qzcode]);
	//res.send("Attempt has been recorded");
	//res.redirect(303,'/student');
    //console.log("hi");
        res.redirect('/student/');
    }
    else
        return next();



}
class Time{
    hour;
    minute;
    sec;
}

function timer(totalTime, startTime){
    let currTime = Date.now();
    let timeElapsed = currTime - startTime;

    let left = new Time();

    left.hour = 0;
    left.minute = 0;
    left.sec = 0;
    let timeRemainingSec = (totalTime - timeElapsed)/1000 + 1;

    if(timeRemainingSec <= 0){
        return left;
    }
    

    left.hour = Math.floor(timeRemainingSec / (60 * 60));
    left.minute = Math.floor(timeRemainingSec / 60 - left.hour * 60);
    left.sec = Math.floor(timeRemainingSec - left.minute * 60 - left.hour * 60 * 60); 

    return left;

}


function beautifyTime(hr, min, sec){
    let prettyTime = "";
    prettyTime += (hr.toString().padStart(2, "0")) + ":";
    prettyTime += (min.toString().padStart(2, "0")) + ":";
    prettyTime += (sec.toString().padStart(2, "0"));
    return prettyTime;
}


const adminProtected = (req, res, next)=>verifyRole(req, res, next, ['admin']);
const studentProtected = (req, res, next)=>verifyRole(req, res, next, ['student']);
const teacherProtected = (req, res, next)=>verifyRole(req, res, next, ['teacher','toBeVerified']);
const taProtected = (req, res, next)=>verifyRole(req, res, next, ['ta']);
const multipleProtected = (req, res, next, expectedRoles)=>verifyRole(req, res, next, expectedRoles);


module.exports= {
    adminProtected: adminProtected,
    studentProtected: studentProtected,
    teacherProtected: teacherProtected,
    taProtected: taProtected,
    multipleProtected: multipleProtected,
    timer: timer,
    beautifyTime: beautifyTime,
    checkTime: checkTime
}
