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

<a name="time_measuring"></a>
### Time measuring function ###
The time measuring covers the functionality of a typical stopwatch.
<a name="input_time_measuring"></a>
#### Inputs for time measuring function ####

Every input `msg` should have a **command** property, otherwise an error is issued (see [Error handling](#error_handling)). Supported commands are:
- **start** - starts (or resumes) time measuring  
- **stop** - stops (or pauses) time measuring  
- **pause** - pauses time measuring. Synonym of **stop**  
- **resume** - resumes time measuring. Synonym of **start**  
- **toggle** - switches over between running and stopped time measuring  
- **reset** - resets measured value to 00:00. In the case of a running time measuring the value  continues to count from 00:00  
- **status** - reports the actual status of the measured value. Output properties see section [Output](#output)  

Remark: Alarm commands are described in the [alarm section](#input_alarm_handling). 

An example for an input `msg` object is as follows:

<img src="assets/input-msg_start.png" title="Input message object" width="200" />

**Fig. 3:** Input `msg` object (example *start* command)


xxx hier noch irgendwie beschreiben, dass
I've committed the change to send the status message for start/stop/reset commands if msg.status=true


<a name="output_time_measuring"></a>
#### Output properties for time measuring function ####
The `node-red-contrib-hourglass` node contains the following output properties within its sent `msg` objects: 
* `command` - give the last received command
* `started` - gives the status of the time measuring, specifies whether measuring is actually active
* `elapsed` - gives time values as an own sub-object (details see below)

The output `msg` is sent in the case of every input msg with a valid command.

<img src="assets/output-msg_object.png" title="Output message object" width="200" />

**Fig. 4:** Output `msg` object


The output property `elapsed` contains a sub-object with the following properties:
* `elapsed.human` - human representation of elapsed time (like '2 days'). These strings are localized.  
* `elapsed.millis` - time in milliseconds, specifies the time elapsed since measuring was started.  
* `elapsed.time` - has sub-properties of days/hours/minutes/seconds/milliseconds for elapsed time.  

In the output example shown in the previous Fig. 4, these `msg` object properties contain a *stopped* state ("started: false"), a last command as a *stop* command and the *elapsed time* of about 66 seconds.


<a name="alarm_handling"></a>
### Alarm handling ###
The alarm functionality covers the ability to set/remove several alarms. Generally there are no limitations of the number of active alarms within the node.

<a name="input_alarm_handling"></a>
#### Inputs for alarm handling ####
Alarms are also controlled via input `msg` objects. Supported commands are:
- **alarm** - adds a new alarm to the node (NOTE: Alarms are not persisted and recovered after restart of Node-RED).  
- **remove-alarms** - cancels and removes all alarms


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

<a name="output_alarm_handling"></a>
#### Outputs for alarm handling ####

Output message when alarm is fired is same as the message that was used to add the alarm plus extra properties used 
in the *status* command

xxx Welche Ausgänge gibt es bei Alarms?


### Node status ###
The nodes status shows 
* an active time count with a green dot (see Fig. 5, left node) and the message of the actual elapsed time, 
* a paused/stopped timer with a grey circle (see Fig. 5, right node) with the message of the actual elapsed time.  
* an alarm with a blue dot and a message *"Alarm ... message "*
<img src="assets/node-status.png" title="Node status" width="300" />

**Fig. 5:** `Hourglass` node status



<a name="error_handling"></a>
## Error handling ## 
The node emits the following error messages, which may be catched via the `catch` node.
Errors are signaled via an error message with a payload string giving the error cause.

The following error messages may occur: 
- "Not running" - occurs if the node is in *stopped* state and an input command *stop* or *pause* is received
- "Already running" - occurs if the node is in *running* state and an input command *start* or *resume* is received
- "Unknown command: *"command"* - occurs when an unknown (invalid) command is received
- "Alarm *"alarm time"* already exists" - occurs when an alarm is already set at the desired alarm time
- "Overdue alarm" - occurs if an alarm has expired but the node was not called a quite long time

The errors may be catched with the `catch` node.


<a name="examples"></a>
## Examples ##

<a name="basic_time_measuring_example"></a>
### Basic time measuring example (start, stop, reset) ###
This example shows how to use the basic commands *start*, *stop*, *reset*. Injecting the appropriate command to the `hourglass` node shows the status at the node, the last injected command and the elapsed time. 
Remark: A value unequal to '0' in the elapsed time when injecting *reset* at a running node is only a matter of performance of the Node-RED machine.  
<img src="assets/example-basic.png" title="Basic example" width="650" />

**Fig. 6:** `Hourglass` basic example 


```json
[{"id":"38d3bc18.5fab9c","type":"hourglass","z":"25e44718.693758","name":"","humanizeLocale":"","x":770,"y":140,"wires":[["b76eef4.f8f021"]]},{"id":"7bcac329.9101dc","type":"change","z":"25e44718.693758","name":"{command:'reset'}","rules":[{"t":"set","p":"command","pt":"msg","to":"reset","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":240,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"3d77841f.654b0c","type":"change","z":"25e44718.693758","name":"{command:'start'}","rules":[{"t":"set","p":"command","pt":"msg","to":"start","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":140,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"fb5df939.afa9f8","type":"change","z":"25e44718.693758","name":"{command:'stop'}","rules":[{"t":"set","p":"command","pt":"msg","to":"stop","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":480,"y":180,"wires":[["ac103e97.ca2d08","38d3bc18.5fab9c"]]},{"id":"b76eef4.f8f021","type":"debug","z":"25e44718.693758","name":"","active":false,"tosidebar":true,"console":false,"tostatus":true,"complete":"elapsed.millis","targetType":"msg","x":1000,"y":140,"wires":[]},{"id":"ac103e97.ca2d08","type":"debug","z":"25e44718.693758","name":"last command","active":false,"tosidebar":false,"console":false,"tostatus":true,"complete":"command","targetType":"msg","x":780,"y":200,"wires":[]},{"id":"17ca3917.a04e2f","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":180,"wires":[["fb5df939.afa9f8"]]},{"id":"20bc7f33.c543a8","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":240,"wires":[["7bcac329.9101dc"]]},{"id":"7b3afdf3.637da4","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":140,"wires":[["3d77841f.654b0c"]]}]
```  
**Fig. 7:** `Hourglass` node example flow

<a name="pause_and_resume_example"></a>
### Using pause and resume option ###

xxx


<a name="split_time_with_status_command_example"></a>
### Getting split time values using the status command ###

xxx

<a name="alarm_handling_example"></a>
### Alarm handling example ###

xxx alarm handling with 1 timer resp. several timers


## Version history

v1.3.0 Send status for start/stop/reset commands

v1.2.0 Selector for humanized time locale

v1.1.1 Cannot add the same alarm twice

v1.1.0 Locale for humanized time

v1.0.0 Initial release

