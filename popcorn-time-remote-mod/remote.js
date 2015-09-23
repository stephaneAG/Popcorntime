/*!
 * Popcorn Time Remote v1.1.0.pre
 * Developed by the PTR Team [ + tef for few hours ]
 * Copyright 2014, the PTR Team
 * Released under the GNU GPL V3 License
 * http://popcorntimeremote.com/
 */
/*! Make sure that we've got jQuery included. */
if (typeof jQuery === "undefined") {
	throw new Error("Popcorn Time Remote requires jQuery.");
}

/************!
 * FUNCTIONS
 ************/

/************!
 * TEF EDIT
 ************/
/*!
 * Call the Popcorn Time API with given arguments.
 *
 * @returns {void}
 */
function popcorntefAPI(method, parameters, callback) {
	if (!window.connected) {
		console.warn("[WARNING] Function popcorntimeAPI was called, but can't proceed since window.connected is not set to true.");
		return false;
	}
	if (typeof parameters == "undefined") {
		parameters = [];
	}
	var request = {};
	request.id = 1234;
	request.jsonrpc = "2.0";
	request.remote = "PTR-" + window.version;
	request.callerLocation = window.location.href;
	request.method = method;
	request.params = parameters;
	$.ajax({
		type: 'POST',
		url: 'http://' + window.ip + ':' + window.port,
		data: JSON.stringify(request),
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password));
		},
		success: function(data, textStatus) {
			callback(request, data);
		},
	});
	return null;
}

// a littl' polish ..
function reinitPopcornColorChange(){
  if( window.popcornColorChangeInterval ) clearInterval( window.popcornColorChangeInterval );
  /* animate the color of the popcorn-masked div */
  window.popcornColorChangeInterval = setInterval( function(){
    var randomColor = 'rgb(' +
    (Math.floor(Math.random() * 256)) + ',' + 
    (Math.floor(Math.random() * 256)) + ',' +
    (Math.floor(Math.random() * 256)) + ')';
    document.querySelector('#popcorn').style.backgroundColor = randomColor;
    //alert('i am annoying!'); // works fine on chrome, and is actually pretty annoying !
  }, 1000);
}




/*!
 * Call the Popcorn Time API with given arguments.
 *
 * @returns {void}
 */
function popcorntimeAPI(method, parameters) {
	if (!window.connected) {
		console.warn("[WARNING] Function popcorntimeAPI was called, but can't proceed since window.connected is not set to true.");
		return false;
	}
	if (typeof parameters == "undefined") {
		parameters = [];
	}
	var request = {};
	request.id = 1234;
	request.jsonrpc = "2.0";
	request.remote = "PTR-" + window.version;
	request.callerLocation = window.location.href;
	request.method = method;
	request.params = parameters;
	$.ajax({
		type: 'POST',
		url: 'http://' + window.ip + ':' + window.port,
		data: JSON.stringify(request),
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password));
		},
		success: function(data, textStatus) {
			responseHandler(request, data);
		},
	});
	return null;
}

/*!
 * Determine what to do with the response.
 *
 * @returns {boolean}
 */
