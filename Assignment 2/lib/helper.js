'use strict'
//Dependencies
const config = require('./config');
const crypto = require('crypto');

//Helper class
class Helper{
    
    // Create a SHA256 hash
    static Hash(str){
        if(typeof(str) == 'string' && str.length > 0){
            let hash = crypto.createHmac('sha256', config.secret).update(str).digest('hex');
            return hash;
        } else {
            return false;
        }
    }

    // Create a string of random alphanumeric characters, of a given length
    static GenerateRandomString(length){
        length = typeof(length) == 'number' && length > 0 ? length : false;
        if(length){
            // Define all the possible characters that could go into a string
            let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
            // Start the final string
            let str = '';
            for(let i = 1; i <= length; i++) {
                // Get a random charactert from the possibleCharacters string
                let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
                // Append this character to the string
                str+=randomCharacter;
            }
            // Return the final string
            return str;
        } else {
            return false;
        }
    }
}

module.exports = Helper