/**
 * Created by Vincent Peybernes on 16/05/2014.
 */

require("cmd-conf").configure(__dirname+"/../config.json");

var imageProcessor = require("./imageProcessor");
var server = require("./server");