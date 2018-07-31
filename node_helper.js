/* Magic Mirror
 * Module: MMM-Netatmo-Presence
 *
 * By AgP42 - https://github.com/AgP42/MMM-Netatmo-Presence
 * 
 * MIT Licensed.
 */
 
var NodeHelper = require('node_helper');
var request = require('request');
var access_token = null;

module.exports = NodeHelper.create({
  start: function () {
    console.log(this.name + ' helper started ...');    
    
    
  },
  
socketNotificationReceived: function(notification, payload) {
    
  //  console.log("notification : " + notification + ", payload : " + payload);
    
    var self = this;
  
     /*
     * Get the access_token
     * code from https://dev.netatmo.com/resources/technical/samplessdks/codesamples
     * */
     
    if (notification === 'GET_ACCESS_TOKEN') {
      
	    this.config = payload;
	    
		console.log("notification : " + notification + ", username : " + self.config.username);
		
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
			'scope': "read_presence access_presence"});

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
					access_token = res.access_token;
					var refresh_token = res.refresh_token;
					var scope = res.scope;
					console.log("Your access_token is:", access_token);
				//	console.log("Your refresh_token is:", refresh_token);
				//	console.log("Your scopes are:", scope);
					
					//we got a new token, say it to main file to allow it to request the datas
					self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', 'OK'); //send back the infos to MMM-Netatmo-Presence.js						

				} else {
					
					console.log('status code:', response.statusCode, '\n', res);
					self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', response.statusCode); //send back the infos to MMM-Netatmo-Presence.js						
					
				}
			});
		};

		var req = https.request(options, callback);
		req.on('error', function(e) {
			console.log('There is a problem with your request:', e.message);
			self.sendSocketNotification('GET_ACCESS_TOKEN_RESPONSE', e.message); //send back the infos to MMM-Netatmo-Presence.js						

		});

		req.write(params);
		req.end();

    } 
    
    /*
     * Request GET_CAMERA_EVENTS. 
     * Will send back all the "homes" data. Parsing will be done on the main file
     * Code modified, initially from https://dev.netatmo.com/resources/technical/samplessdks/codesamples
     * */
    if (notification === 'GET_CAMERA_EVENTS') {
		
	    this.config = payload;
	    
		console.log("notification : " + notification + ", access_token : " + access_token + " , eventRequestSize : " + self.config.eventRequestSize);

		var https = require("https");
		const querystring = require('querystring');

		var params = querystring.stringify({
			'access_token': access_token,
			'home_id': self.config.home_id,
			'size': self.config.eventRequestSize, //nuber of events to retrieve. 
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

					self.sendSocketNotification('GET_CAMERA_EVENTS_RESPONSE', homes); //send back the infos to MMM-Netatmo-Presence.js						
						
					
				} else if (response.statusCode == '403'){
					
					console.log('New token requested !');
					self.sendSocketNotification('GET_CAMERA_EVENTS_RESPONSE', 'TOKEN_EXPIRED'); //send back the info to MMM-Netatmo-Presence.js						

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
    
     /*
     * Check if the previous vpn_url is still reachable
     * NOT USED
     * */
    if (notification === 'PING_VPN_URL') {
      
      var that = this;
      
 //     console.log("Payload pour PING_VPN_URL :" + payload);
      
      request({
          url: payload,
          method: 'GET'
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            that.lastConnection = new Date(); //success, we record the new date
          }
          
          //whatever the answer, we send the answer back to main file with status and lastConnection timestamp
          that.sendSocketNotification('PING_VPN_URL_RESPONSE', {
              status: !error && response.statusCode == 200?"OK":"ERROR",
              lastConnection: that.lastConnection
          });
        }
      );
    } 
    
   
  }
  
  
});
