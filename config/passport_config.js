var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user_model');

// Use the BasicStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new BasicStrategy(function(username, password, done) {
    // Asynchronous verification
    process.nextTick(function() {
        // Find the user by username.  If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure.  Otherwise, return the authenticated `user`.
        User.findByUsername(username, function(err, user) {
            if(err) { 
                return done(err);
            } else if (!user) {
                return done(null, false);
            } else {
                // Compare passwords
                User.comparePasswords(password, user.password, function(err, res) {
                    if(err) {
                        return done(err);
                    } else if(res) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }
        });
    });
}));
