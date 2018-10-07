var mongoose = require('mongoose');
const validator = require('validator');
const jwt =  require('jsonwebtoken');
const _ = require('lodash');
var UserSchema =new mongoose.Schema({

    email:{
      type: String,
      required: true,
      trim:true,
      minlength:1,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message:'{VALUE} is not a valid email'
      }
    },
    password : {
      type : String,
      required : true,
      minlength:6
    },
    tokens:[{
      access:{
        type: String,
        required: true
      },
      token:{
        type: String,
        required: true
      }
    }]

});
//UserSchema.methods are instance methods
UserSchema.methods.toJSON = function(){
  // this instance method is called when response is
  //converted into json object
  var user = this;
  var userObject =user.toObject();

  return _.pick(userObject,['_id','email']);
};
//because arrow functions donot make use of this keyword
UserSchema.methods.generateAuthToken = function(){
  console.log('generating token');
  var user = this;
  var access =  'auth';
  var token  = jwt.sign({
    _id: user._id.toHexString(), access
  },'abc123').toString();

  user.tokens.push({access,token});
  return user.save().then(()=>{
    return token;
  });
};
// user model
var User = mongoose.model('User',UserSchema);
module.exports = {
  User
};
