require('dotenv').load();
var _ = require('lodash');
// Load the Cloudant library.
var Cloudant = require('cloudant');

// Initialize Cloudant with settings from .env
var username = process.env.cloudant_username;
var password = process.env.cloudant_password;
var cloudant = Cloudant({account:username, password:password});
var userDBName = process.env.userDB;
var feedbackDBName = process.env.feedbackDB;

// asyc db creation?
cloudant.db.list(function(err, allDbs) {
    var userDB = _.find(allDbs, dbName => dbName === userDBName);
    var feedbackDB = _.find(allDbs, dbName => dbName === feedbackDBName);
    if (!userDB) {
        cloudant.db.create(userDBName, function() {});
    }
    if (!feedbackDB) {
        cloudant.db.create(feedbackDBName, function() {});
    }
});

module.exports = cloudant;