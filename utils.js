// generate token using secret from process.env.JWT_SECRET
var jwt = require('jsonwebtoken');

// generate token and return it
function generateToken(user) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!user) return null;

  var u = {
    name: user.name,
    username: user.username,
    isAdmin: user.isAdmin
  };

  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: '365d' // expires in 365 days
  });
}

function generateFToken(user) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!user) return null;

  var u = {
    username: user.username
  };

  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: '1d' // expires in 365 days
  });
}

// return basic user details
function getCleanUser(user) {
  if (!user) return null;

  return {
    name: user.name,
    username: user.username,
    isAdmin: user.isAdmin
  };
}

module.exports = {
  generateToken,
  generateFToken,
  getCleanUser
}
