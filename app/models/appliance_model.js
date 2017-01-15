
var mongoose = require('mongoose');
var User = require('./user_model');
var Home = require('./home_model');

Schema = mongoose.Schema;

Appliance = new Schema({
	name: {type:String},
	id: {type:String},
	home_id: {type : mongoose.Schema.Types.ObjectId, ref: 'Home', required: true},
	room_id: {type : mongoose.Schema.Types.ObjectId, required: true},
	description: {type:String},
	keywords: [{ type: String}],
	type: { type: String},
	status: {  state: {type:Number, default: 0}, read_state: Number, speed: Number, read_speed: Number}
	

});

module.exports = mongoose.model('Appliance', Appliance);