# node-red-contrib-hourglass
This node could be used to calculate time elapsed since some initial moment till current time.
  
Calculation could be stopped (paused) and started (resumed) many times. Also, node persists all required information
between restarts of the Node-Red to the file system, so you don't need to worry about recovery of your data.
  
The most common case of using this node is calculation of the time when some device is working. It also could alert you
when it's time to do some maintenance work or change life-limited parts.  

## Usage

Every input message should have **command** property. Supported commands are:
- **start** - to start (or resume) time calculation
- **resume** - synonym of **start**
- **stop** - to stop time calculation
- **pause** - synonym of **stop**
- **reset** - resets calculation. Calculation continues from 00:00 if it was started before
- **status** - to report current status of the calculation. Output properties are:  
     `started` - true/false, specifies whether calculation is active now  
     `elapsed.millis` - time in milliseconds, specifies the time elapsed since calculation was started  
     `elapsed.human` - human representation of elapsed time (like '2 days')  
     `elapsed.time` - has sub-properties of days/hours/minutes/seconds/milliseconds for elapsed time  

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


## Version history

v1.3.0 Send status for start/stop/reset commands

v1.2.0 Selector for humanized time locale

v1.1.1 Cannot add the same alarm twice

v1.1.0 Locale for humanized time

v1.0.0 Initial release

