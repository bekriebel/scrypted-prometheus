const client = require('prom-client');
const {register} = client;

if (!scriptSettings.getString('prefix') || !scriptSettings.getString('prefix')) {
    scriptSettings.putString('prefix', 'scrypted')
}

const prefix = scriptSettings.getString('prefix');

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


// implementation of EventListener

Device.prototype.onEvent = function(eventSource, eventInterface, eventData) {
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
};


// implementation of HttpRequestHandler

// https://ip:9443/endpoint/@scrypted/prometheus/
Device.prototype.getEndpoint = function() {
    return '@scrypted/prometheus';
};

Device.prototype.onRequest = function(req, res) {
    res.send({code: 200}, register.metrics());
};

exports.default = new Device();