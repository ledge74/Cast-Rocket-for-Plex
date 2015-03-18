//function PrepareToCast(tab) {

//	var VideoURL = tab.url;

//    chrome.tabs.update({url: chrome.extension.getURL('remote.html'), active: true});
//    setTimeout(function(){chrome.tabs.sendMessage(tab.id, {castthis: VideoURL}, function(response) {})},1000);
//}

//chrome.browserAction.onClicked.addListener(PrepareToCast);

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
Cast(request.castthis);
//_gaq.push(['_trackEvent', "Cast", 'Clicked']);
});


function Cast(VideoUrl) {

	var ServerIP = localStorage["plexServer"];
	var PlayerIP = localStorage["plexClient"];
	var PlayerName = localStorage["plexClientName"];
	var PlayerPort = localStorage["plexClientPort"];
	var ServerMachineID = localStorage["plexServerID"];
	var debug = true;

	//Show loading div
	console.log("New Cast : " + VideoUrl);
	console.log("Server IP : " + ServerIP);
	console.log("Server ID : " + ServerMachineID);
	console.log("PlayerIP : " + PlayerIP);
	console.log("PlayerPort : " + PlayerPort);
	//Check if server is responding
	console.log("Looking for media");
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
			console.log("Sending media to player");
			//Send media to player
			var typeofmedia = "Video";
			if(typeof $(data).find("Video").attr("key") === 'undefined'){
				typeofmedia = "Track";
			};
			var key = $(data).find(typeofmedia).attr("key");
			var url = "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/playMedia?key=" + key + "&offset=0&machineIdentifier=" + ServerMachineID + "&address=" + ServerIP + "&port=32400&protocol=http&containerKey=" + key + "&commandID=0";
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
					console.log("Cast: success");
				},
				"error" : function (jqXHR, textStatus, errorThrown) {
					console.log("Error: client is not responding");
				}

			});

		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			console.log("Error: media is not supported");
		}
	});
}