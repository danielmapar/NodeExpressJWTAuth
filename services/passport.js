const passport = require('passport'); // is user logged in before going to controller
const User = require('../models/user');
const config = require('../config');
// Use a Strategy to check if user is logged in based on JWT
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const LocalStategy = require('passport-local');
// Create local Strategy for Sign in (email and password login)
const localOptions = {
  'usernameField': 'email'
};
const localLogin = new LocalStategy(localOptions, function(email, password, done) {
  // Verify email and password, call done with the user
  // if it is the correct username and password
  // otherwise, call done with false
  User.findOne({email: email}).then(function(user) {
    if (!user) { return done(null, false) }

    // compare password - is 'password' equal to user.password?
    user.comparePassword(password, function(error, isMatch) {
      if (error) { return done(error, false) }
      // if I change it from 'null' to a JSON, it returns it
      // as the response in the body
      if (!isMatch) { return done(null, false) }

      return done(null, user);
    });

  }).fail(function(error) {
    if (error) { return done(error, false) }
  });

});

// Create JWT Strategy for Auth'd Request (verify the JWT token)
// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
}; // Here to look to find the JWT

// Create JWT Strategy
// Payload is the decoded JWT token
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the user id and payload exists in our database
  // If it does call 'done' with that user
  // otherwise call 'done' without a user object
  User.findById(payload.sub).then(function(user) {
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  }).fail(function(err){
    return done(err, false); // false means we did not find the user
  });
});

// Tell passport to use that Strategy
passport.use(jwtLogin);
passport.use(localLogin);
