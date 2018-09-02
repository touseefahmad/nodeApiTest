const{SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
var data ={
  id : 10
};

var token =jwt.sign(data,'123abc');
console.log(token);
var decoded = jwt.verify(token,'123abc');
console.log('decode:',decoded);
//jwt.verify
// var message = 'my name is touseef';
// var hash = SHA256(message).toString();
// console.log(`hash value:${hash}`);
//
// var data ={
//   id : 4
// };
//
// var token ={
//   data,
//   //salting hash
//   hash :  SHA256(JSON.stringify(data)+'somesecret').toString()
// };
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
// var resultHash = SHA256(JSON.stringify(token.data)+'somesecret').toString();
//  if(resultHash ===token.hash ){
//    console.log('data was not changes');
//  }else{
//    console.log('data was changed');
//  }
