chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
Cast(request.castthis);
_gaq.push(['_trackEvent', "Cast", 'Clicked']);
});


var ServerIP = localStorage["plexServer"];
var PlayerIP = localStorage["plexClient"];
var PlayerName = localStorage["plexClientName"];
if (localStorage["plexClientPort"]) {
	var PlayerPort = localStorage["plexClientPort"];
} else {
	var PlayerPort = "3005";
}
var ServerMachineID = localStorage["plexServerID"];
var debug = false;
var duration;
var key_new = null;
var key_old = null;
var i = 0;
var commandid = [];
commandid.push(0);
var isPlaying = [];
var mediaType = [];
var updateSeeker = [];
updateSeeker.push(true);
var isMute = [];
isMute.push(0);

$.xhrPool = [];
$.xhrPool.abortAll = function() {
	var i = 0;
    $(this).each(function(idx, jqXHR) { 
        jqXHR.abort();
        i++;
    });
    $.xhrPool.length = 0;
    if (debug) console.log("all calls aborted " + i);
};

function updateCommandID() {
	var currentID = commandid[0];
	commandid = [];
	commandid.push(currentID + 1);
}

function getPlayerTimesHTTP() {
		if (debug) console.log("new getPlayerTimesHTTP " + i);
			var abort = false;
			$.ajax({
			"url" : "http://" + PlayerIP + ":" + PlayerPort + "/player/timeline/poll?wait=1&commandID=" + commandid,
			"dataType" : "text",
			"type" : "GET",
			"beforeSend": function (xhr) {
				$.xhrPool.push(xhr);
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
			var mediatype = 3;
			if ($(data).find('Timeline').eq(0).attr('state') != "stopped") mediatype = 0; //Track
			if ($(data).find('Timeline').eq(1).attr('state') != "stopped") mediatype = 1; //Video
			if ($(data).find('Timeline').eq(2).attr('state') != "stopped") mediatype = 2; //Photo

				//Monitor Media change
				if (typeof $(data).find('Timeline').eq(mediatype).attr('key') !== 'undefined') key_new = $(data).find('Timeline').eq(mediatype).attr('key');

				if (key_new != key_old && i != 0) {
					//Update Media Info
					if (debug) console.log("key old : " + key_old);
					if (debug) console.log("key new : " + key_new);
					GetMediaInfo(key_new);
					abort=true;

				}
				if (typeof $(data).find('Timeline').eq(mediatype).attr('key') !== 'undefined') key_old = $(data).find('Timeline').eq(mediatype).attr('key');

				//Update Volume Info
				isMute = [];
				isMute.push($(data).find('Timeline').eq(mediatype).attr('mute'));
				GetMuteState(isMute[0]);
				if (isMute[0] == 0) $("#volumeseeker").slider("value", $(data).find('Timeline').eq(mediatype).attr('volume'));

				//Get actual state
				var state = $(data).find('Timeline').eq(mediatype).attr('state');
				isPlaying = [];
				isPlaying.push(state);
				if (debug) console.log("state : " + isPlaying);
				
				//Update Media State
				GetMediaState(isPlaying);

				//Force Update Media Info On first run
				if (i == 0) {
					//Update Media Info
					if (debug) console.log ("i : " + i);
					if (debug) console.log ("key : " + key_new);
					GetMediaInfo(key_new);
					abort=true;
				}
				//No media is currently playing
				if (mediatype == 3) {
					key_new = 0;
					key_old = 0;
					SaveDuration(0);
					ResetMediaInfo();
				} else {
				if (abort == false) {
					//Update Seeker Info
					if(typeof $(data).find('Timeline').eq(mediatype).attr('duration') === 'undefined' && typeof state !== 'undefined') {
						getPlayerTimesJSON();
					} else if ($(data).find('Timeline').eq(mediatype).attr('duration') < 3000 && typeof state !== 'undefined'){
						getPlayerTimesJSON();
					} else {
						var current = $(data).find('Timeline').eq(mediatype).attr('time');
						var duration = $(data).find('Timeline').eq(mediatype).attr('duration');
						SaveDuration(duration);
						UpdateSeekerValues(duration, current);
					}
				}
				}
			getPlayerTimesHTTP();
			},
			"complete" : function(xhr) {
		       var index = $.xhrPool.indexOf(xhr);
		        if (index > -1) {
		            $.xhrPool.splice(index, 1);
		        }
				i++;
				if (debug) console.log("done getPlayerTimesHTTP " + i);
			},
			"error" : function() {
				getPlayerTimesHTTP();
			}
		});
		return duration;
		return state;
		return key_new;
		return key_old;
		return abort;
};

