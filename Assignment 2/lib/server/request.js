'use strict'

//Dependencies
const url = require('url');
const querystring = require('querystring'); 
const StringDecoder = require('string_decoder').StringDecoder;

//Requst class
class Request{
    constructor(req, callback){
        //Filling properties
        this.RawUrl = req.url;
        this.Url = url.parse(req.url);
        this.RawQueryString = this.Url.query;
        this.QueryString = querystring.parse(this.Url.query);
        this.PathName = this.Url.pathname.replace(/^\/+|\/+$/g, '');
        this.Method = req.method.toUpperCase();
        this.Headers = req.headers;
        this.PayloadString = "";
        this.Payload = {};

        //Define string decoder for decoding payload data
        const decoder = new StringDecoder('utf-8');
        
        //Filling Payload with available data;
        req.on('data', (data) => { 
            this.PayloadString += decoder.write(data); 
        });

        //On the end of the requedt end the decoder end make the callback
        req.on('end', ()=> {
            
            //end decoder 
            this.PayloadString += decoder.end();

            //If payloadsting is not empty string try to parse it to json else payload is empty object
            if(this.PayloadString != ""){
                try { 
                    this.Payload = JSON.parse(this.PayloadString) 
                } 
                catch (error) { 
                    console.log("Could't parse payload to JSON")
                };
            }

            //Make callback to request handler and handle the response
            callback(); 
        });
    }
}

module.exports = Request;