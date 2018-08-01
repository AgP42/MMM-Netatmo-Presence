/* Magic Mirror
 * Module: MMM-Netatmo-Presence
 * 
 * By AgP42 - https://github.com/AgP42/MMM-Netatmo-Presence
 * First Version : 29/07/2018
 * 
 * MIT Licensed.
 */
 
//For the PIR sensor
var UserPresence = true; //by default : user present. (No PIR-Sensor)

Module.register("MMM-Netatmo-Presence",{
		
		// Default module config.
		defaults: {
			
				logDebug: false, //set to true to get detailed debug logs. To see them : "Ctrl+Shift+i"
				
                updateInterval: 5, //in min. Refrest interval
                initialDelay: 0, //sec
                displayLastUpdate: true, //to display the last update of the API datas or live snapshot image (on top of the module)
				displayLastUpdateFormat: 'ddd - HH:mm:ss', //format of the date and time to display for displayLastUpdate and for events
           		animationSpeed: 1000, 	//display animation time between refresh, in ms.
				
				//config for timeline display of the events
				eventsTypeMessageDisplay: false, //if false : will display icons for the type of events, if true : will display the text message given by Netatmo (directly on the good language normally)
				eventsNumberToDisplay: 5,	//set to 1 for only the last one and set to 0 for none...	
				eventsTypeToDisplay: ["human", "vehicle"], //possible values : "animal", "vehicle", "human" or "movement"
				eventRequestSize: 30, //will request this value of events to the API. Increase this value if the number of "eventsNumberToDisplay" is often not reach. Decrease it to limit bandwith and MagicMirror load. 
				lastEventAsFullImageOnTop: true,	//to display the last event not only as a small image focus on Netatmo detection but also the full image. If several cameras, only the one of the last event will be displayed				
				fade: true,		//fade effect at the end of the timeline ?
				fadePoint: 0.25,
				//icon definition
				iconHuman: 'fa fa-user iconHumanNP',
				iconVehicle: 'fa fa-car iconVehicleNP',
				iconAnimal: 'fa fa-paw iconAnimalNP',
				iconMovement: 'fa fa-envira iconMovementNP',
				
				//config for live snapshot
				liveImageAsFullImageOnTop: true, //display the live snapshot or not
				liveCamera_Name: ["Camera1", "Camera2"], //name of the cameras to be displayed (has to be the same than configured on your netatmo app) The images will be display on the same order than written here
				
                //API configuration. See README.md for details how to get thoses values
				client_id: null, // your app id
				client_secret: null, // your app secret
				username: null, //communication is https
				password: null,	//communication is https			
				home_id: null										

		},

start: function () {
	
		Log.info("Starting module: " + this.name + " with identifier: " + this.identifier);

		this.loglog("start");

		var self = this;
		this.ModuleNetatmoPresenceHidden = false; //displayed by default
		this.IntervalID = 0;
		this.events = [];
		this.cameraLiveURL = [];
		this.config.instanceID = this.identifier;
		
		this.loaded = false;
		this.errorMessage = "Loading...";
		
//		this.loglog("demande premier token - loaded false");
	
		//get a new token at start-up. When receive, GET_CAMERA_EVENTS will be requested
		this.updateTimer = setTimeout(function() {
			self.sendSocketNotification('GET_CAMERA_EVENTS', self.config);
		}, this.config.initialDelay *1000);

		//set auto-update                               
		this.IntervalID = setInterval( function () { 				
			//request directly the data, with the previous token. When the token will become invalid (error 403), it will be requested again
			self.sendSocketNotification('GET_CAMERA_EVENTS', self.config);
		}, this.config.updateInterval * 60 * 1000 + this.config.initialDelay *1000);    

}, //end start function

loglog: function(notification) {
		
	if(this.config.logDebug){
		Log.log(this.data.header + " - " + moment.unix(Date.now() / 1000).format('ddd - HH:mm:ss:SSS') + " - " + notification);
	}
		
},
  
suspend: function() { //function called when module is hiden
	this.ModuleNetatmoPresenceHidden = true; 

		this.loglog("Fct suspend - ModuleHidden = " + this.ModuleNetatmoPresenceHidden);
	
	this.GestionUpdateIntervalNetatmoPresence(); //call the function that manage all cases
},

resume: function() { //function called when module is displayed again
	this.ModuleNetatmoPresenceHidden = false;
	
		this.loglog("Fct resume - ModuleHidden = " + this.ModuleNetatmoPresenceHidden);

	
	this.GestionUpdateIntervalNetatmoPresence();	
},

notificationReceived: function(notification, payload) {
	if (notification === "USER_PRESENCE") { // notification sent by the module MMM-PIR-Sensor or others
		
		this.loglog("Fct notificationReceived USER_PRESENCE - payload = " + payload);
		
		UserPresence = payload;
		this.GestionUpdateIntervalNetatmoPresence();
	}
},

GestionUpdateIntervalNetatmoPresence: function() {
	if (UserPresence === true && this.ModuleNetatmoPresenceHidden === false){ //user is present and module is displayed
		
		var self = this;

		this.loglog("user is present and module is displayed ! Update !");
    
		// update now
		self.sendSocketNotification('GET_CAMERA_EVENTS', self.config);

		//set autoupdate again if no other setInterval is running                     
		if (this.IntervalID === 0){
			//set autoupdate                               
			this.IntervalID = setInterval( function () { 				
				self.sendSocketNotification('GET_CAMERA_EVENTS', self.config);
			}, this.config.updateInterval * 60 * 1000 + this.config.initialDelay *1000);
		}
	
	}else{ //user is not present OR module is not displayed : stop updating
		
		this.loglog("Stop update ! ID : " + this.IntervalID);
	
		clearInterval(this.IntervalID); // on arrete l'intervalle d'update en cours
		this.IntervalID=0; //on reset la variable

	}
},

//communication socket with node_helper.js --> reception
socketNotificationReceived: function(notification, payload) {

	var self = this;
  	  
    this.loglog("received notification : " + notification + " pour : " + payload.instanceID + " payload : " + payload.payloadReturn);
		
	//if this notificatoin is not for us --> go out of the loop !	
	if (payload.instanceID !== this.identifier) {
		this.loglog("Mauvaise instance, STOP ! Envoyé pour : " + payload.instanceID + " et nous on est !: " + this.identifier);
		return;
    }
    
	
  /*
   * GET_ACCESS_TOKEN_RESPONSE
   * */	
  if (notification === 'GET_ACCESS_TOKEN_RESPONSE') {
	  
	if(payload.payloadReturn === 'OK'){//we got a token, we can request the data
		
		this.sendSocketNotification('GET_CAMERA_EVENTS', this.config);
		
	}else{
		
		this.loglog("GET_ACCESS_TOKEN_RESPONSE en erreur - loaded false : " + payload.payloadReturn);

		self.loaded = false;
		self.errorMessage = "ERROR : " + payload.payloadReturn;
		self.updateDom(self.config.animationSpeed); //update the Dom to display the error message
		
	}
	
	  
  }//end notification = GET_ACCESS_TOKEN_RESPONSE
  
  /*
   * GET_CAMERA_EVENTS_RESPONSE
   * */	
  if (notification === 'GET_CAMERA_EVENTS_RESPONSE') {


	if(payload.payloadReturn === 'TOKEN_EXPIRED'){//token ended, let's request a new one
		
		this.loglog("TOKEN EXPIRED notification received, new one requested");		
		
		this.sendSocketNotification('GET_ACCESS_TOKEN', self.config);
		
	} else if (payload.payloadReturn) { 
		
		var homes = payload.payloadReturn; 
		self.cameraLiveURL = [];

							
		//now we receive all datas, we look for our home id (probably the first one)
		homes.forEach(function(i_homes) { //i_homes represent the value of the index and not the index itself !
						
			if (i_homes.id == self.config.home_id) { //we found it
				
				if(self.config.liveImageAsFullImageOnTop){//if live requested, look into "cameras" to catch the vpn_url to display live snapshot

					i_homes.cameras.forEach(function(i_cameras) {//loop into API answer file					
					
						self.config.liveCamera_Name.forEach(function(i_cameras_configName) {//loop into config array			
					
							if (i_cameras.name == i_cameras_configName) { //we found our camera, lets catch the vpn_url			
																		
								self.cameraLiveURL.push(i_cameras.vpn_url+"/live/snapshot_720.jpg"); //--> finally, our cameras URL !
								
							}
					
						});
					});	
					
				}
				
				//get all events (much more easier...)
				self.events = i_homes.events;
		//		Log.log("events recues :" + self.events);

			}
			
		});
	
		this.loglog("Loaded = true");		

		self.loaded = true;
		self.updateDom(self.config.animationSpeed); //update the Dom
		
	  }//end if payload
	  
  }//end notification = GET_CAMERA_EVENTS_RESPONSE
  
},//end socketNotificationReceived

getStyles: function() {
    return ["MMM-Netatmo-Presence.css", 'font-awesome.css'];
},


// Override dom generator.
getDom: function() {
	
	var self = this;
	var eventNumber = 0;

	this.loglog("update iFrame DOM");	
	
		
	
	var wrapper = document.createElement("div");// main Wrapper that containts the others
	wrapper.className = "mainWrapperNP"; //for CSS customization

	//to be displayed at start-up during loading or after when an error occurs
	if (!this.loaded) {
		
		wrapper.innerHTML = self.errorMessage;
		wrapper.className = "dimmed light small";
		
		//to display last update once on top of the timeline
		if(this.config.displayLastUpdate){
			
			this.lastUpdate = Date.now() / 1000 ; 
		
	/*		var line = document.createElement("div");
			line.className = "lineNP";
			wrapper.appendChild(line);*/

			var updateinfo = document.createElement("div"); //le div qui donne la date, si configuré pour etre affichée
			updateinfo.className = "updateinfoNP";
			updateinfo.innerHTML = " Update : " + moment.unix(this.lastUpdate).format(this.config.displayLastUpdateFormat);
			
			wrapper.appendChild(updateinfo);
		}
		
		return wrapper;
	}
	
	//to display last update once on top of the timeline
	if(this.config.displayLastUpdate){
		
		this.lastUpdate = Date.now() / 1000 ; 
	
/*		var line = document.createElement("div");
		line.className = "lineNP";
		wrapper.appendChild(line);*/

		var updateinfo = document.createElement("div"); //le div qui donne la date, si configuré pour etre affichée
		updateinfo.className = "updateinfoNP";
		updateinfo.innerHTML = " Update : " + moment.unix(this.lastUpdate).format(this.config.displayLastUpdateFormat);
		
		wrapper.appendChild(updateinfo);
	}
		
 	/*
	 * display live snapshot of the requested cameras :
	 * 
	 * */
	if(self.config.liveImageAsFullImageOnTop){
	
		var liveWrapper = document.createElement("div");
		liveWrapper.className = "liveWrapperNP"; 				
				
		self.cameraLiveURL.forEach(function(i_cameraURL, index) {

			var liveName = document.createElement("div"); 
			liveName.className = "liveNameNP";
			liveName.innerHTML = "Live " + self.config.liveCamera_Name[index];		
			liveWrapper.appendChild(liveName);
		
			var liveImageAsFullImageOnTop = document.createElement("IMG"); 
			liveImageAsFullImageOnTop.className = "liveImageAsFullImageOnTopNP";
			liveImageAsFullImageOnTop.src = i_cameraURL;		
			liveWrapper.appendChild(liveImageAsFullImageOnTop);
			
		});
		
		//display line to separate live and events
		var line = document.createElement("div");
		line.className = "lineNP";
		liveWrapper.appendChild(line);		
		wrapper.appendChild(liveWrapper);

	}
	       
	/*
	 * display events time line : read all events et build the display
	 * 
	 * */
	this.events.forEach(function(i_events) { //i_events represent the value of the index and not the index itself !
				
		if(i_events.type === 'outdoor'){
			var vignette_url = i_events.event_list[0].vignette.url; //seul le premier event_list a un url, les suivants ont un "filename"...
			var snapshot_url = i_events.event_list[0].snapshot.url; 
			var event_time = i_events.event_list[0].time;
			var event_type = i_events.event_list[0].type;
			var event_message = i_events.event_list[0].message;	
						
		} else if (i_events.type === 'movement'){
			
			var vignette_url = i_events.vignette.url; 
			var snapshot_url = i_events.snapshot.url; 
			var event_time = i_events.time;
			var event_type = i_events.type;
			var event_message = i_events.message;	
		}
			
		self.loglog("i_events.time : " + moment.unix(event_time).format(self.config.displayLastUpdateFormat) + "message : " + event_message); 
		
		//search only the type of event requested by the config
		self.config.eventsTypeToDisplay.forEach(function(i_eventsTypeToDisplay) { //i_XXX represent the value of the index and not the index itself !

			if(event_type === i_eventsTypeToDisplay){
				
				//will stop when the number of event to display is reached
				if (eventNumber < self.config.eventsNumberToDisplay){

					if(eventNumber == 0){//title : only display it once
						var timelineTitle = document.createElement("div");
						timelineTitle.className = "timelineTitleNP";
						timelineTitle.innerHTML = "Last events for " + self.config.eventsTypeToDisplay ;
						wrapper.appendChild(timelineTitle);
					}
					
					if(self.config.lastEventAsFullImageOnTop && eventNumber == 0){

						var lastEventAsFullImageOnTop = document.createElement("IMG"); //le div qui donne la date, si configuré pour etre affichée
						lastEventAsFullImageOnTop.className = "lastEventAsFullImageOnTopNP";
						lastEventAsFullImageOnTop.src = snapshot_url;
						
						wrapper.appendChild(lastEventAsFullImageOnTop);
						
					}
					
					/**structure of the event to display, can be changed by another design !**/
															
					var eventWrapper = document.createElement("table");
					eventWrapper.className="eventTableNP";

					var tr1 = document.createElement("tr");//first line
					  
						var eventLogo = document.createElement("td");//first cell, to display logo
						eventLogo.className = "eventLogoNP"; //for CSS customization
						tr1.appendChild(eventLogo);
						var eventImage = document.createElement("td");//second cell, with 2 row size, to display the image
						eventImage.rowSpan=2;
						eventImage.className = "eventImageNP"; //for CSS customization
						tr1.appendChild(eventImage);
					 
					eventWrapper.appendChild(tr1);

						var tr2 = document.createElement("tr");//second line
					  
						var eventTime = document.createElement("td");
						eventTime.className = "eventTimeNP"; //for CSS customization
						tr2.appendChild(eventTime);
						
					eventWrapper.appendChild(tr2);
					
			//		if(self.config.lastEventAsFullImageOnTop && eventNumber == 0){

						//add a line
			/*			var line = document.createElement("div");
						line.className = "lineNP;
						eventWrapper.appendChild(line);*/
						
			//		}
					
					wrapper.appendChild(eventWrapper); 
					/**end design definition**/
    
					/**lets fill the event design**/
					if(self.config.eventsTypeMessageDisplay){ //display message
						eventLogo.innerHTML = event_message

					}else{ // or the logo
						switch (event_type) {
							case "human":
								eventLogo.className = self.config.iconHuman
								break;
							case "vehicle":
								eventLogo.className = self.config.iconVehicle
								break;
							case "animal":
								eventLogo.className = self.config.iconAnimal
								break;
							case "movement":
								eventLogo.className = self.config.iconMovement
								break;
							default:
								break;
						}
					}
										
					//time of the event
					eventTime.innerHTML = moment.unix(event_time).format(self.config.displayLastUpdateFormat)	

					//image  (this image itself is included into the td "eventImage")
					var eventImageNetatmo = document.createElement("IMG");
					eventImageNetatmo.className = 'eventImageNetatmoNP'
					eventImageNetatmo.src = vignette_url;
					eventImage.appendChild(eventImageNetatmo);				
		
					// Create fade effect by MichMich (MIT)
					if (self.config.fade && self.config.fadePoint < 1) {
						
						if (self.config.fadePoint < 0) {
							self.config.fadePoint = 0;
						}
						var startingPoint = self.config.eventsNumberToDisplay * self.config.fadePoint;
						var steps = self.config.eventsNumberToDisplay - startingPoint;
						if (eventNumber >= startingPoint) {
							var currentStep = eventNumber - startingPoint;
							eventWrapper.style.opacity = 1 - (1 / steps * currentStep);
						}
					}
					// End Create fade effect by MichMich (MIT)
				
					eventNumber++;
					
		//		self.loglog("event number : "+ eventNumber);
				
				}else{
					//we reach the requested number of event to display, stop adding new event (but the loop will continu anyway...)
					return;
				}
			
			}
		});

			
	}); //end of events loop --> for timeline
				
			
	return wrapper;
	
	}//fin getDom

}); //fin module register
