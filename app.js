let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let expressLayout  = require("express-ejs-layouts");
const mongodb = require('mongodb')
const mongoose = require('mongoose');
const session = require('express-session');
const nocache = require("nocache");
const { check, validationResult } = require('express-validator')
const ejs = require('ejs')

let adminRouter = require('./routes/admin');
let userRouter = require('./routes/user');
const { Product } = require('./models/productSchema');

try {
  
mongoose.connect("mongodb://Anju:1234@ac-udihzh8-shard-00-00.zodvl39.mongodb.net:27017,ac-udihzh8-shard-00-01.zodvl39.mongodb.net:27017,ac-udihzh8-shard-00-02.zodvl39.mongodb.net:27017/firstProject?ssl=true&replicaSet=atlas-qeg9v1-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0");
console.log("db connected")
} catch (error) {
  console.log(error.message)
}







var app = express();
app.use(nocache());

app.use(session({
  secret: 'secre-key',
  saveUninitialized: true,
  resave: true,
  cookie:{
    maxAge: 500000000
  }
}))

/*app.use(session({
  secret: "Secret key",
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 500000000
  }
}))*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//for accepting postform data

const bodyParser = require('express').json
app.use(bodyParser());
app.use(expressLayout);
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('Stylish-Magnifying-Glass-Plugin-SergeLand-Image-Zoomer'));

app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });




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
