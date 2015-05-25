var models = require('../models/models.js');

exports.ownershipRequired = function (req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if(isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

exports.load = function (req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(
		function (quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizid=' + quizId)); }
		}).catch(function (error) { next(error); });
};

exports.show = function (req, res) {
	models.Quiz.find(req.params.quizId).then(function (quiz) {
		res.render('quizes/show', { quiz: req.quiz, errors: [] });
	});
};

exports.answer = function (req, res) {
	models.Quiz.find(req.params.quizId).then(function (quiz) {
		if (req.query.respuesta === req.quiz.respuesta)
			res.render('quizes/answer', { quiz: req.quiz, errors: [], respuesta: 'Correcto' });
		else
			res.render('quizes/answer', { quiz: req.quiz, errors: [], respuesta: 'Incorrecto' });
	});
};

exports.index = function (req, res) {
	if (req.query.search !== undefined) {
		var searchStr = '%' + req.query.search.replace(' ', '%') + '%';
		models.Quiz.findAll({ where: ["pregunta like ?", searchStr] }).then(function (quizes) {
			quizes.sort(function (a, b) {
				if (a.pregunta == b.pregunta)
					return 0;
				if (a.pregunta > b.pregunta)
					return 1;
				return -1;
			});
			res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
		});
	} else {
		models.Quiz.findAll().then(function (quizes) {
			res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
		});
	}
};

exports.new = function (req, res) {
	var quiz = models.Quiz.build({
		pregunta: "Pregunta", respuesta: "Respuesta"
	});
	res.render('quizes/new', { quiz: quiz, errors: [] });
};

exports.create = function (req, res) {
	req.body.quiz.UserId = req.session.user.id;
	if(req.files.image) {
		req.body.quiz.image = req.files.image.name;
	}
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(function (err) {
		if (err) {
			res.render('quizes/new', { quiz: quiz, errors: err.errors });
		} else {
			quiz.save({ fields: ["pregunta", "respuesta", "image"] }).then(function () {
				res.redirect("/quizes");
			});
		}
	});
};

exports.edit = function (req, res) {
	var quiz = req.quiz;

	res.render('quizes/edit', { quiz: quiz, errors: [] });
};

exports.update = function (req, res) {
	if(req.files.image) {
		req.quiz.image = req.files.image.name;
	}
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz.validate().then(function (err) {
		if (err) {
			res.render('quizes/edit', { quiz: req.quiz, errors: err.errors });
		} else {
			req.quiz.save({ fields: ["pregunta", "respuesta", "image"] }).then(
				function () {
					res.redirect("/quizes");
				});
		}
	});
};

exports.destroy = function (req, res) {
	req.quiz.destroy().then(function () {
		res.redirect('/quizes');
	}).catch(function (error) { next(error) });
};

exports.getStatistics = function (req, res) {
	models.Quiz.findAll({include: [{ model: models.Comment }]}).then(function (quizes) {
		var statistics = {
			totalQuizes: quizes.length,
			totalComments: 0,
			quizesWithComments: 0,
			quizesWithoutComments: 0,
			medianComments: 0
		};
		for (var i = 0; i < quizes.length; i++) {
			if(!quizes[i].Comments || quizes[i].Comments.length === 0){
				 statistics.quizesWithoutComments++;
				 continue;
			}
			for(var j = 0; j < quizes[i].Comments.length; j++) {
				statistics.totalComments++;
			}
			statistics.quizesWithComments++;
		}
		statistics.medianComments = statistics.totalComments/statistics.totalQuizes;
		res.render('quizes/statistics', {statistics: statistics, errors: []});
	});
}