# MMM-Netatmo-Presence

The `MMM-Netatmo-Presence` is a module for MagicMirror². It allow to display the live images and historical events of Netatmo-Presence cameras to your [MagicMirror](https://github.com/MichMich/MagicMirror). Live image display should also work for Welcome cameras (not tested).

## Main functionalities : 
- Display Live snapshot of one or several cameras - This behavior should work also for "Netatmo Welcome" cameras, but not tested
- Display the events recorded by all the cameras as timeline, with the type of event (animal, human, vehicle or movement). It is possible to filter the event type and to choose the number of events to be displayed. This will not work for Welcome cameras.
- Use the official sample code from Netatmo to connect to the API, so with https and no complex token to catch !
- Several instances possible (one to display live snapshot, another to display events of type "vehicle", another with all last 5 events, ...)
- Network data and RPI load friendly :
	- The API token is requested only when expired or once at start-up (also for several instances)
	- If a PIR-sensor using MMM-PIR-Sensor module is used, the auto-update will stop during screen off (this behavior works also with all other module that send the notification "USER_PRESENCE").
	- If all instances of MMM-Netatmo-Presence module are hidden (by REMOTE-CONTROL or any Carousel module for example), the auto-update will also stop. 
As soon as a MMM-Netatmo-Presence module will be again displayed on the screen or screen switch on, an update will be requested.
- Possibility to display the date and time of the last update request (configurable)
- CSS file and many display configuration possibilities

To do for next version : 
- Translation text file (only english now)
- Find a way to get an automatic refresh triggered by the camera itself when an event occurs. Probably by using MMM-IFTTT module ?, let's see ! (First tests not very positiv...)
- Other idea ? Please post here [Github Issues](https://github.com/AgP42/MMM-Netatmo-Presence/issues)

## Screenshot : 

All possible infos on 1 instance (Display last update of the module, 2 lives cameras, 5 lasts events of type human, vehicle or movement with the last event displayed as full image (= not only the focus on the trigger), and fade effet) : 

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/All%20in%201.png)

3 differents instances (2* 1 lives cameras, and 1 with 5 lasts events of type animal with the last event displayed as full image (= not only the focus on the trigger), and fade effet) : 

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/3%20instances.png)

2 lives cameras on 1 instance with last update display : 

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/2%20lives%20in%201%20instance.png)

1 instances of 5 lasts events of type human or movement with the last event displayed as full image, no fade effet, colored icons (CSS configurable) : 

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/Events%20color%20icon.png)

1 instances of 5 lasts events with text instead of icons (Text directly from Netatmo API, so in your language) :

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/timeline%20without%20update%20date%20and%20without%20icon%20-%20with%20last%20event%20big.png)

1 instances of 5 lasts events with text, without last event as full image : 

![MMM-Netatmo-Presence](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/timeline%20without%20update%20date%20and%20without%20icon%20-%20without%20last%20event%20big.png)

## Installation

Git clone this repo into ~/MagicMirror/modules directory :
```
cd ~/MagicMirror/modules
git clone https://github.com/AgP42/MMM-Netatmo-Presence.git
```
and add the configuration section in your Magic Mirror config file 

## Update
```
cd ~/MagicMirror/modules/MMM-Netatmo-Presence
git pull
```

## Module configuration

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-Netatmo-Presence',
		header: 'Netatmo',
		position: 'bottom_left',
		config:{
						
			updateInterval: 5, //in min.
			initialDelay: 0, //in sec. If several instances, set the first one at 0, then add a delay for each others. For example 3 sec for the second instance and then +1 for each next one. This is needed to avoid interferences of datas between each...
			displayLastUpdate: true, //to display the time of the last update of the module
			displayLastUpdateFormat: 'ddd - HH:mm:ss', //format of the date and time to display for displayLastUpdate and for events
			animationSpeed: 1000, 	//display animation time during refresh, in ms.
			
			//config for timeline display of the events
			eventsTypeMessageDisplay: false, //if false : will display icons, if true : will display text message
			eventsNumberToDisplay: 5,	//how many events to display for the timeline. Set to 0 to display only live images	
			eventsTypeToDisplay: ["human", "vehicle"], //possible values : "animal", "vehicle", "human" or "movement"
			eventRequestSize: 30, //will request this value of events to the API. Increase this value if the number of "eventsNumberToDisplay" is often not reach. Decrease it to limit network bandwith and MagicMirror load. 
			lastEventAsFullImageOnTop: true,	//to display the last event not only as a small image focus on Netatmo detection but also the full image. If several cameras, only the one of the last event will be displayed				
			fade: true,		//fade effect at the end of the timeline ?
			fadePoint: 0.25,
			//icon definition
			iconHuman: 'fa fa-user iconHumanNP',
			iconVehicle: 'fa fa-car iconVehicleNP',
			iconAnimal: 'fa fa-paw iconAnimalNP',
			iconMovement: 'fa fa-envira iconMovementNP',
			//see CSS file for the size of the event images
			
			//config for live snapshot
			liveImageAsFullImageOnTop: true, //display the live snapshot or not
			liveCamera_Name: ["Nord", "Sud"], //name of the cameras to be displayed (has to be the same than configured on your netatmo app). The images will be display on the same order than written here
			//see CSS file for the size of the live snapshot images
								
			//see README.md for details how to get thoses infos						
			client_id: 'your add id', 
			client_secret: 'your app secret', 
			username: 'your Netatmo username (e-mail)',
			password: 'your Netatmo password', //communication is https !
			home_id: 'your home id', //necessaire pour l'API

		}
	},
]
````

## Configuration options

The following properties can be configured:

