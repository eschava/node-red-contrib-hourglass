const path = require('path');
const fs = require('fs');
const moment = require('moment');

module.exports = function(RED) {
    function HourglassNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var humanizeLocale = config.humanizeLocale;
        var persistId = config.persistId || node.id;

        var dir = path.join(RED.settings.userDir, 'hourglass');
        var persistFile = path.join(dir, persistId);

        try {
            fs.mkdirSync(dir);
        } catch (e) {}

        // recovery on startup
        try {
            var data = JSON.parse(fs.readFileSync(persistFile));
            node.started = data.started;
            node.startedAt = data.startedAt;
            node.elapsed = data.elapsed;
        } catch(e) {
            node.started = false;
            node.startedAt = 0;
            node.elapsed = 0;
        }
        node.alarms = [];

        node.duration = function() {
            var duration = moment.duration(node.elapsed + (node.started ? Date.now() - node.startedAt : 0));
            if (humanizeLocale)
                duration = duration.locale(humanizeLocale);
            return duration;
        }

        node.updateStatus = function() {
            var text = node.duration().humanize();
            if (node.started) {
                node.status({fill:'green', shape:'dot', text:text});

                if (!node.statusIntervalId)
                    node.statusIntervalId = setInterval(node.updateStatus, 60000);
            } else {
                node.status({fill:'grey', shape:'ring', text:text});

                if (node.statusIntervalId) {
                    clearInterval(node.statusIntervalId);
                    node.statusIntervalId = 0;
                }
            }
        }
        node.updateStatus();

        node.persist = function() {
            fs.writeFileSync(persistFile, JSON.stringify({
                'started': node.started,
                'startedAt': node.startedAt,
                'elapsed': node.elapsed
            }));

            node.updateStatus();
        }

        node.enrich = function(msg) {
            var duration = node.duration();

            msg.started = node.started;
            msg.elapsed = {};
            msg.elapsed.human = duration.humanize();
            msg.elapsed.millis = duration.asMilliseconds();
            msg.elapsed.time = {
                days: Math.floor(duration.asDays()),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds(),
                milliseconds: duration.milliseconds()
            };
        }

        node.on('input', function(msg, send, error) {
            send = send || function() { node.send.apply(node, arguments) };
            error = error || function(err) { node.error(err, msg) };

            var command = msg.command;
            if (command == 'toggle')
                command = node.started ? 'stop' : 'start';

            var sendStatus = msg.status;

            switch(command) {
                case 'start':
                case 'resume':
                    if (!node.started) {
                        node.started = true;
                        node.startedAt = Date.now();
                        node.persist();

                        node.alarms.forEach(function (alarm) {
                            var duration = alarm.duration;
                            var elapsed = node.duration().asMilliseconds();

                            var timeLeft = duration - elapsed;
                            if (timeLeft <= 0 && alarm.recurrent)
                                timeLeft = duration + alarm.period * Math.floor(1 + (elapsed - duration) / alarm.period) - elapsed;

                            alarm.timeoutId = setTimeout(alarm.callback, timeLeft);
                        });
                    } else {
                        error('Already running');
                    }
                    break;

                case 'pause':
                case 'stop':
                    if (node.started) {
                        node.elapsed += Date.now() - node.startedAt;
                        node.started = false;
                        node.startedAt = 0;
                        node.persist();

                        node.alarms.forEach(function (alarm) {
                            clearTimeout(alarm.timeoutId);
                        });
                    } else {
                        error('Not running');
                    }
                    break;

                case 'reset':
                    node.elapsed = 0;
                    if (node.started) {
                        node.startedAt = Date.now();
                    }
                    node.persist();

                    node.alarms.forEach(function (alarm){
                        if (node.started) {
                            clearTimeout(alarm.timeoutId);
                            var timeLeft = alarm.duration - node.duration().asMilliseconds();
                            alarm.timeoutId = setTimeout(alarm.callback, timeLeft);
                        }
                    });
                    break;

                case 'status':
                    sendStatus = true;
                    break;

                case 'alarm':
                    var duration = moment.duration(msg.payload).asMilliseconds();
                    if (node.alarms.find(a => a.duration == duration)) {
                        error("Alarm '" + msg.payload + "' already exists");
                        break;
                    }
                    var elapsed = node.duration().asMilliseconds();
                    var period = 'period' in msg ? moment.duration(msg.period).asMilliseconds() : duration;
                    var timeLeft = duration - elapsed;
                    if (timeLeft <= 0 && msg.recurrent)
                        timeLeft = duration + period * Math.floor(1 + (elapsed - duration) / period) - elapsed;

                    var alarm = {
                        duration: duration,
                        recurrent: msg.recurrent,
                        period: period
                    };

                    alarm.callback = msg.recurrent
                        ? function() {
                            node.enrich(msg);
                            send(msg);
                            alarm.timeoutId = setTimeout(alarm.callback, alarm.period);
                            node.status({fill:'blue', shape:'dot', text:'Alarm ' + moment.duration(alarm.period).humanize(true)});
                        }
                        : function() {node.enrich(msg); send(msg); }
                    alarm.timeoutId = node.started && timeLeft > 0 ? setTimeout(alarm.callback, timeLeft) : 0;

                    node.alarms.push(alarm);

                    if (timeLeft <= 0) {
                        error("Overdue alarm");
                    } else if (node.started) {
                        node.status({fill:'blue', shape:'dot', text:'Alarm ' + moment.duration(timeLeft).humanize(true)});
                    }
                    break;

                case 'remove-alarms':
                    if (node.started) {
                        node.alarms.forEach(function (alarm){
                            clearTimeout(alarm.timeoutId);
                        });
                    }
                    node.alarms = [];
                    break;

                default:
                    error('Unknown command: ' + msg.command);
                    break;
            }

            if (sendStatus) {
                node.enrich(msg);
                send(msg);
            }
        });

        node.on("close", function() {
            if (node.statusIntervalId) {
                clearInterval(node.statusIntervalId);
                node.statusIntervalId = 0;
            }
            node.alarms.forEach(function (alarm){
                clearTimeout(alarm.timeoutId);
            });
            node.status({});
        });
    }
    RED.nodes.registerType('hourglass', HourglassNode);
}