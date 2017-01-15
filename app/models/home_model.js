var mongoose = require('mongoose');
var User = require('./user_model');

Schema = mongoose.Schema;



Room= new Schema({
	name: {type: String, required:true},


	alt_name: {type:String},
	keywords: [{type: String}],
	
});

Home = new Schema({
	name: { type: String, required: true},
	device_auth_code: {type: String},
	device_status: {type: Boolean, default: false},
	description: {type: String},
	administrator: {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	
	users: [{ 
		_id: {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
		email: {type: String},
		name: { type: String},
		status: { type: Number}
	}],
	rooms: [Room]
	

	
});


/*Room.pre('save', function(next) {
	if(!this.rooms) {
		var room_name = this.name;
		var room_alt_name = this.alt_name;
		console.log(this.name + "Hello");
		this.keywords.push(room_name);
		 var err = new Error('something went wrong');
  next(err);
		
	}
});*/
module.exports = mongoose.model('Home', Home);