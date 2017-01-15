var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
// define the schema for our user model
var userSchema = new Schema({

        unique_id    : String, 
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        name         : String,
        token        : String,
        homes        : [{ type : mongoose.Schema.Types.ObjectId, ref: 'Home' }]
    });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password,passwordhash) {
    return bcrypt.compareSync(password, passwordhash);
};


userSchema.methods.generateUniqueId = function() {
    return bcrypt.genSaltSync(2048);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

