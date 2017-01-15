var express = require('express');
var mongoose = require('mongoose');
var dbConfig = require('../../config/db.js');
var validator = require('validator');
var jwt   = require("jwt-simple");
var moment = require('moment');
var routerAuth = express.Router();
var jwtauth = require('../lib/jwtlib.js');
//mongoose.connect(dbConfig.url);

var User = require('../models/user_model.js');
var Home = require('../models/home_model.js');
var secretKey = require('../../config/config.js');




routerAuth.use( (request,response,next) => {
	if(request.method === "POST"){
	request.validation = false;
	request.validation = validator.isEmail(request.body.email) && 
						validator.isAlphanumeric(request.body.password) &&
						validator.isLength(request.body.password,{min:7, max:36});
	}
	next();

});

routerAuth.post('/signup', (request,response,next) => {
	
	if(request.validation) { 

		User.findOne({email: request.body.email}, (err,user) => {
			if(err) {
				response.json({
					type: false,
					message: "Error occured at" + err
				});
			}
			else {
				if(user) {
					response.json({
						type:false,
						data:user,
						message: "User already exists"
					});
				}
				else {
					var user = new User();
					user.email = request.body.email;
					user.name = request.body.name;
					user.unique_id = user.generateUniqueId();
					user.password = user.generateHash(request.body.password);

					user.save(function (err,user) {
						if(err) {
							response.json({
								type:false,
								message: "Error occured at" + err
								});
						}
						else {
							Home.update({"users.email": user.email}, {$set:{'users.$._id':user._id, 'users.$.status':1}},{"multi": true}, err=> {
								if(err)
								response.write(JSON.stringify({error:err, message:"An error occured"},null,2));
							});
							var expires = moment().add('days', 7).valueOf();
								user.token = jwt.encode({
 								 iid: user.unique_id,
 								 iss: user.name, 								 
 								 exp: expires

								}, secretKey.secret);



							//user.token = jwt.sign({uid: user.unique_id, id: user._id,name: user.name}, require('../../config/config.js').secret);
							user.save(function(err, user1) {
                        		response.write(JSON.stringify({
                          			 type: true,
                            		 data: {email:user1.email, name: user1.name, id: user.unique_id, expiry: expires},
                            		 token: user1.token
								},null,2));
								response.end();
							});
						}
					});	
				}
			}
		});
	}
	else 
		response.json({
			type:false,
			message:"Email id/password does not follow the credential policy",

		});
});


routerAuth.get('/users', jwtauth, function(request, response){
	console.log("Here");
  // do something
});
//routerAuth.use(tokenValidation);
//routerAuth.use(authChecker);


routerAuth.post('/d_signin', (request,response,next) => {
	if(request.validation) { 
		Home.findOne({ device_auth_code: request.body.authCode},(err,home) => {
			if(err) {
				response.json({
					type: false,
					message: "Error occured at" + err
				})
			}
			else if(!home) {
				response.json({
					type: false,
					message: "Home doesn't exist"
				});
			}
			else {
				var home_id = home._id;
				User.findOne({email: request.body.email}, (err,user) => {
					if(err) {
					response.json({
					type: false,
					message: "Error occured at" + err
						});
					}
					else if(!user) {
					response.json({
					type: false,
					message: "User doesn't exist"
						});
					}
					else {
						var password_safe = user.validPassword(request.body.password, user.password);
				
						if (!password_safe) {


					//else if(!user) {
							response.json({	
							type: false,
							message: "Invalid Username/password"
							});
						}	

						else{
							
							Home.update({_id:home_id}, {$set: {device_status: 01}}, (err)=> {
								if(err) {
									response.json({
									type: false,
									message: "Error occured at" + err
									});
								}
								else {
									response.json({
									type: true,
									code: "SUCCESS"
									});
								}

								
							})
							
						}

					}

				});

			}
		})
	}

});

routerAuth.post('/signin',(request,response,next) => {
	if(request.validation) { 
		User.findOne({email: request.body.email}, (err,user) => {
			if(err) {
				response.json({
					type: false,
					message: "Error occured at" + err
				});
			}
			else if(!user) {
				response.json({
					type: false,
					message: "User doesn't exist"
				});
			}
			else {
				

				var password_safe = user.validPassword(request.body.password, user.password);
				//User.findOne({email: request.body.email, password: password_safe}, (err,user) => {
				//	if(err) {
					//	response.json({
					//	type: false,
					//	message: "Error occured at" + err
					//	});
					//}
				if (!password_safe) {


					//else if(!user) {
						response.json({	
							type: false,
							message: "Invalid Username/password"
						});
					}
					else {
						var expires = moment().add(7, 'days').valueOf();
							user.token = jwt.encode({
 								iid: user.unique_id,
 								iss: user.name, 								 
 								exp: expires}, secretKey.secret);	

						user.save(function(err, user1) {
                        	response.json({
                          		type: true,
                            	data: { id: user.unique_id, email:user1.email, name: user1.name, expiry: expires},
                            	token: user1.token
							});
						});
					}
			//	});	
			}
		});

			
	}
	else {
		response.json({
			type:false,
			message:"Email id/password does not follow the credential policy",
			method: request.method
		});
	}
});




function isEmpty(str) {
    return (!str || 0 === str.length);
}
module.exports = routerAuth;