function getPlayerTimesJSON(duration) {
	if (debug) console.log("new getPlayerTimesJSON " + i);
    $.ajax({
        "type": "POST",
        "url": "http://" + PlayerIP + ":" + PlayerPort + "/jsonrpc",
        "async":false,
        "contentType": "application/json",
        "data": '{"jsonrpc":"2.0", "method":"Player.GetProperties", "params":{"playerid":1, "properties":["time", "totaltime"]},"id":1}',
        "dataType": 'json',
        "timeout": 5000,
		"beforeSend": function (xhr) {
			$.xhrPool.push(xhr);
		},
        success: function (response) {
        	if (typeof  response.result !== 'undefined') {
            var duration = response.result.totaltime["hours"]*3600000 + response.result.totaltime["milliseconds"] + response.result.totaltime["minutes"]*60000 + response.result.totaltime["seconds"]*1000;
            var currentime = response.result.time["hours"]*3600000 + response.result.time["milliseconds"] + response.result.time["minutes"]*60000 + response.result.time["seconds"]*1000;
			SaveDuration(duration);
			UpdateSeekerValues(duration, currentime)
			}
        },
        error: function (jqXHR, textStatus, erroThrown) {
        },
        complete: function() {
        	if (debug) console.log("done getPlayerTimesJSON " + i);
        }
    });
};

function UpdateSeekerValues(duration, current) {
	var position = (current*100)/duration;
	$("#duration").text(msToTime(duration));
	$("#current").text(msToTime(current));
	$("#timeseeker").slider("value", position);
};

function GetMediaState(state) {
	if (state == "playing") {
		$("#bigplay").removeClass().addClass("alert-player hide");
		$("#playpauseico").removeClass().addClass("glyphicon glyphicon-pause");
	}
	if (state == "paused") {
		$("#bigplay").removeClass().addClass("alert-player");
		$("#playpauseico").removeClass().addClass("glyphicon glyphicon-play");
	}
	if (state = "stopped") {

	}
	if (state = "buffering") {

	}
};

function GetMuteState(state) {
	if (state == 1) {
		$("#volumeico").removeClass().addClass("glyphicon glyphicon-volume-off");
		$("#volumeseeker").slider("value", 0);
	}
	if (state == 0) {
		$("#volumeico").removeClass().addClass("glyphicon glyphicon-volume-up");
	}
};

function GetMediaInfo(key, callback) {
$.xhrPool.abortAll();
if (debug) console.log("new UpdateMediaInfo");
$.ajax({
		"url" : "http://" + ServerIP + ":32400" + key,
		"dataType" : "xml",
		"type" : "GET",
		"beforeSend": function (xhr) {
			$.xhrPool.push(xhr);
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
			UpdateMediaInfo(data)
		},
		"error" : function (jqXHR, textStatus, errorThrown) {
		},
		"complete" : function(xhr) {
			if (debug) console.log("done UpdateMediaInfo");
	        var index = $.xhrPool.indexOf(xhr);
	        if (index > -1) {
	            $.xhrPool.splice(index, 1);
	        }
		}
	})
_gaq.push(['_trackEvent', "Playback", 'New media']);
};