function responseHandler(request, response) {
	if (request.method == "getviewstack") {
		$(".menu").show();
		viewStackHandler(response);
		return true;
	}
	else if (request.method == "getcurrenttab") {
		setTab(response.result.tab);
		window.oldtab = window.currenttab;
		window.currenttab = response.result.tab;
		return true;
	}
	else if (request.method == "getplaying") {
		if (response.result.playing == true || response.result.playing == false) {
			console.info("[INFO] Client is playing item with title '" + response.result.title + "'.");
			// Get the current volume in a global variable.
			popcorntimeAPI("volume"); // -> ?
		}
		else {
			console.info("[NOTICE] Method getplaying was called, but client isn't inside the player (anymore).");
			return false;
		}
		return true;
	}
	else if (request.method == "ping") {
		window.clientVersion = popcorntimeVersion(response, true);
		return true;
	}
	else if (request.method == "getselection") {
		setMediaInfo(response);
		return true;
	}
	else if (request.method == "getstreamurl") {
		//window.streamURL = response.result.streamUrl;
                /* tef edit: here lies the error: it returns 127.0.0.1 instead of 102.168.1.8, aka localhost instead of LAN IP ADRESS */
                //window.streamURL = response.result.streamUrl.substr(0, 7) + window.ip + response.result.streamUrl.substr( response.result.streamUrl.lastIndexOf(':') )
		//$("#streamer-video").attr("src", window.streamURL);
		//$("#streamer-source").attr("src", window.streamURL);
		//$(".streamer-link").html('<a href="' + window.streamURL + '">Open in new window</a>');
                /* tef edit */
                /* add either 'toggleplay' or 'togglemute' & then a getplaying.currenttime to seek the streamer video frame corresponding to the dektop's */
                //popcorntefAPI('togglemute', [], function(req, resp){ alert('I AM CALLED ON OPEN STREAMER CLICK !'); });
                /* R: we could also toggleplay 
                      the resp.result.currentTime returns stuff like 756.258286 for 12:47 on a 22:20 video ..
                */
                /*
                popcorntefAPI('toggleplaying', [], function(req, resp){
                  popcorntefAPI('getplaying', [], function(req, resp){ alert('TITLE: ' + resp.result.title + ' TIME: ' + resp.result.currentTime ); })
                });
                */
                /* with the added desktop to mobile sync ( good for both toggleplaying & togglemute stuff ) */
                //popcorntefAPI('togglemute', [], function(req, resp){
                popcorntefAPI('toggleplaying', [], function(req, resp){
                  popcorntefAPI('getplaying', [], function(req, resp){ 
                    //alert('TITLE: ' + resp.result.title + ' TIME: ' + resp.result.currentTime );
                    /*
                      Oh yeah* ! :D ( * neat, no-js, & HTML5 compliant ;) )
                      the js alternative 'd be 'doc.getElem('video').addEventListener('loadedmetadata', fcn(){ this.currentTime = <whatever> }, false)'
                      
                    */
                    window.streamURL = response.result.streamUrl.substr(0, 7) + window.ip + response.result.streamUrl.substr( response.result.streamUrl.lastIndexOf(':') ) + '#t=' + resp.result.currentTime;
		    $("#streamer-video").attr("src", window.streamURL);
		    $("#streamer-source").attr("src", window.streamURL);
		    $(".streamer-link").html('<a href="' + window.streamURL + '">Open in new window</a>');
                    // added for auto next when streamer video ends, cancelled if the streamer is closed ( and should be somehow paused when we pause the streamer video, aka cancel on pause & reinit on play)
                    // R: we'll have to digg the events notifying of a new video being available on desktop, to be able to reload the stream src as well as pausing the desktop one
                    //    below works fine, j. in case, fallback idea: window.timedNextOnStreamerEnded = setTimeout(function(){ ... }, resp.result.duration - resp.result.currentTime );
                    $("#streamer-video").get(0).removeEventListener('ended'); // all right, I know it's dirty ..
                    $("#streamer-video").get(0).addEventListener('ended', function(){
                      popcorntefAPI('seek', [ resp.result.duration ], function(req, resp){ /*alert('streamer video end event registered!');*/ });
                      window.streamerWasPlaying = true; // added to be able to return to streamer view after next episode has been downloaded - cancelled when closing the streamer
                    }, false);
                  })
                });
                //popcorntimeAPI("togglemute");
                showSection("streamer");
		return true;
	}
	else if (request.method == "toggleplaying") {
		toggleButton(".btn-pause");
		return true;
	}
	else if (request.method == "volume") {
		window.currentVolume = 1;
		window.currentVolume = response.result.volume;
		return true;
	}
	else if (request.method == "getsubtitles") {
		if (window.view != "player" && window.view != "movie-detail") {
			return false;
		}
		$("#select-subtitles-" + window.view).children().remove();
		$("#select-subtitles-" + window.view).append('<option value="">Select subtitles</option>');
		if (response && response.result && response.result.subtitles) {
			var subtitles = response.result.subtitles;
		}
		else {
			var subtitles = {};
		}
		$.each(subtitles, function(index, value) {
			$("#select-subtitles-" + window.view).append('<option value="' + value + '">' + window.langcodes[value] + '</option>');
		});
		return true;
	}
	else if (request.method == "getplayers") {
		if (window.view == "shows-container-contain" || window.view == "movie-detail") {
			var selectView = window.view;
		}
		else {
			return false;
		}
		$("#select-player-" + selectView).children().remove();
		$("#select-player-" + selectView).append('<option value="">Select player</option>');
		$.each(response.result.players, function(key, value) {
			$("#select-player-" + selectView).append('<option value="' + value.id + '">' + value.name + '</option>');
		});
		return true;
	}
	else if (request.method == "getgenres") {
		$("#select-filter-genre").children().remove();
		$.each(response.result.genres, function(key, value) {
			$("#select-filter-genre").append('<option value="' + value + '">' + value + '</option>');
		});
		return true;
	}
	else if (request.method == "getsorters") {
		$("#select-filter-sort").children().remove();
		$.each(response.result.sorters, function(key, value) {
			$("#select-filter-sort").append('<option value="' + value + '">' + value + '</option>');
		});
		return true;
	}
	else if (request.method == "clearsearch") {
		$("#input-search").val("");
		$(".btn-enter-search").addClass("hidden");
		$(".btn-clear-search").addClass("hidden");
		return true;
	}
	else if (request.method == "up" || request.method == "down" || request.method == "left" || request.method == "right" || request.method == "enter" || request.method == "movieslist" || request.method == "showslist" || request.method == "animelist" || request.method == "togglequality" || request.method == "togglewatched" || request.method == "togglefavourite" || request.method == "previousseason" || request.method == "nextseason" || request.method == "back" || request.method == "seek" || request.method == "setsubtitle" || request.method == "setplayer" || request.method == "showwatchlist" || request.method == "showfavourites" || request.method == "filtergenre" || request.method == "filtersorter" || request.method == "filtersearch") {
		// Methods that do not require a response handler.
		return null;
	}
	else {
		console.warn("[WARNING] No registered response handler for method '" + request.method + "'.");
		console.log(response);
		return false;
	}
}

/*!
 * Try to connect to the Popcorn Time client.
 *
 * @returns {boolean} True or False.
 */
function popcorntimeConnect(noOutput, firstTime) {
	var request = {};
	request.id = 10;
	request.jsonrpc = "2.0";
	request.remote = "PTR-" + window.version;
	request.callerLocation = window.location.href;
	request.method = 'ping';
	request.params = [];

	if (noOutput != true) {
		console.debug("[DEBUG] Connection details: " + window.username + "@" + ip + ":" + port + " with password '" + window.password + "'.");
	}
	$.ajax({
		type: 'POST',
		url: 'http://' + window.ip + ':' + window.port,
		data: JSON.stringify(request),
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', window.btoa(window.username + ":" + window.password));
                        //xhr.setRequestHeader('Authorization', window.btoa('popcorn' + ":" + 'jackassapple007')); /* tef edit */
		},
		success: function(data, textStatus) {
			if (typeof data.error == "undefined") {
				if (noOutput != true) {
					console.info("[INFO] Connection established.");
				}
				window.connected = true;
			}
			else {
				// Encountered errors.
				if (noOutput != true) {
					console.error("[ERROR] Invalid login credentials.");
					alert("Invalid login credetials provided.");
					if (firstTime != true) {
						$(".menu").show();
						toggleButton(".btn-settings-icon");
                                                /* tef edit */
                                                reinitPopcornColorChange();
						showSection("settings");
					}
				}
				window.connected = false;
			}
		},
		error: function() {
			if (noOutput != true) {
				console.error("[ERROR] Could not connect to given client.");
				alert("Could not connect to Popcorn Time. Please check your settings.");
				if (firstTime != true) {
					$(".menu").show();
					toggleButton(".btn-settings-icon");
                                        /* tef edit - also we may diable the above cross ? */
                                        /* (RE)INIT POPCORN COLOR CHANGE */
                                        reinitPopcornColorChange();
					showSection("settings");
				}
			}
			window.connected = false;
		}
	});
	if (window.connected == true) {
		return true;
	}
	else {
		return false;
	}
}

/*!
 * Gets the version of PT client out of a HTTP response.
 *
 * @returns {string}
 */