<table>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>		
		<tr>
			<td><code>updateInterval</code></td>
			<td>Update internal for the module, in minutes. For Live snapshot, it will request a new image, for timeline it will request the Netatmo API if new events occurs and display them.<br>
				<br><b>Example for 30 seconds:</b><code>0.5</code>
				<br><b>Default value:</b> <code>5</code>
			</td>
		</tr>
		<tr>
			<td><code>initialDelay</code></td>
			<td>In seconds. If you use several instances of this module, set the first one at 0, then add a delay for each others. For example 3 sec for the second instance and then +1 for each next one. This is needed to avoid interferences of datas between each instance. The value has also to be adapted according to your internet connection quality...<br>
				<br><b>Example for 3 seconds:</b><code>3</code>
				<br><b>Default value:</b> <code>0</code>
			</td>
		</tr>
		<tr>
			<td><code>displayLastUpdate</code></td>
			<td>If true this will display the last update time at the top of the module. See screenshot<br>
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
		<tr>
			<td><code>displayLastUpdateFormat</code></td>
			<td>Format to use for the time display if displayLastUpdate:true and also to display the date and time of the events for the timeline display <br>
				<br><b>Possible values:</b> See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/)
				<br><b>Default value:</b> <code>'ddd - HH:mm:ss'</code>
			</td>
		</tr>			
		<tr>
			<td><code>animationSpeed</code></td>
			<td>Animation time for the refresh, in ms<br>
				<br><b>Default value:</b> <code>1000</code>
			</td>
		</tr>
		<tr>
			<td><code>eventsTypeMessageDisplay</code></td>
			<td>To choose between displaying icon or text. If false : will display icons, if true : will display the text message given by Netatmo (directly on the good language normally)<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>eventsNumberToDisplay</code></td>
			<td>How many events to display on the timeline ?<br>
				<br><b>Default value:</b> <code>5</code>
			</td>
		</tr>		
		<tr>
			<td><code>eventsTypeToDisplay</code></td>
			<td>Allow to filter the type of event to display.<br>
			<br><b>Possible values:</b>["animal", "vehicle", "human" or "movement"]<br>
				<br><b>Default value:</b> <code>["human", "vehicle"]</code>
			</td>
		</tr>		
		<tr>
			<td><code>eventRequestSize</code></td>
			<td>The number of events to request to the API. Increase this value if the number of "eventsNumberToDisplay" is often not reach. Decrease it to limit bandwith and MagicMirror load.<br>
				<br><b>Default value:</b> <code>30</code>
			</td>
		</tr>		
		<tr>
			<td><code>lastEventAsFullImageOnTop</code></td>
			<td>To display the last event not only as a small image focus on Netatmo detection but also the full image of the camera. If several cameras, only the one of the last event will be displayed. See screenshots<br>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>		
		<tr>
			<td><code>fade</code></td>
			<td>Fade effect at the end of the timeline ? See screenshoot<br>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
		<tr>
			<td><code>fadePoint</code></td>
			<td>Where to start the fade effect<br>
				<br><b>Default value:</b> <code>0.25</code>
			</td>
		</tr>		
		<tr>
			<td><code>iconXXX</code></td>
			<td>Definition of the icon to display for each event type and the associated CSS class used
			iconHuman: 'fa fa-user iconHuman',
			iconVehicle: 'fa fa-car iconVehicle',
			iconAnimal: 'fa fa-paw iconAnimal',
			iconMovement: 'fa fa-envira iconMovement',
				<br><b>Only when eventsTypeMessageDisplay=true</b>
			</td>
		</tr>		
		<tr>
			<td><code>liveImageAsFullImageOnTop</code></td>
			<td>Display the live snapshot or not<br>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
		<tr>
			<td><code>liveCamera_Name</code></td>
			<td>Name of the cameras to be displayed (has to be the same than configured on your netatmo app). The images will be display on the same order than written here<br>
				<br><b>Default value:</b> <code>["Camera1", "Camera2"]</code>
			</td>
		</tr>			
		<tr>
			<td><code>API Connection params</code></td>
			<td>See chapter dedicated bellow<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		

</table>

## Get API Connection params

### username and password
They are your e-mail and password to log on Netatmo app or account. 
The transmission of thoses infos by the module are made by HTTPS using the sample code given by Netatmo. 

### client_id and client_secret
1. Go to https://dev.netatmo.com/dev/createapp
2. Log to your account (using username and password)
3. Clic on "CREATE YOUR APP"
4. Fullfill the following field :
	- Name : any name you like "MagicMirror" for example
	- Description : any description you like
	- App Website, Company, Company website : not requested
	- Data Protection Officer name and email : give yours
	- Accept Netatmo APIs Terms and Conditions
5. SAVE
--> You get your client_id and client_secret !
![client_id and client_secret](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/API.png)

### home_id
1. Go to https://dev.netatmo.com/en-US/resources/technical/reference/security/gethomedata
2. Log to your account
3. Clic on "Try this method by yourself with our TRY IT module"
4. Clic on "TRY IT"
5. Open the fields boby, homes and [object Object] 
6. Get the first field "id" (in red) : 
![home_id](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/API%20-%20home_id.png)

## CSS use
.mainWrapperNP : main display that contains everything else

.updateinfoNP : display the update date and time on top of the module, if <code>displayLastUpdate: true,</code>

Structure of Live display :

![CSS Live](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/CSS_LiveWrapperNP.png)

Structure of Events display :

![CSS Events](https://github.com/AgP42/MMM-Netatmo-Presence/blob/master/screenshot/CSS_event%20NP.png)


The MIT License (MIT)
=====================

Copyright © 2018 Agathe Pinel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
