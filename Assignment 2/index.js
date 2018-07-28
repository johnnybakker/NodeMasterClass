'use strict'
//Dependencies
const Server = require('./lib/server');
const DataService = require('./lib/dataservice');
const Helper = require('./lib/helper');
//Initialize server
Server.Init();

//Initialize dataservice
DataService.Init();

//Start server
Server.Start();

const userService = new DataService("user");
userService.read(function(readResult){
    if(readResult.result){
        let users = readResult.object;
        if(users.length > 0){
            let handled = 0;
            for(let user of users){
                userService.delete(user.id, function(deleteResult){
                    if(deleteResult.result)
                        console.log("deleted user");
                    else
                        console.log("failed to delete user, error: " + deleteResult.object);
                handled += 1;
                if(handled == users.length){
                        userService.create({name: "Johnny", email: "johnnybakker1997@gmail.com", password: Helper.Hash("123")}, function(result){
                            console.log(result.object);
                        });
                    } 
                });
            }
        } else{
            userService.create({name: "Johnny", email: "johnnybakker1997@gmail.com", password: Helper.Hash("123")}, function(result){
                console.log(result.object);
            });
        }
    }
});
