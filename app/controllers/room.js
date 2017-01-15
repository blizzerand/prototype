var express = require('express');
var mongoose = require('mongoose');
var dbConfig = require('../../config/db.js');
//Setting the router
var routerRoom = express.Router();
var validator = require('validator');
var ObjectId = require('mongoose').Types.ObjectId;

var Home = require('../models/home_model.js');
var Appliance = require('../models/appliance_model.js');

var returnRouter = function(io) {

routerRoom.post('/', (request,response) => {
	home = request.home;
	
	if(home) {
		var	room_name = request.body.room_name;
		var	room_alt_name = request.body.room_alt_name;
		console.log(home);
		home.rooms.push({ 'name':room_name, 'alt_name': room_alt_name});


		home.save( err=> {
			if(err) {
				response.write(JSON.stringify({error:err},null,2));
				response.end();
			}
			else {
				
				response.write(JSON.stringify({code:"CREATE-SUCCESS", message:"Room has been added"},null,2));
				response.end();
			
			}
		});
		
		/*home.rooms.save(err=> {
			if(err) {
				response.write(JSON.stringify({type: false, error: err},null,2));
				response.end();
				}
			else{

			console.log(room_name);
			}
		});*/
	}	
})

routerRoom.get('/', (request,response) => {
	home = request.home;
	if(home) {
		rooms = home.rooms;

		response.write(JSON.stringify({code:'GET-SUCCESS','rooms':rooms},null,2));
		response.end();
	}
})

routerRoom.delete('/:room_id',(request,response) => {
	home= request.home;
	room_id= new ObjectId(request.params.room_id);
	home_id = request.home_id;
	console.log(home_id);
		if(home && request.user === "Admin") {
		Home.update({_id: home_id }, { $pull: {rooms: {'_id':room_id}}}, (err,home) => {
			if(err) {
				response.write(JSON.stringify({code: 'Fail', error:err}));
				response.send();
			}
			else {
				response.write(JSON.stringify({code: 'DELETE-SUCCESS',message:"Room successfully deleted"}));
				response.send();
			}
		})
	}

})



routerRoom.get('/:room_id/appliance', (request,response) => {
	home = request.home;
	if(home) {
		room_id = request.params.room_id;
		home_id = request.home_id;
			Appliance.find({'home_id':home_id, 'room_id': room_id},
			 (error,appliance) => {
			if(error) {
				response.write(JSON.stringify({type:false, 'error' :error},null,2));
				response.end();
			}
			else if(!appliance) {
				response.write(JSON.stringify({type: false, message: "You don't have any appliance right now"},null,2));
				response.end();
			} 
			else {
				response.write(JSON.stringify({type:true, 'code':'GET_SUCCESS', appliance},null,2));
				response.end();

			}
		})
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
		response.end();
	}

	
})


routerRoom.post('/:room_id/appliance', (request,response) => {
	home = request.home;
	if(home) {
		var appliance = new Appliance();
	
		appliance.name = request.body.appliance_name;
		appliance.type = request.body.appliance_type;
		appliance.description = request.body.appliance_description;
		appliance.id = request.body.appliance_id;
		appliance.room_id = request.params.room_id;
		appliance.home_id  = home._id;
		if(isEmpty(appliance.name) ||isEmpty(appliance.type)) {
			response.write(JSON.stringify({type:false, "message" : "You've left some fields empty"},null,2));
			response.end();
		}
		else {
			appliance.save(err => {
			if(err) {
				response.write(JSON.stringify({type: false, error: err},null,2));
				response.end();
			}
			else{
			//User.find()
				response.write(JSON.stringify({"code":'CREATE-SUCCESS',"message":`${appliance.name} created!`},null,2));
				response.end();
			}
			});
		}
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
		response.end();
	}

});
	/*	})
		console.log(appliance_description);
		
		else {
			var toInsert = {'appliance_name':appliance_name, 'appliance_type':appliance_type,'appliance_description':appliance_description};
			Home.update({_id:request.home_id, "rooms._id" :room_id},
				{ $push: {
					"rooms.$.appliance": toInsert
					}
				}, (error,status) => {
					if(error) {
						response.write(JSON.stringify({type:false, 'error' :error},null,2));
						response.end();
					}
					else{
						response.write(JSON.stringify({"code":'ADD-SUCCESS',"message": `Appliance successfully added!`},null,2));
						response.end();
					}
				})
		}
	}*/
	
	

routerRoom.get('/:room_id/appliance/:appliance_id', (request,response) => {
	home = request.home;
	if(home) {
		room_id = request.params.room_id;
		appliance_id = request.params.appliance_id;
		home_id = request.home_id;
		/*Home.aggregate(
			{$match :{ _id: new ObjectId(home_id)}},
			 {$unwind: '$rooms'},
			 {$unwind: '$rooms.appliance'},
			
			{$match: {'rooms.appliance._id': new ObjectId(appliance_id)}}
			 
			,*/

		Appliance.findOne({_id: appliance_id, 'room_id': room_id, 'home_id': home_id}, (error,appliance) => {
			if(error) {
				response.write(JSON.stringify({type:false, 'error' :error},null,2));
				response.end();
			}
			else if(!appliance) {

				response.write(JSON.stringify({type: false, message: "This page doesn't exist or you don't have rights to view this object"},null,2));
				response.end();
			} 
			else {
				response.write(JSON.stringify({type:true, 'code':'GET_SUCCESS',appliance},null,2));
				response.end();

			}
		})
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
		response.end();
	}
})

routerRoom.put('/:room_id/appliance/:appliance_id', (request,response,next) => { 
	home = request.home;
	io = request.io;


	if(home) {
		room_id = request.params.room_id;
		appliance_id = request.params.appliance_id;
		home_id = request.home_id;
		Appliance.findOne({_id:appliance_id}, (error,appliance) => {
			if(error) {

				response.write(JSON.stringify({type:false, 'error' :error},null,2));
				response.end();
			}
			else if(!appliance){
				response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
				response.end();
			}
			else {
			if(!isEmptyObject(request.body.appliance_status)) {
				appliance.status = request.body.appliance_status;
				
			}
 
			if(!isEmpty(request.body.appliance_name))
				appliance.name = request.body.appliance_name;
			else if(!isEmpty(request.body.appliance_type))
				appliance.type = request.body.appliance_type;
			else if(!isEmpty(request.body.appliance_id))
				appliance.id = request.body.appliance_id;
			
				
			else if(!isEmpty(request.body.appliance_description))
				appliance.description = request.body.appliance_description;
			
			request.appliance_id = appliance.id;
			request.appliance_status = appliance.status.state;

			appliance.save(error => {

				if(error) {
					response.write(JSON.stringify({type: false, error: error},null,2));
					response.end();
				}
				else{
					next();
					}				
			})
			}
		})
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
		response.end();
	}
})


routerRoom.put('/:room_id/appliance/:appliance_id', (request,response) => {
	console.log(request.appliance_id);

	let id = request.appliance_id;
	let status = request.appliance_status;
	io = request.io;
	io.sockets.emit('message', {'appliance_id':id, 'appliance_status': status});

	response.write(JSON.stringify({type:false,code: "UPDATE-SUCCESS", message: "Success"}));
	response.end();


   // socket.emit('fuckedup',{'message':"TEsting"});
    
  //});
	


 /* socket.on('message', function (data, response) {
  	console.log(data);
});*/


  
	
});


routerRoom.delete('/:room_id/appliance/:appliance_id', (request,response) => { 
	home = request.home;
	if(home) {
		appliance_id = request.params.appliance_id;
		Appliance.remove({_id:appliance_id }, (error,appliance) => {
			if(error) {
					response.write(JSON.stringify({type: false, error: error},null,2));
					response.end();
				}
				else{
			//User.find()
					response.write(JSON.stringify({"code":'DELETE-SUCCESS',"message":'Appliance deleted',appliance},null,2));
					response.end();
				}
		}) 
	}
	else {
		response.write(JSON.stringify({type:false, "message" : "Something went wrong, you don't have rights to view this home"},null,2));
		response.end();
	}
})
return routerRoom;
}
module.exports = returnRouter;

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}
