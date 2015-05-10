var models = require('../models/models.js');

exports.show=function(req,res){
	models.Quiz.find(req.params.quizId).then(function (quiz){
		res.render('quizes/show',{quiz:quiz});
	});
};

exports.answer=function(req,res){
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if(req.query.respuesta=== quiz.respuesta)
			res.render('quizes/answer',{quiz:quiz, respuesta:'Correcto'});
		else
			res.render('quizes/answer',{quiz:quiz, respuesta:'Incorrecto'});
	});
};

exports.index = function(req,res){
	if(req.query.search!==undefined){
	var searchStr='%'+req.query.search.replace(' ','%')+'%';
	models.Quiz.findAll({where: ["pregunta like ?", searchStr]}).then(function(quizes){
		quizes.sort(function(a,b){
			if(a.pregunta==b.pregunta)
				return 0;
			if(a.pregunta>b.pregunta)
				return 1;
			return -1;
		});
		res.render('quizes/index.ejs',{quizes:quizes});
	});
	}else{
	models.Quiz.findAll().then(function(quizes){
		res.render('quizes/index.ejs',{quizes:quizes});
	});
	}
}