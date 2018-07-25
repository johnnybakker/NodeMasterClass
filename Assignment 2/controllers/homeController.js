'use strict'
//Controller object
const homeController = {}

//Adding routes
homeController.get = (request, response)=>{
    response.SendJson({page: "home"});
}

//Export controller object
module.exports = homeController;