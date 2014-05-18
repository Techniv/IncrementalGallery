/**
 * Created by Vincent on 17/05/2014.
 */

;(function(window){
    'use strict';
    var instance = {};

    window.IncGallery = function IncGalleyBind(element, data){
        if(typeof element == "string") element = document.querySelectorAll(element);
        if(element instanceof NodeList){
            for(var i = 0; i < element.length; i++){
                processElement(element[i]);
            }
        } else if(element instanceof Element) {
            processElement(element);
        }


        function processElement(element){
            console.log('test');
            var instanceId = element.dataset.ig | getUID();
            if(instance[instanceId]){

            } else{
                instance[instanceId] = new IncGallery(element, data);
                element.dataset.ig = instanceId;
                return instance[instanceId];
            }
        }
    };




    function IncGallery(container, imageList){
        var image, imageData, socket, current;


        build();
        connect();

        function build(){
            imageData = [];

            image = document.createElement('IMG');
            container.appendChild(image);
        }

        function connect(){
            socket = io.connect();
            socket.on("connected", function(){
                socket.on("data", function(data){
                    imageData.push(data);
                    initImage();
                });

                socket.emit('get', imageList);
            });
        }

        function initImage(){
            if(image.src == "" && imageData.length > 0){
                current = 0;
                image.src = imageData[current].data;

                image.addEventListener("click", function(e){
                    current = (current+1 < imageData.length) ? current+1 : 0;
                    image.src = imageData[current].data;
                });
            };
        }
    }

    function getUID(){
        var tag = 'ig';
        var id = Math.round(Math.random()* instance.length)+''+instance.length + 1;
        return tag+btoa(id);
    }

})(window);
