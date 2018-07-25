'use strict'
//Dependencies
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const config = require('../config');
const Request = require('./request');
const Response = require('./response');

//Private variables
let _httpServer = null;
let _httpsServer = null;
let _controllers = {};

//Server class
class Server{
    //Method for initializing the server variables
    static Init(){
        InitControllers();
        _httpServer = http.createServer(requestHandler);
    }
    //Method for starting the server
    static Start(){
        _httpServer.listen(config.http.port, () => console.log(`Server started to listen on port ${config.http.port}.`));
    }
    //Method for stopping the server
    static Stop(){
        _httpServer.close(() => console.log("Server stopped listening."));
    }
}

//Private functions
function requestHandler(req, res){
    let request = new Request(req);
    let response = new Response(res);
    let controller = _controllers[request.PathName.toLowerCase()];
    if(controller != null){
        let handler = controller[request.Method.toLowerCase()]
        if(handler != null && typeof(handler) == "function")
            handler(request, response);
        else
            response.SendJsonWithCode(405, {error: "Method not allowed"});
    }else{
        response.SendJsonWithCode(404, {error: "Not found"});
    }
}

//Find controllers and add them to the _controller variable
function InitControllers(){
    var controllersDir = "../../controllers/";
    var controllersPath = path.join(__dirname, controllersDir);
    var files = fs.readdirSync(controllersPath);
    for(let file of files){
        let cleanName = file.replace("Controller.js", "");
        try {
            var controller = require(path.join(controllersDir, file));
            _controllers[cleanName] = controller;
        } catch (error) {
            console.log(`Could not read controller: ${file} error: ${error}`);
        }
    }
}

module.exports = Server;
