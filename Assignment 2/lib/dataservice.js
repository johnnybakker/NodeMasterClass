'use strict'
const fs = require('fs');
const path = require('path');
const Helper = require('./Helper');

//Private variables
const _dataDir = "../.data/";
const _dataPath = path.join(__dirname, _dataDir);
const _models = {};

class DataService{
    
    //Initialize module
    static Init(){
        //Create required folder
        if(!fs.existsSync(_dataPath)) fs.mkdirSync(_dataPath);
        //Fill models variable
        InitModels()
    }
    
    //Constructor for new instance
    constructor(collection){
        //Create collection folder if not exist
        InitCollectionFolder(collection)

        //Define some properties
        this.collectionFolder = path.join(_dataPath, collection);
        this.collection = collection;
        this.model = _models[collection];
    }

    //Parse payload to object
    payloadToObject(payload){
        let object = {};
        for(key in this.model) object[key] = payload[key];
        return object;
    }

    //Create a file with content of object
    create(object, cb){
        let _self = this;
        //result object on succes
        let result = {
            result: true,
            object: null,
            message: "Succesfully created " + this.collection
        };
        //validate object
        this.validate(object, [], function(validationResult){
            if(validationResult.object.valid){
                object.id = Helper.GenerateRandomString(20);
                fs.writeFile(path.join(_self.collectionFolder, object.id + ".json"), JSON.stringify(object), function(err){
                    if(err){
                        result.result = false;
                        result.object = err;
                        result.message = "Failed to create " + _self.collection;
                    }else{
                    result.object = object;
                    }
                    cb(result);
                });
            }else{
                result.result = false;
                result.object = validationResult.object;
                result.message = "Object is not valid"
                cb(result);
            }
        });
    }

    //Read a file or read all files if id is not specified
    read(id, cb){
        let _self = this;
        let result = {
            result: true,
            object: null,
            message: "Succesfully readed " + this.collection 
        }
        if(typeof(id) != "function"){
            //Read one file from directory
            fs.readFile(path.join(this.collectionFolder, id + ".json"), "utf8", function(err, buffer){
                let object = {};
                try{
                    object = JSON.parse(buffer.toString());
                }catch(e){
                    result.result = false;
                    result.message = "Could not parse " + _self.collection + " with the id: " + id + " to json";
                    object = e;
                }
                result.object = object;
                cb(result);
            });
        }
        else{
            //If id is callback assign callback
            cb = id;

            //Read all files in directory
            fs.readdir(this.collectionFolder, function(err, files){
                result.result = true;
                result.message = "Succesfully readed " + _self.collection;
                result.object = [];
                if(!err){
                    let corruptedObjects = [];
                    //Loop through files if files count is not less then 1
                    if(files.length < 1) cb(result);
                    for(let i = 0; i < files.length; i++){
                        let id = files[i].replace(".json", "");
                        _self.read(id, function(readResult){
                            if(readResult.result){
                                result.object.push(readResult.object);
                            }else{
                                corruptedObjects.push(readResult);
                            }
                            if(result.object.length == files.length - corruptedObjects.length) cb(result);
                        });
                    }
                }else{
                    result.result = false;
                    result.object = err;
                    result.message = "Could not read " + _self.collection;
                    cb(result);
                }
            });
        }
    }

    //Update obejct in a file
    update(id, object, cb){
        let _self = this;
        let result = {
            result: true,
            object: null,
            message: "Succesfully updated " + this.collection + " with id: " + id
        }
        let filePath = path.join(this.collectionFolder, id + ".json");
        fs.exists(filePath, function(exists){
            if(exists){
                _self.read(id, function(readResult){
                    if(readResult.result){
                        delete object.key;
                        object = Object.assign(readResult.object, object);
                        _self.validate(object, [object.id], function(validationResult){
                            if(validationResult.object.valid){
                                fs.writeFile(filePath, JSON.stringify(object), function(err){
                                    if(err){
                                        result.result = false;
                                        result.message = "Could not update " + _self.collection + " with id: " + id;
                                        result.object = err;
                                    }else{
                                        result.object = object;
                                    }
                                    cb(result)
                                });
                            }else{
                                validationResult.result = false
                                cb(validationResult);
                            }
                        });
                    }else{
                        cb(readResult);
                    }
                });
            }else{
                result.result = false;
                result.object = exists;
                result.message = _self.collection + " does not exist";
                cb(result);
            }
        })
    }

