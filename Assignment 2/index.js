'use strict'
//Dependencies
const Server = require('./lib/server');
const DataService = require('./lib/dataservice');

//Initialize dataservice
DataService.Init();

//Initialize server
Server.Init();

//Start server
Server.Start();
