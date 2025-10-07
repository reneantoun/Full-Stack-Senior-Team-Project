/***************************************************************************
* Filename: routes.js
* Developer: Jackson Hill
* Date: 4/13/2024
* Notes: Setups libraries and configures template engine
****************************************************************************/
const path = require('path');
const bodyParser = require('body-parser');
const express = require("express");

module.exports = function (app, dir) {

    //Access Folder
    app.use(express.static(dir));

    //Use Body Parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    //Configure Template Engine
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.set('views', path.join(dir, 'html'));
};