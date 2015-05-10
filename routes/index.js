var express = require('express');
var router = express.Router();

var quizController=require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});
router.get('/quizes',quizController.index);
router.get('/quizes/:quizId(\\d+)',quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',quizController.answer);
router.get('/author', function (req, res, next) {
	res.render('author', {authors: 'Creadores', author1: {name: 'Álvaro Rodríguez', photo: "images/alvaro.jpg"}, author2: { name: 'Gregorio Juliana', photo: "images/gregorio.jpg"}});
});

module.exports = router;
