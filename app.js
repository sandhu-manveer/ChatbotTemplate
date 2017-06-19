/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var User = require('./models/userModel.js');
require('./routes/auth/passport-init');

// initialize cloudant
var cloudant = require('./cloudant-init');

var app = express();

// Bootstrap application settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public')); // app public assets
app.use(express.static(__dirname + '/node_modules/bootstrap/dist')); // load bootstrap
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.set('view engine', 'ejs'); //ejs 

//cookie parser setup
app.use(cookieParser('secret'));
// express-session for session based auth
app.use(require('express-session')({
  secret: 'some random secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 60 * 24 }
}));
// flash setup (requires session, cookieparser)
app.use(flash());
// passport setup
app.use(passport.initialize());
app.use(passport.session());

var authRouter = require("./routes/auth/auth");
app.use(authRouter);

// middleware to check auth
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  }
  else res.redirect('/login');
}

app.use(checkAuth);

app.get('/', function (req, res, next) {
  res.render('index', { user: req.user.data });
});

var apiRouter = require('./routes/api/api');
app.use('/api', apiRouter);

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: process.env.conversation_username,
  password: process.env.conversation_password,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: Conversation.VERSION_DATE_2017_04_21
});

// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function (err, data) {
    if (data !== undefined) {
      if (err) {
        return res.status(err.code || 500).json(err);
      }
    }
    return res.json(updateMessage(payload, data));
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
