var models=require('../models/models.js');

exports.load = function(req,res,next,userId){
	models.User.find({where:{id:Number(userId)}})
	.then(function(user){
		if(user){
			req.user=user;
			next();
		}else{
			next(new Error("No existe userId="+userId));
		}
	}).catch(function(error){
		next(error);
	});
}
exports.ownershipRequired = function (req, res, next) {
	var objUser = req.user.id;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if(isAdmin || objUser === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

exports.loadSessionUser = function(req,res,next){
	var session=req.session.user;
	if(session){
		models.User.find({
			where:{id:session.id},
			include: [{ model: models.Quiz }]}).then(function(user){
				req.currentUser=user;
				next();
			});
	}else{next();}
}

exports.autenticar = function(login,password,callback){
	models.User.find({
		where:{
			username : login
		}
	}).then(function(user){
		if(user){
			if(user.verifyPassword(password)){
				callback(null,user);
			}else{
				callback(new Error('Password erróneo.'));
			}
		}else{
			callback(new Error('No existe el usuario'));
		}
	}).catch(function(error){callback(error);});
};

exports.edit = function(req,res){
	res.render('user/edit',{user:req.user,errors:[]});
};

exports.update = function(req,res,next){
	req.user.username = req.body.user.username;
	req.user.password = req.body.user.password;
	req.user.validate().then(function(err){
		if(err){
			res.render('user/'+req.user.id,{user:req.user,errors:err.errors});
		}else{
			req.user.save({fields:["username","password"]}).then(function(){
				res.redirect('/');
			});
		}
	}).catch(function(error){next(error);});
};
exports.new = function(req,res){
	var user = models.User.build({username:"",password:""});
	res.render('user/new',{user:user,errors:[]});
};

exports.create = function(req,res,next){
	var user= models.User.build(req.body.user);
	user.validate().then(function(err){
		if(err){
			res.render('user/new',{user:user,errors:err.errors});
		}else{
			user.save({fields:["username","password"]}).then(function(){
				req.session.user={id:user.id,username:user.username};
				res.redirect('/');
			});
		}
	}).catch(function(error){next(error);});
};

exports.destroy = function(req,res,next){
	req.user.destroy().then(function(){
		delete req.session.user;
		res.redirect('/');
	}).catch(function(error){next(error);});
};