function UpdateMediaInfo(data2) {
	var typeofmedia = "Video";
	if(typeof $(data2).find("Video").attr("key") === 'undefined'){
		typeofmedia = "Track";
	};
	mediaType = [];
	mediaType.push(typeofmedia);
	if (debug) console.log("type : " + mediaType);
	if(typeof $(data2).find(typeofmedia).attr("grandparentTitle") !== 'undefined'){
		$("#grandparentTitle").text($(data2).find(typeofmedia).attr("grandparentTitle"));
	} else {
		$("#grandparentTitle").text("");
	}
	var title = $(data2).find(typeofmedia).attr("title");
	$("#title").text(title);

	var arturl = $(data2).find(typeofmedia).attr("art");
	if(typeof arturl === 'undefined'){
		arturl = chrome.extension.getURL('img/remote_background.jpeg');
	} else {
		if (arturl.charAt(0) != "h") arturl = "http://" + ServerIP + ":32400" + $(data2).find(typeofmedia).attr("art");
	}
	$("#video-background").css('background-image', 'none');
		$("#video-background").css('background-image', 'url(' + arturl + ')');

	var thumburl = "http://" + ServerIP + ":32400" + $(data2).find(typeofmedia).attr("thumb");
	var thumburl = $(data2).find(typeofmedia).attr("thumb");
	if (thumburl.charAt(0) != "h") thumburl = "http://" + ServerIP + ":32400" + $(data2).find(typeofmedia).attr("thumb");
	$("#thumbimg").attr('src',thumburl);
};

function ResetMediaInfo() {
	SaveDuration(0);
	$("#duration").text("");
	$("#current").text("");
	$("#timeseeker").slider("value", 0);
	$("#grandparentTitle").text("");
	$("#title").text("Waiting ...");
	$("#thumbimg").attr('src','');
	var arturl = chrome.extension.getURL('img/remote_background.jpeg');
	$("#video-background").css('background-image', 'url(' + arturl + ')');
}

function SaveDuration(duration) {
	localStorage.setItem("duration", duration);
};

function setVolume(val) {
	updateCommandID();
	$.xhrPool.abortAll();
	$.ajax({
		"url" : "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/setParameters?type=video&commandID=" + commandid + "&mute=0&volume=" + val,
		"dataType" : "xml",
		"type" : "GET",
	});
	GetMuteState(0);
	_gaq.push(['_trackEvent', "Volume Seeker", 'New Position']);
};

function setMute(val) {
	var mute;
	if (val == 0) {
		mute = 1;
	} else {
		mute = 0;
	}
	updateCommandID();
	$.xhrPool.abortAll();
	$.ajax({
		"url" : "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/setParameters?type=video&commandID=" + commandid + "&mute=" + mute,
		"dataType" : "xml",
		"type" : "GET",
	});
	GetMuteState(mute);
};

