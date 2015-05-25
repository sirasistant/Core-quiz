var models = require('../models/models.js');

exports.ownershipRequired = function (req, res, next) {
	var objUser = req.user.id;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if(isAdmin || objUser === logUser) {
		next();
	}	else {
		res.redirect('/');
	}
};

var users = {
	admin:{id:1,username:"admin",password:"1234"},
	pepe: {id:2,username:"pepe",password:"5678"}
};


exports.autenticar = function(login,password,callback){
	if(users[login]){
		if(password===users[login].password){
			callback(null,users[login]);
		}else{
			callback(new Error('Password erróneo.'));
		}
	}else{
		callback(new Error('No existe el usuario'));
	}
}