"use strict"
//Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");

//create routes object
var routes = {
    "home": function(reqData, handle){
        handle(200, {message: "Welcome on the homepage"});
    },
    "hello": function(reqData, handle){
        switch(reqData.method){
            case "post":
                let data = JSON.parse(reqData.payload);
                let name = (data.name != null) ? data.name : "stranger";
                handle(200, {message: `Hi ${name}!`})
            break;
            default:
                handle(200, {message: "You should post your name to this path"})
            break;
        }
    }
}

//Create http and https server
var httpServer = null;
var httpsServer = null;

if(config.http != null)
    httpServer = http.createServer(requestListener);
if(config.https != null);
    httpsServer = https.createServer({cert: config.https.cert, key: config.https.key}, requestListener);

function requestListener(req, res){
    //Parse request url
    let parsedUrl = url.parse(req.url);

    //Get request path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, "");
    
    //Get query string
    let queryStringObject = parsedUrl.query

    //Get method (GET, POST, PUT, .......)
    let method  = req.method.toLowerCase();

    //Get headers object
    let headers = req.headers;

    //Get payload
    let decoder = new StringDecoder("utf-8");
    let buffer = "";

    //Fill the buffer on data
    req.on("data", function(data){
        buffer += decoder.write(data);
    });

    //After filling the buffer
    req.on("end", function(){
        buffer += decoder.end();

        //Get the correct handler for the request
        let handler = (typeof(routes[trimmedPath]) == "function") ? routes[trimmedPath] : notFoundHandler;

        // Construct the requestData object to send to the handler
        var requestData = {
            path: trimmedPath,
            queryParams: queryStringObject,
            method: method,
            headers: headers,
            payload: buffer
        };

        // Route the request to the handler specified in the router
        handler(requestData, function(statusCode, payload){
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof(payload) == 'object'? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
}

//Default notFoundHandler
var notFoundHandler = function (reqData, handle){
    handle(404);
}

if(httpServer != null){
    httpServer.listen(config.http.port, function(err){
        if(err)
            console.log(`Http server could not listen on port ${config.http.port}`);
        else
            console.log(`Http server is listening on port: ${config.http.port}`);
    });
}
if(httpsServer != null){
    httpsServer.listen(config.https.port, function(err){
        if(err)
            console.log(`Https server could not listen on port ${config.https.port}`);
        else
            console.log(`Https server is listening on port: ${config.https.port}`);
    });
}