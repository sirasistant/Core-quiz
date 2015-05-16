var models = require('../models/models.js');

exports.load = function (req, res, next, quizId){
	models.Quiz.find(quizId).then(
		function(quiz){
			if(quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizid=' + quizId));}
		}).catch(function(error) {next(error);});
};

exports.show=function(req,res){
	models.Quiz.find(req.params.quizId).then(function (quiz){
		res.render('quizes/show',{quiz:req.quiz,errors:[]});
	});
};

exports.answer=function(req,res){
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if(req.query.respuesta=== req.quiz.respuesta)
			res.render('quizes/answer',{quiz:req.quiz,errors:[], respuesta:'Correcto'});
		else
			res.render('quizes/answer',{quiz:req.quiz,errors:[], respuesta:'Incorrecto'});
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
		res.render('quizes/index.ejs',{quizes:quizes,errors:[]});
	});
	}else{
	models.Quiz.findAll().then(function(quizes){
		res.render('quizes/index.ejs',{quizes:quizes,errors:[]});
	});
	}
}
exports.new = function(req,res){
	var quiz=models.Quiz.build({
		pregunta: "Pregunta",respuesta:"Respuesta"
	});
	res.render('quizes/new',{quiz:quiz,errors:[]});
}
exports.create = function(req,res){
	var quiz=models.Quiz.build(req.body.quiz);
	quiz.validate().then(function(err){
		if(err){
			res.render('quizes/new',{quiz:quiz,errors:err.errors});
		}else{
			quiz.save({fields:["pregunta","respuesta"]}).then(function(){
				res.redirect("/quizes");
			});
		}
	});
}