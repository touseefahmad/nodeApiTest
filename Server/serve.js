var env = process.env.NODE_ENV || 'development';

if(env === 'development'){
  console.log(env);
  process.env.port = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/todoAppdb'
}else if(env === 'test'){
  process.env.port = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/todoApptestDb'
}


var express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todos');
var {User} = require('./models/users');
var{authenticate} =require('./midleware/authenticate');

var port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});
app.get('/todos/:id',authenticate,(req,res)=>{
  var id =req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({});
  }
  Todo.findOne({
    _id:id,
    _creator:req.user._id
  }).then((todo)=>{
    if(!todo){
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((e)=>{
    res.status(400).send();
  });
  //res.send(req.params);
});
//this will remove all documents
// Todo.remove({}).then((result)=>{
//   console.log(result);
// },(e)=>{
//   console.log("error",e);
// });
// Todo.findOneAndRemove({_id:""}).then((todo)=>{
//   console.log("deleted doc:",todo);
// },(e){
// console.log("error:",e);
// });
app.delete('/todo/:id',authenticate,(req,res)=>{
  console.log(req.params);
  var id =  req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({});
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator:req.user._id
  }).then((doc)=>{
    res.send({doc});
  },(e)=>{
    console.log("error of promise");
    return res.status(404).send({});
  }).catch((e)=>{
    console.log("inside catech ");
    return res.status(404).send({});
  });
});

app.patch('/todos/:id',authenticate,(req,res)=>{
  console.log(req.params);
  console.log(req.body);
  var id = req.params.id;
  var body = _.pick(req.body, ['text','completed']);
  if(!ObjectID.isValid(id)){
    console.log('id not valid');
    return res.status(404).send({});
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id,_creator:req.user._id},{
    $set: body
  },{ new : true}).then((todo)=>{
    if(!todo){
      console.log('no todo found');
      return res.status(400).send({});
    }
    res.send({todo});
  },(e)=>{
    console.log('error',e);
    return res.status(400).send({});
  }).catch((e)=>{
    console.log('error',e);
    return res.status(400).send({});
  });
});
//post users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  console.log(body);
  var user = new User(body);

  user.save().then(() => {
    //got a value returned from a promise so
    // promise chaining is handled by then and passing the token
    //to next
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});
app.post('/users/login',(req,res)=>{
var body =_.pick(req.body,['email','password']);
console.log(body);
User.findByCredentials(body.email,body.password).then((user)=>{
  console.log('inside findByCredentials');
//  res.send(user);
return user.generateAuthToken().then((token)=>{
  res.header('x-autth',token).send(user);
});
}).catch((e)=>{
  res.status(400).send(e);
});

});
app.delete('/users/me/token', authenticate, (req, res) => {
  console.log("token for delete",req.token);

  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});
app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});
app.listen(port,()=>{
  console.log('started on port:',port);
});
