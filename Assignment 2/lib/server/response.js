'use strict'

//Response class
class Response{
    constructor(res){
        this.res = res;
    }

    //Send text response
    Send(text){
        this.SendWithCode(200, text);
    }

    //Send html response
    SendHtml(html){
        this.SendHtmlWithCode(200, html);
    }

    //Send json response
    SendJson(json){
        this.SendJsonWithCode(200, json);
    }

    //Send error code
    SendWithCode(code, text){
        this.res.setHeader('Content-Type', 'text/plain');
        this.res.writeHead(code);
        this.res.end(text);
    }

    //Send error code
    SendHtmlWithCode(code, html){
        this.res.setHeader('Content-Type', 'text/html');
        this.res.writeHead(code);
        this.res.end(html);
    }

    //Send error code
    SendJsonWithCode(code, json){
        this.res.setHeader('Content-Type', 'application/json');
        this.res.writeHead(code);
        this.res.end(JSON.stringify(json));
    }
}

//Export response class
module.exports = Response;