function popcorntimeVersion(data, warn) {
	var version = data.result.popcornVersion;
	if (warn) {
		console.info("[INFO] Popcorn Time client version is '" + version + "'.");
	}
	if (typeof(version) == "undefined") {
		// The popcorntime client is lower than 0.3.4
		if (warn) {
			var message = "Your Popcorn Time Client (v" + version + ") is outdated. Please update your client. The remote might not work correctly if you do not update.";
			console.warn("[WARNING] " + message);
			alert(message);
		}
		return "pre-0.3.4";
	}
	else {
		// The popcorntime client is version 0.3.4 or higher.
		if ($.inArray(version, window.supportedPopcornTimeVersions) != "-1") { // version supported.
			if (warn) {
				console.info("[INFO] Client version is supported.");
			}
		}
		else if (version == "0.3.4") { // version is outdated.
			if (warn) {
				var message = "Your Popcorn Time Client (v" + version + ") is outdated. Please update your client. The remote might not work correctly if you do not update.";
				console.warn("[WARNING] " + message);
				alert(message);
			}
		}
		else {
			if (warn) {
				var message = "Your Popcorn Time Client (v" + version + ") is running an unknown version, the remote might not work correctly because of this.";
				console.warn("[WARNING] " + message);
				alert(message);
			}
		}
		return version;
	}
}

/*!
 * Viewstack handler.
 *
 * @returns {void}
 */
function viewStackHandler(data) {
	// Check if the client is an old version of popcorntime (pre 0.3.4).
	if (typeof(data.result.popcornVersion) == "undefined") {
		currentView = data.result[0][data.result[0].length - 1];
	}
	// The popcorntime client is version 0.3.4 or higher.
	else {
		currentView = data.result.viewstack[data.result.viewstack.length - 1];
	}
	// Check if the current view has been changed.
	if (window.view != currentView && $("#settings").is(":visible") == false) {
		console.debug("[DEBUG] View changed, new view: '" + currentView + "'.");
		if (window.view == "movie-detail") {
			// Remove backdrop from background.
			$("body").removeClass("backdrop");
			$("body").attr("style", "");
		}
		switch (currentView) {
			case 'shows-container-contain':
				showSection("shows-container");
				popcorntimeAPI("getselection");
				popcorntimeAPI("getplayers");
				break;
			case 'main-browser':
				showSection("main-browser");
				popcorntimeAPI("getgenres");
				popcorntimeAPI("getsorters");
				break;
			case 'movie-detail':
				showSection("movie-detail");
				popcorntimeAPI("getselection");
				popcorntimeAPI("getsubtitles");
				popcorntimeAPI("getplayers");
				break;
			/*
                        case 'player':
				showSection("player");
				popcorntimeAPI("getplaying");
				popcorntimeAPI("getsubtitles");
				break;
                        */
                        /* tef edit */
                        case 'player':
                                if ( window.streamerWasPlaying == true ){
                                  // pause the desktop
                                  // set streamer video current time to desktop currentTime
                                  // ---------------------------------------------------------------
                                  // quick hack using the 3 lines below to re-trigger src correctly ?
                                  $("#streamer-video").attr("src", '');
		                  $("#streamer-source").attr("src", '');
	                	  $(".streamer-link").html('<a href="' + '' + '">Open in new window</a>');
                                  popcorntefAPI('toggleplaying', [], function(req, resp){
                                    popcorntefAPI('getplaying', [], function(req, resp){ 
                                      //alert('TITLE: ' + resp.result.title + ' TIME: ' + resp.result.currentTime );
                                      /*
                                        Oh yeah* ! :D ( * neat, no-js, & HTML5 compliant ;) )
                                        the js alternative 'd be 'doc.getElem('video').addEventListener('loadedmetadata', fcn(){ this.currentTime = <whatever> }, false)'
                                      
                                      */
                                      window.streamURL = resp.result.streamUrl.substr(0, 7) + window.ip + resp.result.streamUrl.substr( resp.result.streamUrl.lastIndexOf(':') ) + '#t=' + resp.result.currentTime;
	                	      $("#streamer-video").attr("src", window.streamURL);
		                      $("#streamer-source").attr("src", window.streamURL);
	                	      $(".streamer-link").html('<a href="' + window.streamURL + '">Open in new window</a>');
                                      // added for auto next when streamer video ends, cancelled if the streamer is closed ( and should be somehow paused when we pause the streamer video, aka cancel on pause & reinit on play)
                                      // R: we'll have to digg the events notifying of a new video being available on desktop, to be able to reload the stream src as well as pausing the desktop one
                                      //    below works fine, j. in case, fallback idea: window.timedNextOnStreamerEnded = setTimeout(function(){ ... }, resp.result.duration - resp.result.currentTime );
                                      /* below should be already set & good to go
                                      $("#streamer-video").get(0).addEventListener('ended', function(){
                                        popcorntefAPI('seek', [ resp.result.duration ], function(req, resp){ alert('streamer video end event registered!'); });
                                        window.streamerWasPlaying = true; // added to be able to return to streamer view after next episode has been downloaded - cancelled when closing the streamer
                                      }, false);
                                      */
                                    })
                                  });
                                  // ---------------------------------------------------------------
                                  showSection("streamer");
                                } else { 
				  showSection("player");
				  popcorntimeAPI("getplaying");
				  popcorntimeAPI("getsubtitles");
				}
                                break;
			case 'settings-container-contain':
				showSection("settings-client");
				break;
			case 'about':
				showSection("about");
				break;
			case 'init-container':
				console.info("[INFO] Current view is Popcorn Time client loading screen.");
				showSection("loading");
				break;
			case 'app-overlay':
				showSection("downloading");
				break;
			case 'keyboard':
				console.info("[INFO] Current view is Popcorn Time's keyboard shortcut list.");
				break;
			default:
				console.error("[ERROR] View changed to unknown: '" + currentView + "'.");
		}
		view = currentView;
	}
	else if (currentView == "main-browser") {
		/*!TODO: find a better solution for this: this part gets called every second. We should change remote.js to use listennotifications() */
		if (window.currenttab == "movies" || window.currenttab == "shows" || window.currenttab == "anime") {
			$(".subsection-search-filter").removeClass("hidden");
			if (window.currenttab != window.oldtab) {
				popcorntimeAPI("getgenres");
				popcorntimeAPI("getsorters");
			}
		}
		else {
			$(".subsection-search-filter").addClass("hidden");
		}
	}
}

