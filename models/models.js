var path =require('path');
var pg = require('pg');

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

var Sequelize=require('sequelize');

var sequelize=new Sequelize(DB_name, user, pwd,
	{ 	dialect: protocol,
		protocol: protocol,
		port: port,
		host: host,
		storage: storage,
		omitNull: true
	}
);

var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);

var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

var user_path= path.join(__dirname,'user.js');
var User = sequelize.import(user_path);

var favourite_path = path.join(__dirname, 'favourite.js');
var Favourite = sequelize.import(favourite_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

Quiz.belongsTo(User);
User.hasMany(Quiz);

User.belongsToMany(Quiz, {through: 'Favourite'});
Quiz.belongsToMany(User, {through: 'Favourite'});

exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;

sequelize.sync().then(function(){
		Quiz.count().then(function(count){
			if(count===0){
				User.bulkCreate([{username:'admin',password:'1234',isAdmin:true},
					{username:'pepe',password:'5678'}]).then(function(){
				Quiz.create({
					pregunta:"Capital de Italia",
					respuesta:"Roma",
					UserId:2
				});
				Quiz.create({
					pregunta:"Capital de Portugal",
					respuesta:"Lisboa",
					UserId:2
				}).then(function(){console.log("Base de datos inicializada");});
				});
			}
	});
});