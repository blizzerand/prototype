var express = require('express');
var mongoose = require('mongoose');
var dbConfig = require('../../config/db.js');
//Setting the router
var routerHome = express.Router();

var validator = require('validator');


//Connecting the database
mongoose.connect(dbConfig.url);

var Home = require('../models/home_model.js');
var User  = require('../models/user_model.js');

//var returnRouter = function(io) {
	
var returnRouter = function(io) {

var roomRouter = require('./room.js')(io);

routerHome.use(( request,response,next) => {
	console.log(request.url);
	next();
});


routerHome.use(['/:home_id/user','/:home_id',':home_id/room'], (request,response,next) => {

	/*if(request.method === 'GET') {
		console.log(request.method);
		next();
	}*/
	request.home_id = request.params.home_id;
	Home.findOne({ $and:
		[ { _id: request.params.home_id}, {$or:
			[ {administrator:  request.user_data.data.id}, { 'users._id' : mongoose.Types.ObjectId(request.user_data.data.id) } ]
			} 
		]}, (err,home) => {
		if(err) {
		response.write(JSON.stringify({type:false, 'error' :err},null,2));
		response.end();
		}
		else if(!home) {
			response.write(JSON.stringify({type: false, message: "hThis page doesn't exist or you don't have rights to view this object"},null,2));
			response.end();
		
		}
		else{
			if(JSON.stringify(home.administrator) === JSON.stringify(request.user_data.data.id)) 
				request.user = "Admin";
			else
				request.user = "User"
			request.home  = home;
			next();
		}
	}); 
});
routerHome.get('/', (request,response) => {
	Home.find({ $or:
			[ {administrator:  request.user_data.data.id}, { 'users._id' : mongoose.Types.ObjectId(request.user_data.data.id) } ]
			} , function(err,homes) {
		if(err) {
			response.write(JSON.stringify({"error":err},null,2));
			response.end();
		}
		else{

	//response.json(homes});
	response.write(JSON.stringify({user_data: request.user_data, homes:homes},null,2));
	response.end();
	}
	});
	//response.json({'body':'Successs', 'count':request.count});
});

routerHome.get('/:home_id', (request,response) => {
			home = request.home;

			if(home) {
				
				
				response.write(JSON.stringify({type:true,'code':'GET_SUCCESS', home},null,2));
				response.end();

			}

			else if(!home) {
				response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
				response.end();
				
			}
		
	
});

routerHome.post('/', (request,response) => {
	var home = new Home();
	home.name = request.body.name;
	home.administrator  = request.user_data.data.id;
	home.description = request.body.description;
	home.device_auth_code = randomString(12);
	home.device_status = 00;


	home.save(err=> {
		if(err) {
			response.write(JSON.stringify({type: false, error: err},null,2));
				response.end();
		}
		else{
			//User.find()
			response.write(JSON.stringify({"code":'CREATE-SUCCESS',"message":`${home.name} created!`},null,2));
			response.end();
		}
	});
});

routerHome.put('/:home_id',(request,response) => {
	home = request.home;
	if(home && request.user === "Admin") {
		home.name = request.body.name;
		home.description = request.body.description;
		home.save(err=> {
			if(err)
				response.send(err);
			else{
				response.write(JSON.stringify({"code": 'UPDATE-SUCCESS', "message": `Home ${home.name} updated!`},null,2));
				response.end();
			}
		});
	}
	else 
		{
			response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
			response.end();
	}
		
});

routerHome.delete('/:home_id', (request,response)=> {
	home= request.home;
	if(home && request.user === "Admin"){
		Home.remove({'_id': request.params.home_id}, (err,home)=> {
			if(err)
				response.json({"error":err});
			else{
				response.write(JSON.stringify({"code": 'DELETE-SUCCESS', "message":"Successfully deleted the entity"},null,2));
				response.end();
			}
		});
	}
	
});


//Add users





routerHome.post('/:home_id/user', (request,response,next) => {
	if(isEmpty(request.body.add_user_email) || !validator.isEmail(request.body.add_user_email)) {
	response.write(JSON.stringify({type:false, message: "That doesn't look like an email"}));
	response.end();

	}
else
 next();
});



routerHome.post('/:home_id/user', (request,response) => {
	var home = request.home;
	if(home && request.user === "Admin") {
		var invited_user_email = request.body.add_user_email;
		var invited_user_name = request.body.add_user_name;

		User.findOne({email:invited_user_email}, {password:0}, (err,user)=> {

			if(err) {
				response.write(JSON.stringify({type:false, 'error' :err},null,2));
				response.end();
			}
			else if(user) {
				var toInsert = { _id:user._id, email: user.email,name:invited_user_name, status: 1}
				Home.findByIdAndUpdate(request.params.home_id, {$addToSet: {users: toInsert}}, (err) => {
					if(err) {
						response.write(JSON.stringify({type:false, 'error' :err},null,2));
						response.end();
					}
					else{
						response.write(JSON.stringify({"code":'ADD-SUCCESS',"message": `User successfully added!`},null,2));
						response.end();
					}
				});

			}
			else {
				var toInsert = { email: invited_user_email,name:invited_user_name, status:0}
				Home.findByIdAndUpdate(request.params.home_id, {$addToSet: {users: toInsert}}, (err) => {
					if(err) {
						response.write(JSON.stringify({type:false, 'error' :err},null,2));
						response.end();
					}
					else {
						inviteUser();
						response.write(JSON.stringify({"code":'ADD-SUCCESS',"message": `User successfully invited!`},null,2));
						response.end();
					}
				});

			}

		});
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Only the home administrator can add new users"},null,2));
		response.end();
	}
});

routerHome.get('/:home_id/user', (request,response) => {

var home = request.home;
	Home.findOne({_id: home._id},{users:1}, (err, user) =>{
		console.log(user);
		let users = user.users;

        response.write(JSON.stringify({code:'GET-SUCCESS',users},null,2));
        response.end();
        });


})

routerHome.delete('/:home_id/user/:user_id',(request,response) => {
	home= request.home;
	user_id= request.params.user_id;
	home_id = request.params.home_id;

	console.log(home_id );
	console.log(user_id);
	if(home && request.user === "Admin") {
		Home.update({_id: home_id }, { $pull: { users: {'_id':user_id}}}, (err,home) => {
			if(err) {
				response.write(JSON.stringify({code: 'Fail', error:err}));
				response.send();
			}
			else {
				response.write(JSON.stringify({code: 'DELETE-SUCCESS', message:"User successfully deleted"}));
				response.send();
			}
		})
	}

})

routerHome.use(( request,response,next) => {
	console.log("Helo");
	next();
});
	


	/*if(home) {
		Home.remove({'_id': request.params.home_id}, (err,home)=> {
			if(err)
				response.json({"error":err});
			else{
				response.write(JSON.stringify({"message":"Successfully deleted the entity"},null,2));
				response.end();
			}*/
	
	


//});
routerHome.use('/:home_id/room',roomRouter);

return routerHome;
}

module.exports = returnRouter;

function inviteUser() {

	//To be added here
}


function isEmpty(str) {
    return (!str || 0 === str.length);
}


function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

