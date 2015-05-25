var models = require('../models/models.js');

exports.setFavourite = function(req, res) {
	var userId = req.session.user.id;
	models.User.find(userId).then(function(user){
		user.addQuiz(req.params.quizId).then(function(){
			res.redirect('/user/' + userId + "/favourites");
		});
	}).catch(function (error) { next(error); });
};

exports.deleteFavourite = function (req, res) {
	var userId = req.session.user.id;
	models.User.find(userId).then(function(user){
		user.removeQuiz(req.params.quizId).then(function(){
			res.redirect('/user/' + userId + "/favourites");
		});
	}).catch(function (error) { next(error); });
};

exports.getFavourites = function (req, res) {
	var userId = req.session.user.id;
	models.User.find({
		where: { id: Number(userId) },
		include: [{ model: models.Quiz }]
	}).then(	
		function(user){
			user.getQuizzes().then(function(quizzes){
			user.Quizzes = quizzes;
			res.render('user/favourites.ejs', {session: req.session, user: user, errors: []});
			});
		});
};