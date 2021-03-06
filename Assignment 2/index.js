'use strict'
//Dependencies
const Server = require('./lib/server');
const DataService = require('./lib/dataservice');
const Helper = require('./lib/helper');

//Initialize dataservice
DataService.Init();

//Initialize server
Server.Init();

//Start server
Server.Start();