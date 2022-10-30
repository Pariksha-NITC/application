function verifyRole(req, res, next, expectedRoles) {
    if (expectedRoles.includes(req.session.role))
        return next();
    else {
        console.log('session invalid');
        res.redirect('/login');
    }
}


const adminProtected = (req, res, next)=>verifyRole(req, res, next, ['admin']);
const studentProtected = (req, res, next)=>verifyRole(req, res, next, ['student']);
const teacherProtected = (req, res, next)=>verifyRole(req, res, next, ['teacher']);
const taProtected = (req, res, next)=>verifyRole(req, res, next, ['ta']);
const multipleProtected = (req, res, next, expectedRoles)=>verifyRole(req, res, next, expectedRoles);


module.exports= {
    adminProtected: adminProtected,
    studentProtected: studentProtected,
    teacherProtected: teacherProtected,
    taProtected: taProtected,
    multipleProtected: multipleProtected
}
