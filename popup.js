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

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
SetButtonCasting(request.buttontext);
//_gaq.push(['_trackEvent', "Cast", 'Clicked']);
});

!function ($) {

    "use strict";

    // PROGRESSBAR CLASS DEFINITION
    // ============================

    var Progressbar = function (element) {
        this.$element = $(element);
    }

    Progressbar.prototype.update = function (value) {
        var $div = this.$element.find('div');
        var $span = $div.find('span');
        $div.attr('aria-valuenow', value);
        $div.css('width', value + '%');
        $span.text(value + '% Complete');
    }

    Progressbar.prototype.finish = function () {
        this.update(100);
    }

    Progressbar.prototype.reset = function () {
        this.update(0);
    }

    // PROGRESSBAR PLUGIN DEFINITION
    // =============================

    $.fn.progressbar = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('jbl.progressbar');

            if (!data) $this.data('jbl.progressbar', (data = new Progressbar(this)));
            if (typeof option == 'string') data[option]();
            if (typeof option == 'number') data.update(option);
        })
    };

    // PROGRESSBAR DATA-API
    // ====================

    $(document).on('click', '[data-toggle="progressbar"]', function (e) {
        var $this = $(this);
        var $target = $($this.data('target'));
        var value = $this.data('value');

        e.preventDefault();

        $target.progressbar(value);
    });

}(window.jQuery);

if (!localStorage["pauseHTML5video"]) {
	localStorage.setItem("pauseHTML5video", "1");
}

if (localStorage["pauseHTML5video"] == 1) {
	$('#pausevideosetting').prop('checked', true);
}

$("#pausevideosetting").change(function() {
    if(this.checked) {
        console.log("YEYEYE")
        localStorage.setItem("pauseHTML5video", "1");
    } else {
    	console.log("NONONO")
    	localStorage.setItem("pauseHTML5video", "0");
    }
});

if (!localStorage["offsetHTML5video"]) {
	localStorage.setItem("offsetHTML5video", "1");
}

if (localStorage["offsetHTML5video"] == 1) {
	$('#offsetvideosetting').prop('checked', true);
}

$("#offsetvideosetting").change(function() {
    if(this.checked) {
        console.log("YEYEYE")
        localStorage.setItem("offsetHTML5video", "1");
    } else {
    	console.log("NONONO")
    	localStorage.setItem("offsetHTML5video", "0");
    }
});

function ShowSavedClient() {
	$('#savedClient').text(localStorage["plexClientName"]);
	$('#plexServer').val(localStorage.getItem("plexServer"));
}

ShowSavedClient();

function GetClientList() {
$("#clientalert").addClass("hide");
$('#update').button('loading');
$.ajax({
	"url" : "http://" + localStorage["plexServer"] + ":32400/clients",
	"dataType" : "xml",
	"type" : "GET",
	"timeout" : "2000",
	"statusCode": {
		401: function() {
			$("#server-form").addClass("hide");
			$("#client-form").removeClass("hide");
			$("#configure-form").addClass("hide");
			$("#login-form").removeClass("hide");
			$("#username").focus();
		}
	},
	"beforeSend": function (xhr) {
	  	xhr.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
		xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
		xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
		xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
		xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
		xhr.setRequestHeader("X-Plex-Platform", "Chrome");
		xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
		xhr.setRequestHeader("X-Plex-Platform-Version", "1");
		xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
		xhr.setRequestHeader("X-Plex-Version", "1.0");
	},
	"success" : function (data) {
		$("#plexClient").empty();
		something = $(data).find("Server");
		var $clients = $(data).find("Server");
		var $i = 0;
		$.each($clients, function (i,item) {
			var client = $("<option>", {
				"value" : $(item).attr("host"),
				"cname" : $(item).attr("name"),
				"cport" : $(item).attr("port"),
				"html" : $(item).attr("name") + " (" + $(item).attr("host") +")"
			}).appendTo($("#plexClient"));
			$i++;
		});
		if ($i == 0) {
			$("#clientalert").removeClass("hide");
		}
		if ($i == 1) {
			UpdateClient();
		} 
		$("#clientSelect").focus();
		$('#update').button('reset');
		$("#serveralert").alert('close')
	},
	"error" : function (jqXHR, textStatus, errorThrown) {
		$('#update').button('reset');
		$("#serveralert").removeClass("hide");
	}

});
}

GetClientList();

