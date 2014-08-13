chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
Cast(request.castthis);
_gaq.push(['_trackEvent', "Cast", 'Clicked']);
});

var ServerIP = localStorage["plexServer"];
var PlayerIP = localStorage["plexClient"];
var ServerMachineID = localStorage["plexServerID"];
var duration;
var jduration;
var key_new = null;
var key_old = null;
var key_old = null;
var i = 0;


function getPlayerTimes(duration) {
    var url = "http://" + PlayerIP + ":3005";
    var fullPath = url + "/jsonrpc";
    var defaultTimeout = 5000;

    $.ajax({
        "type": "POST",
        "url": fullPath,
        "async":false,
        success: function (response) {
	        if (response && response.result) {
	            //var timeInSeconds = toSeconds(response.result.time["hours"], response.result.time["minutes"], response.result.time["seconds"]);
	            var jduration = response.result.totaltime["hours"]*3600000 + response.result.totaltime["milliseconds"] + response.result.totaltime["minutes"]*60000 + response.result.totaltime["seconds"]*1000;
	            var currentime = response.result.time["hours"]*3600000 + response.result.time["milliseconds"] + response.result.time["minutes"]*60000 + response.result.time["seconds"]*1000;
	            var position = (currentime*100)/jduration;
	            //console.log("JSON JSON JSON");
				$("#duration").text(msToTime(jduration));
				$("#current").text(msToTime(currentime));
				$("#timeseeker").slider("value", position);
				jduration = LogDuration(jduration);
			}
        },
        "contentType": "application/json",
        "data": '{"jsonrpc":"2.0", "method":"Player.GetProperties", "params":{"playerid":1, "properties":["time", "totaltime"]},"id":1}',
        "dataType": 'json',
        "timeout": defaultTimeout,
        error: function (jqXHR, textStatus, erroThrown) {
            callback(0);
        }
    });
return jduration;
}

function LogDuration(duration) {
	console.log(duration);
	localStorage.setItem("duration", duration);
}

function UpdateSeekerInfo(volume) {
var mediatype = 0;
if (focused == true)
{
	console.log("new");
	$.ajax({
		"url" : "http://" + PlayerIP + ":3005/player/timeline/poll?wait=1&commandID=0",
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
			// Get Current type
			if ($(data).find('Timeline').eq(0).attr('state') != "stopped") {
				mediatype = 0;
			}
			if ($(data).find('Timeline').eq(1).attr('state') != "stopped") {
				mediatype = 1;
			}
			if ($(data).find('Timeline').eq(2).attr('state') != "stopped") {
				mediatype = 2;
			}
			//Update Volume Info
			var currentvolume = $(data).find('Timeline').eq(mediatype).attr('volume');
			$("#volumeseeker").slider("value", currentvolume);

			//define var
			var state = $(data).find('Timeline').eq(mediatype).attr('state');

			//console.log(state);
			//console.log(duration);

			//Update Seeker Info
			if(typeof $(data).find('Timeline').eq(mediatype).attr('duration') === 'undefined') {
				duration = getPlayerTimes();
			} else {
				var currentime = $(data).find('Timeline').eq(mediatype).attr('time');
				duration = $(data).find('Timeline').eq(mediatype).attr('duration');
				jduration = LogDuration(duration);
				var position = (currentime*100)/duration;
				console.log("http, duration : " + duration)
				$("#timeseeker").slider("value", position);
				$("#duration").text(msToTime(duration));
				$("#current").text(msToTime(currentime));
			}
			
			//console.log("done : " + msToTime(currentime));
			//Update Media Info
			if (typeof $(data).find('Timeline').eq(mediatype).attr('key') !== 'undefined') {
				key_new = $(data).find('Timeline').eq(mediatype).attr('key');
			}
			if (key_new != key_old && i != 0) {
				UpdateMediaInfo(key_new);
			}
			if (typeof $(data).find('Timeline').eq(mediatype).attr('key') !== 'undefined') {
				key_old = $(data).find('Timeline').eq(mediatype).attr('key');
			}
			//Force Update Media Info
			if (i == 0) {
				UpdateMediaInfo(key_new);
			}
		},
		"error" : function (jqXHR, textStatus, errorThrown) {
		},
		"complete" : function() {
			i++;
			setTimeout(UpdateSeekerInfo, 1000);
		}
	});
	return duration;
	return key_new;
	return key_old;
}
else {
	//console.log("Waiting ...");
	setTimeout(UpdateSeekerInfo, 1000);
}
};