/*!
 * Load the settings into the settings form,
 * apply the set theme and load the settings into global variables.
 * This function should only be called once per session.
 *
 * @returns {void}
 */
function loadSettings() {
	// Check if the settings exist. If not, create them with default settings.
	if (!localStorageExists("ip")) {
		window.localStorage.setItem("ip", "localhost");
	}
	if (!localStorageExists("port")) {
		window.localStorage.setItem("port", "8008");
	}
	if (!localStorageExists("username")) {
		window.localStorage.setItem("username", "popcorn");
	}
	if (!localStorageExists("password")) {
		window.localStorage.setItem("password", "popcorn"); /* jackassapple007 */
	}
        /* tef hack */
        //window.localStorage.setItem("ip", "192.168.1.8");
        //window.localStorage.setItem("username", "popcorn");
        //window.localStorage.setItem("port", "8008");
	//window.localStorage.setItem("password", "jackassapple007"); /* jackassapple007 */
        //alert('TEF HACK DONE !');
        /*if(!localStorageExists("theme")) {
		window.localStorage.setItem("theme", "dark");
	}*/

	// Load the settings into the HTML form.
	$("#ip").val(window.localStorage.getItem("ip"));
	$("#port").val(window.localStorage.getItem("port"));
	$("#username").val(window.localStorage.getItem("username"));
	$("#password").val(window.localStorage.getItem("password"));
	//$("#" + window.localStorage.getItem("theme")).prop("checked", true);
	//switchTheme(window.localStorage.getItem("theme"));

	// Set the global setting variables.
	reloadSettings();
}

/*!
 * Get local storage of items and set their values to global variables.
 *
 * @returns {void}
 */
function reloadSettings() {
	// Get the localStorage items.
	window.ip = window.localStorage.getItem("ip");
	window.port = window.localStorage.getItem("port");
	window.username = window.localStorage.getItem("username");
	window.password = window.localStorage.getItem("password");
	console.info("[INFO] Settings were reloaded.");

	// Check the connection with the refreshed settings.
	popcorntimeConnect(true);
}

/*!
 * Register all the required listeners.
 *
 * @returns {void}
 */
function registerListeners() {
	// Remote buttons handlers.
	registerListener(".btn-enter", "click", "enter", true);
	registerListener(".btn-arrow-up", "click", "up");
	registerListener(".btn-arrow-left", "click", "left");
	registerListener(".btn-arrow-down", "click", "down");
	registerListener(".btn-arrow-right", "click", "right");
	registerListener(".btn-pause", "click", "toggleplaying", false);
	registerListener(".btn-quality", "click", "togglequality");
	registerListener(".btn-favourite", "click", "togglefavourite");
	registerListener(".btn-seen", "click", "togglewatched");
	registerListener(".btn-mute", "click", "togglemute", false, ".btn-mute");
	registerListener(".btn-fullscreen", "click", "togglefullscreen", false, ".btn-fullscreen");
	registerListener(".btn-movies", "click", "movieslist", true);
	registerListener(".btn-shows", "click", "showslist", true);
	registerListener(".btn-anime", "click", "animelist", true);
	registerListener(".btn-season-next", "click", "nextseason");
	registerListener(".btn-season-prev", "click", "previousseason");
	registerListener(".btn-trailer", "click", "watchtrailer");
	registerListener(".btn-stream", "click", "getstreamurl");
	registerListener(".btn-arrow-left-player", "click", "seek", null, null, null, [-10]);
	registerListener(".btn-arrow-right-player", "click", "seek", null, null, null, [10]);
	registerListener(".btn-inbox", "click", "showwatchlist");
	registerListener(".btn-favourites", "click", "showfavourites");
	registerListener(".btn-clear-search", "click", "clearsearch");
	// Setting handlers.
	$(".btn-settings").on('click', function() {
                /* tef edit */
                reinitPopcornColorChange();
		showSection("settings");
		$("body").addClass("backdrop-hidden");
	});
	$(".btn-close-settings").on('click', function() {
		showSection(window.view);
		$("body").removeClass("backdrop-hidden");
	});
	// Back button handler.
	$(".btn-back").on('click', function() {
		$("body").removeClass("backdrop");
		$("body").attr("style", "");
		popcorntimeAPI("back");
		popcorntimeAPI("getviewstack");
	});
	// Start playing button handler.
	$(".btn-play").on('click', function() {
		$("body").removeClass("backdrop");
		$("body").attr("style", "");
		popcorntimeAPI("toggleplaying");
	});
	// Streamer button handler.
	$(".btn-close-streamer").on('click', function() {
		showSection(window.view);
		$("#streamer-video").get(0).pause();
                /* tef edit */
                // R: added after all the stuff below, to cancel the event listener registered for 'ended' on the streamer video
                $("#streamer-video").get(0).removeEventListener('ended');
                window.streamerWasPlaying = false;
                /* R: seeking past the duration of the video seems to trigger the next one's loading ;p */
                popcorntefAPI('getplaying', [], function(req, resp){
                  //alert('currentTime on mobile: ' + $("#streamer-video").get(0).currentTime); /* j. in case, R: .toFixed(2) */
                  //alert('currentTime on mobile/60: ' + $("#streamer-video").get(0).currentTime/60);
                  var warpTime = $("#streamer-video").get(0).currentTime - resp.result.currentTime;
                  //alert('warpTime on mobile: ' + warpTime);
                  //alert('warpTime on mobile/60: ' + warpTime/60);
                  popcorntefAPI('seek', [ warpTime ], function(req, resp){
                    popcorntefAPI('getplaying', [], function(req, resp){ 
                      // TODO:
                      // check resp.result.playingState & window.wasPlaying to know if we have to resume the video on desktop
                      popcorntefAPI('toggleplaying', [], function(req, resp){ alert('playing back on desktop, in sync !') });
                      // check resp.result.volume & window.wasMuted to know if we have to unmute the video on desktop
                    })
                  });
                });
	});
	// Volume increase & decrease handlers.
	$(".btn-arrow-up-player").on('click', function() {
		popcorntimeAPI("volume", [window.currentVolume + 0.1]);
	});
	$(".btn-arrow-down-player").on('click', function() {
		popcorntimeAPI("volume", [window.currentVolume - 0.1]);
	});
	// Subtitles handlers.
	$("#select-subtitles-movie-detail").on('change', function() {
		popcorntimeAPI("setsubtitle", [this.value]);
	});
	$("#select-subtitles-player").on('change', function() {
		popcorntimeAPI("setsubtitle", [this.value]);
	});
	// Player handlers.
	$("#select-player-movie-detail").on('change', function() {
		popcorntimeAPI("setplayer", [this.value]);
	});
	$("#select-player-shows-container-contain").on('change', function() {
		popcorntimeAPI("setplayer", [this.value]);
	});
	// Select genre handler.
	$("#select-filter-genre").on('change', function() {
		popcorntimeAPI("filtergenre", [this.value]);
	});
	// Select sort handler.
	$("#select-filter-sort").on('change', function() {
		popcorntimeAPI("filtersorter", [this.value]);
	});
	// Search handlers.
	$("#input-search").keyup(function(e) {
		if ($("#input-search").val() == "") {
			$(".btn-clear-search").addClass("hidden");
			$(".btn-enter-search").addClass("hidden");
		}
		else {
			$(".btn-clear-search").removeClass("hidden");
			$(".btn-enter-search").removeClass("hidden");
		}
		if (e.keyCode == 13) {
			popcorntimeAPI("filtersearch", [this.value]);
		}
	});
	$(".btn-enter-search .fa-search").on('click', function() {
		popcorntimeAPI("filtersearch", [$("#input-search").val()]);
	});
	/*!TODO: Implement theme css files and theme handler. 
	$("#theme-dark").click(function() {
		window.localStorage.setItem("theme", "dark");
		setTheme("dark");
	});
	$("#theme-light").click(function() {
		window.localStorage.setItem("theme", "light");
		setTheme("light");
	});*/
	$(".btn-save").click(function() {
		window.localStorage.setItem("ip", $("#ip").val());
		window.localStorage.setItem("port", $("#port").val());
		window.localStorage.setItem("username", $("#username").val());
		window.localStorage.setItem("password", $("#password").val());
		//window.localStorage.setItem("theme", "dark");
		reloadSettings();
		alert("Settings saved!");
		location.reload();
	});
}

