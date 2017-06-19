// The Api module is designed to handle all interactions with the server

var Api = (function () {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    positiveFeedback: positiveFeedback,
    negativeFeedback: negativeFeedback,
    sendFeedback: sendFeedback,
    getFeedback: getFeedback,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function () {
      return requestPayload;
    },
    setRequestPayload: function (newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function () {
      return responsePayload;
    },
    setResponsePayload: function (newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    },
    setFeedbackPayload: function (feedbackPayloadStr) {
      feedbackPayload = JSON.parse(feedbackPayloadStr);
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }

  function positiveFeedback() {
    alert('Thanks for the feedback');
    $('.chat-feedback-container').hide();
  }

  function negativeFeedback() {
    $('.thumb').last().hide();
    var watsonResponse = $('.message-inner').last().find('p').first().html();
    var entity = $('.conversation-meta-entity').last().html();
    $('.formWatsonResponse').attr("value", watsonResponse);
    $('.formEntity').attr("value", entity);
    $('.feedback-text-container').last().show();
  }

  // using form, dont send post req here
  function sendFeedback() {
    alert('Thanks for the feedback');
    $('.chat-feedback-container').hide();
  }

  function getFeedback() {
    var entity = $('.conversation-meta-entity').last().html();
    var params = JSON.stringify({
      entity: entity
    });
    var http = new XMLHttpRequest();
    http.open('POST', '/api/getFeedback', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        renderFeedbackResults(http.responseText);
      }
    };

    http.send(params);
    $('.chat-feedback-results-button').last().hide();
    $('.chat-feedback-container').hide();
  }

  function renderFeedbackResults(responseText) {
    var responseJson = JSON.parse(responseText);
    var feedbackHTML = '';

    if (responseJson.length < 1) {
      feedbackHTML = '<div class="user-feedback-result">I could not find any other results.</div>';
    }

    responseJson.forEach(function (element) {
      feedbackHTML += '<div class="user-feedback-result">';
      feedbackHTML += '@' + element.username + '(' + element.userRole + '): ' + element.userFeedback;

      if(element.docUrl !== null) {
        feedbackHTML += '<br>@' + element.username + ' submitted the following document: ' + '<a href="'+ element.docUrl +'" target="iframe_a">Click to read</a>';
      }

      feedbackHTML += '</div>';
    }, this);

    $('.chat-feedback-results-container').last().append(feedbackHTML);
    ConversationPanel.scrollToChatBottom(); // remove?
  }

}());
