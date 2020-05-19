# node-red-contrib-hourglass
`node-red-contrib-hourglass` is a highly versatile stopwatch node to measure ***time differences*** as a duration between a start and an end instant of time. 
Measuring can be stopped (paused) and restarted (resumed) many times including a split time option. A reset function presets the time count value to zero. These are the typical functionalities of a stopwatch.

Additionally an ***alarm functionality*** is implemented which emits a special `msg` at a definable instant of time. Several alarms may be used.

Also, the node persists all required information between restarts of Node-RED to the file system, so you don't need to worry about recovery of your data.
  
One common case of using this node is calculation of the time when some device is working (*operating hour counters 'OHC'*). In addition it also can alert you when it's time to do some maintenance work or change life-limited parts.
Another typical use case is the measuring of time durations (e.g. signal pulse widths, process durations, motion sensor presence times, etc.).
![node-appearance](assets/node-appearance.png "Node appearance")  
**Fig. 1:** Node appearance

<a name="installation"></a>
## Installation

<a name="installation_in_node-red"></a>
### In Node-RED (preferred)
* Via Manage Palette -> Search for "node-red-contrib-hourglass"

<a name="installation_in_a_shell"></a>
### In a shell
* go to the Node-RED installation folder, e.g.: `~/.node-red`
* run `npm install node-red-contrib-hourglass`

<a name="usage"></a>
## Usage

<a name="node_configuration"></a>
### Node Configuration

![node-settings](assets/node-settings.png "Node properties")  
**Fig. 2:** Node properties

Node configuration is quite simple. You only have to set the language to localize the output `elapsed.human`(see below) and the nodes status message (see Fig. 1: "a few seconds"). If you do not use this, you can omit the node configuration.

<a name="input"></a>
### Input ###

Every input `msg` should have a **command** property. Supported commands are:
- **start** - starts (or resumes) time measuring  
- **stop** - stops (or pauses) time measuring  
- **pause** - pauses time measuring. Synonym of **stop**  
- **resume** - resumes time measuring. Synonym of **start**  
- **toggle** - switches over between running and stopped time measuring  
- **reset** - resets measured value to 00:00. In the case of a running time measuring the value  continues to count from 00:00  
- **status** - reports the actual status of the measured value. Output properties see section [Output](#output)  



xxx how many alarms max?


- **alarm** - adds new alarm to the node (NOTE: alarms are not persisted and recovered after restart of Node-Red).  
Input properties for this command are:  

`payload` - text representation of the time when alarm should be triggered. Possible formats are:  
  - `8:00` - for hours with minutes  
  - `9:30:30` - for hours with minutes and seconds  
  - `7.00:00:00` - for days with time  
  - `P1Y2M3D` - for years/month/days
  - for more options you could check [moment.js](https://momentjs.com/docs/#/durations/creating/) docs  

`recurrent` - optional, use *true* to send alarm event periodically, default period is the same as alarm time specified by
payload property  

`period` - optional, to specify period of recurrent event if it differs from the alarm time (the same format is used)  

Output message when alarm is fired is same as the message that was used to add the alarm plus extra properties used 
in the *status* command

 - **remove-alarms** - cancels and removes all alarms


<a name="output"></a>
### Output ###

#### Output properties ####
The `node-red-contrib-hourglass` node contains the following output properties within its sent `msg` objects: 
* `command` - give the last received command
* `started` - gives the status of the time measuring, specifies whether measuring is actually active
* `elapsed` - gives time values as an own sub-object (details see below)

The output `msg` is sent in the case of every input msg with a valid command.

<img src="assets/output-msg_object.png" title="Output message object" width="180" />

**Fig. xxx:** Output `msg`  object


#### Output property `elapsed` ####
The output property `elapsed` contains a sub-object with the following properties:
* `started` - true/false, specifies whether calculation is active now  
* `elapsed.human` - human representation of elapsed time (like '2 days')  
* `elapsed.millis` - time in milliseconds, specifies the time elapsed since calculation was started  
* `elapsed.time` - has sub-properties of days/hours/minutes/seconds/milliseconds for elapsed time  

In the output example shown in the previous figure these `msg` object properties contain a *stopped* state ("started: false"), a last command as a *stop* command and the *elapsed time* of about 66 seconds.


#### Node status ####
The nodes status message shows 
* an active time count with a green dot, 
* a paused/stopped timer with a grey circle.
<img src="assets/node-status.png" title="Node status" width="300" />

**Fig. xxx:** `Hourglass` node status

<a name="error_handling"></a>
## Error handling ## 
xxx hier Fehlerbehandlung mit rein


Fehlermeldungen mit einer error msg mit payload string (erscheint nicht am Output, sondern als Error)
- "Not running", wenn stop oder pause bei "stopped"
- "Already running", wenn start oder resume bei "started"
- "Unknown command: <command>", wenn unbekanntes Kommando am Eingang

xxx catchable?


<a name="examples"></a>
## Examples ##

ToDo

xxx add several examples
- Basic time measuring between start and stop
- Using pause and resume option
- Using status message for getting split time
- timer 1 resp. several

### Basic time measuring (start, stop, reset) ###
This example shows how to use the basic commands *start*, *stop*, *reset*. Injecting the appropriate command to the `hourglass` node shows the status at the node, the last injected command and the elapsed time. 
Remark: A value unequal to '0' in the elapsed time when injecting *reset* at a running node is only a matter of performance of the Node-RED machine. 
<img src="assets/example-basic.png" title="Basic example" width="600" />

**Fig. xxx:** `Hourglass` basic example 


```json
[{"id":"38d3bc18.5fab9c","type":"hourglass","z":"25e44718.693758","name":"","humanizeLocale":"","x":770,"y":140,"wires":[["b76eef4.f8f021"]]},{"id":"7bcac329.9101dc","type":"change","z":"25e44718.693758","name":"{command:'reset'}","rules":[{"t":"set","p":"command","pt":"msg","to":"reset","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":240,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"3d77841f.654b0c","type":"change","z":"25e44718.693758","name":"{command:'start'}","rules":[{"t":"set","p":"command","pt":"msg","to":"start","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":140,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"fb5df939.afa9f8","type":"change","z":"25e44718.693758","name":"{command:'stop'}","rules":[{"t":"set","p":"command","pt":"msg","to":"stop","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":180,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"b76eef4.f8f021","type":"debug","z":"25e44718.693758","name":"","active":false,"tosidebar":true,"console":false,"tostatus":true,"complete":"elapsed.millis","targetType":"msg","x":1000,"y":140,"wires":[]},{"id":"ac103e97.ca2d08","type":"debug","z":"25e44718.693758","name":"last command","active":false,"tosidebar":false,"console":false,"tostatus":true,"complete":"command","targetType":"msg","x":780,"y":200,"wires":[]},{"id":"17ca3917.a04e2f","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":180,"wires":[["fb5df939.afa9f8"]]},{"id":"20bc7f33.c543a8","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":240,"wires":[["7bcac329.9101dc"]]},{"id":"7b3afdf3.637da4","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":140,"wires":[["3d77841f.654b0c"]]}]
```  
**Fig. xxx:** `Hourglass` node example flow


## Version history

v1.3.0 Send status for start/stop/reset commands

v1.2.0 Selector for humanized time locale

v1.1.1 Cannot add the same alarm twice

v1.1.0 Locale for humanized time

v1.0.0 Initial release

