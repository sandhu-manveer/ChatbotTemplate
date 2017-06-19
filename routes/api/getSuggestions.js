var express = require('express');
var cloudant = require('../../cloudant-init');
var helpers = require('./helpers');

var router = express.Router();
module.exports = router;

var getSuggestions = helpers.getSuggestions;

// add queries to suggestions
// add suggestions to data models
router.post('/getSuggestions', function(req, res, next) {
    var cloudantFile = null;
    var input = (req.body.answer) ? req.body.answer : null ;

    var cisco = cloudant.db.use('suggestions');

    cisco.get('questions', function(err, body) {
        if (!err) {
            if (body != undefined) {
                var cloudantFile = {
                    body
                };
                output = getSuggestions(input, cloudantFile);
                res.send(output);
            }
        }
    });
});