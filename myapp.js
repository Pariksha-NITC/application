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

const registerRoutes = require('./register');
app.use('/register',registerRoutes);

const studentRoutes = require('./student');
app.use('/student',studentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
}) 

app.get('/login',(req,res) => {
	res.render('login',{ layout: null });
})

app.post('/login',async(req,res) => {
	//if(req.cookies.cookie == )
	//res.send('Already logged in');
	const query = `SELECT * FROM login WHERE userid='${req.body.userID}';`;
	const logMessage = 'User trying to log in';
	const msg = await executeQuery(query,logMessage)
	//console.log(msg);
	if(msg)
	{
		if(msg[0].password === req.body.password)
		{
			res.cookie('cookie', `${req.body.userID}`);
			res.send('Successful');
		}
		else
		{
			res.render('login',{layout:null,wrong:true});
		}
	}
	else
	{
		res.render('login',{layout:null,wrong:true});
	}
	
})

app.get('/logout',(req,res) => {
	//res.send(req.cookies.cookie)
	//res.render('login',{ layout: null });
	res.clearCookie('cookie')
	res.render('login',{ layout: null });
})
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


app.get('/changePwd',(req,res)=>{
	res.send('Successfully reached');		
});

app.listen(port, () => {
  console.log(`Quiz app listening on port ${port}`)
})
