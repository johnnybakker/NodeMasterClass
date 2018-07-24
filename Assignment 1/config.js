//Dependencies
const fs = require("fs");

//Configuaration object
const configuration = {}

//development config
configuration.development = {
    http: {
        port: 8080
    },
    https: {
        port: 4433,
        cert: fs.readFileSync('./https/cert.pem'),
        key: fs.readFileSync('./https/key.pem')
    }
}

//deployment config
configuration.deployment = {
    http: {
        port: 80
    },
    https: {
        port: 443,
        cert: fs.readFileSync('./https/cert.pem'),
        key: fs.readFileSync('./https/key.pem')
    }
}

// Determine which environment was passed as a command-line argument
var currentConfiguration = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Export the configuration
module.exports = typeof(configuration[currentConfiguration]) == 'object' ? configuration[currentConfiguration] : configuration.development;

