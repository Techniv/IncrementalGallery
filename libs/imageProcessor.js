/**
 * Created by Vincent Peybernes on 16/05/2014.
 */

var img     = require("easyimage");
var config  = require("cmd-conf").getParameters();
var path    = require("path");
var fs      = require("fs");
var stdout  = process.stdout;
require("colors");

var extReg  = /\.([a-zA-Z0-9]+)$/;
var sizeReg = /([0-9]+)x([0-9]+)/;

var galleryPath = config.galleryPath    = path.resolve(__dirname+"/..", path.join(config.publicDirectory, config.gallery));
var thumbsPath   = config.thumbPath     = path.resolve(galleryPath, "thumbs");
var dataPath    = config.dataPath       = path.resolve(galleryPath, "data");


processGallery();

fs.watch(galleryPath, function(event, file){
    processFile(file);
});

function createThumb(filename){
    var filePath    = path.join(galleryPath, filename);
    var thumbPath   = path.join(thumbsPath, filename);

    img.resize({src:filePath, dst: thumbPath, width:config.thumbnailSize.w, height:config.thumbnailSize.h}, function(){

    });
}

function createDataUrl(filename, extention){
    var filePath    = path.join(galleryPath, filename);
    var urlPath     = path.join(dataPath, filename+".txt");

    var data = fs.readFileSync(filePath);
    var mime = "image/"+extention;

    fs.writeFileSync(urlPath, "data:"+mime+";base64,"+data.toString("base64"));
}

function processGallery(){
    console.log("Gallery processing");

    if(!fs.existsSync(galleryPath)) fs.mkdirSync(galleryPath);
    if(!fs.statSync(galleryPath).isDirectory()) throw new Error("The gallery path is not a directory.");
    if(!fs.existsSync(thumbsPath)) fs.mkdirSync(thumbsPath);
    if(!fs.statSync(thumbsPath).isDirectory()) throw new Error("The thumb path in the gallery is not a directory.");
    if(!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
    if(!fs.statSync(dataPath).isDirectory()) throw new Error("The data path in the gallery is not a directory.");

    if(typeof config.thumbnailSize == "string"){
        if(!sizeReg.test(config.thumbnailSize)) throw new Error("Invalid thumbnailSize parameter. It must be like 400x400");
        config.thumbnailSize = {
            w: RegExp.$1,
            h: RegExp.$2
        }
    }

    var files = fs.readdirSync(galleryPath);
    for( var i in files ){
        processFile(files[i]);
    }

    console.log("--------------");
}

function processFile(filename){
    if(extReg.test(filename) && config.allowExtension[RegExp.$1]){
        var extention = RegExp.$1;
        stdout.write("    Process "+filename+": ");
        createDataUrl(filename, extention);
        if(!config.disabledThumbnail) createThumb(filename);
        stdout.write("OK!\n".green);
    }
}

module.exports = {
    getDataUrl: function getDataUrl(filename, callback){
        filename = path.resolve(dataPath, filename+".txt");
        fs.readFile(filename, callback);
    }
}
