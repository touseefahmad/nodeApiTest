var {User} = require('./../models/users');

var authenticate = (req,res,next)=>{
console.log('authenticating user');
  var token =req.header('x-auth');
  console.log(token);
  User.findByToken(token).then((user)=>{
    if(!user){
      console.log('no user found');
      return Promise.reject(401);
    }
    req.user =user;
    req.token =token;
    console.log('user found',token);
    next();
  }).catch((e)=>{
    console.log('error:',e);
    res.status(401).send({});
  });
}

module.exports ={authenticate};