function setPosition(val) {
	updateCommandID();
	$.xhrPool.abortAll();
	var duration = localStorage["duration"];;
	var newposition = Math.round((val/100)*duration);
	$.ajax({
		"url" : "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/seekTo?type=video&commandID=" + commandid + "&offset=" + newposition,
		"dataType" : "xml",
		"type" : "GET",
	});
	_gaq.push(['_trackEvent', "Position Seeker", 'New Position']);
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

$( "#playpauseico").click(function() {
  plex.doCommand("playpause");
});

$( "#bigplay" ).click(function() {
  plex.doCommand("playpause");
});

$( "#stopico").click(function() {
  plex.doCommand("stop");
});

$( "#volumeico" ).click(function() {
  setMute(isMute[0]);
});

$( "#exitico" ).click(function() {
  history.back();
});

$( "#infoico" ).click(function() {
  $("#alert-info").removeClass("hide");
  $("#infoico").addClass("hide");
});

$( "#alert-info" ).click(function() {
  $("#alert-info").addClass("hide");
  $("#infoico").removeClass("hide");
});

$( "#settingsico" ).click(function() {
  chrome.tabs.update({url: chrome.extension.getURL('options.html'), active: true});
});	

////////////

function Cast(VideoUrl) {

	//Setting seekers status
	updateSeeker = [];
	updateSeeker.push(false);

	//Show loading div
	console.log("New Cast : " + VideoUrl);
	console.log("Server IP : " + ServerIP);
	console.log("Server ID : " + ServerMachineID);
	console.log("PlayerIP : " + PlayerIP);
	console.log("PlayerPort : " + PlayerPort);
	$("#cast_player").addClass("hide");
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
			console.log("Connected to server");
			console.log("Looking for media");
			//Retrieve Plex Style URL for media to cast
			$.ajax({
				"url" : "http://node.plexapp.com:32400/system/services/url/lookup?url=" + VideoUrl,
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
					console.log("Sending media to player");
					//Send media to player
					var typeofmedia = "Video";
					if(typeof $(data).find("Video").attr("key") === 'undefined'){
						typeofmedia = "Track";
					};
					var key = $(data).find(typeofmedia).attr("key");
					var url = "http://" + PlayerIP + ":" + PlayerPort + "/player/playback/playMedia?key=" + key + "&offset=0&machineIdentifier=" + ServerMachineID + "&address=" + ServerIP + "&port=32400&protocol=http&containerKey=" + key + "&commandID=" + commandid;
					$.ajax({
						"url" : url,
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
							console.log("Cast: success");
							$("#cast_loading").addClass("hide");
							$("#cast_success").removeClass("hide");
							setTimeout(function(){$("#cast_success").addClass("hide");}, 3000);
							setTimeout(function(){$("#cast_player").removeClass("hide");}, 3000);
							getPlayerTimesHTTP();
							_gaq.push(['_trackEvent', "Cast", 'Success']);
						},
						"error" : function (jqXHR, textStatus, errorThrown) {
							console.log("Error: client is not responding");
							
							_gaq.push(['_trackEvent', "Cast", 'Client error']);
							
							$("#cast_loading").addClass("hide");
							$("#cast_error_client").removeClass("hide");
							setTimeout(function(){$("#cast_error_client").addClass("hide");}, 3000);
							setTimeout(function(){$("#cast_player").removeClass("hide");}, 3000);
							
							//Client is not responding: send alert to user
							var retVal = confirm("Client not found. Do you want to update your settings ?");
							if( retVal == true ){
								chrome.tabs.update({url: chrome.extension.getURL('options.html'), active: true});
								return true;
							}
							//getPlayerTimesHTTP();
						}

					});

				},
				"error" : function (jqXHR, textStatus, errorThrown) {
					_gaq.push(['_trackEvent', "Cast", 'Media error']);
					
					console.log("Error: media is not supported");
					
					$("#cast_loading").addClass("hide");
					$("#cast_error_media").removeClass("hide");
					setTimeout(function(){$("#cast_error_media").addClass("hide");}, 3000);
					setTimeout(function(){$("#cast_player").removeClass("hide");}, 3000);
					
					getPlayerTimesHTTP();
				}

			});

		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			_gaq.push(['_trackEvent', "Cast", 'Server error']);

			console.log("Error: server is not responding");

			$("#cast_loading").addClass("hide");
			$("#cast_error_server").removeClass("hide");
			setTimeout(function(){$("#cast_error_server").addClass("hide");}, 3000);
			setTimeout(function(){$("#cast_player").removeClass("hide");}, 3000);

			//Server is not responding: send alert to user
			var retVal = confirm("Server not found. Do you want to update your settings ?");
			if( retVal == true ){
				chrome.tabs.update({url: chrome.extension.getURL('options.html'), active: true});
				return true;
			}
			   //getPlayerTimesHTTP();
		}
	});
}

function updateSeekerNow() {
	if (updateSeeker[0] == true) {
		console.log("Cast function not triggered, updating seeker");
		getPlayerTimesHTTP();
	} else {
		console.log("Cast function triggered, not updating seeker");
	}
}

setTimeout(updateSeekerNow, 1000);

$("#cast_player").html("<span class='glyphicon glyphicon-stats' style='color:#cc7b19; opacity:0.7;'></span> " + PlayerName);