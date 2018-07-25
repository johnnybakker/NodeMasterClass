'use strict'

//Dependencies
const url = require('url');
const querystring = require('querystring'); 

//Requst class
class Request{
    constructor(req){
        this.RawUrl = req.url;
        this.Url = url.parse(req.url);
        this.RawQueryString = this.Url.query;
        this.QueryString = querystring.parse(this.Url.query);
        this.PathName = this.Url.pathname.replace(/^\/+|\/+$/g, '');
        this.Method = req.method.toUpperCase();
        this.Headers = req.headers;
    }
}

module.exports = Request;