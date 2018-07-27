'use strict'
const fs = require('fs');
const path = require('path');

//Private variables
const _dataDir = "../.data/";
const _dataPath = path.join(__dirname, _dataDir);
const _models = {};

class DataService{
    constructor(collection){
        InitCollectionFolder(collection)
        this.collectionFolder = path.join(_dataPath, collection);
        this.collection = collection;
        this.model = _models[collection];
    }
    create(object, cb){
        let _self = this;
        this.validate(object, [], function(result){
            if(result.valid){
                fs.writeFile(path.join(_self.collectionFolder, object.id + ".json"), JSON.stringify(object), function(err){
                    if(err) cb(err);
                    cb(object);
                });
            }else{
                cb(result);
            }
        });
    }
    read(id, cb){
        let _self = this;
        if(typeof(id) != "function"){
            fs.readFile(path.join(this.collectionFolder, id + ".json"), "utf8", function(err, buffer){
                cb(JSON.parse(buffer.toString()))
            });
        }
        else{
            cb = id;
            fs.readdir(this.collectionFolder, function(err, files){
                let result = [];
                if(!err){
                    if(files.length < 1) cb(result);
                    for(let i = 0; i < files.length; i++){
                        _self.read(files[i].replace(".json", ""), function(obj){
                            result.push(obj);
                            if(result.length == files.length) cb(result);
                        });
                    }
                }else{
                    cb(result);
                }
            });
        }
    }
    update(id, object, cb){
        let _self = this;
        let filePath = path.join(this.collectionFolder, id + ".json");
        fs.exists(filePath, function(exists){
            if(exists){
                _self.read(id, function(record){
                    delete object.key;
                    object = Object.assign(record, object);
                    _self.validate(object, [object.id], function(result){
                        if(result.valid){
                            fs.writeFile(filePath, JSON.stringify(object), function(err){
                                if(err) cb(false);
                                cb(true);
                            });
                        }
                    });
                });
            }else{
                cb(false);
            }
        })
    }
    delete(id, cb){
        fs.unlink(path.join(this.collectionFolder, id + ".json") , cb); 
    }
    validate(object, ignore, cb){
        //Object if valid
        let result = {
            valid: true,
            messages: []
        } 

        console.log(ignore);

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
            if(required && object[key] == null) result.messages.push(key + " is required");
            if(object[key] != null){
                if(typeof(object[key]) !== type) result.messages.push(key + " must be a " + type);
                let objectLength = null
                
                if(type == "number")
                    objectLength = object[key];
                else if(type == "string")
                    objectLength = object[key].length;

                if(objectLength != null){                   
                    if(minLength > objectLength) result.messages.push("minimum length for " + key + " is " + minLength); 
                    if(maxLength < objectLength) result.messages.push("maximum length for " + key + " is " + minLength); 
                    if(property.length != null && property.length != objectLength) result.messages.push("the length of " + key + "must be " + property.length);
                }
            }
        }

        //the unique check
        this.read(function(records){
            for(let recordIndex = 0; recordIndex < records.length; recordIndex++){
                let record = records[recordIndex];
                if(ignore.indexOf(record.id) < 0){
                    for(let i = 0; i < uniqueFields.length; i++){
                        if(record[uniqueFields[i]].toLowerCase() == object[uniqueFields[i]].toLowerCase()){
                            result.messages.push(uniqueFields[i] + ": "+ object[uniqueFields[i]] +" is already in use");
                        }
                    }
                }
            }
            if(result.messages.length > 0) result.valid = false;
            cb(result);
        });
    }
    static Init(){
        //Create required folder
        if(!fs.existsSync(_dataPath)) fs.mkdirSync(_dataPath);
        //Fill models variable
        InitModels()
    }
}

function InitCollectionFolder(collection){
    if(!fs.existsSync(path.join(_dataPath, collection))) fs.mkdirSync(path.join(_dataPath, collection));
}

//Find controllers and add them to the _controller variable
function InitModels(){
    var modelsDir = "../models/";
    var modelsPath = path.join(__dirname, modelsDir);
    var files = fs.readdirSync(modelsPath);
    for(let file of files){
        let cleanName = file.replace(".json", "");
        try {
            var model = require(path.join(modelsDir, file));
            _models[cleanName] = model;
        } catch (error) {
            console.log(`Could not read model: ${file} error: ${error}`);
        }
    }
}

module.exports = DataService