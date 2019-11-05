//jshint esversion:6
//dependencies
//session branch
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//initialize an express server and call it app
let app = express()

//Setting up everything we need
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:'our little secret',
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

// encrypting the database with AES
// userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:['password']});
//Connect the mongoose database using the new url parser flag
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser:true})

// A schema to be followed by documents in a collection
const userSchema = mongoose.Schema({
  email:String,
  password:String
});


userSchema.plugin(passportLocalMongoose);

//A collection in the userDB database
const User = mongoose.model('user', userSchema)

// using passport-local-mongoose
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.set('useCreateIndex', true);

//home route
app.get('/', function(req, res){
  res.render('home');
})

//login route
app.get('/login', function(req, res){
  res.render('login');
})

//register route
app.get('/register', function(req, res){
  res.render('register');
})

//secrets route
app.get('/secrets',function(req,res){
  if(req.isAuthenticated()){
    res.render('secrets');
  }else{
    res.redirect('/login')
  }
});

//post using the register route (creating a new user)
app.post('/register', function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect('/register')
    }else{
      passport.authenticate('local')(req,res,function(){
        res.redirect('/secrets')
      })
    }
    }
  )
});

// login route
app.post('/login', function(req,res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate('local')(req,res,function(){
        res.redirect('/secrets');
      })
    }
  })
});

app.get('/logout',function(req,res){
  req.logout();
  res.redirect('/');
})




app.listen(3000, function(req,res){
  console.log('you are connected')
})
