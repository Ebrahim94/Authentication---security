//jshint esversion:6
//dependencies
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

//Connect the mongoose database using the new url parser flag
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser:true})

// A schema to be followed by documents in a collection
const userSchema = mongoose.Schema({
  email:String,
  password:String
});

// encrypting the database with AES
const secret = 'thisisoursecret.'
userSchema.plugin(encrypt, {secret:secret, encryptedFields:['password']});

//A collection in the userDB database
const User = mongoose.model('user', userSchema)

//initialize an express server and call it app
let app = express()

//Setting up ejs and allowing the express server to use bodyParser
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

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

//post using the register route (creating a new user)
app.post('/register', function(req, res){

  //adding a document in the user collection
  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  })

  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render('secrets')
    }
  })
});

app.post('/login', function(req,res){

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username, password:password}, function(err, found){
    if(!err){
      if(found){
        if(found.password === password){
          res.render('secrets')
        }
        }
    }else
    {console.log(err)}
  })
})


app.listen(3000, function(req,res){
  console.log('you are connected')
})
