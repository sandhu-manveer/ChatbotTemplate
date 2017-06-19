var express = require('express');
var passport = require('passport');

var router = express.Router();
module.exports = router;

router.route('/login')
    .all(function(req, res, next){
        next();
    })
    .get(function(req, res, next){
            res.render('login', {message: req.flash(), user: req.user});
        })
    .post(passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash : true
        }));

/*router.route('/signup')
    .get(function(req, res, next){
            res.render('signup', {message: req.flash()});
        })
    .post(passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash : true
        }));*/

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});
