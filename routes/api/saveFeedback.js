var express = require("express");
var Feedback = require('../../models/feedbackModel.js');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var helper = require('./helpers');

var clearDirectory = helper.clearDirectory;

var router = express.Router();
module.exports = router;

router.post('/saveFeedback', upload.single('file'), function(req, res, next) {
    var text = null;
    var watsonResponse = null;
    var entity = null;
    if(req.body.feedbackText && req.body.feedbackText !== '') {
        text = req.body.feedbackText;
    } else {
        res.sendStatus(500);
        return;
    }

    if (req.body.watsonResponse && req.body.watsonResponse !== '') {
        watsonResponse = req.body.watsonResponse;
    }

    if (req.body.entity && req.body.entity !== '') {
        entity = req.body.entity;
    }

    var feedback = new Feedback({
        userId: req.user.data._id,
        userFeedback: text,
        watsonResponse: watsonResponse,
        entity: entity,  // same as id in old schem, really required?
        username: req.user.data.name,
        userRole: req.user.data.role
    });

    feedback.save((err, resp) => {
        var query = {selector:{_id: resp.id}};
        var savedFeedback = new Feedback();

        savedFeedback.find(query, function(err, results) {
            var result = results[0];
             if (req.file) {
                result.uploadFile(req.file, function(err, resultWithFile) {
                    if(!err) {
                        clearDirectory('./uploads');
                        var addFeedbackUrl = new Feedback();
                        addFeedbackUrl.find({selector:{_id: resultWithFile.id}}, function(err, docsWithUrl) {
                            var doc = docsWithUrl[0];
                            var docUrl = 'https://';
                            docUrl += process.env.cloudant_username + '.cloudant.com/';
                            docUrl += process.env.feedbackDB + '/';
                            docUrl += doc.data._id + '/';
                            docUrl += req.file.filename

                            doc.set('docUrl', docUrl);
                            doc.update((err, resp) => {
                                if (!err) res.sendStatus(200);
                                else { console.log(err); res.sendStatus(500); }
                            })
                        }); 
                    } 
                    else {
                        console.log(err);
                        res.sendStatus(500);
                    }
                });
            } else res.sendStatus(200);
        });
    });
});