function SetButtonCasting(tab) {
	if (tab == "lookingformedia") {;
		$("#progresstext").text("Looking for media...");
		$("#progress-33").click();
	}
	console.log("CAST Response : " + tab);
	if (tab == "medianotsupported") {
		$("#progresstext").text("Error: Media isn't supported :(");
		_gaq.push(['_trackEvent', "Cast", 'Media error']);
		setTimeout(function(){
			$('#cast').button('reset');
			$('#collapseExample').collapse('hide');
			$("#progress-00").click();
		}, 1000);
	}
	if (tab == "mediasupported") {
		$("#progresstext").text("Preparing to cast...");
		$("#progress-66").click();
	}
	if (tab == "clientnotresponding") {
		$("#progresstext").text("Error: Client isn't reponsing :(");
		_gaq.push(['_trackEvent', "Cast", 'Client error']);
		setTimeout(function(){
			$('#cast').button('reset');
			$('#collapseExample').collapse('hide');
			$("#progress-00").click();
		}, 1000);
	}
	if (tab == "casting") {
		_gaq.push(['_trackEvent', "Cast", 'Success']);
		$("#progresstext").text("Casting :)");
		$("#progress-100").click();
		setTimeout(function(){
			$('#cast').button('reset');
			$('#collapseExample').collapse('hide');
			$("#progress-00").click();
			$("#progresstext").text("Please wait...");
		}, 1000);
	}
}

function ResetButtonSaved(tab) {
$('#save').button('reset');
}

function UpdateClient() {
	$('#save').button('loading');
	localStorage.setItem("plexClient", $("#plexClient").val());
	if ($('option:selected', "#plexClient").attr('cname').length > 16) {
		var truncatedname = $('option:selected', "#plexClient").attr('cname').substring(0,16) + "...";
	} else {
		var truncatedname = $('option:selected', "#plexClient").attr('cname');
	}
	localStorage.setItem("plexClientName", truncatedname);
	localStorage.setItem("plexClientPort", $('option:selected', "#plexClient").attr('cport'));
	ShowSavedClient();
	setTimeout(ResetButtonSaved, 1000);
};

function PrepareToCastWOR(tab) {
	chrome.tabs.query({active:true,currentWindow:true},function(tabArray){
	    
	    var VideoURL = tabArray[0].url;
	    var tabid = tabArray[0].id;

	    $('#cast').button('loading');
	    //chrome.tabs.update({url: chrome.extension.getURL('remote.html'), active: true});
	    //setTimeout(function(){chrome.tabs.sendMessage(tabid, {castthis: VideoURL}, function(response) {})},1000);

	    //chrome.runtime.sendMessage({castthis: VideoURL}, function(response) {});
	    chrome.runtime.sendMessage({castthis: VideoURL}, function(response) {});
	    _gaq.push(['_trackEvent', "Cast", 'Clicked']);
	    //setTimeout(SetButtonCasting,1050);

    })
}

///////////////////
///////////////////

function make_base_auth(user, password) {
		var tok = user + ':' + password;
		var hash = btoa(tok);
		
		return "Basic " + hash;
}

$("#SaveServer").click(function(){
	$('#SaveServer').button('loading');
	$("#serverok").addClass("hide");
	$("#serverrerror").addClass("hide");
	$.ajax({
		"url" : "http://" + $("#plexServer").val() + ":32400/",
		"dataType" : "xml",
		"type" : "GET",
		"timeout" : "5000",
		"statusCode": {
			401: function() {
				$('#SaveServer').button('reset');
				$("#serverformip").addClass("hide");
				$("#serverformlogin").removeClass("hide");
				$("#username").focus();
			}
		},
		"beforeSend": function (xhr) {
		  	xhr.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
			xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
			xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Platform-Version", "1");
			xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Version", "1.0");
		},
		"success" : function (data) {
			var $clients = $(data).find("MediaContainer");
			var $i = 0;
				$.each($clients, function (i,item) {
					var s = $("#plexServer").val();
					console.log($(item).attr("machineIdentifier"));
					var id = $(item).attr("machineIdentifier");
					i++;
					localStorage.setItem("plexServer", s);
					localStorage.setItem("plexServerID", id); 
				});
			console.log(i);
			$("#clientSelect").focus();
			$('#SaveServer').button('reset');
			$("#serverok").removeClass("hide");
			GetClientList();
		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			//alert("Error");
			$("#serverrerror").removeClass("hide");
			$('#SaveServer').button('reset');
		}

	});
});

$("#MyPlexLogin").click(function(e) {
	$('#MyPlexLogin').button('loading');
	$("#loginerror").addClass("hide")
	var username = $("#username").val();
	var password = $("#password").val();
	e.preventDefault();
	$.ajax({
		"url" : "https://my.plexapp.com/users/sign_in.xml",
		"type" : "POST",
		"dataType" : "xml",
		"statusCode": {
			401: function() {
				$("#loginerror").removeClass("hide")
				//setTimeout($("#loginerror").addClass("hide"), 1000);
				$('#MyPlexLogin').button('reset');
			}
		},
		"beforeSend": function (xhr) {
		  	xhr.setRequestHeader("Authorization", make_base_auth(username,password));
			xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
			xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Platform-Version", "1");
			xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Version", "1.0");
		},
		"success" : function (data) {
			var token = $(data).find("authentication-token").text();
			console.log("Setting Plex Token: " + token)
			localStorage.setItem("plexToken", token);
			$('#MyPlexLogin').button('reset');
			$("#serverformlogin").addClass("hide");
			$("#serverformip").removeClass("hide");
			$("#SaveServer").click();
		},
		"error" : function (jqXHR, textStatus, errorThrown) {
			//alert("Error");
			$("#loginerror").removeClass("hide")
			//setTimeout($("#loginerror").addClass("hide"), 1000);
			$('#MyPlexLogin').button('reset');
		}
	});


});