/*!
 * Show the given section id, hide all other sections.
 *
 * @returns {boolean}
 */
function showSection(section) {
	console.debug("[DEBUG] showSection called with argument(s) '" + section + "'.");
	if (section == '') {
		console.warn("[WARNING] Empty argument given for showSection.");
		return false;
	}
	$(".sections").addClass("hidden");
	if (section != "default") {
		$("#default").addClass("hidden");
		$("#" + section).removeClass("hidden");
	}
	return true;
}

/*!
 * Switch to the given theme.
 *
 * @returns {void}
 */
function switchTheme(theme) {
	$("#contents").removeClass("theme_dark");
	$("#contents").removeClass("theme_light");
	$("#contents").addClass("theme_" + theme);
}

/*!
 * Toggle a button's icon.
 *
 * @returns {boolean}
 */
function toggleButton(button) {
	function notEligable(button) {
		console.warn("[WARNING] Could not swap buttons: no eligable class found for toggleButton('" + button + "').");
	}
	if (toggleButton == '') {
		console.warn("[WARNING] Empty argument given for toggleButton.");
		return false;
	}
	else if (button == '.btn-pause') {
		if ($(button).hasClass("fa-play")) {
			swapClass(button, "fa-play", "fa-pause");
		}
		else if ($(button).hasClass("fa-pause")) {
			swapClass(button, "fa-pause", "fa-play");
		}
		else {
			notEligable(button);
			return false;
		}
	}
	else if (button == '.btn-mute') {
		if ($(button).hasClass("fa-volume-down")) {
			swapClass(button, "fa-volume-down", "fa-volume-off");
		}
		else if ($(button).hasClass("fa-volume-off")) {
			swapClass(button, "fa-volume-off", "fa-volume-down");
		}
		else {
			notEligable(button);
			return false;
		}
	}
	else if (button == '.btn-fullscreen') {
		if ($('.btn-fullscreen-child').hasClass("fa-expand")) {
			swapClass('.btn-fullscreen-child', "fa-expand", "fa-compress");
		}
		else if ($('.btn-fullscreen-child').hasClass("fa-compress")) {
			swapClass('.btn-fullscreen-child', "fa-compress", "fa-expand");
		}
		else {
			notEligable(button);
			return false;
		}
	}
	else {
		console.warn("[WARNING] Unknown argument given for toggleButton: '" + button + "'.");
		return false;
	}
	return true;
}

/*!
 * Detect if the current session is the visitor's first session.
 *
 * @returns {boolean}
 */
function firstSession() {
	if (!localStorageExists("ip") || !localStorageExists("port") || !localStorageExists("username") || !localStorageExists("password") /*|| !localStorageExists("theme")*/ ) {
		// Either one of the settings isn't set. We'll assume that this is the first session.
		console.info("[INFO] This seems to be your first session, user!");
		return true;
	}
	else {
		console.info("[INFO] Welcome back, user!");
		return false;
	}
}

/*!
 * Set the current tab.
 *
 * @returns {void}
 */
function setTab(tab) {
	if (tab == "movies" || tab == "shows" || tab == "anime") {
		$(".btn-movies").removeClass("active");
		$(".btn-shows").removeClass("active");
		$(".btn-anime").removeClass("active");
		$(".btn-" + tab).addClass("active");
		return true;
	}
	else {
		$(".btn-movies").removeClass("active");
		$(".btn-shows").removeClass("active");
		$(".btn-anime").removeClass("active");
		return false;
	}
}

/********************!
 * PRIVATE FUNCTIONS
 ********************/

/*!
 * Register a listener.
 *
 * I admit, this could be done better.. [ tef comm: I've seen worse .. and made nearly the same in C++ .. we all know moments like these .. ;p ]
 *
 * @returns {boolean} True or False.
 * @private
 */
