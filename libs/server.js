/**
 * Created by Vincent Peybernes on 16/05/2014.
 */

var http    = require("http");
var express = require("express");
var io      = require("socket.io");
var path    = require("path");
var img     = require("./imageProcessor");
var config  = require("cmd-conf").getParameters();

var app     = express();
var server  = http.createServer(app);
var socket  = io.listen(server);

// HTTP
app.use(express.static(path.join(__dirname, "..", config.publicDirectory)));

// Web socket
socket.on("connection", function(client){
    client.set("stack", []);
    client.set("processing", false);

    // Get request
    client.on("get", function(data){
        for(var i = 0; i > data.length; i++){
            client.get("stack").push(data[i]);
        }
        if(!client.get("processing"))
            process.nextTick(processStack.bind(client));
    });
    client.emit('connected');
});

server.listen(config.serverPort);


function processStack(){
    var client = this;
    var stack = client.get("stack");

    if(stack.length == 0){
        client.set("processing", false);
        return;
    }

    client.set("processing", true);

    var query = stack.shift();

    img.getDataUrl(query, function(err, data){
        var answer = {
            name: query,
            data: data
        };

        client.emit("data",answer);
 ;
        process.nextTick(processStack.bind(client));
    });
}