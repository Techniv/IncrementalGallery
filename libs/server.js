/**
 * Created by Vincent Peybernes on 16/05/2014.
 */

var express = require("express");
var path    = require("path");
var config = require("cmd-conf").getParameters();

var server = express();

server.use(express.static(path.join(__dirname, "..", config.publicDirectory)));

server.listen(config.serverPort);