function registerListener(selector, handlerType, popcorntimeAPImethod, refreshViewStack, toggleGivenButton, sliderChange, popcorntimeAPIarguments) {
	if (selector == "" || handlerType == "" || popcorntimeAPImethod == "") {
		console.warn("[WARNING] Invalid arguments provided for registerListener (Called by: " + arguments.callee.caller.name + ").");
		return false;
	}
	else if (handlerType == "click" && refreshViewStack == true && toggleGivenButton != null) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			popcorntimeAPI("getviewstack");
			toggleButton(toggleGivenButton);
		});
	}
	else if (handlerType == "click" && toggleGivenButton != null) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			toggleButton(toggleGivenButton);
		});
	}
	else if (handlerType == "click" && refreshViewStack == true) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			popcorntimeAPI("getviewstack");
		});
	}
	else if (handlerType == "click") {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
		});
	}
	else if (handlerType == "change" && refreshViewStack == true && toggleGivenButton != null) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			popcorntimeAPI("getviewstack");
			toggleButton(toggleGivenButton);
		});
	}
	else if (handlerType == "change" && toggleGivenButton != null) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			toggleButton(toggleGivenButton);
		});
	}
	else if (handlerType == "change" && refreshViewStack == true) {
		$(selector).click(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
			popcorntimeAPI("getviewstack");
		});
	}
	else if (handlerType == "change") {
		$(selector).change(function() {
			popcorntimeAPI(popcorntimeAPImethod, popcorntimeAPIarguments);
		});
	}
	else {
		console.warn("[WARNING] Unknown argument(s) combination(s) given for registerListener.");
		return false;
	}
	return true;
}

/*!
 * Check if given localStorage key isn't null.
 *
 * @returns {boolean}
 * @private
 */
function localStorageExists(key) {
	if (window.localStorage.getItem(key) != null) {
		return true;
	}
	else {
		return false;
	}
}

/*!
 * Swap an object's class with another class.
 *
 * @returns {void}
 * @private
 */
function swapClass(button, classToRemove, classToAdd) {
	$(button).removeClass(classToRemove);
	$(button).addClass(classToAdd);
}

/*!
 * Set media info from response.
 *
 * @returns {boolean}
 */
function setMediaInfo(response) {
	if (typeof(response) == "undefined") {
		console.warn("[WARNING] Invalid argument provided for setMediaInfo.");
		return false;
	}
	else if (window.view == "player") {
		$("#player-title").html("<h3>" + response.result.title + "</h3>");
		$("#player-info").html("<p>" + response.result.synopsis + "</p>");
		$("#player-image").attr("src", response.result.image);
		return true;
	}
	else if (window.view == "movie-detail") {
		$(".movie-detail-poster img").attr("src", response.result.image);
		$("body").addClass("backdrop");
		$("body").attr("style", "background-image: url(" + response.result.backdrop + ");");
		$(".movie-detail-title").html("" + response.result.title + "");
		$(".movie-detail-year").html("" + response.result.year + "");
		$(".movie-detail-rating").html("" + response.result.rating + "/10");
		$(".movie-detail-synopsis").html("<p>" + response.result.synopsis + "</p>");
		$(".movie-detail-genre").html("" + response.result.genre + "");
		$(".movie-detail-runtime").html("" + response.result.runtime + " min");
		$(".movie-detail-imdblink").html('<a href="http://imdb.com/title/' + response.result.imdb_id + '/" target="_blank"><img src="assets/img/imdb.png"></a>');
		return true;
	}
	else if (window.view == "shows-container-contain") {
		$(".show-info-title").html("" + response.result.title + "");
		$(".show-info-year").html("" + response.result.year + " - " + response.result.status + "");
		$(".show-info-rating").html("" + parseFloat(response.result.rating.percentage) / 10 + "/10");
		$(".show-info-seasons").html("" + response.result.num_seasons + " seasons");
		$(".show-info-genre").html("" + response.result.genres[0] + "");
		$(".show-info-runtime").html("" + response.result.runtime + "min");
		$(".show-info-imdb").html('<a href="http://imdb.com/title/' + response.result.imdb_id + '/" target="_blank"><img src="assets/img/imdb.png"></a>');
		$(".show-info-poster").attr("src", "" + response.result.images.poster + "");
		$(".show-info").attr("style", "background-image: url(" + response.result.images.fanart + ");");
		$(".show-info-synopsis").html("<p>" + response.result.synopsis + "</p>");
		return true;
	}
	else if (window.view == "main-browser") {
		return null;
	}
	else {
		console.warn("[WARNING] setMediaInfo can't do anything with the current view '" + window.view + "'.");
		return false;
	}
}


/************!
 * BOOTSTRAP
 ************/

/*! Show loading container. */
$("#default").removeClass("hidden");

/*! Set variables. */
var version = "1.1.0";
var versionTag = ".pre 'Winter is coming'";
var supportedPopcorntimeVersions = ["0.3.5"];
var ip;
var port;
var username;
var password;
var theme;
var clientVersion;
var interval = 1000;
var connected = false;
var debug = true;
var view = "";
var currenttab = "";
var langcodes = "";
$.getJSON("assets/js/langcodes.json", function(json) {
	window.langcodes = json;
});