function UpdateMediaInfo(key) {
$.ajax({
		"url" : "http://" + ServerIP + ":32400" + key,
		"dataType" : "xml",
		"type" : "GET",
		"timeout" : "10000",
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
			var typeofmedia = "Video";
			if(typeof $(data).find("Video").attr("key") === 'undefined'){
				typeofmedia = "Track";
			};
			if(typeof $(data).find(typeofmedia).attr("grandparentTitle") !== 'undefined'){
				$("#grandparentTitle").text($(data).find(typeofmedia).attr("grandparentTitle"));
			} else {
				$("#grandparentTitle").text("");
			}
			var title = $(data).find(typeofmedia).attr("title");
			$("#title").text(title);
			var thumburl = "http://" + ServerIP + ":32400" + $(data).find(typeofmedia).attr("thumb");
			$("#thumbimg").attr('src',thumburl);
		},
		"error" : function (jqXHR, textStatus, errorThrown) {
		},
		"complete" : function() {
		}
	});
};

function setVolume(val) {
	$.ajax({
		"url" : "http://" + PlayerIP + ":3005/player/playback/setParameters?type=video&commandID=4&volume=" + val,
		"dataType" : "xml",
		"type" : "GET",
	});
};

function setPosition(val) {
	var duration = localStorage["duration"];;
	console.log(duration);
	var newposition = Math.round((val/100)*duration);
	$.ajax({
		"url" : "http://" + PlayerIP + ":3005/player/playback/seekTo?type=video&commandID=4&offset=" + newposition,
		"dataType" : "xml",
		"type" : "GET",
	});
};

$(function() {
	$( "#volumeseeker" ).slider({
		min: 0,
		max: 100,
		step: 1,
		range: "min",
		animate: "slow",
		stop: function(event, ui) {
		setVolume(ui.value);
		}
	});
	$( "#timeseeker" ).slider({
		min: 0,
		max: 100,
		step: 0.01,
		range: "min",
		animate: "slow",
		stop: function(event, ui) {
		setPosition(ui.value);
		}
	});
});

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (hours != "0") {
    	return hours + ":" + minutes + ":" + seconds;
    } else {
		return minutes + ":" + seconds;
    }
    
};

////////////


function Cast(VideoUrl) {

	//Show loading div
	$("#cast_loading").removeClass("hide");

	//Check if server is responding
	$.ajax({
		"url" : "http://" + ServerIP + ":32400",
		"dataType" : "xml",
		"type" : "GET",
		"timeout" : "10000",
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
					var url = "http://" + PlayerIP + ":3005/player/playback/playMedia?key=" + key + "&offset=0&machineIdentifier=" + ServerMachineID + "&address=" + ServerIP + "&port=32400&protocol=http&containerKey=" + key + "&commandID=4";
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
							$("#cast_loading").addClass("hide");
							$("#cast_success").removeClass("hide");
							setTimeout(function(){$("#cast_success").addClass("hide");}, 3000);
						},
						"error" : function (jqXHR, textStatus, errorThrown) {
							//Client is not responding: send alert to user
							//console.log(errorThrown);
							   var retVal = confirm("Client not found. Do you want to update your settings ?");
							   if( retVal == true ){
							      chrome.tabs.update({url: chrome.extension.getURL('options.html'), active: true});
								  return true;
							   }
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

		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			//Server is not responding: send alert to user
			//console.log(errorThrown);
			   var retVal = confirm("Server not found. Do you want to update your settings ?");
			   if( retVal == true ){
			      chrome.tabs.update({url: chrome.extension.getURL('options.html'), active: true});
				  return true;
			   }
		}
	});
}

var focused = true;

function onBlur() {
    focused = false;
};
function onFocus(){
    focused = true;
};

if (/*@cc_on!@*/false) { // check for Internet Explorer
	document.onfocusin = onFocus;
	document.onfocusout = onBlur;
} else {
	window.onfocus = onFocus;
	window.onblur = onBlur;
}

UpdateSeekerInfo();