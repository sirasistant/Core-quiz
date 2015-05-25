var express = require('express');
var multer = require('multer');
var router = express.Router();

var quizController=require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController=require('../controllers/session_controller');
var userController=require('../controllers/user_controller');



// Homepage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' ,
      errors:[]});
});

//  Autoload
router.param('quizId', quizController.load);
router.param('commentId',commentController.load);
router.param('userId',userController.load);

// Session
router.get('/login',sessionController.new).post('/login',sessionController.create);
router.get('/logout',sessionController.destroy);

//Users
router.get('/user',userController.new);
router.post('/user',userController.create);
router.get('/user/:userId(\\d+)/edit',sessionController.loginRequired,userController.edit);
router.put('/user/:userId(\\d+)',sessionController.loginRequired,userController.update);
router.delete('/user/:userId(\\d+)',sessionController.loginRequired,userController.destroy);
router.get('/user/:userId(\\d+)/quizes',quizController.index);
// Quizes
router.get('/quizes',quizController.index);
router.get('/quizes/:quizId(\\d+)',quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',quizController.answer);
router.get('/quizes/new',sessionController.loginRequired,quizController.new);
router.post('/quizes/create',sessionController.loginRequired, multer({ dest: './public/media'}),quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',sessionController.loginRequired,quizController.ownershipRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)', sessionController.loginRequired, multer({ dest: './public/media'}), quizController.ownershipRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

// Comments
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',sessionController.loginRequired,commentController.ownershipRequired, commentController.publish);
router.get('/quizes/statistics', quizController.getStatistics);

// Other
router.get('/author', function (req, res, next) {
	res.render('author', {authors: 'Creadores', author1: {name: 'Álvaro Rodríguez', photo: "images/alvaro.jpg"}, author2: { name: 'Gregorio Juliana', photo: "images/gregorio.jpg"},errors:[]});
});

module.exports = router;
