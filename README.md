# MMM-Netatmo-Presence

The `MMM-Netatmo-Presence` is a module for MagicMirror². It allow to display the live images and historical events of Netatmo-Presence cameras to your [MagicMirror](https://github.com/MichMich/MagicMirror). 

## Main functionalities : 
- Display Live snapshot of one or several cameras
- Display the events recorded by all the cameras as timeline, with the type of event (animal, human, vehicle or movement). It is possible to filter which type to display and to choose the number of events to be displayed
- Use the official sample code from Netatmo to connect to the API, so with https and no complex token to catch
- Several instances possible (one to display live snapshot, another to display events of type "vehicle", another with all last 5 events, ...)
- Network data and RPI load friendly :
	- The API token is requested only when expired
	- If a PIR-sensor using MMM-PIR-Sensor module is used, the auto-update will stop during screen off (this behavior works also with all other module that send the notification "USER_PRESENCE").
	- If all instances of MMM-Netatmo-Presence module are hidden (by REMOTE-CONTROL or any Carousel module for example), the auto-update will stop. 
As soon as one MMM-Netatmo-Presence module will be again displayed on the screen or screen switch on, an update will be requested.
- Possibility to display the date and time of the last update request (configurable)
- CSS file and many configuration possible

To do for next version : 
- Add a way to get an automatic refresh trigger by the camera itself when an event occurs. Probably by using MMM-IFTTT module, let's see !
- Other idea ? Please post here (GitHub) or here (MM Forum)

## Screenshot : 

Displaying YouTube (displayLastUpdate: true) : 
![MMM-iFrame-Ping](https://github.com/AgP42/xxx.png)

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
						
			updateInterval: 5, //in min. Refrest interval
			displayLastUpdate: true, //to display the last update of the API datas or live snapshot image (on top of the module)
			displayLastUpdateFormat: 'ddd - HH:mm:ss', //format of the date and time to display for displayLastUpdate and for events
			animationSpeed: 1000, 	//display animation time between refresh, in ms.
			
			//config for timeline display of the events
			eventsTypeMessageDisplay: false, //if false : will display icons for the type of events, if true : will display the text message given by Netatmo (directly on the good language normally)
			eventsNumberToDisplay: 5,	//set to 1 for only the last one and set to 0 for none...	
			eventsTypeToDisplay: ["human", "vehicle"], //possible values : "animal", "vehicle", "human" or "movement"
			eventRequestSize: 0, //will request this value of events to the API. Increase this value if the number of "eventsNumberToDisplay" is often not reach. Decrease it to limit bandwith and MagicMirror load. 
			lastEventAsFullImageOnTop: true,	//to display the last event not only as a small image focus on Netatmo detection but also the full image. If several cameras, only the one of the last event will be displayed				
			fade: true,		//fade effect at the end of the timeline ?
			fadePoint: 0.25,
			//icon definition
			iconHuman: 'fa fa-user iconHuman',
			iconVehicle: 'fa fa-car iconVehicle',
			iconAnimal: 'fa fa-paw iconAnimal',
			iconMovement: 'fa fa-envira iconMovement',
			
			//config for live snapshot
			liveImageAsFullImageOnTop: true, //display the live snapshot or not
			liveCamera_Name: ["Nord", "Sud"], //name of the cameras to be displayed (has to be the same than configured on your netatmo app). The images will be display on the same order than written here
								
			client_id: 'your add id', 
			client_secret: 'your app secret', 
			username: 'your Netatmo username (e-mail)',
			password: 'your Netatmo password',
			home_id: 'your home id', //necessaire pour l'API

		}
	},
]
````

## Configuration options

The following properties can be configured:


<table width="100%">
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
			<td>if false : will display icons for the type of events, if true : will display the text message given by Netatmo (directly on the good language normally)<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>eventsNumberToDisplay</code></td>
			<td><br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>eventsTypeToDisplay</code></td>
			<td><br>
			<br><b>Possible values:</b>"animal", "vehicle", "human" or "movement"<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
		
		<tr>
			<td><code>eventRequestSize</code></td>
			<td>will request this value of events to the API. Increase this value if the number of "eventsNumberToDisplay" is often not reach. Decrease it to limit bandwith and MagicMirror load.<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>lastEventAsFullImageOnTop</code></td>
			<td>to display the last event not only as a small image focus on Netatmo detection but also the full image. If several cameras, only the one of the last event will be displayed<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>fade</code></td>
			<td>fade effect at the end of the timeline ?<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
		<tr>
			<td><code>fadePoint</code></td>
			<td><br>
				<br><b>Default value:</b> <code>0.25</code>
			</td>
		</tr>		
		<tr>
			<td><code>iconXXX</code></td>
			<td>Definition of the icon to use and the associated CSS class used
			iconHuman: 'fa fa-user iconHuman',
			iconVehicle: 'fa fa-car iconVehicle',
			iconAnimal: 'fa fa-paw iconAnimal',
			iconMovement: 'fa fa-envira iconMovement',<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		<tr>
			<td><code>liveImageAsFullImageOnTop</code></td>
			<td>display the live snapshot or not<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
		<tr>
			<td><code>liveCamera_Name</code></td>
			<td>name of the cameras to be displayed (has to be the same than configured on your netatmo app). The images will be display on the same order than written here<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		
		
		<tr>
			<td><code>API Connection params</code></td>
			<td>See chapter bellow<br>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>		

</table>

## CSS use



The MIT License (MIT)
=====================

Copyright © 2018 Agathe Pinel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
