// @require json2.js for ie<11
(function(_$xds, undefined) {

    // what to look for when looking for self
    var selfIdentifier = 'client.js?rh';
    var cdn            = '';
    var servletURI     = '';
    var allowedOrigin  = '';
    var ifrID          = "_xds" + Math.random().toString(36).substring(2);

    /**
     * --------------------------------------------------
     * @callback function to init when document.ready
     * @bubble boolean true/false
     * --------------------------------------------------
     */
    function docReady(callback, bubble) {

        var addListener    = document.addEventListener    || document.attachEvent,
            removeListener = document.removeEventListener || document.detachEvent;

        if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
            callback();
            return;
        }

        bubble = bubble || false;
        var eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange";
        addListener.call(document, eventName, function(event) {
            try { removeListener(eventName, arguments.callee, bubble); } catch(err){}
            callback();
        }, bubble);

    }

    /**
     * --------------------------------------------------
     * @param  object message message to send (JSON object)
     * @return boolean true/false
     * --------------------------------------------------
     */
    _$xds.postMessage = function(message) {
        console.debug('client sent:', message);

        if (typeof(message) === typeof({})) {
            message = JSON.stringify(message);
        }

        try {
            var iframe = document.getElementById(ifrID).contentWindow;
            return iframe.postMessage(message, allowedOrigin);
        } catch(err) {
            console.debug("Failed postMessage()");
        }
    };


    /**
     * --------------------------------------------------
     * parse and execute command sent by backend js
     * @param  object message command + params
     * --------------------------------------------------
     */
    function parseBackendMessage(data) {
        // parse stringified jsons
        if (typeof(data) === typeof("string") && data.indexOf("{") !== -1) {
            data = JSON.parse(data);
        }

        console.debug("client recieved:", data);

        /*
        // do json stuff
        if (typeof(data) === typeof({})) {
            // ...
        }
        */
    }


    /**
     * --------------------------------------------------
     * figure out the server
     * --------------------------------------------------
     */
    var script = (function(selfScript) {
        try {
            return document.currentScript.src;
        } catch(err) {

            var scripts = document.getElementsByTagName("script");
            for (var i = scripts.length-1; i >= 0; i--) {
                var script = scripts[i].src.replace('"', "").replace('"', "");
                if (script.indexOf(selfScript) !== -1) {
                    return script.src.replace('"', "").replace('"', "");
                }
            }

        }
    }(selfIdentifier));

    // parse data
    var cdnURI   = script.split("//");
    var protocol = cdnURI[0]+"//";
    var cdnParts = cdnURI[1].split("/");
        cdnParts.pop();

    // assign values
    cdn           = protocol+cdnParts.join("/")+"/";
    servletURI    = protocol+cdnParts.join("/")+"/servlet.html";
    allowedOrigin = protocol+cdnParts[0];


	/**
     * --------------------------------------------------
     * initilize xd listner
     * --------------------------------------------------
     */
    var eventMethod  = window.addEventListener ? "addEventListener" : "attachEvent";
    var messageEvent = window.addEventListener ? "message" : "onmessage";
    var eventObject  = window[eventMethod];
    eventObject(messageEvent, function(event) {
        // parse iframe commands
        if (event.origin === allowedOrigin) {
            try { parseBackendMessage(event.data); } catch(err) {}
        }
    }, false);


    /**
     * --------------------------------------------------
     * finally, create iframe walkie-talkie and sent it the data
     * --------------------------------------------------
    */
    if (servletURI !== '') {
        docReady(function(){
            var xdsifr = document.createElement("iframe");
                xdsifr.id                = ifrID;
                xdsifr.src               = servletURI;
                xdsifr.style.width       = "1px";
                xdsifr.style.height      = "1px";
                xdsifr.style.top         = "-100px";
                xdsifr.style.left        = "-100px";
                xdsifr.style.position    = "fixed";
                xdsifr.frameBorder       = 0;
                xdsifr.border            = 0;
                xdsifr.allowtransparency = "true";

                xdsifr.onload = function(){
                    setTimeout(function(){
                        _$xds.postMessage( {"ready":true} );
                    }, 10);
                };

            try {
                document.documentElement.appendChild(xdsifr);
            } catch(er) {
                document.body.appendChild(xdsifr);
            }
        });
    }

}(window._$xds = window._$xds || {}));