var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todos');
var {User} = require('./models/users');


var app = express();
app.use(bodyParser.json());
app.post('/todos',(req,res)=>{
  console.log(req.body);
  var todo =  new Todo({
    text: req.body.text
  });
  todo.save().then((doc)=>{
    res.status(200).send(doc);
  },
(e)=>{
  console.log('inside error block');
  res.status(400).send(e);
});
});
app.get('/todos',(req,res)=>{
  Todo.find().then((todos)=>{
    res.send({todos});
  },(e)=>{
    res.status(400).send(e);
  });
});
app.get('/todos/:id',(req,res)=>{
  var id =req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send({});
  }
  Todo.findById(id).then((todo)=>{
    if(!todo){
      return res.status(404).send({});
    }
    res.send({todo});
  }).catch((e)=>{
    res.status(400).send();
  });
  //res.send(req.params);
})
app.listen(3000,()=>{
  console.log('started on port 3000');
});
