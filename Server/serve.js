var express = require('express');
var bodyParser = require('body-parser');

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
//app.get();
app.listen(3000,()=>{
  console.log('started on port 3000');
});
