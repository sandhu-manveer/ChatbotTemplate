var express = require("express");
var Feedback = require('../../models/feedbackModel.js');

var router = express.Router();
module.exports = router;

router.post('/getFeedback', function(req, res, next) {
    var entity = (req.body.entity) ? req.body.entity : null;

    var query = {
        selector: {
            entity: entity
        }
    };

    var feedback = new Feedback();

    feedback.find(query, (err, response) => {
        var responseJSON = [];
        response.forEach(function(element) {
            var obj = {};
            obj.userFeedback = element.get('userFeedback');
            obj.username = element.get('username');
            obj.userRole = element.get('userRole');
            obj.docUrl = element.get('docUrl');
            responseJSON.push(obj);
        }, this);
        res.status(200);
        res.json(responseJSON);
    });

});