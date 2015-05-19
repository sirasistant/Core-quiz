var express = require('express');
var router = express.Router();

var quizController=require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController=require('../controllers/session_controller');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' ,
      errors:[]});
});

router.param('quizId', quizController.load);

router.get('/login',sessionController.new);
router.post('/login',sessionController.create);
router.get('/logout',sessionController.destroy);

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

router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', commentController.create);

module.exports = router;
