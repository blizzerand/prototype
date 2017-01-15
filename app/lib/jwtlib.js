var jwt = require('jwt-simple');
var user = require('../models/user_model.js');
var secretKey = require('../../config/config.js');
var tokenValidation = function tokenValidation(request,response,next) {


	var token = (request.body && request.body.access_token) || (request.query && request.query.access_token) || request.headers['x-access-token'];

	if(!isEmpty(token)){
		request.token = token;
		try {
    		var decoded = jwt.decode(request.token,secretKey.secret);
    		if (decoded.exp <= Date.now()) {
  				response.json({
        		    type: false,
        		    message: "Token expired",
        		    redirect: '/signin'
					});
			}
			else{
				user.findOne({'unique_id': decoded.iid}, function(err,user) {
					if(err) {
						response.json({
							type:false,
							message: "Error with token" + err,
							redirect: '/signin'
						});
					}
					else if(!user){
						response.json({
							type:false,
							message: "Wrong token code",
							redirect: '/signin'
						});

					}

					else {
						request.user_data ={
							type: true,
							data: {
								email: user.email,
								name: user.name,
								id: user._id,
								unique_id: user.unique_id
							}
						};	
						
						next();
					}
				
				});

			}	
    	}
   		catch (err) {
    		response.json({
				type:false,
				message: "Error with token" + err,
				redirect: '/signin'
			});
  		}

	}
	else {
		response.json({
			type:false,
			message:"User isn't logged in",

			redirect: '/signin'
		});
	}

}

  
  		
	

function isEmpty(str) {
    return (!str || 0 === str.length);
}

	module.exports = tokenValidation;