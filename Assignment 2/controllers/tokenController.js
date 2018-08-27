'use strict'
//Dependencies
const DataService = require("../lib/dataservice");
const tokenDataService = new DataService("token");
const userDataService = new DataService("user");

//Controller object
const tokenController = {}

//Adding routes
tokenController.get = (request, response)=>{
    //Get all tokens or get one by defining an id in the querystring
    if(request.QueryString.id != null)
        tokenDataService.read(request.QueryString.id, res => response.SendJson(res));
    else
        tokenDataService.read(res => response.SendJson(res));
}
tokenController.post = (request, response)=>{
    let username = request.Payload.username;
    let password = request.Payload.password;

    let expireDate = Helper.Date.CreateExpirationDate("minutes", 2);
    //Send result of the create
   // tokenDataService.create(token, result =>{ response.SendJson(result) });
}
tokenController.delete = (request, response) => { 
    if(request.QueryString.id != null)
        tokenDataService.delete(request.QueryString.id, res => response.SendJson(res));
    else
        response.SendJson({ result: false, object: null, message: "id not found"});
}
tokenController.put = (request, response) => {
    if(request.QueryString.id != null){
        //Parse payload to token object
        let token = tokenDataService.payloadToObject(request.Payload);
        tokenDataService.update(request.QueryString.id, token, result => { response.SendJson(result) });
    }else{
        response.SendJson({ result: false, object: null, message: "id not found"});
    }
}

//Export controller object
module.exports = tokenController;