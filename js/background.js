//function PrepareToCast(tab) {

//	var VideoURL = tab.url;

//    chrome.tabs.update({url: chrome.extension.getURL('remote.html'), active: true});
//    setTimeout(function(){chrome.tabs.sendMessage(tab.id, {castthis: VideoURL}, function(response) {})},1000);
//}

//chrome.browserAction.onClicked.addListener(PrepareToCast);

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", pause: localStorage["pauseHTML5video"], offset: localStorage["offsetHTML5video"]}, function(response) {
	    Cast(request.castthis, response);
	    //_gaq.push(['_trackEvent', "Cast", 'Clicked']);
	  });
	});
});

chrome.contextMenus.create({
"title": "Cast This!",
"contexts": ["page", "link"],
"onclick" : function(e) {
  var url = e.pageUrl;
  
  if (e.linkUrl) {
    // The user wants to buzz a link.
    url = e.linkUrl;
  }
  
  Cast(url, 0); 

}
});


function Cast(VideoUrl, offset) {

	var ServerIP = localStorage["plexServer"];
	var PlayerIP = localStorage["plexClient"];
	var PlayerName = localStorage["plexClientName"];
	var PlayerPort = localStorage["plexClientPort"];
	var ServerMachineID = localStorage["plexServerID"];
	var debug = true;

	//Show loading div
	console.log("New Cast : " + VideoUrl);
	console.log("offset : " + offset);
	console.log("Server IP : " + ServerIP);
	console.log("Server ID : " + ServerMachineID);
	console.log("PlayerIP : " + PlayerIP);
	console.log("PlayerPort : " + PlayerPort);
	//Check if server is responding
	console.log("Looking for media");
	chrome.runtime.sendMessage({buttontext: "lookingformedia"}, function(response) {});
	//Retrieve Plex Style URL for media to cast
	$.ajax({
		"url" : "http://node.plexapp.com:32400/system/services/url/lookup?url=" + VideoUrl,
		"dataType" : "xml",
		"type" : "GET",
		"beforeSend": function (xhr) {
		  	xhr.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
			xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
			xhr.setRequestHeader("X-Plex-Model", "Plex Cast");
			xhr.setRequestHeader("X-Plex-Client-Identifier", "Plex Cast");
			xhr.setRequestHeader("X-Plex-Device-Name", "Plex Cast");
			xhr.setRequestHeader("X-Plex-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Platform-Version", "1");
			xhr.setRequestHeader("X-Plex-Product", "Plex Cast");
			xhr.setRequestHeader("X-Plex-Version", "1.0");
		},
		"success" : function (data) {
			//Send media to player
			var typeofmedia = "Video";
			if(typeof $(data).find("Video").attr("key") === 'undefined'){
				typeofmedia = "Track";
			};
			var key = $(data).find(typeofmedia).attr("key");
			var url = "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/playMedia?key=" + key + "&offset=" + offset + "&machineIdentifier=" + ServerMachineID + "&address=" + ServerIP + "&port=32400&protocol=http&containerKey=" + key + "&commandID=0";
			console.log("Good news, your media is being processed!");
			chrome.runtime.sendMessage({buttontext: "mediasupported"}, function(response) {});
			$.ajax({
				"url" : url,
				"dataType" : "xml",
				"type" : "GET",
				"beforeSend": function (xhr) {
				  	xhr.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
					xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
					xhr.setRequestHeader("X-Plex-Model", "Plex Cast");
					xhr.setRequestHeader("X-Plex-Client-Identifier", "Plex Cast");
					xhr.setRequestHeader("X-Plex-Device-Name", "Plex Cast");
					xhr.setRequestHeader("X-Plex-Platform", "Chrome");
					xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
					xhr.setRequestHeader("X-Plex-Platform-Version", "1");
					xhr.setRequestHeader("X-Plex-Product", "Plex Cast");
					xhr.setRequestHeader("X-Plex-Version", "1.0");
				},
				"success" : function (data) {
					chrome.runtime.sendMessage({buttontext: "casting"}, function(response) {});
					console.log("Casting :)");
					//embedding remote in current webpage
				},
				"error" : function (jqXHR, textStatus, errorThrown) {
					console.log("Error: client is not responding");
					chrome.runtime.sendMessage({buttontext: "clientnotresponding"}, function(response) {});
				}

			});

		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			console.log("Error: media is not supported");
			chrome.runtime.sendMessage({buttontext: "medianotsupported"}, function(response) {});
		}
	});
}