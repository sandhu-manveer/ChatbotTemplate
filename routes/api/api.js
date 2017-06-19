var express = require("express");

var router = express.Router();

var saveFeedback = require('./saveFeedback');
router.use(saveFeedback);

var getFeedback = require('./getFeedback');
router.use(getFeedback);

var getSuggestions = require('./getSuggestions');
router.use(getSuggestions);

module.exports = router;