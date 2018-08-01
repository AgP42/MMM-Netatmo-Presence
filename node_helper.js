/* Magic Mirror
 * Module: MMM-Netatmo-Presence
 *
 * By AgP42 - https://github.com/AgP42/MMM-Netatmo-Presence
 * 
 * MIT Licensed.
 */
 
var NodeHelper = require('node_helper');
var request = require('request');



module.exports = NodeHelper.create({
  start: function () {
    console.log(this.name + ' helper started ...');    
    
    this.access_token = null;
	this.access_token_time = null;
        
  },
  
socketNotificationReceived: function(notification, payload) {
    
       	 
// 	 console.log(new Date() + notification + " asked, from : " + payload.instanceID);
  
     /*
     * Get the access_token
     * code from https://dev.netatmo.com/resources/technical/samplessdks/codesamples
     * */
     
    if (notification === 'GET_ACCESS_TOKEN') {
		
		var self = this;
		self.config = payload;
      	    
	//	console.log(new Date() + "notification : " + notification + ", username : " + self.config.username);
		
	//	console.log(new Date() + " - Notre token datait de :" + self.access_token_time);
	//	console.log(new Date() + " - Notre token avait :" + (new Date() - self.access_token_time)/1000 + "s");

			
		var https = require("https");
		const querystring = require('querystring');

		var options = {
			hostname: 'api.netatmo.com',
			path: '/oauth2/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};

		var params = querystring.stringify({'grant_type': "password",
			'username': self.config.username,
			'password': self.config.password,
			'client_id':self.config.client_id,
			'client_secret': self.config.client_secret,
			'scope': "read_presence access_presence read_camera access_camera"});

		var callback = function(response) {
			response.on('error', function(e) {
				console.log('error', e);
			});
			var res = '';

			response.on('data', function (chunk) {
				res += chunk;
			});

			response.on('end', function () {
				res = JSON.parse(res);
				if (response.statusCode == '200') {
					self.access_token = res.access_token;
					var refresh_token = res.refresh_token;
					var scope = res.scope;
				//	console.log("Your access_token is:", this.access_token);
				//	console.log("Your refresh_token is:", refresh_token);
				//	console.log("Your scopes are:", scope);
				
					self.access_token_time = new Date(); 
			//		console.log(self.access_token_time + " - Your access_token is:", self.access_token);
					
					//we got a new token, say it to main file to allow it to request the datas
					self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', {payloadReturn: "OK", instanceID: self.config.instanceID }); //send back the infos to MMM-Netatmo-Presence.js						

				} else {
					
					console.log('status code:', response.statusCode, '\n', res);
					self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', {payloadReturn: response.statusCode, instanceID: self.config.instanceID }); //send back the infos to MMM-Netatmo-Presence.js						
					
				}
			});
		};

		var req = https.request(options, callback);
		req.on('error', function(e) {
			console.log('There is a problem with your request:', e.message);
			self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', {payloadReturn: e.message, instanceID: self.config.instanceID }); //send back the infos to MMM-Netatmo-Presence.js						

		});

		req.write(params);
		req.end();

	}//end GET_ACCESS_TOKEN
    
    /*
     * Request GET_CAMERA_EVENTS. 
     * Will send back all the "homes" data. Parsing will be done on the main file
     * Code modified, initially from https://dev.netatmo.com/resources/technical/samplessdks/codesamples
     * */
    if (notification === 'GET_CAMERA_EVENTS') {
		
		var self = this;
		self.config = payload;	    
	    
	//	console.log(new Date() + "notification : " + notification + ", access_token : " + self.access_token + " , eventRequestSize : " + self.config.eventRequestSize);

		var https = require("https");
		const querystring = require('querystring');

		var params = querystring.stringify({
			'access_token': self.access_token,
			'home_id': self.config.home_id,
			'size': self.config.eventRequestSize, //number of events to retrieve. 
		});

		var options = {
			hostname: 'api.netatmo.com',
			path: '/api/gethomedata',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};


		var callback = function(response) {
			response.on('error', function(e) {
				console.log('error', e);
			});
			var res = '';

			response.on('data', function (chunk) {
				res += chunk;
			});

			response.on('end', function () {
				res = JSON.parse(res);
				if (response.statusCode == '200') {
					var data = res.body;
					var homes =  data.homes;
			//		console.log(homes)	
			
			//		console.log(new Date() + " - NEW DATAS, for : " + self.config.instanceID);

					self.sendSocketNotification('GET_CAMERA_EVENTS_RESPONSE', {payloadReturn: homes, instanceID: self.config.instanceID }); //send back the infos to MMM-Netatmo-Presence.js						
						
					
				} else if (response.statusCode == '403'){
					
					console.log(new Date() + 'Error 403 - New token requested !');
					self.sendSocketNotification('GET_CAMERA_EVENTS_RESPONSE', {payloadReturn: 'TOKEN_EXPIRED', instanceID: self.config.instanceID }); //send back the info to MMM-Netatmo-Presence.js						

				} else {
					console.log('status code:', response.statusCode, '\n', res);
				}
			});
		};

		var req = https.request(options, callback);
		req.on('error', function(e) {
			console.log('There is a problem with your request:', e.message);
		});

		req.write(params);
		req.end();

    }
    
   
  }
  
  
});
