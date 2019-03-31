const client = require('prom-client');
const os = require('os');
const {register} = client;

const prefixDefault = 'scrypted';
const metricsEndpoint = '@bekit/scrypted-prometheus';

// Use the default prefix if another prefix hasn't been set
const prefixSetting = scriptSettings.getString('prefix');
const prefix = (prefixSetting && prefixSetting.length) ? prefixSetting : prefixDefault;

const sdk = require('@scrypted/sdk').default;
const {systemManager} = sdk;

if (prefixSetting != prefix) {
    log.i("Setting default metric prefix: " + prefix);
    scriptSettings.putString('prefix', prefix);
} else {
    log.i("Using metric prefix: " + prefix);
}

// See if our oneTimeAlerts have already been triggered
const oneTimeAlert = scriptSettings.getBoolean('oneTimeAlert', false);

var gauges = {};

// Event interface gauges
gauges['Battery'] = new client.Gauge({
    name: prefix + '_battery',
    help: 'Battery Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['BinarySensor'] = new client.Gauge({
    name: prefix + '_binary',
    help: 'BinarySensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['Brightness'] = new client.Gauge({
    name: prefix + '_brightness',
    help: 'Brightness Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['ColorSettingTemperature'] = new client.Gauge({
    name: prefix + '_colorsetting_temperature',
    help: 'ColorSettingTemperature Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['Entry'] = new client.Gauge({
    name: prefix + '_entry',
    help: 'Entry Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['FloodSensor'] = new client.Gauge({
    name: prefix + '_flood',
    help: 'FloodSensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['HumiditySensor'] = new client.Gauge({
    name: prefix + '_humidity',
    help: 'HumiditySensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['IntrusionSensor'] = new client.Gauge({
    name: prefix + '_intrusion',
    help: 'IntrusionSensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['Lock'] = new client.Gauge({
    name: prefix + '_lock',
    help: 'Lock Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['LuminanceSensor'] = new client.Gauge({
    name: prefix + '_luminance',
    help: 'LuminanceSensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['Online'] = new client.Gauge({
    name: prefix + '_online',
    help: 'Online Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['OnOff'] = new client.Gauge({
    name: prefix + '_onoff',
    help: 'OnOff Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['Thermometer'] = new client.Gauge({
    name: prefix + '_thermometer',
    help: 'Thermometer Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

gauges['UltravioletSensor'] = new client.Gauge({
    name: prefix + '_ultraviolet',
    help: 'UltravioletSensor Value Gauge',
    labelNames: ['id', 'type', 'name'],
});

// Latest event gauge
gauges['LatestEvent'] = new client.Gauge({
    name: prefix + '_latest_event',
    help: 'Timestamp of the latest event for a device and event interface',
    labelNames: ['id', 'type', 'name', 'interface'],
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
var allEvents = systemManager.getDeviceByName("events");

allEvents.listen(null, function(eventSource, eventDetails, eventData) {
    const {eventInterface, property} = eventDetails;
    var eventTime = Date.now();
    var eventLogMessage = eventInterface + ", " +
        property + ", " +
        eventSource.getRefId() + ", " +
        eventSource.type() + ", " +
        eventSource.name() + ", " +
        eventData;

    log.d('event recieved: ' + eventLogMessage);

    // Set the latest event timestamp
    gauges['LatestEvent'].set(
        {
            id: eventSource.getRefId(),
            type: eventSource.type(),
            name: eventSource.name(),
            interface: eventInterface,
        },
        eventTime
    );

    // Convert boolean to number and throw out non-numerical values
    var eventValue;
    switch (typeof eventData) {
        case 'number':
            eventValue = eventData;
            break;
        case 'boolean':
            eventValue = eventData ? 1 : 0;
            break;
        default:
            return;
    }

    if (!(eventInterface in gauges)) {
        log.w('non-metric event: ' + eventLogMessage);
    } else {
        gauges[eventInterface].set(
            {
                id: eventSource.getRefId(),
                type: eventSource.type(),
                name: eventSource.name(),
            },
            eventValue
        );
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