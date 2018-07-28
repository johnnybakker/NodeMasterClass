'use strict'
const env = process.env.NODE_ENV;

//for development
const dev = {
    http: {
        port: 8080
    },
    https:{
        port: 4433
    },
    secret: "mysecretapplicationtoken"
};

//for production
const prod = {
    http: {
        port: 80
    },
    https:{
        port: 443
    },
    secret: "mysecretapplicationtoken"
};

const config = {
    dev,
    prod
};

module.exports = config[env] != null ? config[env] : config.dev;