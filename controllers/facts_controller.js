var request = require('request');

exports.getFacts = function(callback) {
	var result = {};
	result.errors = [];
	request.get('http://numbersapi.com/random/math', function(error, response, body){
		var numberFact = body;
		request.get('http://api.icndb.com/jokes/random?escape=javascript', function(error, response, body){
			if(error){
				result.errors.push(error);
				return callback(result);
			}
			body = JSON.parse(body);
			result["CNFact"] = body.value.joke
			result["NumberFact"] = numberFact;
			return callback(result);
		});
	});
};