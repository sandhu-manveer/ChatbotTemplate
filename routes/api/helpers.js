var stringSimilarity = require('string-similarity');
var fs = require('fs');

var getSuggestions = function(input, cloudantFile) {
    var matches = stringSimilarity.findBestMatch(input, cloudantFile.body.questions);

    var matchesRatings = matches.ratings;

    matchesRatings.forEach(function(arrayItem) {
        if (arrayItem.rating === 1) {
            arrayItem.rating = 0;
        };
    });

    matchesRatings.sort(function(b, a) {
        return parseFloat(a.rating) - parseFloat(b.rating);
    });

    return matchesRatings.slice(0, 5);
}

module.exports = {
    getSuggestions
}