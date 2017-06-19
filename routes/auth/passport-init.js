var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var _ = require('lodash');
var User = require('../../models/userModel');

passport.use('local-login', new localStrategy(function(username, password, done){

    var user = new User();
    // check if user exists
    user.findByEmail(username, (err, user) => {
        if(!user.data._id) {   
            done(null, null, {message: 'Incorrect Username or Password'});
            return;
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                done(null, false, { message: 'Incorrect Username or Password' });
                return;
            } else {
                done(null, user);
                return;
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
   done(null, user);
});