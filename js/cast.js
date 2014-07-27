chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	Cast(request.castthis);
	_gaq.push(['_trackEvent', "Cast", 'Clicked']);
  });

function Cast(VideoUrl) {

	//Show loading div
	$("#cast_loading").removeClass("hide");

	//Fetch user settings
	ServerIP = localStorage["plexServer"];
	PlayerIP = localStorage["plexClient"];
	ServerMachineID = localStorage["plexServerID"];

	//Retrieve Plex Style URL
	$.ajax({
		"url" : "http://node.plexapp.com:32400/system/services/url/lookup?url=" + VideoUrl,
		"dataType" : "xml",
		"type" : "GET",
		"statusCode": {
			401: function() {
				alert("Wrong configuration, please update your settings.");
			}
		},
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

			//Send Plex Style URL to player
			var key = $(data).find("Video").attr("key");
			var url = "http://" + PlayerIP + ":3005/player/playback/playMedia?key=" + key + "&offset=0&machineIdentifier=" + ServerMachineID + "&address=" + ServerIP + "&port=32400&protocol=http&containerKey=" + key + "&commandID=4";
			$.ajax({
				"url" : url,
				"dataType" : "xml",
				"type" : "GET",
				"statusCode": {
					401: function() {
						alert("Wrong configuration, please update your settings.");
					}
				},
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
					$("#cast_loading").addClass("hide");
					$("#cast_success").removeClass("hide");
					setTimeout(function(){$("#cast_success").addClass("hide");}, 3000);
				},
				"error" : function (jqXHR, textStatus, errorThrown) {
					$("#cast_loading").addClass("hide");
					$("#cast_error").removeClass("hide");
					setTimeout(function(){$("#cast_error").addClass("hide");}, 3000);
				}

			});

		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			$("#cast_loading").addClass("hide");
			$("#cast_error").removeClass("hide");
			setTimeout(function(){$("#cast_error").addClass("hide");}, 3000);
		}

	});
}