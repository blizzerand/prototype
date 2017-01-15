var express = require('express');
var mongoose = require('mongoose');
var dbConfig = require('../../config/db.js');
//Setting the router
var routerUser = express.Router();




var User  = require('../models/user_model.js');

routerUser.use('/:user_id', (request,response,next) => {
	requestedUserId = request.params.user_id;
	console.log(requestedUserId + ' ' + request.user_data.data.id);
	if(requestedUserId == request.user_data.data.id) {
		next();
	}
	
	else {
		response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this objects"},null,2));
		response.end();
	}
});

routerUser.get('/:user_id', (request,response) => {
	
	User.findOne({ "_id" : request.params.user_id},{'password':0}, (err,user)  => {
		if(err) {
			response.write(JSON.stringify({'error':err},null,2));
			response.end();
		}
		else if(user) {
			response.write(JSON.stringify({user},null,2));
			response.end();
		}
		else {				
			response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
			response.end();
		}
	});
});

routerUser.put('/:user_id', (request,response) => {
	User.findOne({ "_id" : request.params.user_id},{'password':0}, (err,user)  => {
		if(err) {
			response.write(JSON.stringify({'error':err},null,2));
			response.end();
		}
		else if(user) {
			//TODOcode to be completed

			user.save( err=> {
				if(err) {
					response.write(JSON.stringify({'error':err},null,2));
					response.end();

				}
				else{
					response.write(JSON.stringify({"message": `Your profile has been successfully updated`},null,2));
					response.end();
				}
			});
		}
		else {				
			response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
			response.end();
		}
	});
});

routerUser.delete('/:user_id', (request,response ) => {
	User.remove({'_id' : request.params.user_id}, (err,user)=> {
		if(err) {
			response.write(JSON.stringify({'error':err},null,2));
			response.end();
		}
		else if(user) {
			response.write(JSON.stringify({"message":"Successfully deleted the entity"},null,2));
			response.end();
		}
		else {
			response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
			response.end();
		}
	});
});

module.exports = routerUser;