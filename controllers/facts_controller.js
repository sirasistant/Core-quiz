var request = require('request');

exports.getFacts = function(callback) {
	var result = {};
	result.errors = [];
	result.facts = {};
	request.get('http://catfacts-api.appspot.com/api/facts', function(error, response, body){
		body = JSON.parse(body);
		var catFact = body.facts[0];
		request.get('http://numbersapi.com/random/math', function(error, response, body){
			var numberFact = body;
			request.get('http://api.icndb.com/jokes/random?escape=javascript', function(error, response, body){
				if(error){
					result.errors.push(error);
					return callback(result);
				}
				body = JSON.parse(body);
				result.facts["CatFact"] = catFact;
				result.facts["CNFact"] = body.value.joke;
				result.facts["NumberFact"] = numberFact;
				return callback(result);
			});
		});
	})
};