var models = require('../models/models.js');

exports.ownershipRequired = function (req, res, next) {
	models.Quiz.find({
		where: {
			id: Number(req.Comment.QuizId)
		}
	}).then(function (quiz) {
		if (quiz) {
			var objQuizOwner = quiz.UserId;
			var logUser = req.session.user.id;
			var isAdmin = req.session.user.isAdmin;

			console.log(objQuizOwner, logUser, isAdmin);

			if (isAdmin || objQuizOwner === logUser) {
				next();
			} else {
				res.redirect('/');
			}
		} else { next(new Error('No existe quizId=' + quizId)) }
	}).catch(function(error){next(error)});
};

exports.load = function (req, res, next, commentId) {
	models.Comment.find({
		where: {
			id: Number(commentId)
		}
	}).then(function (comment) {
		if (comment) {
			req.comment = comment;
			next();
		} else {
			next(new Error('No existe commentId=' + commentId));
		}
	});
};

exports.new = function (req, res) {
	res.render('comments/new.ejs', { quizId: req.params.quizId, errors: [] });
};

exports.create = function (req, res) {
	var comment = models.Comment.build({
		texto: req.body.comment.texto,
		QuizId: req.params.quizId
	});
	comment.validate().then(
		function (err) {
			if (err) {
				res.render('comments/new.ejs', { comment: comment, errors: err.errors });
			} else {
				comment.save().then(
					function () { res.redirect('/quizes/' + req.params.quizId); });
			}
		}
		).catch(function (error) { next(error); });
};

exports.publish = function (req, res) {
	req.comment.publicado = true;
	req.comment.save({ fields: ["publicado"] }).then(function () {
		res.redirect('/quizes/' + req.params.quizId);
	}).catch(function (error) { next(error) });
};