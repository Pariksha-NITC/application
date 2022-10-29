const express = require('express')
const expressHandlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {executeQuery} = require('./helpers');
const dotenv = require('dotenv')
dotenv.config();


const app = express()
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }))

const credentials = require('../credentials')
app.use(cookieParser(credentials.cookieSecret));

app.engine('handlebars', expressHandlebars({
defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');





app.get('/', (req, res) => {
  res.send('Hello World!')
}) 

const registerRoutes = require('./register');
app.use('/register',registerRoutes);

const loginRoutes = require('./login');
app.use('/',loginRoutes);

app.use(async(req,res,next)=>{
	//console.log("Control reached inside");
	if(req.cookies.cookie)
	{
		const query = `SELECT * FROM login WHERE userid='${req.cookies.cookie}';`;
		const logMessage = 'User trying to log in';
		const msg = await executeQuery(query,logMessage)
		if(msg && msg[0].loggedin === true)
			next();
		else
			res.render('login',{layout:null})	
	}
	else
	res.render('login',{layout:null});
});

const studentRoutes = require('./student');
app.use('/student',studentRoutes);

app.get('/protectedRoute',(req,res)=>{
	res.send('Successfully reached');		
});
/*app.use('/student',(req,res) =>{
	res.status(404).send('Not found');
});*/

app.listen(port, () => {
  console.log(`Quiz app listening on port ${port}`)
})