document.getElementById('cast').onclick = PrepareToCastWOR;
document.getElementById('save').onclick = UpdateClient;
document.getElementById('update').onclick = GetClientList;



///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////
///////////////////////////


chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
Cast(request.castthis);
//_gaq.push(['_trackEvent', "Cast", 'Clicked']);
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

var ServerIP = localStorage["plexServer"];
var PlayerIP = localStorage["plexClient"];
var PlayerName = localStorage["plexClientName"];
if (localStorage["plexClientPort"]) {
	var PlayerPort = localStorage["plexClientPort"];
} else {
	var PlayerPort = "3005";
}
var ServerMachineID = localStorage["plexServerID"];

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
				xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Platform", "Chrome");
				xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
				xhr.setRequestHeader("X-Plex-Platform-Version", "1");
				xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Version", "1.0");
			},
			"success" : function (data) {
			// Get Current type
			var mediatype = 3;
			if ($(data).find('Timeline').eq(0).attr('state') == "playing") mediatype = 0; //Track
			if ($(data).find('Timeline').eq(1).attr('state') == "playing") mediatype = 1; //Video
			if ($(data).find('Timeline').eq(2).attr('state') == "playing") mediatype = 2; //Photo

				//Monitor Media change
				if (typeof $(data).find('Timeline').eq(mediatype).attr('key') !== 'undefined') key_new = $(data).find('Timeline').eq(mediatype).attr('key');

				if (key_new != key_old && i != 0) {
					//Update Media Info
					if (debug) console.log("key old : " + key_old);
					if (debug) console.log("key new : " + key_new);
					//GetMediaInfo(key_new);
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
					//GetMediaInfo(key_new);
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
		$("#playpauseico").removeClass().addClass("glyphicon glyphicon-pause");
	}
	if (state == "paused") {
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
			xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
			xhr.setRequestHeader("X-Plex-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
			xhr.setRequestHeader("X-Plex-Platform-Version", "1");
			xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
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
//_gaq.push(['_trackEvent', "Playback", 'New media']);
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
		//$("#grandparentTitle").text($(data2).find(typeofmedia).attr("grandparentTitle"));
	} else {
		//$("#grandparentTitle").text("");
	}
	var title = $(data2).find(typeofmedia).attr("title");
	//$("#title").text(title);
};

function ResetMediaInfo() {
	SaveDuration(0);
	$("#duration").text("0:00:00");
	$("#current").text("0:00:00");
	$("#timeseeker").slider("value", 0);
	//$("#grandparentTitle").text("");
	//$("#title").text("Waiting ...");
	//var arturl = chrome.extension.getURL('img/remote_background.jpeg');
	//$("#video-background").css('background-image', 'url(' + arturl + ')');
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
		"url" : "http://" + localStorage["plexClient"] + ":" + localStorage["plexClientPort"] + "/player/playback/setParameters?type=video&commandID=" + commandid + "&mute=" + mute,
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
		"url" : "http://" + localStorage["plexClient"] + ":" + localStorage["plexClientPort"] + "/player/playback/seekTo?type=video&commandID=" + commandid + "&offset=" + newposition,
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
		stop: function(event, ui) {
		setVolume(ui.value);
		}
	});
	$( "#timeseeker" ).slider({
		min: 0,
		max: 100,
		step: 0.01,
		range: "min",
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

$( "#stopico").click(function() {
  plex.doCommand("stop");
});

$( "#volumeico" ).click(function() {
  setMute(isMute[0]);
});

getPlayerTimesHTTP();


///////////////////////////////////////////
/////////// REMOTE JAVASCRIPT /////////////

var plex = {};

function sendCommand(command) {
	$.xhrPool.abortAll();
	updateCommandID();
		$.ajax({
			"url" : "http://" + localStorage["plexClient"] + ":" + localStorage["plexClientPort"] + "/player/" + plex.sendaction + "/" + command + "?commandID=" + commandid,
			"dataType" : "text",
			"type" : "GET",
			"timeout" : 3000,
			"beforeSend": function (xhr) {
			  	xhr.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
				xhr.setRequestHeader("X-Plex-Device", "Chrome Browser");
				xhr.setRequestHeader("X-Plex-Model", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Client-Identifier", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Device-Name", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Platform", "Chrome");
				xhr.setRequestHeader("X-Plex-Client-Platform", "Chrome");
				xhr.setRequestHeader("X-Plex-Platform-Version", "1");
				xhr.setRequestHeader("X-Plex-Product", "Cast Rocket");
				xhr.setRequestHeader("X-Plex-Version", "1.0");
			},
			"success" : function (data) {
				if (debug) console.log("command sent : " + command);
				_gaq.push(['_trackEvent', "Command", command]);
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