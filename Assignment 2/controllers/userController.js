'use strict'
//Dependencies
const DataService = require("../lib/dataservice");
const userDataService = new DataService("user");

//Controller object
const userController = {}

//Adding routes
userController.get = (request, response)=>{
    //Get all users or get one by defining an id in the querystring
    if(request.QueryString.id != null)
        userDataService.read(request.QueryString.id, res => response.SendJson(res));
    else
        userDataService.read(res => response.SendJson(res));
}
userController.post = (request, response)=>{

    //Parse payload to user object
    let user = userDataService.payloadToObject(request.Payload);

    //Send result of the create
    userDataService.create(user, result =>{ response.SendJson(result) });
}

//Export controller object
module.exports = userController;