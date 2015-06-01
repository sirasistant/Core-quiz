var models = require('../models/models.js');
var app = require('../app.js');

exports.ownershipRequired = function (req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

exports.load = function (req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }, { model: models.User }]
	}).then(
		function (quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizid=' + quizId)); }
		}).catch(function (error) { next(error); });
};

exports.show = function (req, res) {
	var show = function (isFavourite) {
		if (req.quiz.image) {
			console.log(req.quiz.image);
			app.blobService.getBlobToLocalFile('core', req.quiz.image, './public/media/' + req.quiz.image, function (err, result, response) {
				if(err) console.log(err.message);
				res.render('quizes/show', { quiz: req.quiz, errors: [], isFavourite: isFavourite });
			});
		}
		else res.render('quizes/show', { quiz: req.quiz, errors: [], isFavourite: isFavourite });
	}
	if (req.session.user) {
		req.quiz.hasUser(req.session.user.id).then(function (hasUser) {
			show(hasUser);
		});
	} else {
		show(false);
	}

};

exports.answer = function (req, res) {
	models.Quiz.find(req.params.quizId).then(function (quiz) {
		var correct = req.query.respuesta.toLowerCase().trim() === req.quiz.respuesta.toLowerCase().trim();
		console.log(correct);
		if (correct && req.currentUser) {
			quiz.addSolver(req.currentUser).then(function () {
				res.render('quizes/answer', { quiz: req.quiz, errors: [], respuesta: 'Correcto' });
			})
		}
		else
			if (correct)
				res.render('quizes/answer', { quiz: req.quiz, errors: [], respuesta: 'Correcto' });
			else
				res.render('quizes/answer', { quiz: req.quiz, errors: [], respuesta: 'Incorrecto' });
	});
};

exports.index = function (req, res) {
	var options = {};
	if (req.user) {
		options.where = { UserId: req.user.id }
	}

	var findFavourites = function (quizes, then) {
		var userHasQuiz = function (user, quiz, callback) {
			user.hasQuiz(quiz.id).then(function (result) {
				return callback(quiz, result);
			});
		};
		var favourited = [].repeat(false, quizes.length);
		var checked = 0;

		if (req.currentUser && quizes.length > 0) {
			for (var i = 0; i < quizes.length; i++) {
				quizes[i].indexInArr = i;
				userHasQuiz(req.currentUser, quizes[i], function (quiz, result) {
					favourited[quiz.indexInArr] = result;
					checked++;
					if (checked == quizes.length) then(favourited);
				});
			}
		} else {
			then(favourited);
		}
	}

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
			findFavourites(quizes, function (favourited) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: [], favourited: favourited });
			})
		});
	} else {
		models.Quiz.findAll(options).then(function (quizes) {
			var show = function (favourited) {
				console.log(favourited);
				res.render('quizes/index.ejs', { quizes: quizes, errors: [], favourited: favourited });
			}
			findFavourites(quizes, show);
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
	if (req.files.image) {
		req.body.quiz.image = req.files.image.name;
		app.blobService.createBlockBlobFromLocalFile('core', req.files.image.name, './public/media/' + req.files.image.name, function (err, result, response) { if (err) console.log("Couldn't upload to azure: " + err.message); });
	}
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(function (err) {
		if (err) {
			res.render('quizes/new', { quiz: quiz, errors: err.errors });
		} else {
			quiz.save({ fields: ["pregunta", "respuesta", "image", "UserId"] }).then(function () {
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
	if (req.files.image) {
		req.quiz.image = req.files.image.name;
		app.blobService.createBlockBlobFromLocalFile('core', req.files.image.name, './public/media/' + req.files.image.name, function (err, result, response) { if (err) console.log("Couldn't upload to azure: " + err.message); });
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
	models.Quiz.findAll({ include: [{ model: models.Comment }] }).then(function (quizes) {
		models.User.findAll().then(function (users) {
			var findLeaderBoard = function (userArr, callback) {
				var countSolutions = function (user, callback) {
					user.getSolutions().then(function (solutions) {
						callback(user, solutions.length);
					});
				}
				var leaderBoard = [];
				var finished = 0;
				if (userArr.length > 0) {
					for (var i = 0; i < userArr.length; i++) {
						countSolutions(userArr[i], function (user, count) {
							leaderBoard.push({ username: user.username, count: count });
							finished++;
							if (finished === userArr.length) {
								leaderBoard.sort(function (a, b) {
									return b.count - a.count;
								});
								callback(leaderBoard);
							}
						});
					}
				}
				else {
					callback(leaderBoard);
				}
			}

			findLeaderBoard(users, function (leaderBoard) {
				console.log(leaderBoard);
				var statistics = {
					totalQuizes: quizes.length,
					totalComments: 0,
					quizesWithComments: 0,
					quizesWithoutComments: 0,
					medianComments: 0
				};
				for (var i = 0; i < quizes.length; i++) {
					if (!quizes[i].Comments || quizes[i].Comments.length === 0) {
						statistics.quizesWithoutComments++;
						continue;
					}
					for (var j = 0; j < quizes[i].Comments.length; j++) {
						statistics.totalComments++;
					}
					statistics.quizesWithComments++;
				}
				statistics.medianComments = statistics.totalComments / statistics.totalQuizes;
				res.render('quizes/statistics', { statistics: statistics, errors: [], top: leaderBoard });
			});
		});
	});
};