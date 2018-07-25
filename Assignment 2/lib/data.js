'use strict'
const fs = require('fs');
const path = require('path');

const dataDir = "../.data/";
const dataPath = path.join(__dirname, dataDir);

class Data{
    static Init(){
        if(!fs.exists(dataPath)){
            
        }
    }
}