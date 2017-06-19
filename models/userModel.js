// return promises?
var db = require("./db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");
var cloudant = require('../cloudant-init');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var userDB = cloudant.db.use(process.env.userDB);

var User = function (data) {
    this.data = this.sanitize(data);
}

User.prototype.data = {}

User.prototype.changeName = function (name) {
    this.data.name = name;
}

User.prototype.get = function (name) {
    return this.data[name];
}

User.prototype.set = function (name, value) {
    this.data[name] = value;
}

User.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema));
}

User.prototype.save = function (callback) {
    var self = this;
    self.data = self.sanitize(self.data);

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return console.log(err);

        // hash the password using our new salt
        bcrypt.hash(self.data.password, salt, function (err, hash) {
            if (err) return console.log(err);

            // override the cleartext password with the hashed one
            self.data.password = hash;
            
            // remove _rev, other way to do?
            delete self.data._rev;

            // save, use async
            userDB.insert(self.data, function (err, body, header) {
                console.log(body);
                if (err) return callback(err);
                callback(null, body);
            });
        });
    });
}

User.prototype.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.data.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
}
User.prototype.update = function (callback) {
    var self = this;
    self.data = self.sanitize(self.data);
    // save, use async
    userDB.insert(self.data, function (err, body, header) {
        if (err) return callback(err);
        callback(null, body);
    });
}

User.prototype.findByEmail = function (email, callback) {
    userDB.find({ selector: { _id: email } }, function (err, result) {
        if (err) return callback(err);
        callback(null, new User(result.docs[0]));
    });
}

module.exports = User;