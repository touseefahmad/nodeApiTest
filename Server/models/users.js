var mongoose = require('mongoose');
const validator = require('validator');
const jwt =  require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
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


UserSchema.methods.removeToken = function (token) {
  var user = this;
  console.log('pulling token:',token);
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

// UserSchema.methods.removeToken = function(token){
//   var user = this;
//   return user.update({
//     $pull:{
//       tokens:{
//         token:token
//       }
//     }
//   });
//
// };
// user model

UserSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;
  try{
    decoded = jwt.verify(token,process.env.JWT_SECRET);
  }catch(e){
    return Promise.reject('404');
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

UserSchema.pre('save',function(next){
  var user = this;
  if(user.isModified('password')){
    var password = user.password;
    bcrypt.genSalt(10, (err,salt)=>{
      bcrypt.hash(password,salt,(err,hash)=>{
        user.password = hash;
        next();
      });
    });
  }else{
    next();
  }
});
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};
var User = mongoose.model('User',UserSchema);
module.exports = {
  User
};
