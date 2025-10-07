/***************************************************************************
* Filename: encrypt.js
* Developer: Jackson Hill
* Date: 5/17/2024
* Notes: This simple script will be used for encryption functions
****************************************************************************/
//Use crypto library for encryption functionality
const crypto = require('crypto-js'),

//Provide constant password to use for each encryption call
password = 'd6F3Efeq';

//Functions for encrypting and decrypting text data
module.exports = {
    encrypt: function(text) {
        const result = crypto.AES.encrypt(text, password);
        return result.toString();
    },
    decrypt: function(text) {
        const result = crypto.AES.decrypt(text, password);
        return result.toString(crypto.enc.Utf8);
    }
}
