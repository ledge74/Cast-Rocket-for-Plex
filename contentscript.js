chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello") {
		var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
		if (!location.ancestorOrigins.contains(extensionOrigin)) {
		    
			//Add iframe to current page
		    var iframe = document.createElement('iframe');
		    iframe.src = chrome.runtime.getURL('popup.html');
		    iframe.style.cssText = 'position:fixed;top:0px;left:0;display:block;' +
		                           'width:300px;height:100%;z-index:999999;border-right-style:solid;border-color:#F25B6E;';
		    //document.body.appendChild(iframe);
		    //document.body.style.marginLeft = 300 + 'px';
			
		    //Pause HTML5 Video and start playback from current time
			var before = $('video')[0];
			if (typeof before  !== 'undefined' && request.offset == 1) {
				if (request.pause == 1) $('video').trigger('pause');
		    	var offset1 = $('video')[0].currentTime*1000;
		    	var offset = Math.floor(offset1);
			} else {
				var offset = 0;
			}
			sendResponse(offset);
		}
    }
});