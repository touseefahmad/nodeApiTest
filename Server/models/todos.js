var mongoose = require('mongoose');

//save
var Todo = mongoose.model('Todo',{
  text:{
    type: String,
    required: true,
    minlength:1,
    //trim removes leading and trailing spaces
    trim: true
  },
  completed:{
    type: Boolean,
    default: false
  },
  completedAt:{
    type: Number,
    default: null
  },
  _creator:{
    type:mongoose.Schema.Types.ObjectId,
    required: true
  }
});
module.exports = {Todo};
