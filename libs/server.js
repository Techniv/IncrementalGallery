/**
 * Created by Vincent Peybernes on 16/05/2014.
 */

var http    = require("http");
var express = require("express");
var io      = require("socket.io");
var path    = require("path");
var img     = require("./imageProcessor");
var config  = require("cmd-conf").getParameters();
var stdout  = process.stdout;

var app     = express();
var server  = http.createServer(app);
var socket  = io.listen(server, {log: false});

console.log("\nStarting servers:");

// HTTP
stdout.write("\tHTTP server:            \t");
app.use(express.static(path.join(__dirname, "..", config.publicDirectory)));
stdout.write("OK!\n".green);

// Web socket
stdout.write("\tWeb Socket server:      \t");
socket.on("connection", function(client){
    client.stack = [];
    client.processing = false;

    // Get request
    client.on("get", function(data){
        for(var i = 0; i < data.length; i++){
            client.stack.push(data[i]);
        }
        if(!client.processing)
            process.nextTick(processStack.bind(client));
    });
    client.emit('connected');
});
stdout.write("OK!\n".green);

stdout.write("\tServers listen on port "+config.serverPort+":\t");
try{
    server.listen(config.serverPort);
    stdout.write("OK!\n".green);
} catch (e) {
    stdout.write("KO!\n".red)
}


function processStack(){
    var client = this;
    var stack = client.stack;

    if(stack.length == 0){
        client.processing = false;
        return;
    }

    client.processing = true;

    var query = stack.shift();

    img.getDataUrl(query, function(err, data){
        if(err){
            console.log(("Error on "+query).red, err);
            return;
        }
        console.log("\tSend:".green, query, data.substr(0,25));
        var answer = {
            name: query,
            data: data
        };

        client.emit("data",answer);
 ;
        process.nextTick(processStack.bind(client));
    });
}