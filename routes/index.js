var express = require('express');
var router = express.Router();

var quizController=require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' ,
      errors:[]});
});
router.param('quizId', quizController.load);
router.get('/quizes',quizController.index);
router.get('/quizes/new',quizController.new);
router.get('/quizes/:quizId(\\d+)',quizController.show);
router.get('/quizes/:quizId(\\d+)/edit',quizController.edit);
router.get('/quizes/:quizId(\\d+)/answer',quizController.answer);
router.get('/author', function (req, res, next) {
	res.render('author', {authors: 'Creadores', author1: {name: 'Álvaro Rodríguez', photo: "images/alvaro.jpg"}, author2: { name: 'Gregorio Juliana', photo: "images/gregorio.jpg"},errors:[]});
});
router.post('/quizes/create',quizController.create);
router.put('/quizes/:quizId(\\d+)',quizController.update);
router.delete('/quizes/:quizId(\\d+)', quizController.destroy);
module.exports = router;
