///////////////////////////////////////////
/////////// Google Analytics //////////////

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-53208212-2']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();


///////////////////////////////////////////
/////////// REMOTE JAVASCRIPT /////////////

var plex = {};

function sendCommand(command) {
	$.xhrPool.abortAll();
	updateCommandID();
		$.ajax({
			"url" : "http://" + plex.plexClientIP + ":" + plex.plexClientPort + "/player/" + plex.sendaction + "/" + command + "?commandID=" + commandid,
			"dataType" : "text",
			"type" : "GET",
			"timeout" : 3000,
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
				if (debug) console.log("command sent : " + command);
				_gaq.push(['_trackEvent', "Command", command]);
			}
		});
}

$("#sendText").click(function() {
  sendText($("#text2send").val());
});

function sendText(text) {
	if (debug) console.log("sending text: " + $("#text2send").val());
	$.xhrPool.abortAll();
	updateCommandID();
		$.ajax({
			"url" : "http://" + plex.plexClientIP + ":" + plex.plexClientPort + "/player/application/setText?text=" + text + "&commandID=" + commandid,
			"dataType" : "text",
			"type" : "GET",
			"timeout" : 3000,
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
				if (debug) console.log("text sent : " + text);
			}
		});
}

$(document).keydown(function(e) {
	switch (e.which) {
		case 13: // enter
			plex.doCommand("select");
			break;

		case 27: // escap
			plex.doCommand("back");
			break;

		case 32: // space
			plex.doCommand("playpause");
			break;

		case 37: // left
			if (e.shiftKey === true) {
				plex.doCommand("smallstepback");
			} else {
				plex.doCommand("left");
			}
			break;

		case 38: // up
			if (e.shiftKey === true) {
				plex.doCommand("bigstepforward");
			} else {
				plex.doCommand("up");
			}
			break;

		case 39: // right
			if (e.shiftKey === true) {
				plex.doCommand("smallstepforward");
			} else {
				plex.doCommand("right");
			}
			break;

		case 40: // down
			if (e.shiftKey === true) {
				plex.doCommand("bigstepback");
			} else {
				plex.doCommand("down");
			}
			break;

		case 77: // m
			plex.doCommand("osd");
			break;

		default:
			return; // exit this handler for other keys
	}
	e.preventDefault();
});



plex.doCommand = function(action) {
	plex.plexServerIP = localStorage["plexServer"];
	plex.plexClientIP = localStorage["plexClient"];
	plex.plexClientPort = localStorage["plexClientPort"];
	if (localStorage["plexClientPort"]) {
		plex.plexClientPort = localStorage["plexClientPort"];
	} else {
		plex.plexClientPort = "3005";
	}

	switch (action) {
		case "up":
			plex.sendaction = "navigation";
			sendCommand("moveUp");
			break;

		case "down":
			plex.sendaction = "navigation";
			sendCommand("moveDown");
			break;

		case "left":
			plex.sendaction = "navigation";
			sendCommand("moveLeft");
			break;

		case "right":
			plex.sendaction = "navigation";
			sendCommand("moveRight");
			break;

		case "bigstepforward":
			plex.sendaction = "playback";
			sendCommand("bigStepForward");
			break;

		case "bigstepback":
			plex.sendaction = "playback";
			sendCommand("bigStepBack");
			break;

		case "smallstepback":
			plex.sendaction = "playback";
			sendCommand("stepBack");
			break;

		case "smallstepforward":
			plex.sendaction = "playback";
			sendCommand("stepForward");
			break;

		case "select":
			plex.sendaction = "navigation";
			sendCommand("select");
			break;

		case "back":
			plex.sendaction = "navigation";
			sendCommand("back");
			break;

		case "osd":
			plex.sendaction = "navigation";
			sendCommand("toggleOSD");
			break;

			//playback
		case "playpause":
			if (isPlaying == "playing") {
				GetMediaState("paused");
				plex.sendaction = "playback";
				sendCommand("pause");
			} else {
				plex.state = "paused";
				GetMediaState("playing");
				plex.sendaction = "playback";
				sendCommand("play");
			}
			break;

		case "stop":
			plex.sendaction = "playback";
			sendCommand("stop");
			break;

	}
};