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
	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.open("GET", "http://" + plex.plexServerIP + ":32400/system/players/" + plex.plexClientIP + "/" + plex.sendaction + "/" + command, true);
	req.onreadystatechange = function(e) {
		if (req.readyState === 4) {
			if (req.status === 200) {
				console.log("Message sent: " + command);
			}
		}
	};
	req.send();
};

plex.state = "play";

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
			if (plex.state == "play") {
				plex.state = "pause";
				plex.sendaction = "playback";
				sendCommand("pause");
			} else {
				plex.state = "play";
				plex.sendaction = "playback";
				sendCommand("play");
			}
			break;
	}
};