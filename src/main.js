const client = require('prom-client');
const {register} = client;
const gauge = new client.Gauge({ name: 'thermometer', help: 'a fucking thermometer' });

function Device() {
}

// implementation of EventListener

Device.prototype.onEvent = function(eventSource, eventInterface, eventData) {
    // eventSource.name() for the name and eventSource.getRefId() for the unique id
    if (eventInterface == 'Thermometer') {
        gauge.set(eventData);
    }
};


// implementation of HttpRequestHandler

// https://ip:9443/endpoint/@scrypted/metrics/
Device.prototype.getEndpoint = function() {
    return '@scrypted/metrics';
};

Device.prototype.onRequest = function(req, res) {
    res.send({code: 200}, register.metrics());
};

exports.default = new Device();
