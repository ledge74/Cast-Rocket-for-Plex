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

function make_base_auth(user, password) {
		var tok = user + ':' + password;
		var hash = btoa(tok);
		
		return "Basic " + hash;


///////////////////////////////////////////
///////////// Plex Settings ///////////////


}
$().ready(function () {
	$("#getClients").click(function(){
	_gaq.push(['_trackEvent', "Options", 'New Configuration']);
		$.ajax({
			"url" : "http://" + $("#plexServer").val() + ":32400/",
			"dataType" : "xml",
			"type" : "GET",
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
				_gaq.push(['_trackEvent', "Options", 'Server OK']);
				$("#plexServerID").empty();
				something = $(data).find("MediaContainer");
				var $clients = $(data).find("MediaContainer");
				$.each($clients, function (i,item) {
				var client = $("<option>", {
						"value" : $(item).attr("machineIdentifier"),
						"html" : $(item).attr("machineIdentifier")
					}).appendTo($("#plexServerID"));
				});
				$("#clientSelect").focus();
			},
			"error" : function (jqXHR, textStatus, errorThrown) {
				alert("Error");
				_gaq.push(['_trackEvent', "Options", 'Server Error']);
			}

		});
		$.ajax({
			"url" : "http://" + $("#plexServer").val() + ":32400/clients",
			"dataType" : "xml",
			"type" : "GET",
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
				_gaq.push(['_trackEvent', "Options", 'Client List OK']);
				$("#plexClient").empty();
				something = $(data).find("Server");
				var $clients = $(data).find("Server");
				$.each($clients, function (i,item) {
					var client = $("<option>", {
						"value" : $(item).attr("host"),
						"cname" : $(item).attr("name"),
						"cport" : $(item).attr("port"),
						"html" : $(item).attr("name") + " (" + $(item).attr("host") +")"
					}).appendTo($("#plexClient"));
				});
				$("#clientSelect").focus();
				$("#client-form").removeClass("hide");
				$("#server-form").addClass("hide");
			},
			"error" : function (jqXHR, textStatus, errorThrown) {
				alert("Error");
				_gaq.push(['_trackEvent', "Options", 'Client List Error']);
			}

		});
	});

});

$("#plexServer").val(localStorage.getItem("plexServer"));
$("#plexClient").val(localStorage.getItem("plexClient"));
$("#save").click(function(e) {
	_gaq.push(['_trackEvent', "Options", 'Saved']);
	$("#client-form").addClass("hide");
	var s = $("#plexServer").val();
	var c = $("#plexClient").val();
	var n = $('option:selected', "#plexClient").attr('cname');
	var p = $('option:selected', "#plexClient").attr('cport');
	var i = $("#plexServerID").val();


	var j = {
		plexServer : s,
		plexServerID : i,
		plexClient : c,
		plexClientName : n,
		plexClientPort : p
	};

	if (localStorage.getItem("plexToken")) {
		j.plexToken = localStorage.getItem("plexToken");
	}

	localStorage.setItem("plexServer", s);
	localStorage.setItem("plexServerID", i);    
	localStorage.setItem("plexClient", c);
	localStorage.setItem("plexClientName", n);
	localStorage.setItem("plexClientPort", p);

	$("#success-form").removeClass("hide");

	//window.location.href = "pebblejs://close#" + JSON.stringify(j);

	e.preventDefault();
});
$("#SubmitToken").click(function(e) {
	_gaq.push(['_trackEvent', "Options", 'GetToken']);
	var username = $("#username").val();
	var password = $("#password").val();
	e.preventDefault();
	$.ajax({
		"url" : "https://my.plexapp.com/users/sign_in.xml",
		"type" : "POST",
		"dataType" : "xml",
		"beforeSend": function (xhr) {
		  	xhr.setRequestHeader("Authorization", make_base_auth(username,password));
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
			var token = $(data).find("authentication-token").text();
			console.log("Setting Plex Token: " + token)
			localStorage.setItem("plexToken", token);
			$("#login-form").addClass("hide");
			$("#configure-form").removeClass("hide");
			$("#getClients").click();
		}
	});


});