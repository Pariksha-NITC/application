require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

if (process.env.NODE_ENV === "development") {
  //server that tells webpage of the modifications in code to trigger hot reload
  const livereload = require("livereload");
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, 'public'));

  // the actual trigger once nodemon reload is done
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');

var app = express();

if (process.env.NODE_ENV === "development") {
  //inject scripts into web pages to listen for hot reload
  const connectLivereload = require("connect-livereload");
  app.use(connectLivereload());
}

// session management
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
let redisClient = createClient({legacyMode: true});
redisClient.connect().catch(console.error);
app.use(
  session({
    store: new RedisStore({client: redisClient}),
    saveUninitialized: false,
    secret: process.env.APP_SECRET,
    resave: false,
    cookie: { maxAge: 60000 }
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
let handlebars = require('express-handlebars');
handlebars = handlebars.create({
    helpers: require('./handlebar'),
    defaultLayout : 'main',
    extname : '.hbs'
});
app.engine('.hbs',handlebars.engine)

// CORS
const cors = require("cors");
const { nextTick, ppid } = require('process');
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.APP_SECRET));
app.use(express.static(path.join(__dirname, 'public')));


// registering paths
app.use('/', indexRouter);
app.use('/',loginRouter);
app.use('/users', usersRouter);
app.use('/register',registerRouter);
app.use('/student',studentRouter);
app.use('/teacher',teacherRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