    //Delete a file by id
    delete(id, cb){
        let _self = this;
        let result = {
            result: true,
            object: null,
            message: "Succesfully removed " + this.collection + " with id: " + id
        }
        let filePath = path.join(this.collectionFolder, id + ".json");
        fs.exists(filePath, function(exists){
            if(exists){
                fs.unlink(filePath, function(err){
                    if(err){
                        result.result = false;
                        result.object = err;
                        result.message = "Could not delete " + _self.collection + " with id: " + id;
                    }
                    cb(result);
                }); 
            }else{
                result.result = false;
                result.object = exists;
                result.message = _self.collection + " does not exist";
                cb(result);
            }
        });
    }

    //Validate object using a the model with the same name as the collection
    validate(object, ignore, cb){
        //Object if valid
        let result = {
            result: true,
            object: {
                valid: true,
                messages: []
            },
            message: "Object is valid"
        }
        
        //this variable will be filled in the check loop
        let uniqueFields = [];

        //Check if fields are filled, need to be filled and are the right type
        for(let key in this.model){
            let property = this.model[key];
            let required = property.required != null ? property.required : false;
            let unique = property.unique != null ? property.unique : false;
            let type = (property.type != null ? property.type : "string").toLowerCase();
            let minLength = property["min-length"] != null ? property["min-length"] : 0;
            let maxLength = property["max-length"] != null ? property["max-length"] : Number.MAX_SAFE_INTEGER;
            
            //push into unique fields array for the unique check
            if(unique) uniqueFields.push(key);

            //other checks
            if(required && object[key] == null) result.object.messages.push(key + " is required");
            if(object[key] != null){
                if(typeof(object[key]) !== type) result.object.messages.push(key + " must be a " + type);
                let objectLength = null
                
                if(type == "number")
                    objectLength = object[key];
                else if(type == "string")
                    objectLength = object[key].length;

                if(objectLength != null){                   
                    if(minLength > objectLength) result.object.messages.push("minimum length for " + key + " is " + minLength); 
                    if(maxLength < objectLength) result.object.messages.push("maximum length for " + key + " is " + minLength); 
                    if(property.length != null && property.length != objectLength) result.object.messages.push("the length of " + key + "must be " + property.length);
                }
            }
        }
        //the unique check
        this.read(function(readResult){
            for(let recordIndex = 0; recordIndex < readResult.object.length; recordIndex++){
                let record = readResult.object[recordIndex];
                if(ignore.indexOf(record.id) < 0){
                    for(let i = 0; i < uniqueFields.length; i++){
                        if(record[uniqueFields[i]] == object[uniqueFields[i]]){
                            result.object.messages.push(uniqueFields[i] + ": "+ object[uniqueFields[i]] +" is already in use");
                        }
                    }
                }
            }
            if(result.object.messages.length > 0){
                result.object.valid = false;
                result.message = "Object is not valid";
            }
            cb(result);
        });
    }
}

//Create if not exist
function InitCollectionFolder(collection){
    if(!fs.existsSync(path.join(_dataPath, collection))) fs.mkdirSync(path.join(_dataPath, collection));
}

//Find models and add them to the _models variable
function InitModels(){
    var modelsDir = "../models/";
    var modelsPath = path.join(__dirname, modelsDir);
    var files = fs.readdirSync(modelsPath);
    for(let file of files){
        let cleanName = file.replace(".json", "");
        try {
            var model = require(path.join(modelsDir, file));
            //if model contains id remove it
            if(model.id != undefined) delete model.id;
            _models[cleanName] = model;
        } catch (error) {
            console.log(`Could not read model: ${file} error: ${error}`);
        }
    }
}

module.exports = DataService