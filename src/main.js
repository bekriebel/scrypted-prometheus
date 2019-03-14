const client = require('prom-client');
const os = require('os');
const {register} = client;

if (!scriptSettings.getString('prefix') || !scriptSettings.getString('prefix')) {
    scriptSettings.putString('prefix', 'scrypted')
}

const prefix = scriptSettings.getString('prefix');
const metricsEndpoint = '@bekit/scrypted-prometheus';
const oneTimeAlert = scriptSettings.getBoolean('oneTimeAlert', false);

const batteryGauge = new client.Gauge({
    name: prefix + '_battery',
    help: 'Battery Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const brightnessGauge = new client.Gauge({
    name: prefix + '_brightness',
    help: 'Brightness Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const colorSettingTemperatureGauge = new client.Gauge({
    name: prefix + '_colorsetting_temperature',
    help: 'ColorSettingTemperature Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const entryGauge = new client.Gauge({
    name: prefix + '_entry',
    help: 'Entry Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const humidityGauge = new client.Gauge({
    name: prefix + '_humidity',
    help: 'Humidity Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const intrusionGauge = new client.Gauge({
    name: prefix + '_intrusion',
    help: 'Intrusion Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const luminanceGauge = new client.Gauge({
    name: prefix + '_luminance',
    help: 'Luminance Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const onlineGauge = new client.Gauge({
    name: prefix + '_online',
    help: 'Online Value Gauge',
    labelNames: ['id', 'type', 'name'],
});
const onOffGauge = new client.Gauge({
    name: prefix + '_onoff',
    help: 'OnOff Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const thermometerGauge = new client.Gauge({
    name: prefix + '_thermometer',
    help: 'Thermometer Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

const ultravioletGauge = new client.Gauge({
    name: prefix + '_ultraviolet',
    help: 'Ultraviolet Value Gauge',
    labelNames: ['id', 'type', 'name'],
});


function Device() {
}

function alertAndThrow(msg) {
    log.a(msg);
    throw new Error(msg);
}

function getIP() {
    var ifaces = os.networkInterfaces();
    var ipAddress = "<ip>";

    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if (ipAddress !== "<ip>" || 'IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                //   and don't continue if ipAddress is already set.
                return;
            }
            ipAddress = iface.address;
        });
    });

    return ipAddress
}

var metricsAddress = "https://" + getIP() + ":9443/endpoint/" + metricsEndpoint + "/public/";
if (!oneTimeAlert) {
    // Send this alert once and then set the variable to hide it
    log.a("Your metrics address is: " + metricsAddress);
    scriptSettings.putBoolean('oneTimeAlert', true);
} else {
    log.i("Your metrics address is: " + metricsAddress);
}

// Get the events
var allEvents = deviceManager.getDeviceByName("events");

allEvents.on(null, function(eventSource, eventInterface, eventData) {
    var eventLogMessage = eventInterface + ", " +
        eventSource.getRefId() + ", " +
        eventSource.type() + ", " +
        eventSource.name() + ", " +
        eventData;

    // Don't bother with non-numerical data types
    if (isNaN(eventData)) {
        log.d('eventData non-numerical: ' + eventLogMessage);
        return;
    }

    log.d('event recieved: ' + eventLogMessage);

    switch (eventInterface) {
        case 'Battery':
            batteryGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'Brightness':
            brightnessGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'ColorSettingTemperature':
            colorSettingTemperatureGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'Entry':
            entryGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData ? 1 : 0
            );
            break;
        case 'HumiditySensor':
            humidityGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'IntrusionSensor':
            intrusionGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData ? 1 : 0
            );
            break;
        case 'LuminanceSensor':
            luminanceGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'Online':
            onlineGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData ? 1 : 0
            );
            break;
        case 'OnOff':
            onOffGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData ? 1 : 0
            );
            break;
        case 'Thermometer':
            thermometerGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        case 'UltravioletSensor':
            ultravioletGauge.set(
                {
                    id: eventSource.getRefId(),
                    type: eventSource.type(),
                    name: eventSource.name(),
                },
                eventData
            );
            break;
        default:
            log.w('non-metric event: ' + eventLogMessage);
            break;
    }
});


// implementation of HttpRequestHandler

// https://<ip>:9443/endpoint/@bekit/scrypted-prometheus/
Device.prototype.getEndpoint = function() {
    return metricsEndpoint;
};

Device.prototype.onRequest = function(req, res) {
    res.send({code: 200}, register.metrics());
};

exports.default = new Device();