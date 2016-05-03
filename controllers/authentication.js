const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  // https://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#rfc.section.4.1.4
  // sub = subject = who is this token owner
  // iat = issued at time
  // exp = expiration time/
  const timestamp = new Date().getTime();
  const expiration = new Date().getTime() + 300000000000;
  return jwt.encode({ sub: user.id, iat: timestamp, exp: expiration } , config.secret);
}

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd
  // We just need to give them a token
  // req.user comes from the passport-local middleware for signin
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next ) {
  // See if a user with a given email exists
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({error: 'You must provide email and password'});
  }

  User.findOne({email: email}).exec().then(function(existingUser) {

    // If a user with email does exist, return an error
    if (existingUser) {
      return res.status(422).send({error: 'Email is in use'});
    }

    // If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save().then(function(user) {
      // Respond to request indicating the user was created
      res.json({token: tokenForUser(user)});
    }).fail(function (error) {
      return res.status(422).send({error: error.errors});
    });

  }).fail(function () {
    return res.status(422).send({error: error.errors});
  });

};
