'use strict'
//Dependencies
const Server = require('./lib/server');
const DataService = require('./lib/dataservice');

//Initialize server
Server.Init();

//Initialize dataservice
DataService.Init();

//Start server
Server.Start();

