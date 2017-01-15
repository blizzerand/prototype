var mongoose = require('mongoose');
var User = require('./user_model');

Schema = mongoose.Schema;

Appliance = new Schema({
	appliance_name: {type:String},
	appliance_id: {type:String},
	appliance_description: {type:String},
	keywords: [{ type: String}],
	appliance_type: { type: String},
	appliance_status: { light: { write_state: Number, read_state: Number },
					fan: {write_state: Number, read_state: Number, write_speed: Number, read_speed: Number}
	}

});

Room= new Schema({
	name: {type: String, required:true},
	device_auth_code: {type: String},
	
	alt_name: {type:String},
	keywords: [{type: String}],
	appliance: [Appliance]
});

Home = new Schema({
	name: { type: String, required: true},
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