var db = require("./db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");
var cloudant = require('../cloudant-init');
var fs = require('fs');

var feedbackDB = cloudant.db.use(process.env.feedbackDB);

var Feedback = function (data) {
    this.data = this.sanitize(data);
}

Feedback.prototype.data = {}

Feedback.prototype.get = function (name) {
    return this.data[name];
}

Feedback.prototype.set = function (name, value) {
    this.data[name] = value;
}

Feedback.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.feedback;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

Feedback.prototype.save = function (callback) {
    var self = this;
    self.data = self.sanitize(self.data);
    delete self.data._id;
    delete self.data._rev;
    delete self.data._attachments;
    
    feedbackDB.insert(self.data, function(err, body, header) {
        if (err) return callback(err);
        callback(null, body);
    });
}

Feedback.prototype.update = function (callback) {
    var self = this;
    self.data = self.sanitize(self.data);
    
    feedbackDB.insert(self.data, function(err, body, header) {
        if (err) return callback(err);
        callback(null, body);
    });
}

Feedback.prototype.find = function (query, callback) {
    feedbackDB.find(query, function(err, body, header) {
        if (err) return callback(err);
        var results = [];
        body.docs.forEach(function(element) {
            results.push(new Feedback(element));
        }, this);
        callback(null, results);
    });
}

Feedback.prototype.uploadFile = function (file, callback) {
    var self = this;
    self.data = self.sanitize(self.data);

    fs.readFile('./' + file.path.replace('\\', '/'), function(err, data) {
        if (!err) {
            feedbackDB.attachment.insert(self.data._id, file.filename, data, file.mimetype,
            { rev: self.data._rev }, function(err, body) {
                if (err) return callback(err);
                callback(null, body);
            });
        } else {
             callback(err);
        }
    });
}

module.exports = Feedback;