/*! On document ready, call functions. */
$(document).ready(function() {

        /* tef edit */
        /*
        // animate the color of the popcorn-masked div
        timer = setInterval( function(){
	  var randomColor = 'rgb(' +
          (Math.floor(Math.random() * 256)) + ',' + 
	  (Math.floor(Math.random() * 256)) + ',' +
	  (Math.floor(Math.random() * 256)) + ')';
	  document.querySelector('#popcorn').style.backgroundColor = randomColor;
          alert('i am annoying!'); // works fine on chrome, and is actually pretty annoying !
        }, 1000);
        */

        // quick debug for simulated events using our color changing popcorn
        document.querySelector('#popcorn').ontouchstart = function(e){ 
          //alert('someone touche me !!: target.nodeName -> ' + e.target.nodeName + ' originalTarget.nodeName ->' + e.tefOriginalTarget );
          if( e.tefOriginalTarget != 'INPUT' ) { // aka we clicked on the popcorn colored thingy instead of some input
            //alert('tef original target is different than INPUT')
            // dispatch a test event
            var evtef = document.createEvent('HTMLEvents');
            evtef.currentTarget = e.tefOriginalTarget;
            evtef.initEvent('touchstart',true, true);
            evtef.touches = [{pageX: e.touches[0].pageX, pageY: e.touches[0].pageY}];
            evtef.view = window;
            //document.querySelector('#contents').dispatchEvent(evtef); // works ? // could surely need some e.currentTarget & some touches
            //document.querySelector('#contents').style.backgroundColor = ''; // DEBUG dispatchEvent -> discard any false positive
            document.dispatchEvent(evtef); // seems to work, regarding the color change ?
            //alert('the touchstart should be effective by now'); // may change without the help of the alert() calls .. anyway, further testing: trying to dispatch INPUT.ontouchend to see if we trigger the alert
            //setTimeout(function(){
            //  evtef.currentTarget -> ended & written in the else below ( .. )
            //}, 10000);
          } else { // aka we clicked on an input, which dispatched an onstart event to the popcorn colored thingy, to end up here, dispatching an ontouchend event for that same input
            // R: it may be caused by the alerts, but the 1st touchend that occured on the input never called it's attached alert -> did he ever got called ?
            var evtef = document.createEvent('HTMLEvents');
            evtef.currentTarget = e.tefOriginalTarget; // checked in iOS allowed scrolling Y
            evtef.target = e.tefOriginalTarget; // checked in ontouchend ?
            evtef.initEvent('touchend',true, true);
            evtef.touches = [{pageX: e.touches[0].pageX, pageY: e.touches[0].pageY}];
            evtef.view = window;
            //document.querySelector('#contents').style.backgroundColor = ''; // DEBUG dispatchEvent -> discard any false positive
            //document.dispatchEvent(evtef); // finger crossed .. nope :/
            evtef.currentTarget.dispatchEvent(evtef); // nope either ..
            //alert('hopefully, the previous alert was "touch end on input !", was it ? => target.nodeName: ' + evtef.target);
          } 
        }

        /* iOS fix for more native-app-like behavior of webapp - extracted from neatFramework ;) */
        var w = window;
        w.IOS = {};
        /* working version, a littl' old, and that doesn't care about inputs ( & thus by-by the disabled scroll .. )
        w.IOS.disable_elastic_scrolling=function(){console.log("MyApp.IOS.disable_elastic_scrolling > disabling elastic scrolling");w.IOS.initialY=null;var e=document;e.ontouchstart=function(e){w.IOS.initialY=e.pageY};e.ontouchend=function(e){w.IOS.initialY=null};e.ontouchcancel=function(e){w.IOS.initialY=null};e.ontouchmove=function(e){e.preventDefault()};console.log("MyApp.IOS.disable_elastic_scrolling > IOS elastic scrolling is now disabled")};
        */
        w.IOS.disable_elastic_scrolling=function(){
          console.log("MyApp.IOS.disable_elastic_scrolling > disabling elastic scrolling");
          w.IOS.initialY=null;
          var e=document;
          e.ontouchstart=function(e){
            // yup, I'm messing up with my work !
            //document.querySelector('#contents').style.backgroundColor = '#00DBFF'; // DEBUG dispatchEvent
            //if( evt.fromPopcornLove ) alert('touchstart event initiated from POPCORN colored thingy')
            // tef edit of 16/09/2015, aka NOT old & current wip
            if( e.target.nodeName == 'INPUT' ){ // input & Cie
              //alert('touch start on input !');
              // TODO: focus the input instead of dangerously risking to allow a touchmove that'd follow the nowhere touchstart
              //e.target.focus(); // does something weird but and surely NOT expected .. ( it jumps to next input ? )
              // instead of nothing, we could try focusing the currently focused stuff ? ( aka, itself )
              //e.preventDefault(); // prevents any undesired document movement
              //document.activeElement.focus();
              //e.target.focus(); // IT WOOOOOOOOOOOORKED !!!!!!! ===> aka, document scroll is prevented by focusing on the element AFTER having prevented its default behavior
              if( document.activeElement == e.target ){
                //alert('was already focused');
              } else {
                //alert('was not previously focused');
                e.preventDefault();
                //e.target.focus(); wip to test ontouchmove/ontouchend /!\
                //w.IOS.initialY=e.pageY; // wip to test if we can touchmove to scroll normally without some dispatchEvent & Cie hackety tricks => nope :/
                //var customEvt = document.createEvent('TouchEvent');
                //customEvt.touches = [{pageX: pageX, pageY: pageY}];
                //customEvt.touches = [{pageX: e.touches[0].pageX, pageY: e.touches[0].pageY}];
                //customEvt.target = document.getElementById('contents'); // hardcoding is baaad, & 'd be better to get the closest parent with some class .., or just the closest parent, aka not an input ;)
                //document.dispatchEvent(customEvt);
                //customEvt.initTouchEvent();
                //$('#contents').trigger('touchstart'); // dummy test
                //$(document).trigger('touchstart'); // dummy test
                //var evt = document.createEvent('TouchEvent'); //document.createEvent('UIEvent');
                //evt.initTouchEvent('touchstart', true, true);
                //evt.view = window;
                //evt.target = document.getElementById('contents');
                //evt.altKey = false;
                //evt.ctrlKey = false;
                //evt.shiftKey = false;
                //evt.metaKey = false;
                //document.dispatchEvent(evt);
                //document.getElementById('contents').focus();
                //document.activeElement.focus();
                
                w.IOS.initialY=e.pageY
                //var touches = e.touches;
                //var touch = touches[0];
                //var simulatedEvent = document.createEvent("TouchEvent");
                //simulatedEvent.initTouchEvent("touchstart", true, true, window, 1,
                //touch.screenX, touch.screenY,
                //touch.clientX, touch.clientY, false /*ctrl*/, false /*alt*/,
                //false /*shift*/, false /*meta*/, 0 /*left*/, null /*related target*/);
                
                //var elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
                //elementUnderFinger.dispatchEvent(simulatedEvent);
                /*
                // Available iOS 2.0 and later
                            customEvent.initTouchEvent(type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY,
                                ctrlKey, altKey, shiftKey, metaKey,
                                touches, targetTouches, changedTouches,
                                scale, rotation);
                */
                //document.dispatchEvent(simulatedEvent);
                //var e = document.createEvent('HTMLEvents');
                //e.initEvent('touchend',true, true);
                //document.dispatchEvent(e);

                //document.querySelector('#contents').style.backgroundColor = ''; // DEBUG dispatchEvent

                var t=e.touches[0].pageY-w.IOS.initialY;
                var n=e.currentTarget;
                //alert('T: ' + t + ' NnodeName: ' + n.nodeName);
                var evtef = document.createEvent('HTMLEvents');
                evtef.tefOriginalTarget = e.target.nodeName;
                evtef.initEvent('touchstart',true, true);
                document.querySelector('#popcorn').dispatchEvent(evtef); // works !
                //alert('input dispatch to colored thngy should be successful');
                //evtef.initEvent('touchcancel',true, true);
                //e.target.dispatchEvent(evtef);
                //alert('WTF ?!');
                
              }
            } else { // not an input & Cie
              //document.activeElement.blur(); // allow to loose focus when previously focused on an input, but a little bit too harsh in the sense that doesn't care about amout scrolled by iOS virtual keyboard 
              // IDEA: maybe handling the above 
              //alert('touch start on something other than input !');
              //alert('target: ' + e.target);
              //alert('current target: ' + e.currentTarget);
              w.IOS.initialY=e.pageY
              //if( evt.fromPopcornLove ) alert('touchstart event initiated from POPCORN colored thingy')
            }
          };
          e.ontouchend=function(e){
            if( e.target.nodeName == 'INPUT' ){ // input & Cie
              //alert('touch end on input !'); // gets called indeed ! :/
              //document.focus(); // try to prevent scrolling by focusing ..
              e.target.focus(); // best here than above, awating to be improved WORKS !
              // test that may be useful for next improvement(s) - simulates a touchstart on the scrollable content
              var evtef = document.createEvent('HTMLEvents');
              //evtef.currentTarget = e.tefOriginalTarget;
              //evtef.target = e.target; // to check, but i'm afraid this one defaults to the document
              evtef.target = document.querySelector('#contents');
              w.IOS.initialY=e.touches[0].pageY;
              evtef.currentTarget = document.querySelector('#contents');
              evtef.initEvent('touchstart',true, true);
              evtef.touches = [{pageX: e.touches[0].pageX, pageY: e.touches[0].pageY}];
              evtef.view = window;
              document.querySelector('#contents').dispatchEvent(evtef); // works ? // could surely need some e.currentTarget & some touches
              //document.querySelector('#contents').style.backgroundColor = ''; // DEBUG dispatchEvent -> discard any false positive
              //document.querySelector('#contents').focus(); // or try focusing the document, focusing the currently active element, or even blurring the input ?
              //document.dispatchEvent(evtef); // seems to work, regarding the color change ?
              //$(document).trigger('touchstart'); // dummy test -> nope :/
            } else {
              w.IOS.initialY=null;
            }
            //w.IOS.initialY=null - before dispatchEvent tweaks
            //document.querySelector('#contents').style.backgroundColor = ''; // DEBUG dispatchEvent
          };
          e.ontouchcancel=function(e){
            w.IOS.initialY=null};
            //alert('touch cancel on input !'); // triggers onload & never after ?
          e.ontouchmove=function(e){
            //e.preventDefault()
            if( e.target.nodeName == 'INPUT' ){ // input & Cie
              alert('touch move on input !'); // should NEVER get called, since not preventing the default for INPUTs on touchstart 'll result in the whole document to scroll 
              //document.focus(); // try to prevent scrolling by focusing .. 
            }
            e.preventDefault()
            document.querySelector('#contents').style.backgroundColor = '#BADA55'; // DEBUG dispatchEvent - never called ??
          };console.log("MyApp.IOS.disable_elastic_scrolling > IOS elastic scrolling is now disabled")};

      w.IOS.setup_custom_scroll=function(e){console.log("MyApp.IOS.setup_custom_scroll v2 > Applying scroll on element: "+e);var t=document.getElementById(e);if(t){t.ontouchmove=function(e){e.stopPropagation();if(w.IOS.initialY!==null){var t=e.touches[0].pageY-w.IOS.initialY;var n=e.currentTarget;if(t>0&&n.scrollTop<=0){e.preventDefault()}else if(t<0&&n.scrollTop>=n.scrollHeight-n.clientHeight){e.preventDefault()}else{}}}}else{console.log("MyApp.IOS.setup_custom_scroll v2 > Cannot find element to apply scroll to")}};

        // Ahhh, neatFramework .. when will you be finished .. anyway handy !;/p
        w.IOS.disable_elastic_scrolling();
        //w.IOS.setup_custom_scroll("longHeightContent");
        w.IOS.setup_custom_scroll("contents");
        alert('I OWN IOS WAHAHA!');

	console.info("[INFO] Document is ready, starting Popcorn Time Remote session.");
	console.info("[INFO] Popcorn Time Remote version " + version + versionTag + ".");
	if (firstSession()) {
		// Show settings section and welcome div.
		console.info("[INFO] Starting in 'Welcome' mode.");
		$(".btn-save").hide();
		$(".btn-close-settings").hide();
                /* tef edit */
                reinitPopcornColorChange();
		showSection("settings");
		$(".welcome").show();
		$(".btn-welcome").click(function() {
			window.localStorage.setItem("ip", $("#ip").val());
			window.localStorage.setItem("port", $("#port").val());
			window.localStorage.setItem("username", $("#username").val());
			window.localStorage.setItem("password", $("#password").val());
			//window.localStorage.setItem("theme", "dark");
			reloadSettings();
			popcorntimeConnect(true, true);
			popcorntimeConnect(null, true);
			setTimeout(function() {
				console.debug("[DEBUG] Connected status: " + window.connected);
				if (window.connected == true) {
					alert("Connected to Popcorn Time client!");
					location.reload();
				}
			}, 500);
		});
	}
	else {
		loadSettings();
		registerListeners();
		popcorntimeConnect();
		setInterval(function() {
			popcorntimeAPI("getviewstack");
			popcorntimeAPI("getcurrenttab");
		}, interval);
		setTimeout(function() {
			popcorntimeAPI("ping");
		}, 500);
	}
});
