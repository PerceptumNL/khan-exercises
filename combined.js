/* khan-exercise.js

	The main entry point here is actually the loadScripts method which is defined
	as Khan.loadScripts and then evaluated around line 500.

	When this loadScripts is called, it loads in many of the pre-reqs and then
	calls, one way or another, prepareUserExercise concurrently with loadModules.

	prepareUserExercise calls updateData and advances the problem counter 
	via setProblemNum. updateData refreshes the page ui based on this current
	problem (among other things). setProblemNum updates some instance vars
	that get looked at by other functions.

	loadModules takes care of loading an individual exercise's prereqs (i.e. 
	word problems, etc). It _also_ loads in the khan academy site skin and
	exercise template via injectSite which runs prepareSite first then 
	makeProblemBag and makeProblem when it finishes loading dependencies.

	pepareSite and makeProblem are both fairly heavyweight functions.

	If you are trying to register some behavior when the page loads, you
	probably want it to go in prepareSite. (which also registers server-initiated
	behavior via api.js) as well. By the time prepareSite is called, jquery and
	any core plugins are already available.

	If you are trying to do something each time a problem loads, you probably
	want to look at makeProblem.

	For obvious reasons window.userExercise is removed but it remains available
	to you from within the Khan object

	At the end of evaluation, the inner Khan object is returned/exposed as well
	as the inner Util object.

*/

var Translate = new function(){

	this.langdefault = "en";
	this.lang = "nl";
	this.table = {};
	this.production = ( typeof(userExercise) !== "undefined" );
	this.current = ( this.production ? userExercise.exercise : window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1).split('.')[0] );
	this.exercisefile = ( this.production ? "/khan-exercises/exercises/" : "" ) + this.current + ".lang.js";
	this.globalfile = ( this.production ? "/khan-exercises/exercises/" : "" ) +"lang.js";

	this.switchLang = function(map){
		if(map[this.lang]){
			return map[this.lang];
		}
		else{
			return map[this.langdefault];
		}
	}

	this.getTranslation = function(url, name){
		//TODO: Implement caching on client side
		$.ajax({
			type: "GET",
			url: url,
			async:false,
			success: function(data){
				Translate.table[name] = eval(data);
			}
		})
		return this.table[name];
	}

	this.load = function(){

		Khan.Util.tokenreplace = Translate;
		Khan.Util.translate = Translate;

		var globals = this.getTranslation(this.globalfile, "globals");
		$('.exercise-title').each(function(){
			var title = $('title').html().substring(0, $('title').html().indexOf('|')-1)
			if(Translate.table["globals"]["titles"][Translate.lang][title]){
				$(this).html(Translate.table["globals"]["titles"][Translate.lang][title])
			}
		});

		var exercisedata = this.getTranslation(this.exercisefile, this.current);
		if(exercisedata && exercisedata[this.lang]){
			$('[data-tt]').each(function(){
				token = $(this).attr('data-tt');
				if(Translate.table[Translate.current][Translate.lang][token]){
					$(this).html(Translate.table[Translate.current][Translate.lang][token]);
				}
			});
		}

	}

};

var Khan = (function() {
	function warn( message, showClose ) {
		jQuery(function() {
			jQuery( "#warning-bar-content" ).html( message );
			if ( showClose ) {
				jQuery( "#warning-bar-close" ).show();
			} else {
				jQuery( "#warning-bar-close" ).hide();
			}
			jQuery( "#warning-bar" ).fadeIn( "fast" );
		});
	}

	// Adapted from a comment on http://mathiasbynens.be/notes/localstorage-pattern
	var localStorageEnabled = function() {
		var enabled, uid = +new Date;
		try {
			localStorage[ uid ] = uid;
			enabled = ( localStorage[ uid ] == uid );
			localStorage.removeItem( uid );
			return enabled;
		}
		catch( e ) {
			return false;
		}
	}();

	if ( !localStorageEnabled ) {
		if ( typeof jQuery !== "undefined" ) {
			warn( "You must enable DOM storage in your browser to see an exercise.", false );
		}
		return;
	}

	// Prime numbers used for jumping through exercises
	var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43,
	47, 53, 59, 61, 67, 71, 73, 79, 83],

	/*
	===============================================================================
	Crc32 is a JavaScript function for computing the CRC32 of a string
	...............................................................................

	Version: 1.2 - 2006/11 - http://noteslog.com/category/javascript/

	-------------------------------------------------------------------------------
	Copyright (c) 2006 Andrea Ercolino
	http://www.opensource.org/licenses/mit-license.php
	===============================================================================
	*/

	// CRC32 Lookup Table
	table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",

	/* Number */
	crc32 = function( /* String */ str, /* Number */ crc ) {
		if( crc == window.undefined ) { crc = 0; }
		var n = 0; //a number between 0 and 255
		var x = 0; //an hex number

		crc = crc ^ (-1);
		for( var i = 0, iTop = str.length; i < iTop; i++ ) {
			n = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
			x = "0x" + table.substr( n * 9, 8 );
			crc = ( crc >>> 8 ) ^ x;
		}
		return Math.abs( crc ^ (-1) );
	},

	// Get the userExercise object from the global scope
	userExercise = window.userExercise,

	// Check to see if we're in test mode
	testMode = typeof userExercise === "undefined",

	// The main server we're connecting to for saving data
	server = typeof apiServer !== "undefined" ? apiServer :
		testMode ? "http://localhost:8080" : "",

	// The name of the exercise
	exerciseName = typeof userExercise !== "undefined" ? userExercise.exercise : ((/([^\/.]+)(?:\.html)?$/.exec( window.location.pathname ) || [])[1]),

	// Bin users into a certain number of realms so that
	// there is some level of reproducability in their questions
	bins = 200,

	// The seed information
	randomSeed,

	// Get the username of the user
	user = window.localStorage["exercise:lastUser"] || null,
	userCRC32,

	// The current problem and its corresponding exercise
	problem,
	exercise,

	// The number of the current problem that we're on
	problemNum = 1,

	// Info for constructing the seed
	seedOffset = 0,
	jumpNum = 1,
	problemSeed = 0,

	problemID,

	// The current validator function
	validator,

	hints,

	// The exercise elements
	exercises,

	// If we're dealing with a summative exercise
	isSummative = false,

	// Where we are in the shuffled list of problem types
	problemBag,
	problemBagIndex = 0,

	// How many problems are we doing? (For the fair shuffle bag.)
	problemCount = 10,

	// For saving problems to the server
	hintsUsed,
	lastAction,
	attempts,
	once = true,

	guessLog,
	userActivityLog,

	// For loading remote exercises
	remoteCount = 0,

	// Debug data dump
	dataDump = {
		"exercise": exerciseName,
		"problems": [],
		"issues": 0
	},

	urlBase = typeof urlBaseOverride !== "undefined" ? urlBaseOverride :
		testMode ? "../" : "/khan-exercises/",

	lastFocusedSolutionInput = null,

	issueError = "Communication with GitHub isn't working. Please file "
		+ "the issue manually at <a href=\""
		+ "http://github.com/PerceptumNL/khan-exercises/issues/new\">GitHub</a>. "
		+ "Please reference exercise: " + exerciseName + ".",
	issueSuccess = function( url, title, suggestion ) {
		return ["Thank you for your feedback! Your issue has been created and can be ",
			"found at the following link:",
			"<p><a id=\"issue-link\" href=\"", url, "\">", title, "</a>",
			"<p>", suggestion, "</p>"].join('');
	},
	issueIntro = "Ga eerst door alle hints en vul het antwoord uit de hints in, gebruik report a problem bij vragen waarvan je denkt dat ze het niet doen alleen als je echt zeker weet dat de vraag niet werkt of niet goed is. Als de vraag fout is kopieer de vraag dan in je omschrijving, dat helpt enorm, bedankt voor het helpen!";

	// Nuke the global userExercise object to make
	// it significantly harder to cheat
	try {
		delete window.userExercise;
	} catch(e) {
		window.userExercise = undefined;
	}

	// Add in the site stylesheets
	if (testMode) {
		(function(){
			var link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = urlBase + "css/khan-site.css";
			document.getElementsByTagName('head')[0].appendChild(link);

			link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = urlBase + "css/khan-exercise.css";
			document.getElementsByTagName('head')[0].appendChild(link);
		})();
	}

	// The main Khan Module
	var Khan = {
		modules: {},

		// So modules can use file paths properly
		urlBase: urlBase,

		moduleDependencies: {
			"math": [ {
				src: urlBase + "utils/MathJax/1.1a/MathJax.js?config=KAthJax-7018d213c4354228862b1ba15a62d3d5"
			}, "raphael" ],

			// Load Raphael locally because IE8 has a problem with the 1.5.2 minified release
			// http://groups.google.com/group/raphaeljs/browse_thread/thread/c34c75ad8d431544

			// The normal module dependencies.
			"calculus": [ "math", "expressions", "polynomials" ],
			"exponents": [ "math", "math-format" ],
			"kinematics": [ "math" ],
			"math-format": [ "math", "expressions" ],
			"polynomials": [ "math", "expressions" ],
			"stat": [ "math" ],
			"word-problems": [ "math" ],
			"derivative-intuition": [ "jquery.mobile.vmouse" ],
			"unit-circle": [ "jquery.mobile.vmouse" ],
			"interactive": [ "jquery.mobile.vmouse" ]
		},

		warnTimeout: function() {
			warn( 'Your internet might be too slow to see an exercise. Refresh the page '
				+ 'or <a href="" id="warn-report">report a problem</a>.', false );
			jQuery( "#warn-report" ).click( function( e ) {
				e.preventDefault();
				jQuery( "#report" ).click();
			});
		},

		warnFont: function() {
			var enableFontDownload = "enable font download in your browser";
			if ( jQuery.browser.msie ) {
				enableFontDownload = '<a href="http://missmarcialee.com/2011/08/how-to-enable-font-download-in-internet-explorer-8/"  target="_blank">enable font download</a>';
			}

			warn( 'You should ' + enableFontDownload + ' to improve the appearance of math expressions.', true );
		},

		require: function( mods ) {
			if ( mods == null ) {
				return;
			} else if ( typeof mods === "string" ) {
				mods = mods.split( " " );
			} else if ( !jQuery.isArray( mods ) ) {
				mods = [ mods ];
			}

			jQuery.each(mods, function( i, mod ) {
				var src, deps;

				if ( typeof mod === "string" ) {
					var cachebust = "";
					if ( testMode && Khan.query.nocache != null ) {
						cachebust = "?" + Math.random();
					}
					src = urlBase + "utils/" + mod + ".js" + cachebust;
					deps = Khan.moduleDependencies[ mod ];
					mod = {
						src: src,
						name: mod
					};
				} else {
					src = mod.src;
					deps = mod.dependencies;
					delete mod.dependencies;
				}

				if ( !Khan.modules[ src ] ) {
					Khan.modules[ src ] = mod;
					Khan.require( deps );
				}

			});
		},

		// Populate this with modules
		Util: {
			// http://burtleburtle.net/bob/hash/integer.html
			// This is also used as a PRNG in the V8 benchmark suite
			random: function() {
				// Robert Jenkins' 32 bit integer hash function.
				var seed = randomSeed;
				seed = ( ( seed + 0x7ed55d16 ) + ( seed << 12 ) ) & 0xffffffff;
				seed = ( ( seed ^ 0xc761c23c ) ^ ( seed >>> 19 ) ) & 0xffffffff;
				seed = ( ( seed + 0x165667b1 ) + ( seed << 5 ) ) & 0xffffffff;
				seed = ( ( seed + 0xd3a2646c ) ^ ( seed << 9 ) ) & 0xffffffff;
				seed = ( ( seed + 0xfd7046c5 ) + ( seed << 3 ) ) & 0xffffffff;
				seed = ( ( seed ^ 0xb55a4f09 ) ^ ( seed >>> 16 ) ) & 0xffffffff;
				return ( randomSeed = ( seed & 0xfffffff ) ) / 0x10000000;
			}
		},

		// Load in a collection of scripts, execute callback upon completion
		loadScripts: function( urls, callback ) {
			var loaded = 0,
				loading = urls.length,
				head = document.getElementsByTagName('head')[0];

			callback || ( callback = function() { } );

			for ( var i = 0; i < loading; i++ ) { (function( mod ) {

				if ( !testMode && mod.src.indexOf("/khan-exercises/") === 0 && mod.src.indexOf("/MathJax/") === -1 ) {
					// Don't bother loading khan-exercises content in production
					// mode, this content is already packaged up and available
					// (*unless* it's MathJax, which is silly still needs to be loaded)
					loaded++;
					return;
				}

				// Adapted from jQuery getScript (ajax/script.js)
				var script = document.createElement("script");
				script.async = "async";

				for ( var prop in mod ) {
					script[ prop ] = mod[ prop ];
				}

				script.onerror = function() {
					// No error in IE, but this is mostly for debugging during development so it's probably okay
					// http://stackoverflow.com/questions/2027849/how-to-trigger-script-onerror-in-internet-explorer
					Khan.error( "Error loading script " + script.src );
				};

				script.onload = script.onreadystatechange = function() {
					if ( !script.readyState || ( /loaded|complete/ ).test( script.readyState ) ) {
						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						runCallback();
					}
				};

				head.appendChild(script);
			})( urls[i] ); }

			runCallback( true );

			function runCallback( check ) {
				if ( check !== true ) {
					loaded++;
				}

				if ( callback && loading === loaded ) {
					callback();
				}
			}
		},

		// Query String Parser
		// Original from:
		// http://stackoverflow.com/questions/901115/get-querystring-values-in-javascript/2880929#2880929
		queryString: function() {
			var urlParams = {},
				e,
				a = /\+/g,  // Regex for replacing addition symbol with a space
				r = /([^&=]+)=?([^&]*)/g,
				d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
				q = window.location.search.substring(1);

			while ( (e = r.exec(q)) ) {
				urlParams[d(e[1])] = d(e[2]);
			}

			return urlParams;
		},

		// Display error messages
		error: function( ) {
			if ( typeof console !== "undefined" ) {
				jQuery.each( arguments, function( ix, arg ) {
					console.error(arg);
				});
			}
		},

		scratchpad: (function() {
			var disabled = false, visible = false, wasVisible, pad;

			var actions = {
				disable: function() {
					wasVisible = visible;
					actions.hide();

					jQuery( "#scratchpad-show" ).hide();
					jQuery( "#scratchpad-not-available" ).show();
					disabled = true;
				},

				enable: function() {
					if ( wasVisible ) {
						actions.show();
						wasVisible = false;
					}

					jQuery( "#scratchpad-show" ).show();
					jQuery( "#scratchpad-not-available" ).hide();
					disabled = false;
				},

				isVisible: function() {
					return visible;
				},

				show: function() {
					if ( visible ) {
						return;
					}

					var makeVisible = function() {
						jQuery( "#workarea, #hintsarea" ).css( "padding-left", 60 );
						jQuery( "#scratchpad" ).show();
						jQuery( "#scratchpad-show" ).text( "Hide scratchpad" );
						visible = true;
					};

					if ( !pad ) {
						Khan.loadScripts( [ { src: urlBase + "utils/scratchpad.js" } ], function() {
							makeVisible();
							pad || ( pad = new Scratchpad( jQuery( "#scratchpad div" )[0] ) );
						} );
					} else {
						makeVisible();
					}
				},

				hide: function() {
					if ( !visible ) {
						return;
					}

					jQuery( "#workarea, #hintsarea" ).css( "padding-left", 0 );
					jQuery( "#scratchpad" ).hide();
					jQuery( "#scratchpad-show" ).text( "Show scratchpad" );
					visible = false;
				},

				toggle: function() {
					visible ? actions.hide() : actions.show();
				},

				clear: function() {
					if ( pad ) {
						pad.clear();
					}
				},

				resize: function() {
					if ( pad ) {
						pad.resize();
					}
				}
			};

			return actions;
		})(),

		showThumbnail: function( index ) {
			jQuery( "#related-video-list .related-video-list li" ).each(function(i, el) {
				if ( i === index ) {
					jQuery( el )
						.find( 'a.related-video-inline' ).hide().end()
						.find( '.thumbnail' ).show();
				}
				else {
					jQuery( el )
						.find( 'a.related-video-inline' ).show().end()
						.find( '.thumbnail' ).hide();
				}
			});
		},

		// make a link to a related video, appending exercise ID.
		relatedVideoHref: function(video, data) {
			var exid_param = '';
			data = data || userExercise;
			if ( data ) {
				exid_param = "?exid=" + data.exercise_model.name;
			}
			return video.ka_url + exid_param;
		},

		showSolutionButtonText: function() {
			return hintsUsed ? "Show step (" + hints.length + " left)" : "Show Solution";
		}

	};
	// see line 183. this ends the main Khan module

	// Load query string params
	Khan.query = Khan.queryString();

	if ( Khan.query.activity !== undefined ) {
		userExercise = {
			exercise_model: {},
			read_only: true,
			user_activity: JSON.parse( Khan.query.activity )
		};
	}

	// Seed the random number generator with the user's hash
	randomSeed = testMode && parseFloat( Khan.query.seed ) || userCRC32 || ( new Date().getTime() & 0xffffffff );


	// Load in jQuery
	var scripts = (typeof jQuery !== "undefined") ? [] : [ { src: "../jquery.js" } ];

	// Actually load the scripts. This is getting evaluated when the file is loaded.
	Khan.loadScripts( scripts, function() {

		if ( testMode ) {
			Khan.require( [ "../jquery-ui" ] );
		};

		// Base modules required for every problem
		Khan.require( [ "answer-types", "tmpl", "underscore" ] );

		Khan.require( document.documentElement.getAttribute("data-require") );

		if ( typeof userExercise !== "undefined" ) {
			prepareUserExercise( userExercise );

		} else {
			// Load in the exercise data from the server
			jQuery.ajax({
				// Do a request to the server API
				url: server + "/api/v1/user/exercises/" + exerciseName,
				type: "GET",
				dataType: "json",

				// Make sure cookies are passed along
				xhrFields: { withCredentials: true },

				success: prepareUserExercise
			});
		}

		jQuery(function() {
			var remoteExercises = jQuery( ".exercise[data-name]" );

			if ( remoteExercises.length ) {
				isSummative = true;

				remoteExercises.each( loadExercise );

			// Only run loadModules if exercises are in the page
			} else if ( jQuery( ".exercise" ).length ) {
				loadModules();
			}
		});

		jQuery.fn.extend({
			// Pick a random element from a set of elements
			getRandom: function() {
				return this.eq( Math.floor( this.length * KhanUtil.random() ) );
			},

			// Run the methods provided by a module against some elements
			runModules: function( problem, type ) {
				type = type || "";

				var info = {
					testMode: testMode
				};

				return this.each(function( i, elem ) {
					elem = jQuery( elem );

					// Run the main method of any modules
					jQuery.each( Khan.modules, function( src, mod ) {
						var name = mod.name;
						if ( jQuery.fn[ name + type ] ) {
							elem[ name + type ]( problem, info );
						}
					});
				});
			}
		});

		// See if an element is detached
		jQuery.expr[":"].attached = function( elem ) {
			return jQuery.contains( elem.ownerDocument.documentElement, elem );
		};
	});

	// Add up how much total weight is in each exercise so we can adjust for
	// it later
	function weighExercises( problems ) {
		if ( exercises.length > 1 ) {
			jQuery.map( problems, function( elem ) {
				elem = jQuery( elem );

				var exercise = elem.parents( ".exercise" ).eq( 0 );

				var exerciseTotal = exercise.data( "weight-sum" );
				exerciseTotal = exerciseTotal !== undefined ? exerciseTotal : 0;

				var weight = elem.data( "weight" );
				weight = weight !== undefined ? weight : 1;

				exercise.data( "weight-sum", exerciseTotal + weight );
			});
		}
	}

	// Create a set of n problems fairly from the weights - not random; it
	// ensures that the proportions come out as fairly as possible with ints
	// (still usually a little bit random).
	// There has got to be a better way to do this.
	function makeProblemBag( problems, n ) {
		var bag = [], totalWeight = 0;

		if ( testMode && Khan.query.test != null ) {
			// Just do each problem 10 times
			jQuery.each( problems, function( i, elem ) {
				elem = jQuery( elem );
				elem.data( "id", elem.attr( "id" ) || "" + i );

				for ( var j = 0; j < 10; j++ ) {
					bag.push( problems.eq( i ) );
				}
			} );

			problemCount = bag.length;

		} else if ( problems.length > 0 ) {
			// Collect the weights for the problems and find the total weight
			var weights = jQuery.map( problems, function( elem, i ) {
				elem = jQuery( elem );

				var exercise = elem.parents( ".exercise" ).eq( 0 );
				var exerciseWeight = exercise.data( "weight" );
				exerciseWeight = exerciseWeight !== undefined ? exerciseWeight : 1;
				var exerciseTotal = exercise.data( "weight-sum" );

				var weight = elem.data( "weight" );
				weight = weight !== undefined ? weight : 1;

				if ( exerciseTotal !== undefined ) {
					weight = weight * exerciseWeight / exerciseTotal;
					elem.data( "weight", weight );
				}

				// Also write down the index/id for each problem so we can do
				// links to problems (?problem=17)
				elem.data( "id", elem.attr( "id" ) || "" + i );

				totalWeight += weight;
				return weight;
			});

			while ( n ) {
				bag.push( (function() {
					// Figure out which item we're going to pick
					var index = totalWeight * KhanUtil.random();

					for ( var i = 0; i < problems.length; i++ ) {
						if ( index < weights[i] || i === problems.length - 1 ) {
							var w = Math.min( weights[i], totalWeight / ( n-- ) );
							weights[i] -= w;
							totalWeight -= w;
							return problems.eq( i );
						} else {
							index -= weights[i];
						}
					}

					// This will never happen
					return Khan.error("makeProblemBag got confused w/ index " + index);
				})() );
			}
		}

		return bag;
	}

	function enableCheckAnswer() {
		jQuery( "#check-answer-button" )
			.removeAttr( "disabled" )
			.removeClass( "buttonDisabled" )
			.val(Translate.switchLang({'en':'Check Answer', 'nl':'Check Antwoord'}))
	}

	function disableCheckAnswer() {
		jQuery( "#check-answer-button" )
			.attr( "disabled", "disabled" )
			.addClass( "buttonDisabled" )
			.val('Please wait...');
	}

	function makeProblem( id, seed ) {
		if ( typeof Badges !== "undefined" ) {
			Badges.hide();
		}

		// Enable scratchpad (unless the exercise explicitly disables it later)
		Khan.scratchpad.enable();

		// Allow passing in a random seed
		if ( typeof seed !== "undefined" ) {
			problemSeed = seed;

		// In either of these testing situations,
		} else if ( (testMode && Khan.query.test != null) || user == null ) {
			problemSeed = randomSeed;
		}

		// Set randomSeed to what problemSeed is (save problemSeed for recall later)
		randomSeed = problemSeed;

		// Check to see if we want to test a specific problem
		if ( testMode ) {
			id = typeof id !== "undefined" ? id : Khan.query.problem;
		}

		if ( typeof id !== "undefined" ) {
			var problems = exercises.children( ".problems" ).children();

			problem = /^\d+$/.test( id ) ?
				// Access a problem by number
				problems.eq( parseFloat( id ) ) :

				// Or by its ID
				problems.filter( "#" + id );

		// Otherwise we grab a problem at random from the bag of problems
		// we made earlier to ensure that every problem gets shown the
		// appropriate number of times
		} else if ( problemBag.length > 0 ) {
			problem = problemBag[ problemBagIndex ];
			id = problem.data( "id" );

		// No valid problem was found, bail out
		} else {
			return;
		}

		problemID = id;

		// Find which exercise this problem is from
		exercise = problem.parents( ".exercise" ).eq( 0 );

		// Work with a clone to avoid modifying the original
		problem = problem.clone();

		// problem has to be child of visible #workarea for MathJax metrics to all work right
		var workAreaWasVisible = jQuery( "#workarea" ).is( ":visible" );
		jQuery( "#workarea" ).append( problem ).show();

		// If there's an original problem, add inherited elements
		var parentType = problem.data( "type" );

		while ( parentType ) {
			// Copy over the parent element to the child
			var original = exercise.find( ".problems #" + parentType ).clone();
			problem.prepend( original.children().data( "inherited", true ) );

			// Keep copying over the parent elements (allowing for deep inheritance)
			parentType = original.data( "type" );
		}

		// Add any global exercise defined elements
		problem.prepend( exercise.children( ':not(.problems)' ).clone().data( "inherited", true ) );

		// Apply templating
		var children = problem
			// var blocks append their contents to the parent
			.find( ".vars" ).tmplApply( { attribute: "class", defaultApply: "appendVars" } ).end()

			// Individual variables override other variables with the same name
			.find( ".vars [id]" ).tmplApply().end()

			// We also look at the main blocks within the problem itself to override,
			// ignoring graphie and spin blocks
			.children( "[class][class!='graphie'][class!='spin']" ).tmplApply( { attribute: "class" } );

		// Finally we do any inheritance to the individual child blocks (such as problem, question, etc.)
		children.each(function () {
			// Apply while adding problem.children() to include
			// template definitions within problem scope
			jQuery( this ).find( "[id]" ).add( children ).tmplApply();
		});

		// Remove and store hints to delay running modules on it
		hints = problem.children( ".hints" ).remove();

		// Remove the hint box if there are no hints in the problem
		if ( hints.length === 0 ) {
			jQuery( ".hint-box" ).remove();
		}

		// Run the main method of any modules
		problem.runModules( problem, "Load" );
		problem.runModules( problem );

		// Store the solution to the problem
		var solution = problem.find(".solution"),

			// Get the multiple choice problems
			choices = problem.find(".choices"),

			// Get the area into which solutions will be inserted,
			// Removing any previous answer
			solutionarea = jQuery("#solutionarea").empty(),

			// See if we're looking for a specific style of answer
			answerType = solution.data("type");

		// Make sure that the answer type exists
		if ( answerType ) {
			if ( Khan.answerTypes && !Khan.answerTypes[ answerType ] ) {
				Khan.error( "Unknown answer type specified: " + answerType );
				return;
			}
		}

		if ( !answerType ) {
			// If a multiple choice block exists
			if ( choices.length ) {
				answerType = "radio";

			// Otherwise we assume the smart number type
			} else {
				answerType = "number";
			}
		}

		// Generate a type of problem
		// (this includes possibly generating the multiple choice problems,
		// if this fails then we will need to try generating another one.)
		guessLog = [];
		userActivityLog = [];
		validator = Khan.answerTypes[answerType]( solutionarea, solution );

		// A working solution was generated
		if ( validator ) {
			// Focus the first input
			// Use .select() and on a delay to make IE happy
			var firstInput = solutionarea.find( ":input" ).first();
			setTimeout( function() {
				firstInput.focus().select();
			}, 1 );

			lastFocusedSolutionInput = firstInput;
			solutionarea.find( ":input" ).focus( function() {
				// Save which input is focused so we can refocus it after the user hits Check Answer
				lastFocusedSolutionInput = this;
			} );
		} else {
			// Making the problem failed, let's try again
			problem.remove();
			makeProblem( id, randomSeed );
			return;
		}

		// Remove the solution and choices elements from the display
		solution.remove();
		choices.remove();

		// Add the problem into the page
		jQuery( "#workarea" ).toggle( workAreaWasVisible ).fadeIn();
		Khan.scratchpad.resize();

		// Enable the all answer input elements except the check answer button.
		jQuery( "#answercontent input" ).not( '#check-answer-button' )
			.removeAttr( "disabled" );

		// Only enable the check answer button if we are not still waiting for
		// server acknowledgement of the previous problem.
		if ( !jQuery("#throbber").is(':visible') ) {
			enableCheckAnswer();
		}

		if ( validator.examples && validator.examples.length > 0 ) {
			jQuery( "#examples-show" ).show();
			jQuery( "#examples" ).empty();

			jQuery.each( validator.examples, function( i, example ) {
				jQuery( "#examples" ).append( '<li>' + example + '</li>' );
			});

			jQuery( "#examples" ).children().tmpl();
		} else {
			jQuery( "#examples-show" ).hide();
		}
		// save a normal JS array of hints so we can shift() through them later
		hints = hints.tmpl().children().get();

		if ( hints.length === 0 ) {
			// Disable the get hint button
			jQuery( "#hint" ).attr( "disabled", true );
		}

		// Hook out for exercise test runner
		if ( testMode && parent !== window && typeof parent.jQuery !== "undefined" ) {
			parent.jQuery( parent.document ).trigger( "problemLoaded", [ makeProblem, validator.solution ] );
		}

		// Save problem info in dump data for testers
		if ( testMode && Khan.query.test != null ) {
			var testerInfo = jQuery( "#tester-info" );

			// Deep clone the elements to avoid some straaaange bugs
			var lastProblem = jQuery.extend( true, {}, {
				seed: problemSeed,
				type: problemID,
				VARS: jQuery.tmpl.VARS,
				solution: validator.solution
			} );

			dataDump.problems.push( lastProblem );

			jQuery( testerInfo ).find( ".problem-no" )
				.text( dataDump.problems.length + dataDump.issues + " of " + problemCount );

			var answer = jQuery( testerInfo ).find( ".answer" ).empty();

			var displayedSolution = validator.solution;
			if ( !jQuery.isArray( displayedSolution ) ) {
				displayedSolution = [ displayedSolution ];
			}

			jQuery.each( displayedSolution, function( i, el ) {
				if (jQuery.isArray( el )) {
					// group nested arrays of answers, for sets of multiples or multiples of sets.
					// no reason answers can't be nested arbitrarily deep, but here we assume no
					// more than one sub-level.
					var subAnswer = jQuery( "<span>" ).addClass( "group-box" ).appendTo(answer);
					jQuery.each( el, function( i, el ) {
						jQuery( "<span>" ).text( el ).addClass( "box" ).appendTo(subAnswer);
					} );
				} else {
					jQuery( "<span>" ).text( el ).addClass( "box" ).appendTo( answer );
				}
			} );
		}

		if (typeof userExercise !== "undefined" && userExercise.read_only) {
			var timelineEvents, timeline;

			var timelinecontainer = jQuery( "<div id='timelinecontainer'>" )
				.append( "<div>\
							<div id='previous-problem' class='simple-button action-gradient'>Previous Problem</div>\
							<div id='previous-step' class='simple-button action-gradient'><span>Previous Step</span></div>\
						  </div>" )
				.insertBefore( "#extras" );

			if (getData().total_done === 0) {
				jQuery( '#previous-problem' )
					.addClass( 'disabled' )
					.css( {
						cursor: 'default !important',
						top: '0',
						color: '#333 !important'
					} )
					.data( 'disabled', true );
			}

			timeline = jQuery( "<div id='timeline'>" ).appendTo( timelinecontainer );
			timelineEvents = jQuery( "<div id='timeline-events'>" ).appendTo( timeline );

			timelinecontainer
				.append( "<div>\
							<div id='next-problem' class='simple-button action-gradient'>Next Problem</div>\
							<div id='next-step' class='simple-button action-gradient'><span>Next Step</span></div>\
						  </div>" );

			jQuery( "<div class='user-activity correct-activity'>Started</div>" )
				.data( 'hint', false )
				.appendTo( timelineEvents );

			var hintNumber = 0,
				answerNumber = 1;

			/* value[0]: css class
			 * value[1]: guess
			 * value[2]: time taken since last guess
			 */
			jQuery.each(userExercise.user_activity, function(index, value) {
				var guess = value[1] === "Activity Unavailable" ? value[1] : JSON.parse( value[1] ),
					thissolutionarea;

				timelineEvents
					.append( "<div class='timeline-time'>" + value[2] + "s</div>" );

				thissolutionarea = jQuery( "<div>" )
					.addClass( "user-activity " + value[0] )
					.appendTo( timelineEvents );

				if (value[0] === "hint-activity") {
					thissolutionarea.attr( 'title', 'Hint used' );
					thissolutionarea
						.data( 'hint', hintNumber )
						.prepend( "Hint #" + (hintNumber+1) );
					hintNumber += 1;
				} else { // This panel is a solution (or the first panel)
					thissolutionarea.data( 'hint', false );
					if (guess === "Activity Unavailable") {
					  thissolutionarea.text( guess );
					} else {
						if (answerType === 'radio') {
							// radio is the only answer type that can't display its own guesses
							thissolutionarea.append( jQuery(
							  "<p class='solution'>" + guess + "</p>" ).tmpl()
							);

							if (index === userExercise.user_activity.length - 1) {
								thissolutionarea
									.removeClass( 'incorrect-activity' )
									.addClass( 'correct-activity' );

								thissolutionarea.attr( 'title', 'Correct Answer' );
							} else {
								thissolutionarea.attr( 'title', 'Incorrect Answer' );
							}
						} else {
							var thisValidator = Khan.answerTypes[answerType]( thissolutionarea, solution );

							thisValidator.showGuess( guess );

							if (thisValidator() === true) {
								// If the user didn't get the problem right on the first try, all
								// answers are labelled incorrect by default
								thissolutionarea
									.removeClass( 'incorrect-activity' )
									.addClass( 'correct-activity' );

								thissolutionarea.attr( 'title', 'Correct Answer' );
							} else {
								thissolutionarea
									.removeClass( 'correct-activity' )
									.addClass( 'incorrect-activity' );
								thissolutionarea.attr( 'title', 'Incorrect Answer' );
							}
						}

						thissolutionarea
							.data( 'guess', guess )
								.find( 'input' )
								.attr( 'disabled', true )
							.end()
								.find( 'select' )
								.attr( 'disabled', true );
					}
				}
			});

			if (timelinecontainer.height() > timeline.height()) {
				timeline.height( timelinecontainer.height() );
			}

			var states = timelineEvents.children( ".user-activity" ),
				currentSlide = states.length - 1,
				numSlides = states.length,
				firstHintIndex = timeline.find( '.hint-activity:first' )
				  .index( '.user-activity' ),
				lastHintIndex  = timeline.find( '.hint-activity:last' )
				  .index( '.user-activity' ),
				totalHints = timeline.find( '.hint-activity:last' )
				  .index( '.hint-activity' ),
				hintButton = jQuery( '#hint' ),
				hintRemainder = jQuery( '#hint-remainder' ),
				timelineMiddle = timeline.width() / 2,
				realHintsArea = jQuery( '#hintsarea' ),
				realWorkArea = jQuery( '#workarea' ),
				statelist = [],
				previousHintNum = 100000;

			// So highlighting doesn't fade to white
			jQuery( '#solutionarea' ).css( 'background-color', jQuery( '#answercontent' ).css( 'background-color' ) );

			jQuery.fn.scrubber = function() {
				var scrubber1 = jQuery( '#scrubber1' ),
						scrubber2 = jQuery( '#scrubber2' );

				scrubber1 = scrubber1.length ? scrubber1 : jQuery("<div id='scrubber1'>").appendTo(document.body);
				scrubber2 = scrubber2.length ? scrubber2 : jQuery("<div id='scrubber2'>").appendTo(document.body);

				// triangle top of scrubber
				scrubber1.css( {
					display: 'block',
					width: '0',
					height: '0',
					'border-left': '6px solid transparent',
					'border-right': '6px solid transparent',
					'border-bottom': '6px solid #888',
					position: 'absolute',
					top: (timelinecontainer.offset().top + timelinecontainer.height() - 6) + 'px',
					left: (this.offset().left + this.width()/2) + 'px',
					bottom: '0'
				} );

				// rectangle bottom of scrubber
				scrubber2.css( {
					display: 'block',
					width: '0',
					height: '0',
					'border-bottom': '6px solid #888',
					'border-left': '6px solid #888',
					'border-right': '6px solid #888',
					position: 'absolute',
					top: (scrubber1.offset().top + 7) + 'px',
					left: scrubber1.offset().left + 'px'
				} );

				return this;
			};

			// Set the width of the timeline (starts as 10000px) after MathJax loads
			MathJax.Hub.Queue( function() {
				var maxHeight = 0;
				timelineEvents.children().each( function() {
					maxHeight = Math.max( maxHeight, jQuery( this ).height() );
				});

				if (maxHeight > timelinecontainer.height()) {
					timelinecontainer.height( maxHeight + 16 );
					timeline.height( maxHeight + 16 );
				}
			} );

			var create = function( i ) {
				var thisSlide = states.eq( i );

				var thisHintArea, thisProblem,
					hintNum = jQuery( '#timeline-events .user-activity:lt('+(i+1)+')' )
								.filter('.hint-activity').length - 1,
					// Bring the currently focused panel as close to the middle as possible
					itemOffset = thisSlide.position().left,
					itemMiddle = itemOffset + thisSlide.width() / 2,
					offset = timelineMiddle - itemMiddle,
					currentScroll = timeline.scrollLeft(),
					timelineMax = states.eq( -1 ).position().left + states.eq( -1 ).width(),
					scroll = Math.min( currentScroll - offset, currentScroll + timelineMax - timeline.width() + 25 );

				if (hintNum >= 0) {
				  jQuery( hints[hintNum] ).appendTo( realHintsArea ).runModules( problem );
				}

				MathJax.Hub.Queue( function() {
					var recordState = function() {
						jQuery( "#problemarea input" ).attr({ disabled: "disabled" });
						thisHintArea = realHintsArea.clone();
						thisProblem = realWorkArea.clone();

						var thisState = {
							slide: thisSlide,
							hintNum: hintNum,
							hintArea: thisHintArea,
							problem: thisProblem,
							scroll: scroll
						};

						statelist[i] = thisState;

						if (i+1 < states.length) {
							MathJax.Hub.Queue( function() {
								create( i+1 );
							} );
						} else {
							activate( i );
						}
					};

					if ( thisSlide.data( "guess" ) !== undefined && jQuery.isFunction( validator.showCustomGuess ) ) {
						KhanUtil.currentGraph = jQuery( realWorkArea ).find( ".graphie" ).data( "graphie" );
						validator.showCustomGuess( thisSlide.data( "guess" ) );
						MathJax.Hub.Queue( recordState );
					} else {
						recordState();
					}

				});
			};

			MathJax.Hub.Queue( function() {create(0);} );

			var activate = function( slideNum ) {
				var hint, thisState,
					thisSlide = states.eq( slideNum );

				// All content for this state has been built before
				if (statelist[slideNum]) {
					thisState = statelist[slideNum];

					timeline.animate({
						scrollLeft: thisState.scroll
					}, 150, function() {
						thisState.slide.scrubber();
					});

					if (slideNum < firstHintIndex) {
						hintRemainder.fadeOut( 150 );
						hintButton.val( "I'd like a hint" );
					} else if (slideNum >= lastHintIndex) {
						if (states.eq( lastHintIndex ).data( 'hint' ) < hints.length) {
							hintRemainder.fadeOut( 150 );
						}
					} else {
						hintButton.val( "I'd like another hint" );

						hintRemainder
							.text( (totalHints - thisState.hintNum) + " remaining" )
							.fadeIn( 150 );
					}

					jQuery( '#workarea' ).remove();
					jQuery( '#hintsarea' ).remove();
					jQuery( '#problemarea' ).append( thisState.problem ).append( thisState.hintArea );

					if (thisSlide.data( 'guess' )) {
						solutionarea.effect( 'highlight', {}, 200 );

						// If there is a guess we show it as if it was filled in by the user
						validator.showGuess( thisSlide.data( 'guess' ) );
					} else {
						validator.showGuess();
					}

					// TODO: still highlight even if hint modifies problem (and highlight following hints)
					if (slideNum > 0 && (thisState.hintNum > statelist[slideNum-1].hintNum)) {
						jQuery( '#hintsarea' ).children().each( function( index, elem ) {
							if (index > previousHintNum) {
								jQuery( elem ).effect( 'highlight', {}, 200 );
							}
						} );

						previousHintNum = thisState.hintNum;
					}

					if (slideNum === 0) {
						previousHintNum = -1;
					}
				}
			};

			// Allow users to use arrow keys to move up and down the timeline
			jQuery( document ).keydown(function(event) {
				if (event.keyCode !== 37 && event.keyCode !== 39) {
					return;
				}

				if (event.keyCode === 37) { // left
					currentSlide -= 1;
				} else { // right
					currentSlide += 1;
				}

				currentSlide = Math.min(currentSlide, numSlides-1);
				currentSlide = Math.max(currentSlide, 0);

				activate( currentSlide );

				return false;
			});

			// Allow users to click on points of the timeline
			jQuery( states ).click(function(event) {
				var index = jQuery( this ).index( "#timeline .user-activity" );

				currentSlide = index;
				activate( currentSlide );

				return false;
			});

			jQuery( '#previous-step' ).click(function(event) {
				if (currentSlide > 0) {
					currentSlide -= 1;
					activate( currentSlide );
				}

				return false;
			});

			jQuery( '#next-step' ).click(function(event) {
				if (currentSlide < numSlides-1) {
					currentSlide += 1;
					activate( currentSlide );
				}

				return false;
			});

			jQuery( '#next-problem' ).click(function(event) {
				window.location.href = userExercise.next_problem_url;
			});

			jQuery( '#previous-problem' ).click(function(event) {
				if (!jQuery( this ).data( 'disabled' )) {
					window.location.href = userExercise.previous_problem_url;
				}
			});

			// Some exercises use custom css
			jQuery( "#timeline input[type='text']" ).css( "width",
				jQuery( "#answer_area input[type='text']" ).css('width')
			);

			jQuery( '#hint' ).attr( 'disabled', true );
			jQuery( '#answercontent input' ).attr( 'disabled', true );
			jQuery( '#answercontent select' ).attr( 'disabled', true );
	  }


		// Show the debug info
		if ( testMode && Khan.query.debug != null ) {
			jQuery( document ).keypress( function( e ) {
				if ( e.charCode === 104 ) {
					jQuery("#hint").click();
				}
			});
			var debugWrap = jQuery( "#debug" ).empty();
			var debugURL = window.location.protocol + "//" + window.location.host + window.location.pathname
				+ "?debug&problem=" + problemID;

			jQuery( "<h3>Debug Info</h3>" ).appendTo( debugWrap );

			var src = exercise.data("src");
			if ( src != null ) {
				var srcInfo = jQuery( "<p>" ).appendTo( debugWrap );
				srcInfo.append( "From " );

				jQuery( "<a>" )
					.text( src )
					.attr( "href", src + "?debug" )
					.appendTo( srcInfo );
			}

			var links = jQuery( "<p>" ).appendTo( debugWrap );
			jQuery( "<a>Problem permalink</a>" )
				.attr( "href", debugURL + "&seed=" + problemSeed )
				.appendTo( links );


			if ( !Khan.query.activity ) {
				links.append("<br>");
				var historyURL = debugURL + "&seed=" + problemSeed + "&activity=";
				jQuery( "<a>Problem history</a>" ).attr( "href", "javascript:" ).click(function( event ) {
					window.location.href = historyURL + encodeURIComponent( JSON.stringify( userActivityLog ) );
				}).appendTo( links );
			} else {
				links.append("<br>");
				jQuery( "<a>Random problem</a>" )
					.attr( "href", debugURL )
					.appendTo( links );
			}

			links.append("<br>");
			links.append("Problem type: ");

			jQuery( "<a>" )
				.text( problemID )
				.attr( "href", debugURL )
				.appendTo( links );

			if ( exercise.data( "name" ) != null ) {
				links.append("<br>");
				links.append("Original exercise: " + exercise.data( "name" ));
			}

			if ( typeof jQuery.tmpl.VARS !== "undefined" ) {
				var varInfo = jQuery( "<p>" );

				jQuery.each( jQuery.tmpl.VARS, function( name, value ) {
					var str;

					if ( typeof value === "function") {
						str = value.toString();
					} else {
						// JSON is prettier (when it works)
						try {
							str = JSON.stringify( value );
						} catch ( e ) {
							str = value.toString();
						}
					}

					varInfo.append( jQuery( "<b>" ).text( name ) );
					varInfo.append( ": " );
					varInfo.append( jQuery( "<var>" ).text( str ) );
					varInfo.append( "<br>" );
				});

				varInfo.appendTo( debugWrap );
			}

			// for special style rules

			jQuery( "body" ).addClass("debug");
		}

		hintsUsed = 0;
		attempts = 0;
		lastAction = (new Date).getTime();

		jQuery( "#hint" ).val( "I'd like a hint" );
		jQuery( "#hint-remainder" ).hide();

		if ( once ) {
			updateData();
			once = false;
		}

		jQuery(Khan).trigger( "newProblem" );

	  return answerType;
	}

	function drawGraph( followups ){

		if (window.Raphael){
			// prime followups as empty so that we can check properties without throwing exceptions
			followups = followups || {};

			var exerciseName = typeof userExercise !== "undefined" ? userExercise.exercise : ((/([^\/.]+)(?:\.html)?$/.exec( window.location.pathname ) || [])[1]);

			// get from the api which exercises follow this one and then render the map
			var getUserFollowups = function(){
				$.ajax({
				  url: "/api/v1/user/exercises/"+exerciseName+"/followup_exercises",
					type: "GET",
					dataType: "json",
					xhrFields: { withCredentials : true },
				  success: renderFollowups
				});
			};
		
			// a rectangle centered at x,y
			Raphael.fn.centeredBox = function (x, y, w, h, r) {
				return this.rect(x - (w/2), y - (h/2), w, h, r);
			};

			// actually draw the map
			var renderFollowups = function(exercises){
				$("#you-are-here").empty();

				exercises = exercises || [];

				// only take the top three exercises
				exercises = exercises.slice(0,3);

				var map = Raphael("you-are-here",500, 100);

				// this is a slightly taller graph
				// var paths = ["M10,75 l75,0 l0,40", "M10,75 l150,0 l0,-40", "M10,75 l225,0"];

				// this is a slightly shorter graph
				var paths = ["M10,50 l75,0 l0,17", "M10,50 l150,0 l0,-17", "M10,50 l225,0"];
				var star = "l2,0 l1-2 l1,2 l2,0 l-2,1 l1,2 l-2,-1 l-2,1 l1,-2 l-2,-1";

				if(exercises.length === 2){
					paths = paths.slice(1,3);
				}
				if(exercises.length === 1){
					paths = paths.slice(2,3);
				}

				// a star explaining where you are
				map.text(5,30, "You Are Here").attr("text-anchor","start").attr("font-size",12).attr("fill","#444");
				var currentBg = map.centeredBox(13, 51, 20,20,4)
					.attr("fill", "rgb(0, 128, 201)")
					.attr("stroke-width",0);
				var currentPos = map.path("M10,50 "+ star)
					.attr("fill","rgb(255, 255, 72)")
					.attr("stroke","rgb(0, 128, 201)")
					.attr("stroke-width",0)
					.scale(3,3.5).attr("id","you-star");

				// walk all the exercises and draw a route for each
				var routes = $.map( exercises, function(exercise, i){

					var state = exercise.exercise_states || { suggested:true } ;
					pathState = false;
					$.each(state, function(i,v){ pathState = (v || pathState); });

					var dotColor = "#ccc";
					var routeColor = "#ccc";
					var accentColor = "#fff";

					if(pathState){

						if(state.suggested){ // greenish
							dotColor = "rgb(137, 185, 8)";
							routeColor = "rgb(208, 227, 156)";
							accentColor = "#fff";
						}

						if(state.proficient){ // blueish
							dotColor = "rgb(0, 128, 201)";
							routeColor = "rgb(167, 211, 236)";
							accentColor = "rgb(255, 255, 72)";
						}

						if(state.reviewing){ // orangeish
							dotColor = "rgb(227, 93, 4)";
							routeColor = "rgb(244, 189, 154)";
							accentColor = "#ccc";
						}

					}

					// draw nth path (paths are hand-coded, not autogenerated)
					var route = map.path(paths[i])
						.attr("stroke-width",6)
						.attr("stroke", routeColor );

					var endpoint = route.getPointAtLength(route.getTotalLength());

					// the exercise status/state will show up at the endpoint position
					// here it's a rounded rect with a star atop it
					var roundedrect = map.centeredBox(endpoint.x, endpoint.y, 20,20,4)
						.attr("fill", dotColor)
						.attr("stroke-width",0);

					// the path for the star/dot
					var starpath = "M"+(endpoint.x-3)+","+(endpoint.y-1) + star;
					var dot = map.path(starpath)
						.attr("fill", accentColor)   // the state of this exercise
						.attr("stroke-width",0)
						.scale(3, 3.5);

					// these describe the position of the text label
					yoffset = (i === 0) ? 25 : -15;
					xoffset = -10;

					// the href for the next exercise
					var exercise_display = (exercise.hasOwnProperty("exercise_model")) ? exercise.exercise_model.display_name : exercise.display_name;
					var exercise_name = (exercise.hasOwnProperty("exercise_model")) ? exercise.exercise : exercise.name;
					var href = typeof userExercise !== "undefined" ? "/exercises?exid="+exercise_name : "./"+exercise_name+".html";
					var label = map.text(endpoint.x + xoffset, endpoint.y + yoffset, exercise_display)
						.attr("text-anchor","start")
						.attr("font-size", 14)
						.attr("href",href)
						.attr("fill","#999");

					// create two sets: one for the icon another for the route
					var box = map.set();
					var labels = map.set();

					labels.push(roundedrect).push(dot).push(label);
					box.push(route).push(labels);

					// when you mouseover, fade in the route and make sure the current star isn't covered
					var over = function(){
						box.toFront();
						route.toFront();
						labels.toFront();

						currentBg.toFront(); // position the bg and star
						currentPos.toFront();
						route.animate( {stroke : dotColor}, 350 , "<>");
					};

					// mouseout, fade out the path to its original color
					var out = function(){ 
						route.animate( {stroke : routeColor }, 550, "<>" );
					};

					var gotoExercise = function(){ window.location = href; };
					var click = function(evt){
						gae_bingo.bingo( "clicked_followup", gotoExercise, gotoExercise );
						return false;
					};
					box.mouseover(over).mouseout(out).click(click);
				});

				// promote the current star
				currentBg.toFront();
				currentPos.toFront();

			};


			// actually doing things
			if ( jQuery.isArray(followups) ){ 

				// how considerate! let's just render this now.
				renderFollowups( followups );
				return;

			}else { 

				// if nothing of use was fed to us just grab it from the api
				getUserFollowups();
				return;

			}

		}
	}

	function injectSite( html, htmlExercise ) {
		jQuery("body").prepend( html );
		jQuery("#container").html( htmlExercise );

		if ( Khan.query.layout === "lite" ) {
			jQuery("html").addClass( "lite" );
		}
	}

	function prepareSite() {

		// Set exercise title
		if(jQuery(".exercise-title").text().length == 0){
			jQuery(".exercise-title").text( typeof userExercise !== "undefined" && userExercise.exercise_model ?
				userExercise.exercise_model.display_name : document.title );
		}

		Translate.load();

		exercises = jQuery( ".exercise" ).detach();

		// Setup appropriate img URLs
		jQuery( "#sad" ).attr( "src", urlBase + "css/images/face-sad.gif" );
		jQuery( "#happy" ).attr( "src", urlBase + "css/images/face-smiley.gif" );
		jQuery( "#throbber, #issue-throbber" )
			.attr( "src", urlBase + "css/images/throbber.gif" );

		if (typeof userExercise !== "undefined" && userExercise.read_only) {
			jQuery( "#extras" ).css("visibility", "hidden");
		}

		// Change form target to the current page, so that errors do not kick us
		// back to the dashboard
		jQuery( "#answerform" ).attr( "action", window.location.href );

		// Watch for a solution submission
		jQuery("#check-answer-button").click( handleSubmit );
		jQuery("#answerform").submit( handleSubmit );

		// Build the data to pass to the server
		function buildAttemptData(pass, attemptNum, attemptContent, curTime) {
			var timeTaken = Math.round((curTime - lastAction) / 1000);

			if ( attemptContent !== "hint" ) {
				userActivityLog.push([ pass ? "correct-activity" : "incorrect-activity", attemptContent, timeTaken ]);
			} else {
				userActivityLog.push([ "hint-activity", "0", timeTaken ]);
			}

			return {
				// The user answered correctly
				complete: pass === true ? 1 : 0,

				// The user used a hint
				count_hints: hintsUsed,

				// How long it took them to complete the problem
				time_taken: timeTaken,

				// How many times the problem was attempted
				attempt_number: attemptNum,

				// The answer the user gave
				// TODO: Get the real provided answer
				attempt_content: attemptContent,

				// A hash representing the exercise
				// TODO: Populate this from somewhere
				sha1: typeof userExercise !== "undefined" ? userExercise.exercise_model.sha1 : exerciseName,

				// The seed that was used for generating the problem
				seed: problemSeed,

				// The seed that was used for generating the problem
				problem_type: problemID,

				// The non-summative exercise that the current problem belongs to
				non_summative: exercise.data( "name" )
			};
		}

		function handleSubmit() {
			var pass = validator();

			// Stop if the user didn't enter a response
			// If multiple-answer, join all responses and check if that's empty
			// Remove commas left by joining nested arrays in case multiple-answer is nested
			if ( jQuery.trim( validator.guess ) === "" ||
				 ( validator.guess instanceof Array && jQuery.trim( validator.guess.join( "" ).replace(/,/g, '') ) === "" ) ) {
				return false;
			} else {
				guessLog.push( validator.guess );
			}

			// Stop if the form is already disabled and we're waiting for a response.
			if ( jQuery( "#answercontent input" ).not( "#hint" ).is( ":disabled" )) {
				return false;
			}

			jQuery( "#throbber" ).show();
			disableCheckAnswer();
			jQuery( "#answercontent input" ).not("#check-answer-button, #hint")
				.attr( "disabled", "disabled" );
			jQuery( "#check-answer-results p" ).hide();

			// Figure out if the response was correct
			if ( pass === true ) {
				jQuery("#happy").show();
				jQuery("#sad").hide();
			} else {
				jQuery("#happy").hide();
				jQuery("#sad").show();

				// Is this a message to be shown?
				if ( typeof pass === "string" ) {
					jQuery( "#check-answer-results .check-answer-message" ).html( pass ).tmpl().show();
				}

				// Show the examples (acceptable answer formats) if available -- we get
				// a lot of issues due to incorrect formats (eg. "3.14159" instead of
				// "3pi", "log(2^5)" instead of "log(32)").
				var examples = jQuery( "#examples" ),
					examplesLink = jQuery( "#examples-show" );
				if ( examplesLink.is( ":visible" ) ) {
					if ( !examples.is( ":visible" ) ) {
						examplesLink.click();
					}
					examples.effect( "pulsate", { times: 1 }, "slow" );
				}

				// Refocus text field so user can type a new answer
				if ( lastFocusedSolutionInput != null ) {
					setTimeout( function() {
						// focus should always work; hopefully select will work for text fields
						jQuery( lastFocusedSolutionInput ).focus().select();
					}, 1 );
				}
			}

			// The user checked to see if an answer was valid

			// Save the problem results to the server
			var curTime = new Date().getTime();
			var data = buildAttemptData(pass, ++attempts, JSON.stringify(validator.guess), curTime);
			request( "problems/" + problemNum + "/attempt", data, function() {

				// TODO: Save locally if offline
				jQuery(Khan).trigger( "answerSaved" );

				jQuery( "#throbber" ).hide();
				enableCheckAnswer();
			}, function() {
				// Error during submit. Cheat, for now, and reload the page in
				// an attempt to get updated data.

				if ( typeof userExercise === "undefined" || !userExercise.tablet ) {
					if ( user != null && exerciseName != null ) {
						// Before we reload, clear out localStorage's UserExercise.
						// If there' a discrepancy between server and localStorage such that
						// problem numbers are out of order or anything else, we want
						// to restart with whatever the server sends back on reload.
						delete window.localStorage[ "exercise:" + user + ":" + exerciseName ];
					}

					window.location.reload();
				} else {
					// TODO: Implement alternative error handling
				}
			});

			if ( pass === true ) {
				// Correct answer, so show the next question button.
				jQuery( "#check-answer-button" ).hide();
				if ( !testMode || Khan.query.test == null ) {
					jQuery( "#next-question-button" ).show();
					jQuery( "#next-question-button" ).removeAttr( "disabled" )
						.removeClass( "buttonDisabled" )
						.focus();
				}
				nextProblem( 1 );
			} else {
				// Wrong answer. Enable all the input elements, but wait until
				// until server acknowledges before enabling the check answer
				// button.
				jQuery( "#answercontent input" ).not( "#check-answer-button, #hint" )
					.removeAttr( "disabled" );
			}

			// Remember when the last action was
			lastAction = curTime;

			jQuery(Khan).trigger( "checkAnswer", pass );

			return false;
		}

		// Watch for when the next button is clicked
		jQuery("#next-question-button").click(function(ev) {
			jQuery("#happy").hide();
			if( !jQuery( "#examples-show" ).data( "show" ) ){ jQuery( "#examples-show" ).click(); }

			// Toggle the navigation buttons
			jQuery("#check-answer-button").show();
			jQuery("#next-question-button").blur().hide();

			// Wipe out any previous problem
			jQuery("#workarea").hide();
			jQuery("#workarea, #hintsarea").runModules( problem, "Cleanup" ).empty();
			jQuery("#hint").attr( "disabled", false );

			Khan.scratchpad.clear();

			if ( testMode && Khan.query.test != null && dataDump.problems.length + dataDump.issues >= problemCount ) {
				// Show the dump data
				jQuery( "#problemarea" ).append(
					"<p>Thanks! You're all done testing this exercise.</p>" +
					"<p>Please copy the text below and send it to us.</p>"
				);

				jQuery( "<textarea>" )
					.val( "Khan.testExercise(" + JSON.stringify( dataDump ) + ");" )
					.css({ width: "60%", height: "200px" })
					.prop( "readonly", true )
					.click( function() {
						this.focus();
						this.select();
					} )
					.appendTo( "#problemarea" );

				jQuery( "#sidebar" ).hide();

			} else {
				// Generate a new problem
				makeProblem();
			}
		});

		// Watch for when the "Get a Hint" button is clicked
		jQuery( "#hint" ).click(function() {

			if ( user && attempts === 0 ) {
				var hintApproved = window.localStorage[ "hintApproved:" + user ];

				if ( !(typeof hintApproved !== "undefined" && JSON.parse(hintApproved)) ) {
					if ( !(typeof userExercise !== "undefined" && userExercise.read_only) ) {
						if ( confirm("One-time warning: Using a hint will set back your progress.\nAre you sure you want to continue?"))  {
							// Hint consequences approved
							window.localStorage[ "hintApproved:" + user ] = true;

						} else {
							// User doesn't want to have progress set back
							return;
						}
					}
				}
			}

			var hint = hints.shift();
			jQuery( "#hint-remainder" ).text( hints.length + " remaining" )
				.fadeIn( 500 );

			if ( hint ) {

				hintsUsed += 1;

				jQuery( this )
					.val( jQuery( this ).data( "buttonText" ) || "I'd like another hint" );

				var problem = jQuery( hint ).parent();

				// Append first so MathJax can sense the surrounding CSS context properly
				jQuery( hint ).appendTo( "#hintsarea" ).runModules( problem );

				// Grow the scratchpad to cover the new hint
				Khan.scratchpad.resize();

				// Disable the get hint button
				if ( hints.length === 0 ) {
					jQuery( this ).attr( "disabled", true );
					jQuery( "#hint-remainder" ).fadeOut( 500 );
				}
			}

			var fProdReadOnly = !testMode && userExercise.read_only;
			var fAnsweredCorrectly = jQuery( "#next-question-button" ).is( ":visible" );
			if ( !fProdReadOnly && !fAnsweredCorrectly ) {
				// Resets the streak and logs history for exercise viewer
				request(
					"problems/" + problemNum + "/hint",
					buildAttemptData(false, attempts, "hint", new Date().getTime()),
					// Don't do anything on success or failure, silently failing is ok here
					function() {},
					function() {}
				);
			}

			// The first hint is free iff the user has already attempted the question
			if ( hintsUsed === 1 && attempts > 0 ) {
				gae_bingo.bingo( "hints_free_hint" );
				gae_bingo.bingo( "hints_free_hint_binary" );
			}
		});

		// On an exercise page, replace the "Report a Problem" link with a button
		// to be more clear that it won't replace the current page.
		jQuery( "<a>Report a Problem</a>" )
			.attr( "id", "report" ).addClass( "simple-button action-gradient green" )
			.replaceAll( jQuery( ".footer-links #report" ) );

		jQuery( "#report" ).click( function( e ) {

			e.preventDefault();

			var report = jQuery( "#issue" ).css( "display" ) !== "none",
				form = jQuery( "#issue form" ).css( "display" ) !== "none";

			if ( report && form ) {
				jQuery( "#issue" ).hide();
			} else if ( !report || !form ) {
				jQuery( "#issue-email" ).val(userEmail);
				jQuery( "#issue-status" ).removeClass( "error" ).html( issueIntro );
				jQuery( "#issue, #issue form" ).show();
				jQuery( "html, body" ).animate({
					scrollTop: jQuery( "#issue" ).offset().top
				}, 500, function() {
					jQuery( "#issue-title" ).focus();
				} );
			}
		});


		// Hide issue form.
		jQuery( "#issue-cancel" ).click( function( e ) {

			e.preventDefault();

			jQuery( "#issue" ).hide( 500 );
			jQuery( "#issue-title, #issue-email, #issue-body" ).val( "" );

		});

		jQuery( "[name=issue-type] ").click( function( e ) {
			console.log(this);
			jQuery("[data-forlabel]").hide();
			jQuery("[data-for=" + jQuery(this).attr("id") + "]").show();
		});

		// Submit an issue.
		jQuery( "#issue form input:submit" ).click( function( e ) {

			e.preventDefault();

			var pretitle = jQuery( ".exercise-title" ).text() || jQuery( "title" ).text().replace(/ \|.*/, '');

			var dataObj = {
				page: pretitle,
				ureport: jQuery( "#issue-body" ).val(),
				ucontact: jQuery( "#issue-email" ).val(),
				utype: jQuery( "input[name=issue-type]:checked" ).data("text"),
				ustamp: new Date().getTime(),
				udate: new Date().toUTCString()
			};

			// don't do anything if the user clicked a second time quickly
			if ( jQuery( "#issue form" ).css( "display" ) === "none" ) return;

			var formElements = jQuery( "#issue input" ).add( "#issue textarea" );

			// disable the form elements while waiting for a server response
			formElements.attr( "disabled", true );

			jQuery( "#issue-cancel" ).hide();
			jQuery( "#issue-throbber" ).show();


			// we try to post ot github without a cross-domain request, but if we're
			// just running the exercises locally, then we can't help it and need
			// to fall back to jsonp.
			jQuery.ajax({

				url: "/nl_report",
				type: "POST",
				data: dataObj,
				success: function( json ) {

					// hide the form
					jQuery( "#issue form" ).hide();

					// show status message
					jQuery( "#issue-status" ).removeClass( "error" )
						.html( Translate.switchLang({"nl":"Bedankt voor je feedback!", "en":"Thanks for your feedback!"}) )
						.show();

					// reset the form elements
					formElements.attr( "disabled", false )
						.not( "input:submit" ).val( "" );

					// replace throbber with the cancel button
					jQuery( "#issue-cancel" ).show();
					jQuery( "#issue-throbber" ).hide();

				},
				// note this won't actually work in local jsonp-mode
				error: function( json ) {

					// show status message
					jQuery( "#issue-status" ).addClass( "error" )
						.html( Translate.switchLang({
							"nl":"Het melden is mislukt, probeer het later nog een keer.",
							"en":"Reporting the problem failed, try again later."
						}) ).show();

					// enable the inputs
					formElements.attr( "disabled", false );

					// replace throbber with the cancel button
					jQuery( "#issue-cancel" ).show();
					jQuery( "#issue-throbber" ).hide();

				}
			});
		});

		jQuery( "#print-ten" ).data( "show", true )
			.click( function( e ) {
				e.preventDefault();

				var link = jQuery( this ),
					show = link.data( "show" );

				// Reset answer fields, etc. and clear work and hints area
				jQuery("#next-question-button").click();

				if ( show ) {
					link.text( "Try current problem" );
					jQuery( "#answerform" ).hide();

					for ( var i = 0; i < 9; i++ ) {
						jQuery( "#workarea" ).append( "<hr>" );
						nextProblem( 1 );
						makeProblem();
					}

					// Rewind so next time we make a problem we'll be back at the beginning
					prevProblem( 9 );
				} else {
					link.text( "Show next 10 problems" );
					jQuery( "#answerform" ).show();
				}

				jQuery( "#answerform input[type='button']" ).attr( "disabled", show );

				link.data( "show", !show );
			});

		jQuery( "#examples-show" ).data( "show", true )
			.click(function(evt){
				if ( evt ) { evt.preventDefault(); }

				var exampleLink = jQuery(this);
				var examples = jQuery( "#examples" );
				var show = exampleLink.data( "show" );

				if ( exampleLink.data( "show" ) ){
					exampleLink.text( Translate.switchLang({"nl":"Verberg geaccepteerde antwoordformaten.", "en":"Hide acceptable answer formats"}) );
				} else {
					exampleLink.text( Translate.switchLang({"nl":"Laat geaccepteerde antwoordformaten zien.", "en":"Show acceptable answer formats"}) );
				}

				examples.slideToggle( 190 );
				exampleLink.data( "show", !show );
			}).trigger( "click" );

		jQuery( "#warning-bar-close a").click( function( e ) {
			e.preventDefault();
			jQuery( "#warning-bar" ).fadeOut( "slow" );
		});

		jQuery( "#scratchpad-show" )
			.click( function( e ) {
				e.preventDefault();
				Khan.scratchpad.toggle();

				if ( user ) {
					window.localStorage[ "scratchpad:" + user ] = Khan.scratchpad.isVisible();
				}
			});

		jQuery( "#answer_area" ).delegate( "input.button, select", "keydown", function( e ) {
			// Don't want to go back to exercise dashboard; just do nothing on backspace
			if ( e.keyCode === 8 ) {
				return false;
			}
		} );

		// Prepare for the tester info if requested
		if ( testMode && Khan.query.test != null ) {
			jQuery( "#answer_area" ).prepend(
				'<div id="tester-info" class="info-box">' +
					'<span class="info-box-header">Testing Mode</span>' +
					'<p><strong>Problem No.</strong> <span class="problem-no"></span></p>' +
					'<p><strong>Answer:</strong> <span class="answer"></span></p>' +
					'<p>' +
						'<input type="button" class="pass button green" value="This problem was generated correctly.">' +
						'<input type="button" class="fail button orange" value="There is an error in this problem.">' +
					'</p>' +
				'</div>'
			);

			jQuery( "#tester-info .pass" ).click( function() {
				dataDump.problems[ dataDump.problems.length - 1 ].pass = true;
				nextProblem( 1 );
				jQuery( "#next-question-button" ).trigger( "click" );
			} );

			jQuery( "#tester-info .fail" ).click( function() {
				var description = prompt( "Please provide a short description of the error" );

				// Don't do anything on clicking Cancel
				if ( description == null ) return;

				// we discard the info recorded and record an issue on github instead
				// of testing against the faulty problem's data dump.
				var dump = dataDump.problems.pop(),
					prettyDump = "```js\n" + JSON.stringify( dump ) + "\n```",
					fileName = window.location.pathname.replace(/^.+\//, ""),
					path = fileName + "?problem=" + problemID
						+ "&seed=" + problemSeed;

				var title = encodeURIComponent( "Issue Found in Testing - " + jQuery("title").html() ),
					body = encodeURIComponent( [ description, path, prettyDump, navigator.userAgent ].join("\n\n") ),
					label = encodeURIComponent( "tester bugs" );

				var err = function( problems, dump, desc ) {
					problems.push( dump );
					problems[ problems.length - 1 ].pass = desc;
				};

				var comment = function( id ) {
					// If communication fails with the Sinatra app or Github and a
					// comment isn't created, then we create a test that will always
					// fail.
					jQuery.ajax({
						url: "http://66.220.0.98:2563/file_exercise_tester_bug_comment?id=" + id + "&body=" + body,
						dataType: "jsonp",
						success: function( json ) {
							if ( json.meta.status !== 201 ) {
								err( dataDump.problems, dump, description );
							} else {
								dataDump.issues += 1;
							}
						},
						error: function( json ) {
							err( dataDump.problems, dump, description );
						}
					});
				};

				var newIssue = function() {
					// if communication fails with the Sinatra app or Github and an
					// issue isn't created, then we create a test that will always
					// fail.
					jQuery.ajax({
						url: "http://66.220.0.98:2563/file_exercise_tester_bug?title=" + title + "&body=" + body + "&label=" + label,
						dataType: "jsonp",
						success: function( json ) {
							if ( json.meta.status !== 201 ) {
								err( dataDump.problems, dump, description );
							} else {
								dataDump.issues += 1;
							}
						},
						error: function( json ) {
							err( dataDump.problems, dump, description );
						}
					});
				};

				jQuery.ajax({
					url: "https://api.github.com/repos/PerceptumNL/khan-exercises/issues?labels=tester%20bugs",
					dataType: "jsonp",
					error: function( json ) {
						err( dataDump.problems, dump, description );
					},
					success: function( json ) {
						var copy = false;

						// see if an automatically generated issue for this file
						// already exists
						jQuery.each( json.data, function( i, issue ) {
							if ( encodeURIComponent( issue.title ) === title ) {
								copy = issue.number;
							}
						});

						if ( copy ) {
							comment( copy );
						} else {
							newIssue();
						}
					}
				});

				jQuery( "#next-question-button" ).trigger( "click" );
			} );

			jQuery( document ).keyup( function( e ) {
				if ( e.keyCode === "H".charCodeAt( 0 ) ) {
					jQuery( "#hint" ).click();
				}
				if ( e.keyCode === "Y".charCodeAt( 0 ) ) {
					jQuery( "#tester-info .pass" ).click();
				}
				if ( e.keyCode === "N".charCodeAt( 0 ) ) {
					jQuery( "#tester-info .fail" ).click();
				}
			});
		}

		// Prepare for the debug info if requested
		if ( testMode && Khan.query.debug != null ) {
			jQuery( '<div id="debug"></div>' ).appendTo( "#answer_area" );
		}

		// Register API ajax callbacks for updating UI
		if ( typeof APIActionResults !== "undefined" ) {
			// Display Messages like "You're Proficient" or "You Seem To Be Struggling"
			APIActionResults.register("exercise_state",
				function(userState) {
					var jel = jQuery("#exercise-message-container");
					if (userState.template !== null) {
						jel.empty().append(userState.template);
						setTimeout(function(){ jel.slideDown(); }, 50);
					}
					else {
						jel.slideUp();
					}
				}
			);
		}

		// record a bingo if came here from knowledge map after clicking on green button or dashboard link
		if(document.referrer.indexOf("move_on") > 0 && window.gae_bingo){
			gae_bingo.bingo("clicked_followup");
		}

		// Make scratchpad persistent per-user
		if (user) {
			var lastScratchpad = window.localStorage[ "scratchpad:" + user ];
			if ( typeof lastScratchpad !== "undefined" && JSON.parse( lastScratchpad ) ) {
				Khan.scratchpad.show();
			}
		}
	}

	function setProblemNum( num ) {
		problemNum = num;
		problemSeed = (seedOffset + jumpNum * (problemNum - 1)) % bins;
		problemBagIndex = (problemNum + problemCount - 1) % problemCount;
	}

	function nextProblem( num ) {
		setProblemNum( problemNum + num );
	}

	function prevProblem( num ) {
		nextProblem( -num );
	}

	function drawExerciseState( data ) {
		// drawExerciseState changes the #exercise-icon-container's status to 
		// reflect the current state of the 
		var icon = jQuery("#exercise-icon-container");
		var exerciseStates = data && data.exercise_states;
		if ( exerciseStates ){
			var sPrefix = exerciseStates.summative ? "node-challenge" : "node";
			var src = exerciseStates.review ? "/images/node-review.png" :
					exerciseStates.suggested ? "/images/" + sPrefix + "-suggested.png" :
						exerciseStates.proficient ? "/images/" + sPrefix + "-complete.png" :
							"/images/" + sPrefix + "-not-started.png";
			jQuery("#exercise-icon-container img").attr("src", src);

			icon.addClass("hint" )
				.click(function(){jQuery(this).toggleClass("hint");});

		}
	};

	function prepareUserExercise( data ) {
		// Update the local data store
		updateData( data );
	
		if ( data.exercise ) {
			exerciseName = data.exercise;
		}

		if ( user != null ) {
			// How far to jump through the problems
			jumpNum = primes[ userCRC32 % primes.length ];

			// The starting problem of the user
			seedOffset = userCRC32 % bins;

			// Advance to the current problem seed
			setProblemNum( getData().total_done + 1 );
		}
	}

	function request( method, data, fn, fnError ) {
		if ( testMode ) {
			// Pretend we have success
			if ( jQuery.isFunction( fn ) ) {
				fn();
			}

			return;
		}

		var xhrFields = {};
		if ( typeof XMLHTTPRequest !== "undefined" ) {
			// If we have native XMLHTTPRequest support,
			// make sure cookies are passed along.
			xhrFields["withCredentials"] = true;
		}

		var request = {
			// Do a request to the server API
			url: server + "/api/v1/user/exercises/" + exerciseName + "/" + method,
			type: "POST",
			data: data,
			dataType: "json",
			xhrFields: xhrFields,

			// Backup the response locally, for later use
			success: function( data ) {
				// Update the visual representation of the points/streak
				updateData( data );

				if ( jQuery.isFunction( fn ) ) {
					fn( data );
				}
			},

			// Handle error edge case
			error: fnError
		};

		// Do request using OAuth, if available
		if ( typeof oauth !== "undefined" && jQuery.oauth ) {
			jQuery.oauth( jQuery.extend( {}, oauth, request ) );

		} else {
			jQuery.ajax( request );
		}
	}

	// updateData is used to update some user interface elements as the result of 
	// a page load or after a post / problem attempt. updateData doesn't know if an
	// attempt was successful or not, it's simply reacting to the state of the data 
	// object returned by the server (or window.localStorage for phantom users)
	//
	// It gets called a few times
	// * by prepareUserExercise when it's setting up the exercise state
	// * and then by makeProblem, when a problem is being initialized
	// * when a post to the /api/v1/user/exercises/<exercisename>/attempt succeeds
	//   which just means there was no 500 error on the server
	function updateData( data ) {

		// easeInOutCubic easing from
		// jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
		// (c) 2008 George McGinley Smith, (c) 2001 Robert Penner - Open source under the BSD License.
		jQuery.extend( jQuery.easing, {
			easeInOutCubic: function (x, t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			}
		});

		// Check if we're setting/switching usernames
		if ( data ) {
			user = data.user || user;
			userCRC32 = user != null ? crc32( user ) : null;
			randomSeed = userCRC32 || randomSeed;
		}

		// Make sure we have current data
		var oldData = getData();

		// Change users, if needed
		if ( data && (data.total_done >= oldData.total_done || data.user !== oldData.user) ) {
			// Cache the data locally
			if ( user != null ) {
				window.localStorage[ "exercise:" + user + ":" + exerciseName ] = JSON.stringify( data );
			}

		// If no data is provided then we're just updating the UI
		} else {
			data = oldData;
		}

		// Update the streaks/point bar
		var streakMaxWidth = jQuery(".streak-bar").width(),

			// Streak and longest streak pixel widths
			streakWidth = Math.min(Math.ceil(streakMaxWidth * data.progress), streakMaxWidth);

		if ( data.summative ) {
			jQuery( ".summative-help ")
				.find( ".summative-required-streaks" ).text( data.num_milestones ).end()
				.show();

			if ( jQuery( ".level-label" ).length === 0 ) {

				// Split summative streak bar into levels
				var levels = [];
				var levelCount = data.num_milestones;
				for ( var i = 1; i < levelCount; i++ ) {

					// Individual level pixels
					levels[ levels.length ] = Math.ceil(i * ( streakMaxWidth / levelCount ));

				}

				jQuery.each(levels, function( index, val ) {
					jQuery( ".best-label" ).after( jQuery("<li class='level-label' ></li>").css({ "left":val }) );
				});

			}
		}

		jQuery(".current-rating").animate({"width":( streakWidth ) }, 365, "easeInOutCubic");
		jQuery(".streak-icon").css({width:"100%"});
		jQuery(".streak-bar").toggleClass("proficient", data.progress >= 1.0);

		drawExerciseState( data );

		var videos = data && data.exercise_model.related_videos;
		if ( videos && videos.length &&
			jQuery(".related-video-list").is(":empty") &&
			typeof ModalVideo !== "undefined"
		) {
			displayRelatedVideos(videos);
			ModalVideo && ModalVideo.hookup();
		}
	}

	function displayRelatedVideos( videos ) {

		var displayRelatedVideoInHeader = function(i, video) {
			var needComma = i < videos.length - 1;
			var li = jQuery( "<li>" ).append("<a href='"+Khan.relatedVideoHref(video)+"'><img src='http://img.youtube.com/vi/"+video.youtube_id+"/hqdefault.jpg' width='' height='' alt='"+video.title+"'/></a>");
			jQuery( ".related-content > .related-video-list" ).append( li ).show();
			jQuery( "#related-video-list,#related-video-list>*,#related-video-list>ul>li>a" ).show();
		};

		var displayRelatedVideoInSidebar = function(i, video) {
			var thumbnailDiv = jQuery("#thumbnail-tmpl").tmpl({
				href: Khan.relatedVideoHref(video),
				video: video
			}).find('a.related-video').data('video', video).end();

			var inlineLink = jQuery("<a href='"+Khan.relatedVideoHref(video)+"' alt='"+video.title+"'><img src='http://img.youtube.com/vi/"+video.youtube_id+"/hqdefault.jpg' width='120px' height='60px'/></a>");

			var sideBarLi = jQuery( "<li>" )
				.append( inlineLink )
				.append( thumbnailDiv );

			jQuery( "#related-video-list .related-video-list" ).append( sideBarLi );
		};

		if ( jQuery.tmpl ) {
			jQuery.each(videos, displayRelatedVideoInHeader);
			jQuery.each(videos, displayRelatedVideoInSidebar);
			jQuery( ".related-content, .related-video-box" ).show();
		}

		// make caption slide up over the thumbnail on hover
		var captionHeight = 45;
		var defaultMarginTop = 23;
		// queue:false to make sure these run simultaneously
		var animationOptions = {duration: 150, queue: false};
		jQuery( ".thumbnail" ).hover(
			function() {
				jQuery( this )
					.find( ".thumbnail_label" ).animate(
						{ marginTop: defaultMarginTop },
						animationOptions
					).end()
					.find( ".thumbnail_teaser" ).animate(
						{ height: captionHeight },
						animationOptions
					);
			},
			function() {
				jQuery( this )
					.find( ".thumbnail_label" ).animate(
						{ marginTop: defaultMarginTop + captionHeight },
						animationOptions
					).end()
					.find( ".thumbnail_teaser" ).animate(
						{ height: 0 },
						animationOptions
					);
			}
		);
	};

	// Grab the cached UserExercise data from local storage
	function getData() {
		// If we're viewing a problem, ignore local storage and return the userExercise blob
		if ( typeof userExercise !== "undefined" && userExercise.read_only ) {
			return userExercise;

		} else {
			var data = window.localStorage[ "exercise:" + user + ":" + exerciseName ];

			// Parse the JSON if it exists
			if ( data ) {
				return JSON.parse( data );

			// Otherwise we contact the server
			} else {
				return {
					total_done: 0,
					total_correct: 0,
					streak: 0,
					longest_streak: 0,
					next_points: 225,
					exercise_model: {
						summative: isSummative
					}
				};
			}
		}
	}

	function loadExercise() {
		var self = jQuery( this );
		var name = self.data( "name" );
		var weight = self.data( "weight" );

		remoteCount++;
		jQuery.get( urlBase + "exercises/" + name + ".html", function( data, status, xhr ) {
			var match, newContents;

			if ( !( /success|notmodified/ ).test( status ) ) {
				// Maybe loading from a file:// URL?
				Khan.error( "Error loading exercise from file " + name + ".html: " + xhr.status + " " + xhr.statusText );
				return;
			}

			// Wrap everything in <pre> tags to keep IE from removing newlines
			data = data.replace( /(<body[^>]*>)/, "$1<pre>" ).replace( "</body>", "</pre></body>" );
			newContents = jQuery( data ).find( "div.exercise" );
			self.replaceWith( newContents );

			// Maybe the exercise we just loaded loads some others
			newContents.find( ".exercise[data-name]" ).each( loadExercise );

			//Tokenreplace

			var langfile = ( Translate.production ? "/khan-exercises/exercises/" : "" ) + name + ".lang.js";
			var translation = Translate.getTranslation(langfile, name);
			if(translation && translation[Translate.lang]){
				newContents.find('[data-tt]').each(function(){
					token = $(this).attr('data-tt');
					if(translation[Translate.lang][token]){
						$(this).html(translation[Translate.lang][token]);
					}
				})
			}

			// Save the filename and weights
			newContents.filter( ".exercise" ).data( "name", name );
			newContents.filter( ".exercise" ).data( "weight", weight );

			// Extract data-require
			var requires = data.match( /<html(?:[^>]+)data-require=(['"])((?:(?!\1).)*)\1/ );

			if ( requires != null ) {
				requires = requires[ 2 ];
			}

			Khan.require( requires );

			// Extract title
			var rtitle = /<title>([^<]*(?:(?!<\/title>)<[^<]*)*)<\/title>/gi;
			while ( ( match = rtitle.exec( data ) ) != null ) {
				newContents.filter( ".exercise" ).data( "title", match[1] );
			}

			// Extract scripts with no src
			var rscript = /<(?:)script\b[^s>]*(?:(?!src=)s[^s>]*)*>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/gi;
			while ( ( match = rscript.exec( data ) ) != null ) {
				jQuery.globalEval( match[1] );
			}

			remoteCount--;
			if ( remoteCount === 0 ) {
				loadModules();
			}
		});
	}

	function loadModules() {

		// Load module dependencies
		Khan.loadScripts( jQuery.map( Khan.modules, function( mod, name ) {
			return mod;
		}), function() {

			jQuery(function() {
				// Inject the site markup, if it doesn't exist
				if ( jQuery("#answer_area").length === 0 ) {
					jQuery.ajax( {
						url: urlBase + "exercises/khan-site.html",
						dataType: "html",
						success: function( html ) {

							jQuery.ajax( {
								url: urlBase + "exercises/khan-exercise.html",
								dataType: "text",
								success: function( htmlExercise ) {

									handleInject( html, htmlExercise );

								}
							});

						}
					});
				} else {
					postInject();
				}
			});
		});

		function handleInject( html, htmlExercise ) {
			injectSite( html, htmlExercise );
			postInject();
		}

		function postInject() {

			prepareSite();

			// Prepare the "random" problems
			if ( !testMode || !Khan.query.problem ) {
				var problems = exercises.children( ".problems" ).children();

				weighExercises( problems );
				problemBag = makeProblemBag( problems, 10 );
			}

			// Generate the initial problem when dependencies are done being loaded
			var answerType = makeProblem();
		}
	}

	if ( typeof userExercise !== "undefined" && userExercise.tablet ) {
		Khan.loadExercise = loadExercise;
		Khan.prepareUserExercise = prepareUserExercise;
	}

	return Khan;

})();

// Make this publicly accessible
var KhanUtil = Khan.Util;;
jQuery.extend( KhanUtil, {
	commonAngles: [
		{deg: 15, rad: "\\frac{\\pi}{12}"},
		{deg: 30, rad: "\\frac{\\pi}{6}"},
		{deg: 45, rad: "\\frac{\\pi}{4}"},
		{deg: 60, rad: "\\frac{\\pi}{3}"},
		{deg: 90, rad: "\\frac{\\pi}{2}"},
		{deg: 120, rad: "\\frac{2\\pi}{3}"},
		{deg: 135, rad: "\\frac{3\\pi}{4}"},
		{deg: 150, rad: "\\frac{5\\pi}{6}"},
		{deg: 180, rad: "\\pi"},
		{deg: 210, rad: "\\frac{7\\pi}{6}"},
		{deg: 225, rad: "\\frac{5\\pi}{4}"},
		{deg: 240, rad: "\\frac{4\\pi}{3}"},
		{deg: 270, rad: "\\frac{3\\pi}{2}"},
		{deg: 300, rad: "\\frac{5\\pi}{3}"},
		{deg: 315, rad: "\\frac{7\\pi}{4}"},
		{deg: 330, rad: "\\frac{11\\pi}{6}"},
		{deg: 360, rad: "2\\pi"}
	],

	// Convert a degree value to a radian value
	toRadians: function( degrees ) {
		return degrees * Math.PI / 180;
	},

	wrongCommonAngle: function( angleIdx, i ) {
		// i is a value from 1 to 3
		return KhanUtil.commonAngles[ (angleIdx + (4 * i)) % KhanUtil.commonAngles.length ];
	},

	wrongDegrees: function( degrees ) {
		var offset;
		var wrong;

		do {
			offset = KhanUtil.randRange( 10, 35 );
			if (KhanUtil.rand(2)) {
				offset *= -1;
			}

			wrong = degrees + offset;
		} while ( !(wrong >= 0 && wrong <= 360) );

		return wrong;
	},

	wrongRadians: function( radians ) {
		var offset;
		var wrong;

		do {
			offset = KhanUtil.randRange( 10, 35 ) / 100;
			if (KhanUtil.rand(2)) {
				offset *= -1;
			}

			wrong = KhanUtil.roundTo( 2, radians + offset );
		} while ( !(wrong >= 0 && wrong <= 2 * Math.PI) );

		return wrong;
	}
});
;
(function() {

var inexactMessages = {
	unsimplified: "Je antwoord is bijna goed, maar moet vereenvoudigd worden.",
	missingPercentSign: "Je antwoord is bijna goed, maar het <code>\\%</code> ontbreekt."
};

Khan.answerTypes = Khan.answerTypes || {};

jQuery.extend( Khan.answerTypes, {
	text: function( solutionarea, solution, fallback, verifier, input ) {
		if ( !input ) {
			input = jQuery('<input type="text">');
		}
		
		jQuery( solutionarea ).append( input );

		var correct = typeof solution === "object" ? jQuery( solution ).text() : solution;

		if ( verifier == null ) {
			verifier = function( correct, guess ) {
				correct = jQuery.trim( correct );
				guess = jQuery.trim( guess );
				return correct === guess;
			};
		}

		var ret = function() {
			// we want the normal input if it's nonempty, the fallback converted to a string if
			// the input is empty and a fallback exists, and the empty string if the input
			// is empty and the fallback doesn't exist.
			var val = input.val().length > 0 ?
				input.val() :
				(typeof fallback !== "undefined") ?
					fallback + "" :
					"";

			ret.guess = input.val();

			return verifier( correct, val );
		};
		ret.solution = jQuery.trim( correct );
		ret.examples = verifier.examples || [];
		ret.showGuess = function( guess ) {
			input.val( guess );
		};
		return ret;
	},


	graphic: function( solutionarea, solution, fallback ) {
			var verifier = function( correct, guess ){
					return Math.abs( correct - guess ) < 0.3;
				}
		return Khan.answerTypes.text( solutionarea, solution, fallback, verifier );
	},

	line: function( solutionarea, solution, fallback ) {

		var verifier = function( correct, guess ){
			var result = true;
			for ( var i = 0; i < 5; i++ ){
				var sampleX = KhanUtil.randRange( -100, 100 );
				if ( guess.match(/[A-W]|[a-w]|[y-z]|[Y-Z]/) !== null ){
					return false;
				}

				var newGuess = guess
						.replace( /\u2212/, "-" )
						.replace( /(\d)(x)/, "€1 * €2" )
						.replace( "x", sampleX )
						.replace( /(\d)(\()/, "€1 * €2" );
				var newCorrect = correct
						.replace( /(\d)(x)/, "€1 * €2" )
						.replace( "x", sampleX )
						.replace( /(\d)(\()/, "€1 * €2" )
						.replace( /-\s?-/, "");
				result = result &&  ( eval( newCorrect ) === eval( newGuess ) ) ;
			}
			return result;
		};
		verifier.examples = "Een vergelijking van een lijn, zoals 3(x+1)/2 of 2x + 1";
		return Khan.answerTypes.text( solutionarea, solution, fallback, verifier );

	},


	number: function( solutionarea, solution, fallback, accForms ) {
		var options = jQuery.extend({
			simplify: "required",
			ratio: false,
			maxError: Math.pow( 2, -42 ),
			forms: "literal, integer, proper, improper, mixed, decimal"
		}, jQuery( solution ).data());
		var acceptableForms = ( accForms || options.forms ).split(/\s*,\s*/);

		var fractionTransformer = function( text ) {
			text = text

				// Replace unicode minus sign with hyphen
				.replace( /\u2212/, "-" )

				// Remove space after +, -
				.replace( /([+-])\s+/g, "$1" )

				// Remove leading/trailing whitespace
				.replace(/(^\s*)|(\s*$)/gi,"");

				// Extract numerator and denominator
			var match = text.match( /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/ );
			var parsedInt = parseInt( text, 10 );

			if ( match ) {
				var num = parseFloat( match[1] ),
					denom = parseFloat( match[2] );
				var simplified = denom > 0 &&
					( options.ratio || match[2] !== "1" ) &&
					KhanUtil.getGCD( num, denom ) === 1;
				return [ {
					value: num / denom,
					exact: simplified
				} ];
			} else if ( !isNaN( parsedInt ) && "" + parsedInt === text ) {
				return [ {
					value: parsedInt,
					exact: true
				} ];
			}

			return [];
		};

		var forms = {
			literal: {
				transformer: function( text ) {
					// Prevent literal comparisons for decimal-looking-like strings
					return [{ value: ( /[^+-\u2212\d\.\s]/ ).test( text ) ? text : null }];
				}
			},

			integer: {
				transformer: function( text ) {
					return forms.decimal.transformer( text );
				},
				example: "een geheel getal, zoals bijv. <code>6</code>"
			},

			proper: {
				transformer: function( text ) {
					return jQuery.map( fractionTransformer( text ), function( o ) {
						if ( Math.abs(o.value) < 1 ) {
							return [o];
						} else {
							return [];
						}
					} );
				},
				example: (function() {
					if ( options.simplify === "optional" ) {
						return "een <em>breuk</em>, zoals <code>1/2</code> of <code>6/10</code>";
					} else {
						return "een <em>vereenvoudigde</em> breuk, zoals <code>3/5</code>";
					}
				})()
			},

			improper: {
				transformer: function( text ) {
					return jQuery.map( fractionTransformer( text ), function( o ) {
						if ( Math.abs(o.value) >= 1 ) {
							return [o];
						} else {
							return [];
						}
					} );
				},
				example: (function() {
					if ( options.simplify === "optional" ) {
						return "an <em>improper</em> fraction, like <code>10/7</code> or <code>14/8</code>";
					} else {
						return "a <em>simplified improper</em> fraction, like <code>7/4</code>";
					}
				})()
			},

			pi: {
				transformer: function( text ) {
					var match, possibilities = [];

					// Replace unicode minus sign with hyphen
					text = text.replace( /\u2212/, "-" );

					// - pi
					if ( match = text.match( /^([+-]?)\s*(?:pi?|\u03c0)$/i ) ) {
						possibilities = [ { value: parseFloat( match[1] + "1" ), exact: true } ];

					// 5 / 6 pi
					} else if ( match = text.match( /^([+-]?\d+\s*(?:\/\s*[+-]?\d+)?)\s*\*?\s*(?:pi?|\u03c0)$/i ) ) {
						possibilities = fractionTransformer( match[1] );

					// 5 pi / 6
					} else if ( match = text.match( /^([+-]?\d+)\s*\*?\s*(?:pi?|\u03c0)\s*(?:\/\s*([+-]?\d+))?$/i ) ) {
						possibilities = fractionTransformer( match[1] + match[2] );

					// - pi / 4
					} else if ( match = text.match( /^([+-]?)\s*\*?\s*(?:pi?|\u03c0)\s*(?:\/\s*([+-]?\d+))?$/i ) ) {
						possibilities = fractionTransformer( match[1] + "1/" + match[2] );

					// 0
					} else if ( text === "0") {
						possibilities = [ { value: 0, exact: true } ];

					// 0.5 pi (fallback)
					} else if ( match = text.match( /^(\S+)\s*\*?\s*(?:pi?|\u03c0)$/i ) ) {
						possibilities = forms.decimal.transformer( match[1] );
					}

					jQuery.each( possibilities, function( ix, possibility ) {
						possibility.value *= Math.PI;
					} );
					return possibilities;
				},
				example: "een veelvoud van pi, bijv. <code>12\\ \\text{pi}</code> of <code>2/3\\ \\text{pi}</code>"
			},

			// simple log( c ) form
			log: {
				transformer: function( text ) {
					var match, possibilities = [];

					// Replace unicode minus sign with hyphen
					text = text.replace( /\u2212/, "-" );

					if ( match = text.match( /^log\(\s*(\S+)\s*\)$/i ) ) {
						possibilities = forms.decimal.transformer( match[1] );
					} else if ( text === "0") {
						possibilities = [ { value: 0, exact: true } ];
					}
					return possibilities;
				},
				example: "an expression, bijv. <code>\\log(100)</code>"
			},

			percent: {
				transformer: function( text ) {
					text = jQuery.trim( text );
					var hasPercentSign = false;

					if ( text.indexOf( "%" ) === ( text.length - 1 ) ) {
						text = jQuery.trim( text.substring( 0, text.length - 1) );
						hasPercentSign = true;
					}

					var transformed = forms.decimal.transformer( text );
					jQuery.each( transformed, function( ix, t ) {
						t.exact = hasPercentSign;
					});
					return transformed;
				},
				example: "een percentage, bijv. <code>12.34\\%</code>"
			},

			dollar: {
				transformer: function( text ) {
					text = jQuery.trim( text ).replace( '$', '' );

					return forms.decimal.transformer( text );
				},
				example: "een geldbedrag, bijv. <code>&euro;2,75</code>"
			},

			mixed: {
				transformer: function( text ) {
					var match = text
						// Replace unicode minus sign with hyphen
						.replace( /\u2212/, "-" )

						// Remove space after +, -
						.replace( /([+-])\s+/g, "&euro;1" )

						// Extract integer, numerator and denominator
						.match( /^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/ );

					if ( match ) {
						var sign  = parseFloat( match[1] + "1" ),
							integ = parseFloat( match[2] ),
							num   = parseFloat( match[3] ),
							denom = parseFloat( match[4] );
						var simplified = num < denom && KhanUtil.getGCD( num, denom ) === 1;

						return [ {
							value: sign * ( integ + num / denom ),
							exact: simplified
						} ];
					}

					return [];
				},
				example: "a mixed number, like <code>1\\ 3/4</code>"
			},

			decimal: {
				transformer: function( text ) {
					var normal = function( text ) {
						var match = text

							// Replace unicode minus sign with hyphen
							.replace( /\u2212/, "-" )

							// Remove space after +, -
							.replace( /([+-])\s+/g, "$1" )

							// Remove commas
							.replace( /,\s*/g, "" )

							// Extract integer, numerator and denominator
							// This matches [+-]?\.; will f
							.match( /^([+-]?(?:\d+\.?|\d*\.\d+))$/ );

						if ( match ) {
							var x = parseFloat( match[1] );

							if ( options.inexact === undefined ) {
								var factor = Math.pow( 10, 10 );
								x = Math.round( x * factor ) / factor;
							}

							return x;
						}
					};

					var commas = function( text ) {
						text = text.replace( /([\.,])/g, function( _, c ) { return ( c === "." ? "," : "." ); } );
						return normal( text );
					};

					return [
						{ value: normal( text ), exact: true },
						{ value: commas( text ), exact: true }
					];
				},
				example: (function() {
					if ( options.inexact === undefined ) {
						return "een <em>decimaal</em>, bijv. <code>0,75</code>";
					} else {
						return "een decimaal, zoals <code>0,75</code>";
					}
				})()
			}
		};

		var verifier = function( correct, guess ) {
			correct = jQuery.trim( correct );
			guess = jQuery.trim( guess );

			var correctFloat = parseFloat( correct );
			var ret = false;

			jQuery.each( acceptableForms, function( i, form ) {
				var transformed = forms[ form ].transformer( jQuery.trim( guess ) );

				for ( var j = 0, l = transformed.length; j < l; j++ ) {
					var val = transformed[ j ].value;
					var exact = transformed[ j ].exact;

					if ( typeof val === "string" &&
							correct.toLowerCase() === val.toLowerCase() ) {
						ret = true;
						return false; // break;
					} if ( typeof val === "number" &&
							Math.abs( correctFloat - val ) < options.maxError ) {
						if ( exact || options.simplify === "optional" ) {
							ret = true;
						} else if ( form === "percent" ){
							ret = inexactMessages.missingPercentSign;
						} else {
							ret = inexactMessages.unsimplified;
						}

						return false; // break;
					}
				}
			} );

			return ret;
		};

		verifier.examples = [];
		jQuery.each( acceptableForms, function( i, form ) {
			if ( forms[ form ] != null && forms[ form ].example != null ) {
				verifier.examples.push( forms[ form ].example );
			}
		});
		
		var input;
		
		if ( typeof userExercise !== "undefined" && userExercise.tablet ) {
			input = jQuery("<input type='number'/>");
		}

		return Khan.answerTypes.text( solutionarea, solution, fallback, verifier, input );
	},

	regex: function( solutionarea, solution, fallback ) {
		var verifier = function( correct, guess ) {
			return jQuery.trim( guess ).match( correct ) != null;
		};

		return Khan.answerTypes.text( solutionarea, solution, fallback, verifier );
	},

	decimal: function( solutionarea, solution, fallback ) {
		return Khan.answerTypes.number( solutionarea, solution, fallback, "decimal" );
	},

	rational: function( solutionarea, solution, fallback ) {
		return Khan.answerTypes.number( solutionarea, solution, fallback, "integer, proper, improper, mixed" );
	},

	// A little bit of a misnomer as proper fractions are also accepted
	improper: function( solutionarea, solution, fallback ) {
		return Khan.answerTypes.number( solutionarea, solution, fallback, "integer, proper, improper" );
	},

	mixed: function( solutionarea, solution, fallback ) {
		return Khan.answerTypes.number( solutionarea, solution, fallback, "integer, proper, mixed" );
	},

	radical: function( solutionarea, solution ) {
		var options = jQuery.extend({
			simplify: "required"
		}, jQuery( solution ).data());
		var ansSquared = parseFloat( jQuery( solution ).text() );
		var ans = KhanUtil.splitRadical( ansSquared );

		var inte = jQuery( "<span>" ), inteGuess, rad = jQuery( "<span>" ), radGuess;

		var inteValid = Khan.answerTypes.text( inte, null, "1", function( correct, guess ) { inteGuess = guess; } );
		var radValid = Khan.answerTypes.text( rad, null, "1", function( correct, guess ) { radGuess = guess; } );

		solutionarea.addClass( "radical" )
			.append( inte )
			.append( '<span class="surd">&radic;</span>')
			.append( rad.addClass( "overline" ) );

		var ret = function() {
			// Load entered values into inteGuess, radGuess
			inteValid();
			radValid();

			inteGuess = parseFloat( inteGuess );
			radGuess = parseFloat( radGuess );

			ret.guess = [ inteGuess, radGuess ];

			var simplified = inteGuess === ans[0] && radGuess === ans[1];
			var correct = Math.abs( inteGuess ) * inteGuess * radGuess === ansSquared;

			if ( correct ) {
				if ( simplified || options.simplify === "optional" ) {
					return true;
				} else {
					return inexactMessages.unsimplified;
				}
			} else {
				return false;
			}
		};
		if ( options.simplify === "required" ) {
			ret.examples = [ "a simplified radical, like <code>\\sqrt{2}</code> or <code>3\\sqrt{5}</code>" ];
		} else {
			ret.examples = [ "a radical, like <code>\\sqrt{8}</code> or <code>2\\sqrt{2}</code>" ];
		}
		ret.solution = ans;
		ret.showGuess = function( guess ) {
			inteValid.showGuess( guess ? guess[0] : '' );
			radValid.showGuess( guess ? guess[1] : '' );
		};
		return ret;
	},

	multiple: function( solutionarea, solution ) {
		solutionarea = jQuery( solutionarea );
		// here be dragons
		solutionarea.append( jQuery( solution ).clone().contents().tmpl() );

		var solutionArray = [];

		solutionarea.find( ".sol" ).each(function() {
			var type = jQuery( this ).data( "type" );
			type = type != null ? type : "number";

			var sol = jQuery( this ).clone(),
				solarea = jQuery( this ).empty();

			var fallback = sol.data( "fallback" ),
				validator = Khan.answerTypes[type]( solarea, sol, fallback );

			jQuery( this ).data( "validator", validator );
			solutionArray.unshift( validator.solution );
		});

		var ret = function() {
			var valid = true,
				guess = [];

			solutionarea.find( ".sol" ).each(function() {
				var validator = jQuery( this ).data( "validator", validator );

				if ( validator != null ) {
					// Don't short-circuit so we can record all guesses
					valid = validator() && valid;

					guess.push( validator.guess );
				}
			});

			ret.guess = guess;

			return valid;
		};

		ret.showGuess = function( guess ) {
			guess = jQuery.extend( true, [], guess );

			solutionarea.find( ".sol" ).each(function() {
				var validator = jQuery( this ).data( "validator", validator );

				if ( validator != null ) {
					// Shift regardless of whether we can show the guess
					var next = guess.shift();

					if ( typeof validator.showGuess === "function" ) {
						validator.showGuess( next );
					}
				}
			});
		};

		ret.showCustomGuess = function( guess ) {
			guess = jQuery.extend( true, [], guess );

			solutionarea.find( ".sol" ).each(function() {
				var validator = jQuery( this ).data( "validator", validator );

				if ( validator != null ) {
					// Shift regardless of whether we can show the interactive guess
					var next = guess.shift();

					if ( jQuery.isFunction( validator.showCustomGuess ) ) {
						validator.showCustomGuess( next );
					}
				}
			});
		};

		ret.examples = solutionarea.find( ".example" ).remove()
			.map(function(i, el) {
				return jQuery( el ).html();
			});
		ret.solution = solutionArray;

		return ret;
	},

	set: function( solutionarea, solution ) {
		var solutionarea = jQuery( solutionarea ),
			showUnused = (jQuery( solution ).data( "showUnused" ) === true);
		solutionarea.append(jQuery(solution).find(".input-format").clone().contents().tmpl());

		var validatorArray = [],
			solutionArray = [],
			inputArray = [];
			checkboxArray = [];

		// Fill validatorArray[] with validators for each acceptable answer
		jQuery(solution).find(".set-sol").clone().each(function() {
			var type = jQuery( this ).data( "type" );
			type = type != null ? type : "number";
			// We don't want the validators to build the solutionarea. The point
			// here is to decouple the UI from the validator. Passing null
			// generally works.
			var solarea = null;
			if (type == "multiple") {
				// Multiple is special. It has dragons that don't like null. This distracts them.
				solarea = jQuery( this ).clone().empty();
			}
			var sol = jQuery( this ).clone(),
				fallback = sol.data( "fallback" ),
				validator = Khan.answerTypes[type]( solarea, sol, fallback );

			validatorArray.push(validator);
			solutionArray.push(validator.solution);
		});


		// Create throwaway validators for each "entry" on the answer form
		// and store the resulting UI fragments in inputArray[]
		solutionarea.find( ".entry" ).each(function() {
			var input = jQuery( this ),
				type = jQuery( this ).data( "type" );
			type = type != null ? type : "number";

			// We're just using this validator to paint the UI, so we pass it a bogus solution.
			Khan.answerTypes[type]( input, jQuery(this).clone().empty(), null );
			inputArray.push(jQuery(input).find(":input"));
		});

		// Also keep track of any checkboxes
		solutionarea.find( ".checkbox" ).each(function() {
			var sol = jQuery( this ).clone();
			var solarea = jQuery( this ).empty(),
				input = jQuery( '<input type="checkbox"/>' );
			solarea.append( input );
			var solution = KhanUtil.tmpl.getVAR( sol.text() );
			jQuery( input ).data( "solution", solution );
			checkboxArray.push( input );
			solutionArray.push( solution );
		});

		var ret = function() {
			var valid = true,
				// Make a copy of the validators, so we can delete each as it's used
				unusedValidators = validatorArray.slice(0),
				allguesses = [];

			// iterate over each input area
			jQuery( inputArray ).each( function() {
				var guess = [],
					correct = false,
					validatorIdx = 0;

				// Scrape the raw inputs out of the UI elements
				jQuery( this ).each( function() {
					guess.push( jQuery( this ).val() );
				});

				if (guess.length == 1) {
					allguesses.push( guess[0] );
				} else {
					allguesses.push( guess );
				}

				// Iterate over each validator
				while (validatorIdx < unusedValidators.length && !correct) {
					// Push the actual guess into the validator's hidden input
					unusedValidators[validatorIdx].showGuess( guess );
					// And validate it
					correct = unusedValidators[validatorIdx]();
					++validatorIdx;
				}

				if (correct) {
					// remove the matching validator from the list so duplicate inputs don't match
					unusedValidators.splice(validatorIdx-1, 1);
				} else if (jQuery.trim( guess.join( "" ) ) !== "") {
					// Not correct and not empty; the entire answer is wrong :(
					valid = false;
				}

			});

			if ((validatorArray.length > inputArray.length)) {
				// if there are more valid answers than inputs, make sure that as many answers as possible were entered
				if (unusedValidators.length > validatorArray.length - inputArray.length) {
					valid = false;
				}
			// otherwise, make sure every possible answer was entered
			} else if (unusedValidators.length > 0) {
				valid = false;
			}

			// now check that all the checkboxes are selected appropriately
			jQuery( checkboxArray ).each( function() {
				var guess = jQuery( this ).is( ":checked" ),
					answer = jQuery( this ).data( "solution" ),
					label_text = jQuery( this ).closest( "label" ).text();
				if (label_text == "") {
					label_text = "checked";
				}
				// un-checked boxes are recorded as "" to prevent the question from
				// being graded if submit is clicked before anything is entered
				allguesses.push( guess ? label_text : "" );
				if ( guess != answer ) {
					valid = false;
				}
			});

			ret.guess = allguesses;

			// If data-show-unused="true" is set and the question was answered correctly,
			// show the list of additional answers (if any) that would also have been accepted.
			//
			// TODO: Ideally this should be shown below the green button so the button doesn't jump around.
			//       perhaps reuse the check-answer-message area
			if (showUnused && valid && unusedValidators.length) {
				var otherSolutions = jQuery( "<p>" ).appendTo(solutionarea);
				jQuery( unusedValidators ).each( function( i, el ) {
					other_solution = el.solution;
					if (i > 0) {
						jQuery( "<span>" ).text(" and ").appendTo( otherSolutions );
					}
					jQuery.each( other_solution, function( i, el ) {
						if (jQuery.isArray( el )) {
							var subAnswer = jQuery( "<span>" ).appendTo( otherSolutions );
							jQuery.each( el, function( i, el ) {
								jQuery( "<span>" ).text( el + " " ).appendTo( subAnswer );
							} );
						} else {
							jQuery( "<span> " ).text( el + " " ).appendTo( otherSolutions );
						}
					} );
				});
				if (unusedValidators.length == 1) {
					jQuery( "<span>" ).text(" is also correct").appendTo( otherSolutions );
				} else {
					jQuery( "<span>" ).text(" are also correct").appendTo( otherSolutions );
				}
			}

			return valid;
		};

		ret.showGuess = function( guess ) {
			guess = jQuery.extend( true, [], guess );
			jQuery( inputArray ).each(function() {
				var item = guess.shift();
				if ( item instanceof Array ) {
					jQuery( this ).each( function() {
						jQuery(this).val( item.shift() );
					});
				} else {
					this.val( item );
				}
			});
			solutionarea.find( ".checkbox input:checkbox" ).each(function() {
				var ans = guess.shift();
				jQuery( this ).attr('checked', ans !== undefined && ans !== "");
			});
		};

		ret.examples = solution.find( ".example" ).remove()
			.map(function(i, el) {
				return jQuery( el ).html();
			});
		ret.solution = solutionArray;

		return ret;
	},

	radio: function( solutionarea, solution ) {
		var extractRawCode = function( solution ) {
			return jQuery( solution ).find('.value').clone()
				.find( ".MathJax" ).remove().end()
				.find( "code" ).removeAttr( "id" ).end()
				.html();
		};
		// Without this we get numbers twice and things sometimes
		var solutionText = extractRawCode( solution );

		var list = jQuery("<ul></ul>");
		jQuery( solutionarea ).append(list);

		// Get all of the wrong choices
		var choices = jQuery( solution ).siblings( ".choices" );

		// Set number of choices equal to all wrong plus one correct
		var numChoices = choices.children().length + 1;
		// Or set number as specified
		if ( choices.data("show") ) {
			numChoices = parseFloat( choices.data("show") );
		}

		// Optionally include none of the above as a choice
		var showNone = choices.data("none");
		var noneIsCorrect = false;
		if ( showNone ) {
			noneIsCorrect = KhanUtil.rand(numChoices) === 0;
			numChoices -= 1;
		}

		// If a category exercise, the correct answer is already included in .choices
		// and choices are always presented in the same order
		var isCategory = choices.data("category");
		var possibleChoices = choices.children().get();
		if ( isCategory ) {
			numChoices -= 1;
		} else {
			possibleChoices = KhanUtil.shuffle( possibleChoices );
		}

		// Add the correct answer
		if( !noneIsCorrect && !isCategory) {
			jQuery( solution ).data( "correct", true );
		}

		// Insert correct answer as first of possibleChoices
		if ( !isCategory ) {
			possibleChoices.splice( 0, 0, solution );
		}

		var dupes = {};
		var shownChoices = [];
		var solutionTextSquish = solution.text().replace(/\s+/g, "");
		for ( var i = 0; i < possibleChoices.length && shownChoices.length < numChoices; i++ ) {
			var choice = jQuery( possibleChoices[i] );
			choice.runModules();
			var choiceTextSquish = choice.text().replace(/\s+/g, "");

			if ( isCategory && solutionTextSquish === choiceTextSquish ) {
				choice.data( "correct", true );
			}

			if ( !dupes[ choiceTextSquish ] ) {
				dupes[ choiceTextSquish ] = true;

				// i == 0 is the solution except in category mode; skip it when none is correct
				if ( !( noneIsCorrect && i === 0 ) || isCategory ) {
					shownChoices.push( choice );
				}
			}
		}

		if( shownChoices.length < numChoices ) {
			return false;
		}

		if ( !isCategory ) {
			shownChoices = KhanUtil.shuffle( shownChoices );
		}

		if( showNone ) {
			var none = jQuery( "<span>Geen van allen.</span>" );

			if( noneIsCorrect ) {
				none.data( "correct", true );
				solutionText = none.text();
				list.data( "real-answer",
						jQuery( solution ).runModules()
							.contents()
							.wrapAll( '<span class="value""></span>' )
							.parent() );
			}

			shownChoices.push( none );
		}

		jQuery.each(shownChoices, function( i, choice ) {
			var correct = choice.data( "correct" );
			choice.contents().wrapAll( '<li><label><span class="value"></span></label></li>' )
				.parent().before( '<input type="radio" name="solution" value="' + (correct ? 1 : 0) + '">' )
				.parent().parent()
				.appendTo(list);
		});

		var ret = function() {
			var choice = list.find("input:checked");

			if ( noneIsCorrect && choice.val() === "1") {
				choice.next()
					.fadeOut( "fast", function() {
						jQuery( this ).replaceWith( list.data( "real-answer" ) )
							.fadeIn( "fast" );
					});
			}

			ret.guess = jQuery.trim( extractRawCode(choice.closest("li")) );

			return choice.val() === "1";
		};
		ret.solution = jQuery.trim( solutionText );
		ret.showGuess = function( guess ) {
			list.find( 'input:checked' ).prop( 'checked', false);

			var li = list.children().filter( function() {
				return jQuery.trim( extractRawCode(this) ) === guess;
			} );
			li.find( "input[name=solution]" ).prop( "checked", true );
		};
		return ret;
	},

	list: function( solutionarea, solution ) {
		var input = jQuery("<select></select>");
		jQuery( solutionarea ).append( input );

		var choices = jQuery.tmpl.getVAR( jQuery( solution ).data("choices") );

		jQuery.each( choices, function(index, value) {
			input.append('<option value="' + value + '">'
				+ value + '</option>');
		});

		var correct = jQuery( solution ).text();

		var verifier = function( correct, guess ) {
			correct = jQuery.trim( correct );
			guess = jQuery.trim( guess );
			return correct === guess;
		};

		var ret = function() {
			ret.guess = input.val();

			return verifier( correct, ret.guess );
		};

		ret.solution = jQuery.trim( correct );

		ret.showGuess = function( guess ) {
			input.val( guess );
		};

		return ret;
	},

	primeFactorization: function( solutionarea, solution, fallback ) {
		var verifier = function( correct, guess ) {
			guess = guess.split(" ").join("").toLowerCase();
			guess = KhanUtil.sortNumbers( guess.split( /x|\*|\u00d7/ ) ).join( "x" );
			return guess === correct;
		};
		verifier.examples = [
			"het product van priemgetallen, bijv. <code>2 \\times 3</code>",
			"een enkel priemgetal, bijv. <code>5</code>"
		];

		return Khan.answerTypes.text( solutionarea, solution, fallback, verifier );
	},

	custom: function( solutionarea, solution ) {
		var isTimeline = !( solutionarea.attr( "id" ) === "solutionarea" || solutionarea.parent().attr( "id" ) === "solutionarea" );
		var guessCorrect = false;
		solution.find( ".instruction" ).appendTo( solutionarea );
		var guessCode = solution.find( ".guess" ).text();

		var validatorCode = solution.find( ".validator-function" ).text();
		var validator = function( guess ) {
			var code = "(function() { var guess = " + JSON.stringify( guess ) + ";" + validatorCode + "})()";
			return KhanUtil.tmpl.getVAR( code, KhanUtil.currentGraph );
		};

		ret = function() {
			ret.guess = KhanUtil.tmpl.getVAR( guessCode, KhanUtil.currentGraph );
			if ( isTimeline ) {
				return guessCorrect;
			} else {
				var result = validator( ret.guess );
				if ( result === "" ) {
					ret.guess = "";
				}
				return result;
			}
		};

		ret.examples = solution.find( ".example" ).map(function(i, el) {
			return jQuery( el ).html();
		});
		ret.solution = "custom";
		ret.showGuess = function( guess ) {
			if ( isTimeline ) {
				guessCorrect = validator( guess );
				jQuery( solutionarea ).empty();
				jQuery( solutionarea ).append( guessCorrect ? "Juist antwoord" : "Fout antwoord" );
			}
		}

		var showGuessCode = jQuery( solution ).find( ".show-guess" ).text();
		ret.showCustomGuess = function( guess ) {
			var code = "(function() { var guess = " + JSON.stringify( guess ) + ";" + showGuessCode + "})()";
			KhanUtil.tmpl.getVAR( code, KhanUtil.currentGraph );
		}

		return ret;
	}
} );

} )();
;
jQuery.extend(KhanUtil, {
	trigFuncs: ["sin", "cos", "tan"],
	ddxTrigFuncs: {
		"sin": function( expr ) {
			return ["cos", expr];
		},
		"cos": function( expr ) {
			return ["-", ["sin", expr]];
		},
		"tan": function( expr ) {
			return ["^", ["sec", expr], 2];
		}
	},

	generateFunction: function( variable ) {
		// Generate a differentiable expression object
		// {fofx, ddxF, wrongs}
		// x being the name of the variable we differentiate with respect to
		// ensure that the function isn"t just 0 as well
		var f;
		do {
			f = new ( KhanUtil.randFromArray( KhanUtil.CalcFunctions ) )( variable );
		} while (f.f === "0");
		return f;
	},

	generateSpecialFunction: function( variable ) {
		// Different emphasis from normal generateFunction
		// For the special_derivatives exercise
		var f;
		do {
			var r = KhanUtil.rand(10);
			if ( r < 2 ) { // 20% chance of power rule
				f = new KhanUtil.CalcFunctions[0]( variable );
			} else if ( r < 6 ) { // 40% chance of trig
				f = new KhanUtil.CalcFunctions[1]( variable );
			} else if ( r < 10 ) { // 40% chance of e^x / ln x
				f = new KhanUtil.CalcFunctions[3]( variable );
			}
		} while (f.f === "0");
		return f;
	},

	ddxPolynomial: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = i * poly.coefs[i];
		}

		return new KhanUtil.Polynomial(poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable);
	},

	// doesn't decrement exponents
	ddxPolynomialWrong1: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i] = i * poly.coefs[i];
		}

		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	// increments negative exponents
	ddxPolynomialWrong2: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			if (i < 0) {
				ddxCoefs[i + 1] = i * poly.coefs[i];
			} else {
				ddxCoefs[i - 1] = i * poly.coefs[i];
			}
		}

		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	// reversed signs on all terms
	ddxPolynomialWrong3: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = -1 * i * poly.coefs[i];
		}

		return new KhanUtil.Polynomial( poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable );
	},

	// doesn't multiply coefficients
	ddxPolynomialWrong4: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i - 1] = poly.coefs[i];
		}

		return new KhanUtil.Polynomial( poly.minDegree - 1, poly.maxDegree - 1, ddxCoefs, poly.variable );
	},

	// original with flipped signs
	ddxPolynomialWrong5: function( poly ) {
		var ddxCoefs = [];

		for (var i = poly.maxDegree; i >= poly.minDegree; i--) {
			ddxCoefs[i] = poly.coefs[i] * -1;
		}

		return new KhanUtil.Polynomial( poly.minDegree, poly.maxDegree, ddxCoefs, poly.variable );
	},

	funcNotation: function( variable, index ) {
		variable = (typeof variable !== "undefined") ? variable : "x";
		var notations = [
			["y", "\\frac{dy}{d"+variable+"}", function ( term ) {
				return "y=" + term + " \\implies \\frac{dy}{d"+variable+"}";
			}],
			["f("+variable+")", "f'("+variable+")", function ( term ) {
				return "f'(" + term + ")";
			}],
			["g("+variable+")", "g'("+variable+")", function ( term ) {
				return "g'(" + term + ")";
			}],
			["y", "y'", function ( term ) {
				return "y=" + term + " \\implies y'";
			}],
			["f("+variable+")", "\\frac{d}{d"+variable+"}f("+variable+")", function ( term ) {
				return "f("+variable+")=" + term + " \\implies \\frac{d}{d"+variable+"}f("+variable+")";
			}],
			["a", "a'", function ( term ) {
				return "a=" + term + " \\implies a'";
			}],
			["a", "\\frac{da}{d"+variable+"}", function ( term ) {
				return "a=" + term + " \\implies \\frac{da}{d"+variable+"}";
			}]
		];
		var n_idx = (typeof index == "number" && index >= 0 && index < notations.length) ? index : KhanUtil.rand( notations.length );
		return {
			f: notations[n_idx][0],
			ddxF: notations[n_idx][1],
			diffHint: notations[n_idx][2]( "A" + variable + "^{n}" ) + "=n \\cdot A"+variable+"^{n-1}", //this is the overall hint in the notation of the problem
			diffHintFunction: notations[ n_idx ][ 2 ] //this is the hint function used by each hint.  It renders the hint per term in the appropriate format
		};
	},

	PowerRule: function(minDegree, maxDegree, coefs, variable, funcNotation ){
		if ( this instanceof KhanUtil.PowerRule ) { //avoid mistakenly calling without a new
			// power rule, polynomials
			var minDegree = (typeof minDegree == "number") ? minDegree : KhanUtil.randRange(-2, 2);
			var maxDegree = (typeof maxDegree == "number") ? maxDegree : KhanUtil.randRange(2, 4);
			var coefs = (typeof coefs == "object") ? coefs : KhanUtil.randCoefs(minDegree, maxDegree);
			var poly = new KhanUtil.Polynomial(minDegree, maxDegree, coefs, variable);

			this.f = poly.expr();
			this.ddxF = KhanUtil.ddxPolynomial(poly).expr();
			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );
			this.notation = (typeof funcNotation == "object") ? funcNotation : KhanUtil.funcNotation(variable);

			this.hints = [];

			for ( var i = 0; i < poly.getNumberOfTerms(); i = i + 1){
				var term = poly.getCoefAndDegreeForTerm( i );
				var ddxCoef = term.degree * term.coef;
				var ddxDegree = ( term.degree != 0 ) ? term.degree -1 : 0;
				var ddxCoefText = ( ddxCoef == 1 ) ? "" : ddxCoef + "";
				var ddxText = ( ddxDegree == 0 ) ? ddxCoef : ddxCoefText + poly.variable + ( (ddxDegree == 1) ? "" : "^{" + ddxDegree + "}" );

				this.hints [ i ] =	"\\dfrac{d (" + KhanUtil.expr( this.f[ i+1 ] )  + ")}{dx} \\implies " + term.degree + " \\cdot " + term.coef + poly.variable + "^{" + term.degree + "-1} = " + ddxText;
			}

			this.wrongs = [
				KhanUtil.ddxPolynomialWrong1(poly).expr(),
				KhanUtil.ddxPolynomialWrong2(poly).expr(),
				KhanUtil.ddxPolynomialWrong3(poly).expr(),
				KhanUtil.ddxPolynomialWrong4(poly).expr(),
				KhanUtil.ddxPolynomialWrong5(poly).expr()
			];

			// Remove empty choices, if any
			this.wrongs = jQuery.map( this.wrongs, function( value, index ) {
				if ( value.length > 1 ) {
					return [ value ];
				} else {
					return [];
				}
			} );

			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		}else{
			return new KhanUtil.PowerRule();
		}
	},

	CalcFunctions: [
		function( variable ) {
			// power rule, polynomials
			var minDegree = KhanUtil.randRange(-2, 2);
			var maxDegree = KhanUtil.randRange(2, 4);
			return KhanUtil.PowerRule(minDegree, maxDegree, KhanUtil.randCoefs(minDegree, maxDegree), variable);
		},
		function( variable ) {
			// random trig func
			var idx = KhanUtil.rand(3); // 0 - 2 in trig funcs

			this.wrongs = [];

			this.wrongs[0] = ["sin", variable];
			this.wrongs[1] = ["csc", variable];
			this.wrongs[2] = ["sec", variable];
			this.wrongs[3] = ["tan", variable];
			this.wrongs[4] = ["-", ["sec", variable]];
			this.wrongs[5] = ["-", ["cos", variable]];

			this.f = [ KhanUtil.trigFuncs[idx], variable ];
			this.ddxF = KhanUtil.ddxTrigFuncs[ KhanUtil.trigFuncs[idx] ](variable);

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );

			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		},

		function( variable ) {
			// basic x^power, simplified version of polynomials in [0]
			// kept KhanUtil around mainly for easy wrong answer generation
			var maxDegree = KhanUtil.randRange(2, 6);
			var minDegree = maxDegree;

			var coefs = [];
			coefs[maxDegree] = 1;

			var poly = new KhanUtil.Polynomial(minDegree, maxDegree, coefs, variable);

			this.f = poly.expr();
			this.ddxF = KhanUtil.ddxPolynomial(poly).expr();

			this.wrongs = [
				KhanUtil.ddxPolynomialWrong1(poly).expr(),
				KhanUtil.ddxPolynomialWrong2(poly).expr(),
				KhanUtil.ddxPolynomialWrong3(poly).expr(),
				KhanUtil.ddxPolynomialWrong4(poly).expr(),
				KhanUtil.ddxPolynomialWrong5(poly).expr()
			];

			// Remove empty choices, if any
			this.wrongs = jQuery.map( this.wrongs, function( value, index ) {
				if ( value.length > 1 ) {
					return [ value ];
				} else {
					return [];
				}
			} );

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );

			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		},

		function( variable ) {
			// ln x and e^x, combined in one because these should not be too likely
			this.wrongs = [];

			if (KhanUtil.rand(2)) {
				this.wrongs[0] = ["frac", 1, ["ln", variable]];
				this.wrongs[1] = ["^", "e", variable];
				this.wrongs[2] = ["frac", 1, ["^", "e", variable]];
				this.wrongs[3] = ["ln", variable];
				this.wrongs[4] = ["frac", 1, ["^", variable, 2]];
				this.wrongs[5] = variable;

				this.f = ["ln", variable];
				this.ddxF = ["frac", 1, variable];
			} else {
				this.wrongs[0] = ["*", variable, ["^", "e", ["-", variable, 1]]];
				this.wrongs[1] = ["frac", 1, variable];
				this.wrongs[2] = ["*", variable, ["^", "e", variable]];
				this.wrongs[3] = ["^", "e", ["-", variable, 1]];
				this.wrongs[4] = ["^", ["-", "e", variable], variable];
				this.wrongs[5] = ["frac", "e", variable];

				this.f = ["^", "e", variable];
				this.ddxF = ["^", "e", variable];
			}

			this.fText = KhanUtil.expr( this.f );
			this.ddxFText = KhanUtil.expr( this.ddxF );

			this.wrongsText = jQuery.map(this.wrongs, function( value, index ) {
				return KhanUtil.expr( value );
			});

			return this;
		} ]
});
;
jQuery.extend( KhanUtil, {

	initCongruence: function( options ) {
		options = jQuery.extend({
			ticks: [],
			numArcs: [ 0, 0, 0 ],
			reflected: false
		}, options );

		options.sides = options.triangle.sideLengths.slice();
		options.angles = options.triangle.angles.slice();

		var randomAngle = function( current ) {
			var angle = current;
			while ( Math.abs( angle - current ) < 10 ) {
				angle = Math.floor( KhanUtil.random() * 70 ) + 10;
			}
			return angle;
		};

		var randomSide = function( current ) {
			var side = current;
			while ( Math.abs( side - current ) < 1 ) {
				side = KhanUtil.random() * 30 / 10 + 1;
			}
			return side;
		};


		//
		// Side-Side-Side
		//
		if ( options.type === "SSS" ) {
			options.angles[0] = randomAngle( options.angles[0] );
			options.angles[1] = randomAngle( options.angles[1] );
			options.angles[2] = randomAngle( options.angles[2] );
			options.ticks = [ 1, 2, 3 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );

			// Point 0 is a fixed distance from point 1
			triangle.points[0].constraints.fixedDistance = { dist: options.sides[0], point: triangle.points[1] };

			// Point 1 can be used to rotate the shape
			triangle.setRotationPoint( 1 );

			// Point 2 can be used to rotate the shape
			triangle.setRotationPoint( 2 );

			// Point 3 is a fixed distance from point 2
			triangle.points[3].constraints.fixedDistance = { dist: options.sides[2], point: triangle.points[2] };

			// When point 0 moves, check if it's close enough to point 3 to make a triangle
			triangle.points[0].onMove = function( coordX, coordY ) {
				triangle.points[0].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[0].coord;
			};

			// When point 3 moves, check if it's close enough to point 0 to make a triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				triangle.points[3].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				// Check to see if SSS was 'reflected' by being turned inside out
				if (Math.abs( ((options.triangle.angles[1] * (triangle.reflected ? -1 : 1) + 360) % 360) - ((KhanUtil.findAngle( this.points[0].coord, this.points[2].coord, this.points[1].coord ) + 360) % 360) ) > 90) {
					triangle.reflected = !triangle.reflected;
				}
				this.points[0].setCoord( this.points[0].applyConstraint( this.points[0].coord, {
					fixedAngle: {
						angle: options.triangle.angles[1] * (triangle.reflected ? -1 : 1),
						vertex: this.points[1],
						ref: this.points[2]
					}
				}));
				this.points[3].setCoord( this.points[3].applyConstraint( this.points[3].coord, {
					fixedAngle: {
						angle: options.triangle.angles[2] * (triangle.reflected ? 1 : -1),
						vertex: this.points[2],
						ref: this.points[1]
					}
				}));
			};


		//
		// Side-Side-Angle
		//
		} else if ( options.type === "SSA" ) {
			options.angles[0] = randomAngle( options.angles[0] );
			options.angles[1] = randomAngle( options.angles[1] );
			options.sides[2] = randomSide( options.sides[2] );
			options.ticks = [ 1, 2, 0 ];
			options.numArcs = [ 0, 1, 0 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );

			// Point 0 is a fixed distance from point 1
			triangle.points[0].constraints.fixedDistance = { dist: options.sides[0], point: triangle.points[1] };

			// Point 1 can be used to rotate the shape
			triangle.setRotationPoint( 1 );

			// Point 2 is a fixed distance from point 1
			triangle.points[2].constraints.fixedDistance = { dist: options.sides[1], point: triangle.points[1] };

			// Point 3 is a fixed angle from points 1 and 2
			triangle.points[3].constraints.fixedAngle = { angle: options.angles[2] * (triangle.reflected ? 1 : -1), vertex: triangle.points[2], ref: triangle.points[1] };

			// When point 0 moves, check if it's close enough to point 3 to make a triangle
			triangle.points[0].onMove = function( coordX, coordY ) {
				triangle.points[0].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.2 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[0].coord;
			};

			// When point 2 moves, point 3 moves along with it
			triangle.points[2].onMove = function( coordX, coordY ) {
				var origCoord = triangle.points[2].coord;
				triangle.points[2].coord = [ coordX, coordY ];
				triangle.points[3].setCoord(triangle.points[3].applyConstraint( triangle.points[3].coord, {
					fixedDistance: {
						dist: KhanUtil.distance( triangle.points[3].coord, origCoord ),
						point: triangle.points[2]
					}
				}));
				// Check if point 3 ends up close enough to point 0 to make a triangle
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.2 ) {
					triangle.snapCorrect();
				}
				triangle.update();
			};

			// When point 3 moves, check if it's close enough to point 0 to make a triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				triangle.points[3].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.2 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				var angle1 = options.triangle.angles[1] * (triangle.reflected ? -1 : 1);
				// SSA has two possible shapes: See which one we're closest to'
				if ( Math.abs( KhanUtil.distance( triangle.points[2].coord, triangle.points[3].coord ) - options.triangle.sideLengths[2] ) > 1.0 ) {
					this.isCongruent = false;
					angle1 = Math.abs(angle1);
					var angle2 = Math.abs(options.triangle.angles[2] * (triangle.reflected ? -1 : 1));
					angle1 = (180 - 2 * angle2 - angle1) * (triangle.reflected ? -1 : 1);
				} else {
					this.isCongruent = true;
				}
				this.points[0].setCoord( this.points[0].applyConstraint( this.points[0].coord, {
					fixedAngle: {
						angle: angle1,
						vertex: this.points[1],
						ref: this.points[2]
					}
				}));
				this.points[3].setCoord( this.points[0].coord );
			};


		//
		// Side-Angle-Side
		//
		} else if ( options.type === "SAS" ) {
			options.angles[0] = randomAngle( options.angles[0] );
			options.sides[2] = randomSide( options.sides[2] );
			options.angles[2] = randomAngle( options.angles[2] );
			options.ticks = [ 1, 2, 0 ];
			options.numArcs = [ 1, 0, 0 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );

			// Point 0 can be used to rotate the shape
			triangle.setRotationPoint( 0 );

			// Point 1 is a fixed distance from point 2
			triangle.points[1].constraints.fixedDistance = { dist: options.sides[1], point: triangle.points[2] };

			// Point 2 can be used to rotate the shape
			triangle.setRotationPoint( 2 );

			// Point 3 is unconstrained

			// When point 1 moves, point 0 moves along with it
			triangle.points[1].onMove = function( coordX, coordY ) {
				triangle.points[1].coord = [ coordX, coordY ];
				triangle.points[0].setCoord(triangle.points[0].applyConstraint( triangle.points[0].coord, {
					fixedDistance: {
						dist: options.sides[0],
						point: triangle.points[1]
					},
					fixedAngle: {
						angle: options.angles[1] * (triangle.reflected ? -1 : 1),
						vertex: triangle.points[1],
						ref: triangle.points[2]
					}
				}));
				// Check if point 0 ends up close enough to point 3 to make a triangle
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.2 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[1].coord;
			};

			// When point 3 moves, check if it's close enough to point 0 to make a triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				triangle.points[3].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.2 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				this.points[3].setCoord( this.points[0].coord );
			};


		//
		// Side-Side-Angle
		//
		} else if ( options.type === "SAA" ) {
			options.angles[0] = randomAngle( options.angles[0] );
			options.sides[1] = randomSide( options.sides[1] );
			options.sides[2] = randomSide( options.sides[2] );
			options.ticks = [ 1, 0, 0 ];
			options.numArcs = [ 1, 2, 0 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );

			// Point 0 can be used to rotate the shape
			triangle.setRotationPoint( 0 );

			// Point 1 is a fixed angle from points 3 and 2
			triangle.points[1].constraints.fixedAngle = { angle: options.angles[2] * (triangle.reflected ? -1 : 1), vertex: triangle.points[2], ref: triangle.points[3] };

			// Point 2 can be used to rotate the shape
			triangle.setRotationPoint( 2 );

			// Point 3 is a fixed angle from points 1 and 2
			triangle.points[3].constraints.fixedAngle = { angle: options.angles[2] * (triangle.reflected ? 1 : -1), vertex: triangle.points[2], ref: triangle.points[1] };

			// When point 1 moves, point 0 moves along with it
			triangle.points[1].onMove = function( coordX, coordY ) {
				triangle.points[1].coord = [ coordX, coordY ];
				triangle.points[0].setCoord(triangle.points[0].applyConstraint( triangle.points[0].coord, {
					fixedDistance: {
						dist: options.sides[0],
						point: triangle.points[1]
					},
					fixedAngle: {
						angle: options.angles[1] * (triangle.reflected ? -1 : 1),
						vertex: triangle.points[1],
						ref: triangle.points[2]
					}
				}));
				// Check if point 0 ends up close enough to point 3 to make a triangle
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[1].coord;
			};

			// When point 3 moves, check if it's close enough to point 0 to make a triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				triangle.points[3].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				this.points[1].setCoord( this.points[1].applyConstraint( this.points[1].coord, {
					fixedDistance: {
						dist: options.triangle.sideLengths[1],
						point: this.points[2]
					}
				}));
				this.points[0].setCoord( this.points[0].applyConstraint( this.points[0].coord, {
					fixedDistance: {
						dist: options.triangle.sideLengths[0],
						point: this.points[1]
					},
					fixedAngle: {
						angle: options.angles[1] * (this.reflected ? -1 : 1),
						vertex: this.points[1],
						ref: this.points[2]
					}
				}));
				this.points[3].setCoord( this.points[3].applyConstraint( this.points[3].coord, {
					fixedDistance: {
						dist: options.triangle.sideLengths[2],
						point: this.points[2]
					}
				}));
			};


		//
		// Angle-Side-Angle
		//
		} else if ( options.type === "ASA" ) {
			options.sides[0] = randomSide( options.sides[0] );
			options.angles[0] = randomAngle( options.angles[0] );
			options.sides[2] = randomSide( options.sides[2] );
			options.ticks = [ 0, 1, 0 ];
			options.numArcs = [ 1, 2, 0 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );

			// Point 0 is a fixed angle from points 2 and 1
			triangle.points[0].constraints.fixedAngle = { angle: options.angles[1] * (triangle.reflected ? -1 : 1), vertex: triangle.points[1], ref: triangle.points[2] };

			// Point 1 can be used to rotate the shape
			triangle.setRotationPoint( 1 );

			// Point 2 can be used to rotate the shape
			triangle.setRotationPoint( 2 );

			// Point 3 is a fixed angle from points 1 and 2
			triangle.points[3].constraints.fixedAngle = { angle: options.angles[2] * (triangle.reflected ? 1 : -1), vertex: triangle.points[2], ref: triangle.points[1] };

			// When point 0 moves, check if it's close enough to point 3 to make a triangle
			triangle.points[0].onMove = function( coordX, coordY ) {
				triangle.points[0].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[0].coord;
			};

			// When point 3 moves, check if it's close enough to point 0 to make a triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				triangle.points[3].coord = [ coordX, coordY ];
				if ( KhanUtil.distance( triangle.points[0].coord, triangle.points[3].coord ) < 0.3 ) {
					triangle.snapCorrect();
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				this.points[0].setCoord( this.points[0].applyConstraint( this.points[0].coord, {
					fixedDistance: {
						dist: options.triangle.sideLengths[0],
						point: this.points[1]
					}
				}));
				this.points[3].setCoord( this.points[3].applyConstraint( this.points[3].coord, {
					fixedDistance: {
						dist: options.triangle.sideLengths[2],
						point: this.points[2]
					}
				}));
			};


		//
		// Angle-Angle-Angle
		//
		} else if ( options.type === "AAA" ) {
			var scale = KhanUtil.random() < 0.5 ? 1 : KhanUtil.random() > 0.5 ? KhanUtil.random() * 0.4 + 1.2 : KhanUtil.random() * 0.2 + 0.6;
			options.sides[0] *= scale;
			options.sides[1] *= scale;
			options.sides[2] *= scale;
			options.numArcs = [ 2, 3, 1 ];
			var triangle = KhanUtil.addInteractiveTriangle( options );
			triangle.isCongruent = scale === 1;

			// The shape is always a triangle, so we don't need 4 points visible
			triangle.points[0].visibleShape.remove();
			triangle.points[0].mouseTarget.remove();
			triangle.points[0].visible = false;

			// Point 1 can be used to rotate the shape
			triangle.setRotationPoint( 1 );

			// Point 2 can be used to rotate the shape
			triangle.setRotationPoint( 2 );

			// Point 3 is a fixed angle from the centroid
			triangle.points[3].constraints.fixedAngle = {
				angle: KhanUtil.findAngle(triangle.points[3].coord, triangle.points[1].coord, triangle.rotationPoint.coord),
				vertex: triangle.rotationPoint,
				ref: triangle.points[1]
			};

			// When point 3 moves, scale the entire triangle
			triangle.points[3].onMove = function( coordX, coordY ) {
				var origCoord = triangle.points[3].coord;
				triangle.points[3].coord = [ coordX, coordY ];
				triangle.points[0].setCoord([ coordX, coordY ]);
				var scaleFactor = KhanUtil.distance([ coordX, coordY ], triangle.rotationPoint.coord) / triangle.radii[3];
				triangle.points[1].setCoord( triangle.points[1].applyConstraint( triangle.points[1].coord, {
					fixedDistance: {
						dist: triangle.radii[1] * scaleFactor,
						point: triangle.rotationPoint
					}
				}));
				triangle.points[2].setCoord( triangle.points[2].applyConstraint( triangle.points[2].coord, {
					fixedDistance: {
						dist: triangle.radii[2] * scaleFactor,
						point: triangle.rotationPoint
					}
				}));
				// Check if the triangle is close enough to congruent to make it easier/possible to get wrong
				if ( Math.abs( KhanUtil.distance( triangle.points[0].coord, triangle.points[1].coord ) - options.triangle.sideLengths[0] ) < 0.3 ) {
					triangle.snapCorrect();
					triangle.isCongruent = true;
				} else {
					triangle.isCongruent = false;
				}
				triangle.update();
				return triangle.points[3].coord;
			};

			triangle.snapCorrect = function() {
				this.points[3].setCoord( this.points[0].applyConstraint( this.points[0].coord, {
					fixedDistance: {
						dist: KhanUtil.distance( options.triangle.points[0], options.triangle.centroid ),
						point: this.rotationPoint
					}
				}));
				this.points[0].setCoord( this.points[3].coord );
				this.points[1].setCoord( this.points[1].applyConstraint( this.points[1].coord, {
					fixedDistance: {
						dist: KhanUtil.distance( options.triangle.points[1], options.triangle.centroid ),
						point: this.rotationPoint
					}
				}));
				this.points[2].setCoord( this.points[2].applyConstraint( this.points[2].coord, {
					fixedDistance: {
						dist: KhanUtil.distance( options.triangle.points[2], options.triangle.centroid ),
						point: this.rotationPoint
					}
				}));
			};


		}
		KhanUtil.currentGraph.interactiveTriangle = triangle;

	},


	addInteractiveTriangle: function( options ) {
		var triangle = jQuery.extend({
			points: [],
			lines: [],
			numArcs: options.numArcs,
			arcs: [],
			radii: [],
			reflected: false,
			animating: false,
			isCongruent: true,
			isTriangle: false
		}, options);

		// Redraw/refresh the triangle
		triangle.update = function() {
			if ( !KhanUtil.dragging ) {
				// if the shape is a triangle, rotate around the centroid, otherwise use the center of the bounding box
				if ( Math.abs( triangle.points[0].coord[0] - triangle.points[3].coord[0] ) < 0.001 &&  Math.abs( triangle.points[0].coord[1] - triangle.points[3].coord[1] ) < 0.001 ) {
					triangle.isTriangle = true;
					triangle.rotationPoint.setCoord([
						1/3 * (triangle.points[0].coord[0] + triangle.points[1].coord[0] + triangle.points[2].coord[0]),
						1/3 * (triangle.points[0].coord[1] + triangle.points[1].coord[1] + triangle.points[2].coord[1]),
					]);
				} else {
					triangle.isTriangle = false;
					var minX = Math.min(triangle.points[0].coord[0], triangle.points[1].coord[0], triangle.points[2].coord[0], triangle.points[3].coord[0]);
					var maxX = Math.max(triangle.points[0].coord[0], triangle.points[1].coord[0], triangle.points[2].coord[0], triangle.points[3].coord[0]);
					var minY = Math.min(triangle.points[0].coord[1], triangle.points[1].coord[1], triangle.points[2].coord[1], triangle.points[3].coord[1]);
					var maxY = Math.max(triangle.points[0].coord[1], triangle.points[1].coord[1], triangle.points[2].coord[1], triangle.points[3].coord[1]);

					triangle.rotationPoint.setCoord([ (maxX - minX) / 2 + minX, (maxY - minY) / 2 + minY ]);
				}

				for ( var point = 0; point < 4; ++point ) {
					triangle.radii[point] = KhanUtil.distance( triangle.points[point].coord, triangle.rotationPoint.coord );
					if ( triangle.points[point].isRotationPoint ) {
						triangle.points[point].constraints.fixedDistance = { dist: triangle.radii[point], point: triangle.rotationPoint };
					}
				}
			}

			KhanUtil.currentGraph.style({ stroke: KhanUtil.BLUE, opacity: 1.0, "stroke-width": 2 });
			for ( var angle = 0; angle < 2; ++angle ) {
				jQuery( triangle.arcs[angle] ).each( function() { this.remove(); });
				triangle.arcs[angle] = KhanUtil.drawArcs( triangle.points[angle].coord, triangle.points[angle + 1].coord, triangle.points[angle + 2].coord, options.numArcs[angle] );
			}
			if (options.numArcs[2]) {
				jQuery( triangle.arcs[2] ).each( function() { this.remove(); });
				triangle.arcs[angle] = KhanUtil.drawArcs( triangle.points[2].coord, triangle.points[3].coord, triangle.points[1].coord, options.numArcs[2] );
			}

			jQuery( triangle.lines ).each( function() {
				this.transform(true);
				this.toFront();
			});
			jQuery( triangle.points ).each( function() { this.toFront(); });
		};

		// Call to set one of the points to rotate the entire shape
		triangle.setRotationPoint = function( point ) {
			triangle.points[point].isRotationPoint = true;
			triangle.points[point].normalStyle = { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE, scale: 1 };
			triangle.points[point].highlightStyle = { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE, scale: 1.5 };
			triangle.points[point].visibleShape.attr( triangle.points[point].normalStyle );
			triangle.points[point].constraints.fixedDistance = { dist: triangle.radii[point], point: triangle.rotationPoint };

			triangle.points[point].onMove = function( coordX, coordY ) {
				var dAngle = KhanUtil.findAngle( [coordX, coordY], triangle.points[point].coord, triangle.rotationPoint.coord ) * Math.PI/180;
				for ( var i = 0; i < 4; ++i ) {
					if (i !== point) {
						triangle.points[i].setCoord([
							(triangle.points[i].coord[0] - triangle.rotationPoint.coord[0]) * Math.cos(dAngle) - (triangle.points[i].coord[1] - triangle.rotationPoint.coord[1]) * Math.sin(dAngle) + triangle.rotationPoint.coord[0],
							(triangle.points[i].coord[0] - triangle.rotationPoint.coord[0]) * Math.sin(dAngle) + (triangle.points[i].coord[1] - triangle.rotationPoint.coord[1]) * Math.cos(dAngle) + triangle.rotationPoint.coord[1]
						]);
					}
				}
				triangle.points[point].coord = [ coordX, coordY ];
				triangle.update();
			};
		};

		jQuery(".question").prepend("<button id=\"reflect\">Reflect shape</button>");
		jQuery("button#reflect").bind("click", function( event ) {
			this.blur();
			if ( !triangle.animating ) {
				triangle.animating = true;
				var startPoints = jQuery.map( triangle.points, function( pt ) { return [ pt.coord.slice() ]; } );
				var xMin = Math.min.apply(Math, jQuery.map( startPoints, function(x) { return x[0]; }));
				var xMax = Math.max.apply(Math, jQuery.map( startPoints, function(x) { return x[0]; }));
				var xMid = (xMin + xMax) / 2;
				var endPoints = jQuery.map( triangle.points, function( pt ) { return [[ xMid - pt.coord[0] + xMid, pt.coord[1] ]]; });

				// flip the angles around
				jQuery( triangle.points ).each( function( n, point ) {
					if ( typeof point.constraints.fixedAngle.angle === "number" ) {
						point.constraints.fixedAngle.angle *= -1;
					}
				});
				triangle.reflected = !triangle.reflected;

				// remove the angle arc decorations since (without some effort) they look funny during the animation
				jQuery( triangle.arcs[0] ).each( function() { this.remove(); });
				jQuery( triangle.arcs[1] ).each( function() { this.remove(); });
				jQuery( triangle.arcs[2] ).each( function() { this.remove(); });

				var xCoords = { 0: startPoints[0][0], 1: startPoints[1][0], 2: startPoints[2][0], 3: startPoints[3][0] };
				jQuery( xCoords ).animate({ 0: endPoints[0][0], 1: endPoints[1][0], 2: endPoints[2][0], 3: endPoints[3][0] }, {
					duration: 500,
					easing: "linear",
					step: function( now, fx ) {
						jQuery( triangle.points ).each(function( n ) { this.setCoord([ xCoords[n], endPoints[n][1] ]); });
						jQuery( triangle.lines ).each(function() { this.transform(true); });
					},
					complete: function() {
						jQuery( triangle.points ).each(function( n ) { this.setCoord( endPoints[n] ); });
						triangle.update();
						triangle.animating = false;
					}
				});
			}
		});

		// Flip the angles around if the triangle starts out reflected
		var angles = options.angles.slice();

		if (!options.reflected) {
			jQuery( angles ).each( function( n ) {
				angles[n] *= -1;
			});
		}

		// Start at 0,0 and build the shape, logo-style
		var coord = [ 0, 0 ];
		triangle.points.push( KhanUtil.addMovablePoint({ coord: coord }) );

		coord[0] += options.sides[0] * Math.cos( angles[0] * Math.PI / 180 );
		coord[1] += options.sides[0] * Math.sin( angles[0] * Math.PI / 180 );
		triangle.points.push( KhanUtil.addMovablePoint({ coord: coord }) );

		coord[0] += options.sides[1] * Math.cos( -(180 - angles[1] - angles[0]) * Math.PI / 180 );
		coord[1] += options.sides[1] * Math.sin( -(180 - angles[1] - angles[0]) * Math.PI / 180 );
		triangle.points.push( KhanUtil.addMovablePoint({ coord: coord }) );

		coord[0] += options.sides[2] * Math.cos( (angles[2] + angles[1] + angles[0]) * Math.PI / 180 );
		coord[1] += options.sides[2] * Math.sin( (angles[2] + angles[1] + angles[0]) * Math.PI / 180 );
		triangle.points.push( KhanUtil.addMovablePoint({ coord: coord }) );

		triangle.lines.push( KhanUtil.addMovableLineSegment({ pointA: triangle.points[0], pointZ: triangle.points[1], ticks: options.ticks[0], highlightStyle: { "stroke": KhanUtil.BLUE, "stroke-width": 4 } }) );
		triangle.lines.push( KhanUtil.addMovableLineSegment({ pointA: triangle.points[1], pointZ: triangle.points[2], ticks: options.ticks[1], highlightStyle: { "stroke": KhanUtil.BLUE, "stroke-width": 4 } }) );
		triangle.lines.push( KhanUtil.addMovableLineSegment({ pointA: triangle.points[2], pointZ: triangle.points[3], ticks: options.ticks[2], highlightStyle: { "stroke": KhanUtil.BLUE, "stroke-width": 4 } }) );

		triangle.rotationPoint = KhanUtil.addMovablePoint({ visible: false });

		// Translate the triangle so its all visible
		var xlateX = 4 - Math.max(triangle.points[0].coord[0], triangle.points[1].coord[0], triangle.points[2].coord[0], triangle.points[3].coord[0]);
		var xlateY = 4 - Math.max(triangle.points[0].coord[1], triangle.points[1].coord[1], triangle.points[2].coord[1], triangle.points[3].coord[1]);
		jQuery( triangle.points ).each(function() { this.setCoord([ this.coord[0] + xlateX, this.coord[1] + xlateY ]); });

		// Dragging the lines translates the entire shape
		for (var line = 0; line < 3; ++line) {
			triangle.lines[line].onMove = function( dX, dY ) {
				jQuery( triangle.points ).each(function() { this.setCoord([ this.coord[0] + dX, this.coord[1] + dY ]); });
				triangle.update();
			};
			triangle.lines[line].onMoveEnd = function() {
				triangle.update();
			};
		}

		// Always redraw the triangle after a point moves
		for (var point = 0; point < 4; ++point) {
			triangle.points[point].onMoveEnd = function( coordX, coordY ) {
				triangle.update();
			};
		}

		triangle.update();
		return triangle;
	},



	addTriangleDecorations: function( triangle, type ) {
		var ticks = [ 0, 0, 0 ];
		var arcs  = [ 0, 0, 0 ];
		if ( type === "SSS" ) {
			ticks = [ 1, 2, 3 ];
		} else if ( type === "SSA") {
			arcs  = [ 0, 0, 1 ];
			ticks = [ 1, 2, 0 ];
		} else if ( type === "SAS") {
			arcs  = [ 0, 1, 0 ];
			ticks = [ 1, 2, 0 ];
		} else if ( type === "SAA") {
			arcs  = [ 0, 1, 2 ];
			ticks = [ 1, 0, 0 ];
		} else if ( type === "ASA") {
			arcs  = [ 0, 1, 2 ];
			ticks = [ 0, 1, 0 ];
		} else if ( type === "AAA") {
			arcs  = [ 1, 2, 3 ];
		}

		KhanUtil.addMovableLineSegment({ coordA: triangle.points[0], coordZ: triangle.points[1], fixed: true, ticks: ticks[0], normalStyle: { stroke: "#b1c9f5", "stroke-width": 2 } });
		KhanUtil.addMovableLineSegment({ coordA: triangle.points[1], coordZ: triangle.points[2], fixed: true, ticks: ticks[1], normalStyle: { stroke: "#b1c9f5", "stroke-width": 2 } });
		KhanUtil.addMovableLineSegment({ coordA: triangle.points[2], coordZ: triangle.points[0], fixed: true, ticks: ticks[2], normalStyle: { stroke: "#b1c9f5", "stroke-width": 2 } });
		KhanUtil.drawArcs( triangle.points[2], triangle.points[0], triangle.points[1], arcs[0] );
		KhanUtil.drawArcs( triangle.points[0], triangle.points[1], triangle.points[2], arcs[1] );
		KhanUtil.drawArcs( triangle.points[1], triangle.points[2], triangle.points[0], arcs[2] );
		jQuery( triangle.set ).each( function() { this.toBack(); });
	}

});


jQuery.extend( Khan.answerTypes, {
	congruence: function( solutionarea, solution, fallback, verifier, input ) {
		jQuery( solutionarea ).append( jQuery( solution ).clone().contents().tmpl() );
		var correct = solutionarea.find( ".answer" ).text();
		solutionarea.find( ".answer" ).empty();

		ret = function() {
			var triangle = KhanUtil.currentGraph.interactiveTriangle;
			var guess = solutionarea.find( "input:checked" ).val();
			ret.guess = [ guess, triangle.points[0].coord, triangle.points[1].coord, triangle.points[2].coord, triangle.points[3].coord ];
			if ( guess === undefined ) {
				// no guess, don't grade answer
				ret.guess = "";
				return false;
			} else if ( guess !== correct) {
				return false;
			} else if ( !triangle.isTriangle) {
				return "Your answer is almost correct, but you haven't constructed a triangle.";
			} else if ( correct === "No" && triangle.isCongruent ) {
				return "Your answer is almost correct, but the two triangles are congruent. Prove your answer by trying to construct an incongruent triangle.";
			} else {
				return true;
			}
		};
		ret.examples = [ "the shapes to the left are part of your answer" ];
		ret.solution = correct;
		ret.showGuess = function( guess ) {
			var triangle = KhanUtil.currentGraph.interactiveTriangle;
			solutionarea.find( "input:checked" ).prop( 'checked', false );
			solutionarea.find( "input[value=" + guess[0] + "]" ).prop( 'checked', true );
			triangle.points[0].setCoord(guess[1]);
			triangle.points[1].setCoord(guess[2]);
			triangle.points[2].setCoord(guess[3]);
			triangle.points[3].setCoord(guess[4]);
			triangle.update();
		};
		return ret;
	}
});
;
jQuery.extend( KhanUtil, {
	trigFunc: {
		csc: {name: "csc", print: function( angle ){
			return KhanUtil.trigFunc.sec.print( 90-angle);
		},
		convertsTo:["sin"],
		convertTo: function( type, angle ){
			if( type.name == "sin" ){
				var cscv =  KhanUtil.trigFunc.csc.print( angle );
				var sinv =  KhanUtil.trigFunc.sin.print( angle );
				var toReturn = [];
				toReturn.push( "\\csc x = \\frac{1}{\\sin x}" );
				toReturn.push( "\\csc x = " + cscv );
				toReturn.push( '\\frac{1}{\\sin x} = ' + cscv );
				toReturn.push( '\\sin x = ' + sinv );
				return toReturn;
			}

		}
	},	
	sec: {name: "sec", print: function( angle ){
		if( angle == 0 ){
			return 1;
		}
		else if( angle == 30 ){
			return "\\frac{2}{\\sqrt 3}";
		}
		else if( angle == 45 ){
			return '\\sqrt 2';
		}
		else if( angle == 60 ){
			return '2';
		}
		else if( angle == 90 ){
			return 'undefined';
		}
		return 'undef';
	},
	convertsTo: ["cos","tan"],
	convertTo: function( type, angle){
		if( type.name ==  "cos" ){ 
			var cosv =  KhanUtil.trigFunc.cos.print( angle );
			var secv =  KhanUtil.trigFunc.sec.print( angle );
			var toReturn = [];
			toReturn.push( "\\sec x = \\frac{1}{\\cos x}" );
			toReturn.push( "\\sec x = " + secv );
			toReturn.push( '\\frac{1}{\\cos x} = ' + secv );
			toReturn.push( "\\cos x = " + cosv);
			return toReturn;
		}
		else if( type.name == "tan"){
			var tanv =  KhanUtil.trigFunc.tan.print( angle );
			var secv =  KhanUtil.trigFunc.sec.print( angle );
			var toReturn = [];
			toReturn.push( "\\sin^2 x + \\cos^2 x = 1" );
			toReturn.push( "\\frac{\\sin^2 x}{\\cos^2 x} + \\frac{\\cos^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x}" );
			toReturn.push( "\\tan^2 x + 1 = \\sec^2 x" );
			toReturn.push( "\\tan^2 x + 1 = (" + secv + ")^2" );
			toReturn.push( "\\tan^2 x = (" + secv + ")^2 - 1" );
			toReturn.push( "\\tan x = \\sqrt { " + secv + "  ^2 - 1 }");
			toReturn.push( "\\tan x = " + tanv );
			return toReturn;	
		}
	}
},	
tan: {name: "tan", print: function( angle ){
	if( angle == 0 ){
		return 0;
	}
	else if( angle == 30 ){
		return "\\frac{1}{\\sqrt 3}";
	}
	else if( angle == 45 ){
		return '1';
	}
	else if( angle == 60 ){
		return '\\sqrt 3';
	}
	else if( angle == 90 ){
		return 'undefined';
	}
	return 'undef';

},
convertsTo: ["sec"],
convertTo: function( type, angle){
	if( type.name ==  "sec" ){ 

		var tanv =  KhanUtil.trigFunc.tan.print( angle );
		var secv =  KhanUtil.trigFunc.sec.print( angle );
		var toReturn = [];
		toReturn.push( "\\sin^2 x + \\cos^2 x = 1" );
		toReturn.push( "\\frac{\\sin^2 x}{\\cos^2 x} + \\frac{\\cos^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x}" );
		toReturn.push( "\\tan^2 x + 1 = \\sec^2 x" );
		toReturn.push( "(" + tanv + ")^2 + 1 = \\sec^2 x" );
		toReturn.push( "\\sqrt{(" + tanv + ")^2 + 1} = \\sec x" );
		toReturn.push( secv + ' = \\sec x');
		return toReturn;	
	}
}
},
cos :{name: "cos", print: function( angle ){
	return KhanUtil.trigFunc.sin.print( 90-angle );
},
convertsTo: ["sin","sec"],
convertTo: function( type, angle){
	if( type.name == "sin" ){
		var cosv =  KhanUtil.trigFunc.cos.print( angle );
		var sinv =  KhanUtil.trigFunc.sin.print( angle );
		var toReturn = [];
		toReturn.push("\\sin^2 x + \\cos^2 x = 1");
		toReturn.push("\\sin^2 x + (" + cosv + ")^2 = 1");
		toReturn.push("(" + cosv + ")^2 = 1 - \\sin^2 x");
		toReturn.push('(' + cosv + ')^2 - 1 = - \\sin^2 x');
		toReturn.push('-(' + cosv + ')^2 + 1 = \\sin^2 x');
		toReturn.push(sinv + ' = \\sin x');
		return toReturn;
	}
	else if( type.name == "sec" ){
		cosv =  KhanUtil.trigFunc.cos.print( angle );
		secv =  KhanUtil.trigFunc.sec.print( angle );
		toReturn = new Array();
		toReturn.push( cosv + " = \\cos x" );
		toReturn.push( secv + " = \\frac{1}{\\cos x}" );
		toReturn.push( secv + " = \\sec x" ); 
		return toReturn;
	}
}
},
sin: {name: "sin", print: function( angle ){ 
	if( angle == 0 ){
		return 0;
	}
	else if( angle == 30 ){
		return '\\frac{1}{2}';
	}
	else if( angle == 45 ){
		return '\\frac{\\sqrt 2}{2}';
	}
	else if( angle == 60 ){
		return '\\frac{\\sqrt 3}{2}';
	}
	else if( angle == 90 ){
		return '1';
	}
	return 'undefined';
},
convertsTo: ["cos","csc"],
convertTo: function( type, angle ){
	if( type.name == "cos" ){
		var sinv = KhanUtil.trigFunc.sin.print( angle );
		var cosv = KhanUtil.trigFunc.cos.print( angle );
		var toReturn = [];
		toReturn.push( "\\sin^2 x + \\cos^2 x = 1" );
		toReturn.push( "(" + sinv + ")^2 + \\cos^2 x = 1" );
		toReturn.push( "(" + sinv + ")^2 = 1- \\cos^2 x " );
		toReturn.push( "(" + sinv + ")^2 - 1 = - \\cos^2 x " ); 
		toReturn.push( "-(" + sinv + ")^2 + 1 = \\cos^2 x " );
		toReturn.push( cosv + " =  \\cos x" );
		return toReturn;

	}
	else if( type.name == "csc" ){
		var sinv = KhanUtil.trigFunc.sin.print( angle );
		var cscv = KhanUtil.trigFunc.csc.print( angle );
		var toReturn = [];
		toReturn.push( sinv + " = \\sin x" );
		toReturn.push( cscv + " = \\frac{1}{\\sin x}" );
		toReturn.push( cscv + " = \\csc x" );
		return toReturn;
	}
}

}
}});

jQuery.extend( KhanUtil, {
	trigTypes: [KhanUtil.trigFunc.sin,KhanUtil.trigFunc.cos,KhanUtil.trigFunc.tan,KhanUtil.trigFunc.csc,KhanUtil.trigFunc.sec],

	findSteps: function( start, end, value){
		var visited = {};
		var queue=[];
		var next=start;
		while( next.name != end.name ){
			if ( next.convertsTo ) {
				$.each( next.convertsTo, function(i, str) {
					if( ! (str in visited) ){
						var move = KhanUtil.trigFunc[str];
						move.parent = next;
						queue.push( move );
					}
					visited[str] = true;
				});
			}
			next = queue.shift();
		}	
		var prev = next;
		var steps = [];
		while( prev.name != start.name ){
			steps.unshift( prev.name );
			prev = prev.parent;

		}		
		steps.unshift( prev.name );
		var toReturn = [];
		for( var x=0; x<steps.length-1 ;x++ ){
			// Vars cannot have circular references, so delete .parent before returning
			var step = KhanUtil.trigFunc[steps[x]].convertTo( KhanUtil.trigFunc[steps[x+1]], value );
			delete step.parent;

			toReturn.push( step );
		}
		for( x=0; x<KhanUtil.trigTypes.length-1 ;x++ ){
			delete KhanUtil.trigTypes[x].parent;
		}
		return toReturn;
	}
});
;
// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while(k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

/*
	Copyright (c) 2010, Michael Bostock
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	* Redistributions of source code must retain the above copyright notice, this
	  list of conditions and the following disclaimer.

	* Redistributions in binary form must reproduce the above copyright notice,
	  this list of conditions and the following disclaimer in the documentation
	  and/or other materials provided with the distribution.

	* The name Michael Bostock may not be used to endorse or promote products
	  derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
	INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
	BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
	EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function(){if (!Date.now) Date.now = function() {
  return +new Date;
};
try {
  document.createElement("div").style.setProperty("opacity", 0, "");
} catch (error) {
  var d3_style_prototype = CSSStyleDeclaration.prototype,
      d3_style_setProperty = d3_style_prototype.setProperty;
  d3_style_prototype.setProperty = function(name, value, priority) {
    d3_style_setProperty.call(this, name, value + "", priority);
  };
}
d3 = {version: "2.3.0"}; // semver
var d3_array = d3_arraySlice; // conversion for NodeLists

function d3_arrayCopy(pseudoarray) {
  var i = -1, n = pseudoarray.length, array = [];
  while (++i < n) array.push(pseudoarray[i]);
  return array;
}

function d3_arraySlice(pseudoarray) {
  return Array.prototype.slice.call(pseudoarray);
}

try {
  d3_array(document.documentElement.childNodes)[0].nodeType;
} catch(e) {
  d3_array = d3_arrayCopy;
}

var d3_arraySubclass = [].__proto__?

// Until ECMAScript supports array subclassing, prototype injection works well.
function(array, prototype) {
  array.__proto__ = prototype;
}:

// And if your browser doesn't support __proto__, we'll use direct extension.
function(array, prototype) {
  for (var property in prototype) array[property] = prototype[property];
};
function d3_this() {
  return this;
}
d3.functor = function(v) {
  return typeof v === "function" ? v : function() { return v; };
};
// A getter-setter method that preserves the appropriate `this` context.
d3.rebind = function(object, method) {
  return function() {
    var x = method.apply(object, arguments);
    return arguments.length ? object : x;
  };
};
d3.ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};
d3.descending = function(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
};
d3.min = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;
  if (arguments.length === 1) {
    while (++i < n && ((a = array[i]) == null || a != a)) a = undefined;
    while (++i < n) if ((b = array[i]) != null && a > b) a = b;
  } else {
    while (++i < n && ((a = f.call(array, array[i], i)) == null || a != a)) a = undefined;
    while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
  }
  return a;
};
d3.max = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;
  if (arguments.length === 1) {
    while (++i < n && ((a = array[i]) == null || a != a)) a = undefined;
    while (++i < n) if ((b = array[i]) != null && b > a) a = b;
  } else {
    while (++i < n && ((a = f.call(array, array[i], i)) == null || a != a)) a = undefined;
    while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
  }
  return a;
};
d3.sum = function(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1;

  if (arguments.length === 1) {
    while (++i < n) if (!isNaN(a = +array[i])) s += a;
  } else {
    while (++i < n) if (!isNaN(a = +f.call(array, array[i], i))) s += a;
  }

  return s;
};
// R-7 per <http://en.wikipedia.org/wiki/Quantile>
d3.quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};
d3.zip = function() {
  if (!(n = arguments.length)) return [];
  for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m;) {
    for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n;) {
      zip[j] = arguments[j][i];
    }
  }
  return zips;
};

function d3_zipLength(d) {
  return d.length;
}
// Locate the insertion point for x in a to maintain sorted order. The
// arguments lo and hi may be used to specify a subset of the array which should
// be considered; by default the entire array is used. If x is already present
// in a, the insertion point will be before (to the left of) any existing
// entries. The return value is suitable for use as the first argument to
// `array.splice` assuming that a is already sorted.
//
// The returned insertion point i partitions the array a into two halves so that
// all v < x for v in a[lo:i] for the left side and all v >= x for v in a[i:hi]
// for the right side.
d3.bisectLeft = function(a, x, lo, hi) {
  if (arguments.length < 3) lo = 0;
  if (arguments.length < 4) hi = a.length;
  while (lo < hi) {
    var mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

// Similar to bisectLeft, but returns an insertion point which comes after (to
// the right of) any existing entries of x in a.
//
// The returned insertion point i partitions the array into two halves so that
// all v <= x for v in a[lo:i] for the left side and all v > x for v in a[i:hi]
// for the right side.
d3.bisect =
d3.bisectRight = function(a, x, lo, hi) {
  if (arguments.length < 3) lo = 0;
  if (arguments.length < 4) hi = a.length;
  while (lo < hi) {
    var mid = (lo + hi) >> 1;
    if (x < a[mid]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
};
d3.first = function(array, f) {
  var i = 0,
      n = array.length,
      a = array[0],
      b;
  if (arguments.length === 1) f = d3.ascending;
  while (++i < n) {
    if (f.call(array, a, b = array[i]) > 0) {
      a = b;
    }
  }
  return a;
};
d3.last = function(array, f) {
  var i = 0,
      n = array.length,
      a = array[0],
      b;
  if (arguments.length === 1) f = d3.ascending;
  while (++i < n) {
    if (f.call(array, a, b = array[i]) <= 0) {
      a = b;
    }
  }
  return a;
};
d3.nest = function() {
  var nest = {},
      keys = [],
      sortKeys = [],
      sortValues,
      rollup;

  function map(array, depth) {
    if (depth >= keys.length) return rollup
        ? rollup.call(nest, array) : (sortValues
        ? array.sort(sortValues)
        : array);

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        object,
        o = {};

    while (++i < n) {
      if ((keyValue = key(object = array[i])) in o) {
        o[keyValue].push(object);
      } else {
        o[keyValue] = [object];
      }
    }

    for (keyValue in o) {
      o[keyValue] = map(o[keyValue], depth);
    }

    return o;
  }

  function entries(map, depth) {
    if (depth >= keys.length) return map;

    var a = [],
        sortKey = sortKeys[depth++],
        key;

    for (key in map) {
      a.push({key: key, values: entries(map[key], depth)});
    }

    if (sortKey) a.sort(function(a, b) {
      return sortKey(a.key, b.key);
    });

    return a;
  }

  nest.map = function(array) {
    return map(array, 0);
  };

  nest.entries = function(array) {
    return entries(map(array, 0), 0);
  };

  nest.key = function(d) {
    keys.push(d);
    return nest;
  };

  // Specifies the order for the most-recently specified key.
  // Note: only applies to entries. Map keys are unordered!
  nest.sortKeys = function(order) {
    sortKeys[keys.length - 1] = order;
    return nest;
  };

  // Specifies the order for leaf values.
  // Applies to both maps and entries array.
  nest.sortValues = function(order) {
    sortValues = order;
    return nest;
  };

  nest.rollup = function(f) {
    rollup = f;
    return nest;
  };

  return nest;
};
d3.keys = function(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
};
d3.values = function(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
};
d3.entries = function(map) {
  var entries = [];
  for (var key in map) entries.push({key: key, value: map[key]});
  return entries;
};
d3.permute = function(array, indexes) {
  var permutes = [],
      i = -1,
      n = indexes.length;
  while (++i < n) permutes[i] = array[indexes[i]];
  return permutes;
};
d3.merge = function(arrays) {
  return Array.prototype.concat.apply([], arrays);
};
d3.split = function(array, f) {
  var arrays = [],
      values = [],
      value,
      i = -1,
      n = array.length;
  if (arguments.length < 2) f = d3_splitter;
  while (++i < n) {
    if (f.call(values, value = array[i], i)) {
      values = [];
    } else {
      if (!values.length) arrays.push(values);
      values.push(value);
    }
  }
  return arrays;
};

function d3_splitter(d) {
  return d == null;
}
function d3_collapse(s) {
  return s.replace(/(^\s+)|(\s+$)/g, "").replace(/\s+/g, " ");
}
/**
 * @param {number} start
 * @param {number=} stop
 * @param {number=} step
 */
d3.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step == Infinity) throw new Error("infinite range");
  var range = [],
       i = -1,
       j;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j);
  else while ((j = start + step * ++i) < stop) range.push(j);
  return range;
};
d3.requote = function(s) {
  return s.replace(d3_requote_re, "\\$&");
};

var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
d3.round = function(x, n) {
  return n
      ? Math.round(x * Math.pow(10, n)) * Math.pow(10, -n)
      : Math.round(x);
};
d3.xhr = function(url, mime, callback) {
  var req = new XMLHttpRequest;
  if (arguments.length < 3) callback = mime;
  else if (mime && req.overrideMimeType) req.overrideMimeType(mime);
  req.open("GET", url, true);
  req.onreadystatechange = function() {
    if (req.readyState === 4) callback(req.status < 300 ? req : null);
  };
  req.send(null);
};
d3.text = function(url, mime, callback) {
  function ready(req) {
    callback(req && req.responseText);
  }
  if (arguments.length < 3) {
    callback = mime;
    mime = null;
  }
  d3.xhr(url, mime, ready);
};
d3.json = function(url, callback) {
  d3.text(url, "application/json", function(text) {
    callback(text ? JSON.parse(text) : null);
  });
};
d3.html = function(url, callback) {
  d3.text(url, "text/html", function(text) {
    if (text != null) { // Treat empty string as valid HTML.
      var range = document.createRange();
      range.selectNode(document.body);
      text = range.createContextualFragment(text);
    }
    callback(text);
  });
};
d3.xml = function(url, mime, callback) {
  function ready(req) {
    callback(req && req.responseXML);
  }
  if (arguments.length < 3) {
    callback = mime;
    mime = null;
  }
  d3.xhr(url, mime, ready);
};
d3.ns = {

  prefix: {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  },

  qualify: function(name) {
    var i = name.indexOf(":");
    return i < 0 ? name : {
      space: d3.ns.prefix[name.substring(0, i)],
      local: name.substring(i + 1)
    };
  }

};
/** @param {...string} types */
d3.dispatch = function(types) {
  var dispatch = {},
      type;
  for (var i = 0, n = arguments.length; i < n; i++) {
    type = arguments[i];
    dispatch[type] = d3_dispatch(type);
  }
  return dispatch;
};

function d3_dispatch(type) {
  var dispatch = {},
      listeners = [];

  dispatch.add = function(listener) {
    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i].listener == listener) return dispatch; // already registered
    }
    listeners.push({listener: listener, on: true});
    return dispatch;
  };

  dispatch.remove = function(listener) {
    for (var i = 0; i < listeners.length; i++) {
      var l = listeners[i];
      if (l.listener == listener) {
        l.on = false;
        listeners = listeners.slice(0, i).concat(listeners.slice(i + 1));
        break;
      }
    }
    return dispatch;
  };

  dispatch.dispatch = function() {
    var ls = listeners; // defensive reference
    for (var i = 0, n = ls.length; i < n; i++) {
      var l = ls[i];
      if (l.on) l.listener.apply(this, arguments);
    }
  };

  return dispatch;
};
// TODO align
d3.format = function(specifier) {
  var match = d3_format_re.exec(specifier),
      fill = match[1] || " ",
      sign = match[3] || "",
      zfill = match[5],
      width = +match[6],
      comma = match[7],
      precision = match[8],
      type = match[9],
      percentage = false,
      integer = false;

  if (precision) precision = precision.substring(1);

  if (zfill) {
    fill = "0"; // TODO align = "=";
    if (comma) width -= Math.floor((width - 1) / 4);
  }

  switch (type) {
    case "n": comma = true; type = "g"; break;
    case "%": percentage = true; type = "f"; break;
    case "p": percentage = true; type = "r"; break;
    case "d": integer = true; precision = "0"; break;
  }

  type = d3_format_types[type] || d3_format_typeDefault;

  return function(value) {
    var number = percentage ? value * 100 : +value,
        negative = (number < 0) && (number = -number) ? "\u2212" : sign;

    // Return the empty string for floats formatted as ints.
    if (integer && (number % 1)) return "";

    // Convert the input value to the desired precision.
    value = type(number, precision);

    // If the fill character is 0, the sign and group is applied after the fill.
    if (zfill) {
      var length = value.length + negative.length;
      if (length < width) value = new Array(width - length + 1).join(fill) + value;
      if (comma) value = d3_format_group(value);
      value = negative + value;
    }

    // Otherwise (e.g., space-filling), the sign and group is applied before.
    else {
      if (comma) value = d3_format_group(value);
      value = negative + value;
      var length = value.length;
      if (length < width) value = new Array(width - length + 1).join(fill) + value;
    }
    if (percentage) value += "%";

    return value;
  };
};

// [[fill]align][sign][#][0][width][,][.precision][type]
var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?([0-9]+)?(,)?(\.[0-9]+)?([a-zA-Z%])?/;

var d3_format_types = {
  g: function(x, p) { return x.toPrecision(p); },
  e: function(x, p) { return x.toExponential(p); },
  f: function(x, p) { return x.toFixed(p); },
  r: function(x, p) {
    var n = x ? 1 + Math.floor(1e-15 + Math.log(x) / Math.LN10) : 1;
    return d3.round(x, p - n).toFixed(Math.max(0, Math.min(20, p - n)));
  }
};

function d3_format_typeDefault(x) {
  return x + "";
}

// Apply comma grouping for thousands.
function d3_format_group(value) {
  var i = value.lastIndexOf("."),
      f = i >= 0 ? value.substring(i) : (i = value.length, ""),
      t = [];
  while (i > 0) t.push(value.substring(i -= 3, i + 3));
  return t.reverse().join(",") + f;
}
/*
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the author nor the names of contributors may be used to
 *   endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var d3_ease_quad = d3_ease_poly(2),
    d3_ease_cubic = d3_ease_poly(3);

var d3_ease = {
  linear: function() { return d3_ease_linear; },
  poly: d3_ease_poly,
  quad: function() { return d3_ease_quad; },
  cubic: function() { return d3_ease_cubic; },
  sin: function() { return d3_ease_sin; },
  exp: function() { return d3_ease_exp; },
  circle: function() { return d3_ease_circle; },
  elastic: d3_ease_elastic,
  back: d3_ease_back,
  bounce: function() { return d3_ease_bounce; }
};

var d3_ease_mode = {
  "in": function(f) { return f; },
  "out": d3_ease_reverse,
  "in-out": d3_ease_reflect,
  "out-in": function(f) { return d3_ease_reflect(d3_ease_reverse(f)); }
};

d3.ease = function(name) {
  var i = name.indexOf("-"),
      t = i >= 0 ? name.substring(0, i) : name,
      m = i >= 0 ? name.substring(i + 1) : "in";
  return d3_ease_clamp(d3_ease_mode[m](d3_ease[t].apply(null, Array.prototype.slice.call(arguments, 1))));
};

function d3_ease_clamp(f) {
  return function(t) {
    return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
  };
}

function d3_ease_reverse(f) {
  return function(t) {
    return 1 - f(1 - t);
  };
}

function d3_ease_reflect(f) {
  return function(t) {
    return .5 * (t < .5 ? f(2 * t) : (2 - f(2 - 2 * t)));
  };
}

function d3_ease_linear(t) {
  return t;
}

function d3_ease_poly(e) {
  return function(t) {
    return Math.pow(t, e);
  }
}

function d3_ease_sin(t) {
  return 1 - Math.cos(t * Math.PI / 2);
}

function d3_ease_exp(t) {
  return Math.pow(2, 10 * (t - 1));
}

function d3_ease_circle(t) {
  return 1 - Math.sqrt(1 - t * t);
}

function d3_ease_elastic(a, p) {
  var s;
  if (arguments.length < 2) p = 0.45;
  if (arguments.length < 1) { a = 1; s = p / 4; }
  else s = p / (2 * Math.PI) * Math.asin(1 / a);
  return function(t) {
    return 1 + a * Math.pow(2, 10 * -t) * Math.sin((t - s) * 2 * Math.PI / p);
  };
}

function d3_ease_back(s) {
  if (!s) s = 1.70158;
  return function(t) {
    return t * t * ((s + 1) * t - s);
  };
}

function d3_ease_bounce(t) {
  return t < 1 / 2.75 ? 7.5625 * t * t
      : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75
      : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375
      : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
}
d3.event = null;
d3.interpolate = function(a, b) {
  var i = d3.interpolators.length, f;
  while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
  return f;
};

d3.interpolateNumber = function(a, b) {
  b -= a;
  return function(t) { return a + b * t; };
};

d3.interpolateRound = function(a, b) {
  b -= a;
  return function(t) { return Math.round(a + b * t); };
};

d3.interpolateString = function(a, b) {
  var m, // current match
      i, // current index
      j, // current index (for coallescing)
      s0 = 0, // start index of current string prefix
      s1 = 0, // end index of current string prefix
      s = [], // string constants and placeholders
      q = [], // number interpolators
      n, // q.length
      o;

  // Reset our regular expression!
  d3_interpolate_number.lastIndex = 0;

  // Find all numbers in b.
  for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
    if (m.index) s.push(b.substring(s0, s1 = m.index));
    q.push({i: s.length, x: m[0]});
    s.push(null);
    s0 = d3_interpolate_number.lastIndex;
  }
  if (s0 < b.length) s.push(b.substring(s0));

  // Find all numbers in a.
  for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
    o = q[i];
    if (o.x == m[0]) { // The numbers match, so coallesce.
      if (o.i) {
        if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i - 1] += o.x;
          s.splice(o.i, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        } else { // This match is followed by a string, so coallesce twice.
          s[o.i - 1] += o.x + s[o.i + 1];
          s.splice(o.i, 2);
          for (j = i + 1; j < n; ++j) q[j].i -= 2;
        }
      } else {
          if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i] = o.x;
        } else { // This match is followed by a string, so coallesce twice.
          s[o.i] = o.x + s[o.i + 1];
          s.splice(o.i + 1, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        }
      }
      q.splice(i, 1);
      n--;
      i--;
    } else {
      o.x = d3.interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
    }
  }

  // Remove any numbers in b not found in a.
  while (i < n) {
    o = q.pop();
    if (s[o.i + 1] == null) { // This match is followed by another number.
      s[o.i] = o.x;
    } else { // This match is followed by a string, so coallesce twice.
      s[o.i] = o.x + s[o.i + 1];
      s.splice(o.i + 1, 1);
    }
    n--;
  }

  // Special optimization for only a single match.
  if (s.length === 1) {
    return s[0] == null ? q[0].x : function() { return b; };
  }

  // Otherwise, interpolate each of the numbers and rejoin the string.
  return function(t) {
    for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
};

d3.interpolateRgb = function(a, b) {
  a = d3.rgb(a);
  b = d3.rgb(b);
  var ar = a.r,
      ag = a.g,
      ab = a.b,
      br = b.r - ar,
      bg = b.g - ag,
      bb = b.b - ab;
  return function(t) {
    return "rgb(" + Math.round(ar + br * t)
        + "," + Math.round(ag + bg * t)
        + "," + Math.round(ab + bb * t)
        + ")";
  };
};

// interpolates HSL space, but outputs RGB string (for compatibility)
d3.interpolateHsl = function(a, b) {
  a = d3.hsl(a);
  b = d3.hsl(b);
  var h0 = a.h,
      s0 = a.s,
      l0 = a.l,
      h1 = b.h - h0,
      s1 = b.s - s0,
      l1 = b.l - l0;
  return function(t) {
    return d3_hsl_rgb(h0 + h1 * t, s0 + s1 * t, l0 + l1 * t).toString();
  };
};

d3.interpolateArray = function(a, b) {
  var x = [],
      c = [],
      na = a.length,
      nb = b.length,
      n0 = Math.min(a.length, b.length),
      i;
  for (i = 0; i < n0; ++i) x.push(d3.interpolate(a[i], b[i]));
  for (; i < na; ++i) c[i] = a[i];
  for (; i < nb; ++i) c[i] = b[i];
  return function(t) {
    for (i = 0; i < n0; ++i) c[i] = x[i](t);
    return c;
  };
};

d3.interpolateObject = function(a, b) {
  var i = {},
      c = {},
      k;
  for (k in a) {
    if (k in b) {
      i[k] = d3_interpolateByName(k)(a[k], b[k]);
    } else {
      c[k] = a[k];
    }
  }
  for (k in b) {
    if (!(k in a)) {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var d3_interpolate_number = /[-+]?(?:\d+\.\d+|\d+\.|\.\d+|\d+)(?:[eE][-]?\d+)?/g,
    d3_interpolate_rgb = {background: 1, fill: 1, stroke: 1};

function d3_interpolateByName(n) {
  return n in d3_interpolate_rgb || /\bcolor\b/.test(n)
      ? d3.interpolateRgb
      : d3.interpolate;
}

d3.interpolators = [
  d3.interpolateObject,
  function(a, b) { return (b instanceof Array) && d3.interpolateArray(a, b); },
  function(a, b) { return (typeof b === "string") && d3.interpolateString(String(a), b); },
  function(a, b) { return (typeof b === "string" ? b in d3_rgb_names || /^(#|rgb\(|hsl\()/.test(b) : b instanceof d3_Rgb || b instanceof d3_Hsl) && d3.interpolateRgb(String(a), b); },
  function(a, b) { return (typeof b === "number") && d3.interpolateNumber(+a, b); }
];
function d3_uninterpolateNumber(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return (x - a) * b; };
}

function d3_uninterpolateClamp(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return Math.max(0, Math.min(1, (x - a) * b)); };
}
d3.rgb = function(r, g, b) {
  return arguments.length === 1
      ? d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb)
      : d3_rgb(~~r, ~~g, ~~b);
};

function d3_rgb(r, g, b) {
  return new d3_Rgb(r, g, b);
}

function d3_Rgb(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

d3_Rgb.prototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  var r = this.r,
      g = this.g,
      b = this.b,
      i = 30;
  if (!r && !g && !b) return d3_rgb(i, i, i);
  if (r && r < i) r = i;
  if (g && g < i) g = i;
  if (b && b < i) b = i;
  return d3_rgb(
    Math.min(255, Math.floor(r / k)),
    Math.min(255, Math.floor(g / k)),
    Math.min(255, Math.floor(b / k)));
};

d3_Rgb.prototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_rgb(
    Math.max(0, Math.floor(k * this.r)),
    Math.max(0, Math.floor(k * this.g)),
    Math.max(0, Math.floor(k * this.b)));
};

d3_Rgb.prototype.hsl = function() {
  return d3_rgb_hsl(this.r, this.g, this.b);
};

d3_Rgb.prototype.toString = function() {
  return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
};

function d3_rgb_hex(v) {
  return v < 0x10 ? "0" + v.toString(16) : v.toString(16);
}

function d3_rgb_parse(format, rgb, hsl) {
  var r = 0, // red channel; int in [0, 255]
      g = 0, // green channel; int in [0, 255]
      b = 0, // blue channel; int in [0, 255]
      m1, // CSS color specification match
      m2, // CSS color specification type (e.g., rgb)
      name;

  /* Handle hsl, rgb. */
  m1 = /([a-z]+)\((.*)\)/i.exec(format);
  if (m1) {
    m2 = m1[2].split(",");
    switch (m1[1]) {
      case "hsl": {
        return hsl(
          parseFloat(m2[0]), // degrees
          parseFloat(m2[1]) / 100, // percentage
          parseFloat(m2[2]) / 100 // percentage
        );
      }
      case "rgb": {
        return rgb(
          d3_rgb_parseNumber(m2[0]),
          d3_rgb_parseNumber(m2[1]),
          d3_rgb_parseNumber(m2[2])
        );
      }
    }
  }

  /* Named colors. */
  if (name = d3_rgb_names[format]) return rgb(name.r, name.g, name.b);

  /* Hexadecimal colors: #rgb and #rrggbb. */
  if (format != null && format.charAt(0) === "#") {
    if (format.length === 4) {
      r = format.charAt(1); r += r;
      g = format.charAt(2); g += g;
      b = format.charAt(3); b += b;
    } else if (format.length === 7) {
      r = format.substring(1, 3);
      g = format.substring(3, 5);
      b = format.substring(5, 7);
    }
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
  }

  return rgb(r, g, b);
}

function d3_rgb_hsl(r, g, b) {
  var min = Math.min(r /= 255, g /= 255, b /= 255),
      max = Math.max(r, g, b),
      d = max - min,
      h,
      s,
      l = (max + min) / 2;
  if (d) {
    s = l < .5 ? d / (max + min) : d / (2 - max - min);
    if (r == max) h = (g - b) / d + (g < b ? 6 : 0);
    else if (g == max) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  } else {
    s = h = 0;
  }
  return d3_hsl(h, s, l);
}

function d3_rgb_parseNumber(c) { // either integer or percentage
  var f = parseFloat(c);
  return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
}

var d3_rgb_names = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
};

for (var d3_rgb_name in d3_rgb_names) {
  d3_rgb_names[d3_rgb_name] = d3_rgb_parse(
      d3_rgb_names[d3_rgb_name],
      d3_rgb,
      d3_hsl_rgb);
}
d3.hsl = function(h, s, l) {
  return arguments.length === 1
      ? d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl)
      : d3_hsl(+h, +s, +l);
};

function d3_hsl(h, s, l) {
  return new d3_Hsl(h, s, l);
}

function d3_Hsl(h, s, l) {
  this.h = h;
  this.s = s;
  this.l = l;
}

d3_Hsl.prototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, this.l / k);
};

d3_Hsl.prototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, k * this.l);
};

d3_Hsl.prototype.rgb = function() {
  return d3_hsl_rgb(this.h, this.s, this.l);
};

d3_Hsl.prototype.toString = function() {
  return "hsl(" + this.h + "," + this.s * 100 + "%," + this.l * 100 + "%)";
};

function d3_hsl_rgb(h, s, l) {
  var m1,
      m2;

  /* Some simple corrections for h, s and l. */
  h = h % 360; if (h < 0) h += 360;
  s = s < 0 ? 0 : s > 1 ? 1 : s;
  l = l < 0 ? 0 : l > 1 ? 1 : l;

  /* From FvD 13.37, CSS Color Module Level 3 */
  m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
  m1 = 2 * l - m2;

  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    if (h < 180) return m2;
    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }

  function vv(h) {
    return Math.round(v(h) * 255);
  }

  return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
}
function d3_selection(groups) {
  d3_arraySubclass(groups, d3_selectionPrototype);
  return groups;
}

var d3_select = function(s, n) { return n.querySelector(s); },
    d3_selectAll = function(s, n) { return n.querySelectorAll(s); };

// Prefer Sizzle, if available.
if (typeof Sizzle === "function") {
  d3_select = function(s, n) { return Sizzle(s, n)[0]; };
  d3_selectAll = function(s, n) { return Sizzle.uniqueSort(Sizzle(s, n)); };
}

var d3_selectionPrototype = [];

d3.selection = function() {
  return d3_selectionRoot;
};

d3.selection.prototype = d3_selectionPrototype;
d3_selectionPrototype.select = function(selector) {
  var subgroups = [],
      subgroup,
      subnode,
      group,
      node;

  if (typeof selector !== "function") selector = d3_selection_selector(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    subgroup.parentNode = (group = this[j]).parentNode;
    for (var i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroup.push(subnode = selector.call(node, node.__data__, i));
        if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
      } else {
        subgroup.push(null);
      }
    }
  }

  return d3_selection(subgroups);
};

function d3_selection_selector(selector) {
  return function() {
    return d3_select(selector, this);
  };
}
d3_selectionPrototype.selectAll = function(selector) {
  var subgroups = [],
      subgroup,
      node;

  if (typeof selector !== "function") selector = d3_selection_selectorAll(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i)));
        subgroup.parentNode = node;
      }
    }
  }

  return d3_selection(subgroups);
};

function d3_selection_selectorAll(selector) {
  return function() {
    return d3_selectAll(selector, this);
  };
}
d3_selectionPrototype.attr = function(name, value) {
  name = d3.ns.qualify(name);

  // If no value is specified, return the first value.
  if (arguments.length < 2) {
    var node = this.node();
    return name.local
        ? node.getAttributeNS(name.space, name.local)
        : node.getAttribute(name);
  }

  function attrNull() {
    this.removeAttribute(name);
  }

  function attrNullNS() {
    this.removeAttributeNS(name.space, name.local);
  }

  function attrConstant() {
    this.setAttribute(name, value);
  }

  function attrConstantNS() {
    this.setAttributeNS(name.space, name.local, value);
  }

  function attrFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttribute(name);
    else this.setAttribute(name, x);
  }

  function attrFunctionNS() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttributeNS(name.space, name.local);
    else this.setAttributeNS(name.space, name.local, x);
  }

  return this.each(value == null
      ? (name.local ? attrNullNS : attrNull) : (typeof value === "function"
      ? (name.local ? attrFunctionNS : attrFunction)
      : (name.local ? attrConstantNS : attrConstant)));
};
d3_selectionPrototype.classed = function(name, value) {
  var re = new RegExp("(^|\\s+)" + d3.requote(name) + "(\\s+|$)", "g");

  // If no value is specified, return the first value.
  if (arguments.length < 2) {
    var node = this.node();
    if (c = node.classList) return c.contains(name);
    var c = node.className;
    re.lastIndex = 0;
    return re.test(c.baseVal != null ? c.baseVal : c);
  }

  function classedAdd() {
    if (c = this.classList) return c.add(name);
    var c = this.className,
        cb = c.baseVal != null,
        cv = cb ? c.baseVal : c;
    re.lastIndex = 0;
    if (!re.test(cv)) {
      cv = d3_collapse(cv + " " + name);
      if (cb) c.baseVal = cv;
      else this.className = cv;
    }
  }

  function classedRemove() {
    if (c = this.classList) return c.remove(name);
    var c = this.className,
        cb = c.baseVal != null,
        cv = cb ? c.baseVal : c;
    cv = d3_collapse(cv.replace(re, " "));
    if (cb) c.baseVal = cv;
    else this.className = cv;
  }

  function classedFunction() {
    (value.apply(this, arguments)
        ? classedAdd
        : classedRemove).call(this);
  }

  return this.each(typeof value === "function"
      ? classedFunction : value
      ? classedAdd
      : classedRemove);
};
d3_selectionPrototype.style = function(name, value, priority) {
  if (arguments.length < 3) priority = "";

  // If no value is specified, return the first value.
  if (arguments.length < 2) return window
      .getComputedStyle(this.node(), null)
      .getPropertyValue(name);

  function styleNull() {
    this.style.removeProperty(name);
  }

  function styleConstant() {
    this.style.setProperty(name, value, priority);
  }

  function styleFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.style.removeProperty(name);
    else this.style.setProperty(name, x, priority);
  }

  return this.each(value == null
      ? styleNull : (typeof value === "function"
      ? styleFunction : styleConstant));
};
d3_selectionPrototype.property = function(name, value) {

  // If no value is specified, return the first value.
  if (arguments.length < 2) return this.node()[name];

  function propertyNull() {
    delete this[name];
  }

  function propertyConstant() {
    this[name] = value;
  }

  function propertyFunction() {
    var x = value.apply(this, arguments);
    if (x == null) delete this[name];
    else this[name] = x;
  }

  return this.each(value == null
      ? propertyNull : (typeof value === "function"
      ? propertyFunction : propertyConstant));
};
d3_selectionPrototype.text = function(value) {
  return arguments.length < 1 ? this.node().textContent
      : (this.each(typeof value === "function"
      ? function() { this.textContent = value.apply(this, arguments); }
      : function() { this.textContent = value; }));
};
d3_selectionPrototype.html = function(value) {
  return arguments.length < 1 ? this.node().innerHTML
      : (this.each(typeof value === "function"
      ? function() { this.innerHTML = value.apply(this, arguments); }
      : function() { this.innerHTML = value; }));
};
// TODO append(node)?
// TODO append(function)?
d3_selectionPrototype.append = function(name) {
  name = d3.ns.qualify(name);

  function append() {
    return this.appendChild(document.createElement(name));
  }

  function appendNS() {
    return this.appendChild(document.createElementNS(name.space, name.local));
  }

  return this.select(name.local ? appendNS : append);
};
// TODO insert(node, function)?
// TODO insert(function, string)?
// TODO insert(function, function)?
d3_selectionPrototype.insert = function(name, before) {
  name = d3.ns.qualify(name);

  function insert() {
    return this.insertBefore(
        document.createElement(name),
        d3_select(before, this));
  }

  function insertNS() {
    return this.insertBefore(
        document.createElementNS(name.space, name.local),
        d3_select(before, this));
  }

  return this.select(name.local ? insertNS : insert);
};
// TODO remove(selector)?
// TODO remove(node)?
// TODO remove(function)?
d3_selectionPrototype.remove = function() {
  return this.each(function() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  });
};
// TODO data(null) for clearing data?
d3_selectionPrototype.data = function(data, join) {
  var enter = [],
      update = [],
      exit = [];

  function bind(group, groupData) {
    var i,
        n = group.length,
        m = groupData.length,
        n0 = Math.min(n, m),
        n1 = Math.max(n, m),
        updateNodes = [],
        enterNodes = [],
        exitNodes = [],
        node,
        nodeData;

    if (join) {
      var nodeByKey = {},
          keys = [],
          key,
          j = groupData.length;

      for (i = -1; ++i < n;) {
        key = join.call(node = group[i], node.__data__, i);
        if (key in nodeByKey) {
          exitNodes[j++] = node; // duplicate key
        } else {
          nodeByKey[key] = node;
        }
        keys.push(key);
      }

      for (i = -1; ++i < m;) {
        node = nodeByKey[key = join.call(groupData, nodeData = groupData[i], i)];
        if (node) {
          node.__data__ = nodeData;
          updateNodes[i] = node;
          enterNodes[i] = exitNodes[i] = null;
        } else {
          enterNodes[i] = d3_selection_dataNode(nodeData);
          updateNodes[i] = exitNodes[i] = null;
        }
        delete nodeByKey[key];
      }

      for (i = -1; ++i < n;) {
        if (keys[i] in nodeByKey) {
          exitNodes[i] = group[i];
        }
      }
    } else {
      for (i = -1; ++i < n0;) {
        node = group[i];
        nodeData = groupData[i];
        if (node) {
          node.__data__ = nodeData;
          updateNodes[i] = node;
          enterNodes[i] = exitNodes[i] = null;
        } else {
          enterNodes[i] = d3_selection_dataNode(nodeData);
          updateNodes[i] = exitNodes[i] = null;
        }
      }
      for (; i < m; ++i) {
        enterNodes[i] = d3_selection_dataNode(groupData[i]);
        updateNodes[i] = exitNodes[i] = null;
      }
      for (; i < n1; ++i) {
        exitNodes[i] = group[i];
        enterNodes[i] = updateNodes[i] = null;
      }
    }

    enterNodes.update
        = updateNodes;

    enterNodes.parentNode
        = updateNodes.parentNode
        = exitNodes.parentNode
        = group.parentNode;

    enter.push(enterNodes);
    update.push(updateNodes);
    exit.push(exitNodes);
  }

  var i = -1,
      n = this.length,
      group;
  if (typeof data === "function") {
    while (++i < n) {
      bind(group = this[i], data.call(group, group.parentNode.__data__, i));
    }
  } else {
    while (++i < n) {
      bind(group = this[i], data);
    }
  }

  var selection = d3_selection(update);
  selection.enter = function() { return d3_selection_enter(enter); };
  selection.exit = function() { return d3_selection(exit); };
  return selection;
};

function d3_selection_dataNode(data) {
  return {__data__: data};
}
function d3_selection_enter(selection) {
  d3_arraySubclass(selection, d3_selection_enterPrototype);
  return selection;
}

var d3_selection_enterPrototype = [];

d3_selection_enterPrototype.append = d3_selectionPrototype.append;
d3_selection_enterPrototype.insert = d3_selectionPrototype.insert;
d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
d3_selection_enterPrototype.select = function(selector) {
  var subgroups = [],
      subgroup,
      subnode,
      upgroup,
      group,
      node;

  for (var j = -1, m = this.length; ++j < m;) {
    upgroup = (group = this[j]).update;
    subgroups.push(subgroup = []);
    subgroup.parentNode = group.parentNode;
    for (var i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i));
        subnode.__data__ = node.__data__;
      } else {
        subgroup.push(null);
      }
    }
  }

  return d3_selection(subgroups);
};
// TODO preserve null elements to maintain index?
d3_selectionPrototype.filter = function(filter) {
  var subgroups = [],
      subgroup,
      group,
      node;

  for (var j = 0, m = this.length; j < m; j++) {
    subgroups.push(subgroup = []);
    subgroup.parentNode = (group = this[j]).parentNode;
    for (var i = 0, n = group.length; i < n; i++) {
      if ((node = group[i]) && filter.call(node, node.__data__, i)) {
        subgroup.push(node);
      }
    }
  }

  return d3_selection(subgroups);
};
d3_selectionPrototype.map = function(map) {
  return this.each(function() {
    this.__data__ = map.apply(this, arguments);
  });
};
d3_selectionPrototype.sort = function(comparator) {
  comparator = d3_selection_sortComparator.apply(this, arguments);
  for (var j = 0, m = this.length; j < m; j++) {
    for (var group = this[j].sort(comparator), i = 1, n = group.length, prev = group[0]; i < n; i++) {
      var node = group[i];
      if (node) {
        if (prev) prev.parentNode.insertBefore(node, prev.nextSibling);
        prev = node;
      }
    }
  }
  return this;
};

function d3_selection_sortComparator(comparator) {
  if (!arguments.length) comparator = d3.ascending;
  return function(a, b) {
    return comparator(a && a.__data__, b && b.__data__);
  };
}
// type can be namespaced, e.g., "click.foo"
// listener can be null for removal
d3_selectionPrototype.on = function(type, listener, capture) {
  if (arguments.length < 3) capture = false;

  // parse the type specifier
  var name = "__on" + type, i = type.indexOf(".");
  if (i > 0) type = type.substring(0, i);

  // if called with only one argument, return the current listener
  if (arguments.length < 2) return (i = this.node()[name]) && i._;

  // remove the old event listener, and add the new event listener
  return this.each(function(d, i) {
    var node = this;

    if (node[name]) node.removeEventListener(type, node[name], capture);
    if (listener) node.addEventListener(type, node[name] = l, capture);

    // wrapped event listener that preserves i
    function l(e) {
      var o = d3.event; // Events can be reentrant (e.g., focus).
      d3.event = e;
      try {
        listener.call(node, node.__data__, i);
      } finally {
        d3.event = o;
      }
    }

    // stash the unwrapped listener for retrieval
    l._ = listener;
  });
};
d3_selectionPrototype.each = function(callback) {
  for (var j = -1, m = this.length; ++j < m;) {
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      var node = group[i];
      if (node) callback.call(node, node.__data__, i, j);
    }
  }
  return this;
};
//
// Note: assigning to the arguments array simultaneously changes the value of
// the corresponding argument!
//
// TODO The `this` argument probably shouldn't be the first argument to the
// callback, anyway, since it's redundant. However, that will require a major
// version bump due to backwards compatibility, so I'm not changing it right
// away.
//
d3_selectionPrototype.call = function(callback) {
  callback.apply(this, (arguments[0] = this, arguments));
  return this;
};
d3_selectionPrototype.empty = function() {
  return !this.node();
};
d3_selectionPrototype.node = function(callback) {
  for (var j = 0, m = this.length; j < m; j++) {
    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
};
d3_selectionPrototype.transition = function() {
  var subgroups = [],
      subgroup,
      node;

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      subgroup.push((node = group[i]) ? {node: node, delay: 0, duration: 250} : null);
    }
  }

  return d3_transition(subgroups, d3_transitionInheritId || ++d3_transitionId);
};
var d3_selectionRoot = d3_selection([[document]]);

d3_selectionRoot[0].parentNode = document.documentElement;

// TODO fast singleton implementation!
// TODO select(function)
d3.select = function(selector) {
  return typeof selector === "string"
      ? d3_selectionRoot.select(selector)
      : d3_selection([[selector]]); // assume node
};

// TODO selectAll(function)
d3.selectAll = function(selector) {
  return typeof selector === "string"
      ? d3_selectionRoot.selectAll(selector)
      : d3_selection([d3_array(selector)]); // assume node[]
};
function d3_transition(groups, id) {
  d3_arraySubclass(groups, d3_transitionPrototype);

  var tweens = {},
      event = d3.dispatch("start", "end"),
      ease = d3_transitionEase,
      then = Date.now();

  groups.id = id;

  groups.tween = function(name, tween) {
    if (arguments.length < 2) return tweens[name];
    if (tween == null) delete tweens[name];
    else tweens[name] = tween;
    return groups;
  };

  groups.ease = function(value) {
    if (!arguments.length) return ease;
    ease = typeof value === "function" ? value : d3.ease.apply(d3, arguments);
    return groups;
  };

  groups.each = function(type, listener) {
    if (arguments.length < 2) return d3_transition_each.call(groups, type);
    event[type].add(listener);
    return groups;
  };

  d3.timer(function(elapsed) {
    groups.each(function(d, i, j) {
      var tweened = [],
          node = this,
          delay = groups[j][i].delay,
          duration = groups[j][i].duration,
          lock = node.__transition__ || (node.__transition__ = {active: 0, count: 0});

      ++lock.count;

      delay <= elapsed ? start(elapsed) : d3.timer(start, delay, then);

      function start(elapsed) {
        if (lock.active > id) return stop();
        lock.active = id;

        for (var tween in tweens) {
          if (tween = tweens[tween].call(node, d, i)) {
            tweened.push(tween);
          }
        }

        event.start.dispatch.call(node, d, i);
        if (!tick(elapsed)) d3.timer(tick, 0, then);
        return 1;
      }

      function tick(elapsed) {
        if (lock.active !== id) return stop();

        var t = (elapsed - delay) / duration,
            e = ease(t),
            n = tweened.length;

        while (n > 0) {
          tweened[--n].call(node, e);
        }

        if (t >= 1) {
          stop();
          d3_transitionInheritId = id;
          event.end.dispatch.call(node, d, i);
          d3_transitionInheritId = 0;
          return 1;
        }
      }

      function stop() {
        if (!--lock.count) delete node.__transition__;
        return 1;
      }
    });
    return 1;
  }, 0, then);

  return groups;
}

function d3_transitionTween(b) {
  return typeof b === "function"
      ? function(d, i, a) { var v = b.call(this, d, i) + ""; return a != v && d3.interpolate(a, v); }
      : (b = b + "", function(d, i, a) { return a != b && d3.interpolate(a, b); });
}

var d3_transitionPrototype = [],
    d3_transitionId = 0,
    d3_transitionInheritId = 0,
    d3_transitionEase = d3.ease("cubic-in-out");

d3_transitionPrototype.call = d3_selectionPrototype.call;

d3.transition = function() {
  return d3_selectionRoot.transition();
};

d3.transition.prototype = d3_transitionPrototype;
d3_transitionPrototype.select = function(selector) {
  var subgroups = [],
      subgroup,
      subnode,
      node;

  if (typeof selector !== "function") selector = d3_selection_selector(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if ((node = group[i]) && (subnode = selector.call(node.node, node.node.__data__, i))) {
        if ("__data__" in node.node) subnode.__data__ = node.node.__data__;
        subgroup.push({node: subnode, delay: node.delay, duration: node.duration});
      } else {
        subgroup.push(null);
      }
    }
  }

  return d3_transition(subgroups, this.id).ease(this.ease());
};
d3_transitionPrototype.selectAll = function(selector) {
  var subgroups = [],
      subgroup,
      node;

  if (typeof selector !== "function") selector = d3_selection_selectorAll(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroups.push(subgroup = selector.call(node.node, node.node.__data__, i));
        for (var k = -1, o = subgroup.length; ++k < o;) {
          subgroup[k] = {node: subgroup[k], delay: node.delay, duration: node.duration};
        }
      }
    }
  }

  return d3_transition(subgroups, this.id).ease(this.ease());
};
d3_transitionPrototype.attr = function(name, value) {
  return this.attrTween(name, d3_transitionTween(value));
};

d3_transitionPrototype.attrTween = function(name, tween) {
  name = d3.ns.qualify(name);

  function attrTween(d, i) {
    var f = tween.call(this, d, i, this.getAttribute(name));
    return f && function(t) {
      this.setAttribute(name, f(t));
    };
  }

  function attrTweenNS(d, i) {
    var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
    return f && function(t) {
      this.setAttributeNS(name.space, name.local, f(t));
    };
  }

  return this.tween("attr." + name, name.local ? attrTweenNS : attrTween);
};
d3_transitionPrototype.style = function(name, value, priority) {
  if (arguments.length < 3) priority = "";
  return this.styleTween(name, d3_transitionTween(value), priority);
};

d3_transitionPrototype.styleTween = function(name, tween, priority) {
  if (arguments.length < 3) priority = "";
  return this.tween("style." + name, function(d, i) {
    var f = tween.call(this, d, i, window.getComputedStyle(this, null).getPropertyValue(name));
    return f && function(t) {
      this.style.setProperty(name, f(t), priority);
    };
  });
};
d3_transitionPrototype.text = function(value) {
  return this.tween("text", function(d, i) {
    this.textContent = typeof value === "function"
        ? value.call(this, d, i)
        : value;
  });
};
d3_transitionPrototype.remove = function() {
  return this.each("end", function() {
    var p;
    if (!this.__transition__ && (p = this.parentNode)) p.removeChild(this);
  });
};
d3_transitionPrototype.delay = function(value) {
  var groups = this;
  return groups.each(typeof value === "function"
      ? function(d, i, j) { groups[j][i].delay = +value.apply(this, arguments); }
      : (value = +value, function(d, i, j) { groups[j][i].delay = value; }));
};
d3_transitionPrototype.duration = function(value) {
  var groups = this;
  return groups.each(typeof value === "function"
      ? function(d, i, j) { groups[j][i].duration = +value.apply(this, arguments); }
      : (value = +value, function(d, i, j) { groups[j][i].duration = value; }));
};
function d3_transition_each(callback) {
  for (var j = 0, m = this.length; j < m; j++) {
    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
      var node = group[i];
      if (node) callback.call(node = node.node, node.__data__, i, j);
    }
  }
  return this;
}
d3_transitionPrototype.transition = function() {
  return this.select(d3_this);
};
var d3_timer_queue = null,
    d3_timer_interval, // is an interval (or frame) active?
    d3_timer_timeout; // is a timeout active?

// The timer will continue to fire until callback returns true.
d3.timer = function(callback, delay, then) {
  var found = false,
      t0,
      t1 = d3_timer_queue;

  if (arguments.length < 3) {
    if (arguments.length < 2) delay = 0;
    else if (!isFinite(delay)) return;
    then = Date.now();
  }

  // See if the callback's already in the queue.
  while (t1) {
    if (t1.callback === callback) {
      t1.then = then;
      t1.delay = delay;
      found = true;
      break;
    }
    t0 = t1;
    t1 = t1.next;
  }

  // Otherwise, add the callback to the queue.
  if (!found) d3_timer_queue = {
    callback: callback,
    then: then,
    delay: delay,
    next: d3_timer_queue
  };

  // Start animatin'!
  if (!d3_timer_interval) {
    d3_timer_timeout = clearTimeout(d3_timer_timeout);
    d3_timer_interval = 1;
    d3_timer_frame(d3_timer_step);
  }
}

function d3_timer_step() {
  var elapsed,
      now = Date.now(),
      t1 = d3_timer_queue;

  while (t1) {
    elapsed = now - t1.then;
    if (elapsed >= t1.delay) t1.flush = t1.callback(elapsed);
    t1 = t1.next;
  }

  var delay = d3_timer_flush() - now;
  if (delay > 24) {
    if (isFinite(delay)) {
      clearTimeout(d3_timer_timeout);
      d3_timer_timeout = setTimeout(d3_timer_step, delay);
    }
    d3_timer_interval = 0;
  } else {
    d3_timer_interval = 1;
    d3_timer_frame(d3_timer_step);
  }
}

d3.timer.flush = function() {
  var elapsed,
      now = Date.now(),
      t1 = d3_timer_queue;

  while (t1) {
    elapsed = now - t1.then;
    if (!t1.delay) t1.flush = t1.callback(elapsed);
    t1 = t1.next;
  }

  d3_timer_flush();
};

// Flush after callbacks, to avoid concurrent queue modification.
function d3_timer_flush() {
  var t0 = null,
      t1 = d3_timer_queue,
      then = Infinity;
  while (t1) {
    if (t1.flush) {
      t1 = t0 ? t0.next = t1.next : d3_timer_queue = t1.next;
    } else {
      then = Math.min(then, t1.then + t1.delay);
      t1 = (t0 = t1).next;
    }
  }
  return then;
}

var d3_timer_frame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) { setTimeout(callback, 17); };
function d3_noop() {}
d3.scale = {};

function d3_scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  return start < stop ? [start, stop] : [stop, start];
}
function d3_scale_nice(domain, nice) {
  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      dx;

  if (x1 < x0) {
    dx = i0; i0 = i1; i1 = dx;
    dx = x0; x0 = x1; x1 = dx;
  }

  nice = nice(x1 - x0);
  domain[i0] = nice.floor(x0);
  domain[i1] = nice.ceil(x1);
  return domain;
}

function d3_scale_niceDefault() {
  return Math;
}
d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3.interpolate, false);
};

function d3_scale_linear(domain, range, interpolate, clamp) {
  var output,
      input;

  function rescale() {
    var linear = domain.length == 2 ? d3_scale_bilinear : d3_scale_polylinear,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3.interpolate);
    return scale;
  }

  function scale(x) {
    return output(x);
  }

  // Note: requires range is coercible to number!
  scale.invert = function(y) {
    return input(y);
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(Number);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3.interpolateRound);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return clamp;
    clamp = x;
    return rescale();
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m) {
    return d3_scale_linearTickFormat(domain, m);
  };

  scale.nice = function() {
    d3_scale_nice(domain, d3_scale_linearNice);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, interpolate, clamp);
  };

  return rescale();
};

function d3_scale_linearRebind(scale, linear) {
  scale.range = d3.rebind(scale, linear.range);
  scale.rangeRound = d3.rebind(scale, linear.rangeRound);
  scale.interpolate = d3.rebind(scale, linear.interpolate);
  scale.clamp = d3.rebind(scale, linear.clamp);
  return scale;
}

function d3_scale_linearNice(dx) {
  dx = Math.pow(10, Math.round(Math.log(dx) / Math.LN10) - 1);
  return {
    floor: function(x) { return Math.floor(x / dx) * dx; },
    ceil: function(x) { return Math.ceil(x / dx) * dx; }
  };
}

// TODO Dates? Ugh.
function d3_scale_linearTickRange(domain, m) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_linearTicks(domain, m) {
  return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
}

function d3_scale_linearTickFormat(domain, m) {
  return d3.format(",." + Math.max(0, -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01)) + "f");
}
function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
  var u = uninterpolate(domain[0], domain[1]),
      i = interpolate(range[0], range[1]);
  return function(x) {
    return i(u(x));
  };
}
function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
  var u = [],
      i = [],
      j = 0,
      n = domain.length;

  while (++j < n) {
    u.push(uninterpolate(domain[j - 1], domain[j]));
    i.push(interpolate(range[j - 1], range[j]));
  }

  return function(x) {
    var j = d3.bisect(domain, x, 1, domain.length - 1) - 1;
    return i[j](u[j](x));
  };
}
d3.scale.log = function() {
  return d3_scale_log(d3.scale.linear(), d3_scale_logp);
};

function d3_scale_log(linear, log) {
  var pow = log.pow;

  function scale(x) {
    return linear(log(x));
  }

  scale.invert = function(x) {
    return pow(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return linear.domain().map(pow);
    log = x[0] < 0 ? d3_scale_logn : d3_scale_logp;
    pow = log.pow;
    linear.domain(x.map(log));
    return scale;
  };

  scale.nice = function() {
    linear.domain(d3_scale_nice(linear.domain(), d3_scale_niceDefault));
    return scale;
  };

  scale.ticks = function() {
    var extent = d3_scaleExtent(linear.domain()),
        ticks = [];
    if (extent.every(isFinite)) {
      var i = Math.floor(extent[0]),
          j = Math.ceil(extent[1]),
          u = Math.round(pow(extent[0])),
          v = Math.round(pow(extent[1]));
      if (log === d3_scale_logn) {
        ticks.push(pow(i));
        for (; i++ < j;) for (var k = 9; k > 0; k--) ticks.push(pow(i) * k);
      } else {
        for (; i < j; i++) for (var k = 1; k < 10; k++) ticks.push(pow(i) * k);
        ticks.push(pow(i));
      }
      for (i = 0; ticks[i] < u; i++) {} // strip small values
      for (j = ticks.length; ticks[j - 1] > v; j--) {} // strip big values
      ticks = ticks.slice(i, j);
    }
    return ticks;
  };

  scale.tickFormat = function(n, format) {
    if (arguments.length < 2) format = d3_scale_logFormat;
    if (arguments.length < 1) return format;
    var k = n / scale.ticks().length,
        f = log === d3_scale_logn ? (e = -1e-15, Math.floor) : (e = 1e-15, Math.ceil),
        e;
    return function(d) {
      return d / pow(f(log(d) + e)) < k ? format(d) : "";
    };
  };

  scale.copy = function() {
    return d3_scale_log(linear.copy(), log);
  };

  return d3_scale_linearRebind(scale, linear);
};

var d3_scale_logFormat = d3.format("e");

function d3_scale_logp(x) {
  return Math.log(x) / Math.LN10;
}

function d3_scale_logn(x) {
  return -Math.log(-x) / Math.LN10;
}

d3_scale_logp.pow = function(x) {
  return Math.pow(10, x);
};

d3_scale_logn.pow = function(x) {
  return -Math.pow(10, -x);
};
d3.scale.pow = function() {
  return d3_scale_pow(d3.scale.linear(), 1);
};

function d3_scale_pow(linear, exponent) {
  var powp = d3_scale_powPow(exponent),
      powb = d3_scale_powPow(1 / exponent);

  function scale(x) {
    return linear(powp(x));
  }

  scale.invert = function(x) {
    return powb(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return linear.domain().map(powb);
    linear.domain(x.map(powp));
    return scale;
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(scale.domain(), m);
  };

  scale.tickFormat = function(m) {
    return d3_scale_linearTickFormat(scale.domain(), m);
  };

  scale.nice = function() {
    return scale.domain(d3_scale_nice(scale.domain(), d3_scale_linearNice));
  };

  scale.exponent = function(x) {
    if (!arguments.length) return exponent;
    var domain = scale.domain();
    powp = d3_scale_powPow(exponent = x);
    powb = d3_scale_powPow(1 / exponent);
    return scale.domain(domain);
  };

  scale.copy = function() {
    return d3_scale_pow(linear.copy(), exponent);
  };

  return d3_scale_linearRebind(scale, linear);
};

function d3_scale_powPow(e) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
  };
}
d3.scale.sqrt = function() {
  return d3.scale.pow().exponent(.5);
};
d3.scale.ordinal = function() {
  return d3_scale_ordinal([], {t: "range", x: []});
};

function d3_scale_ordinal(domain, ranger) {
  var index,
      range,
      rangeBand;

  function scale(x) {
    return range[((index[x] || (index[x] = domain.push(x))) - 1) % range.length];
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = [];
    index = {};
    var i = -1, n = x.length, xi;
    while (++i < n) if (!index[xi = x[i]]) index[xi] = domain.push(xi);
    return scale[ranger.t](ranger.x, ranger.p);
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    rangeBand = 0;
    ranger = {t: "range", x: x};
    return scale;
  };

  scale.rangePoints = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = (stop - start) / (domain.length - 1 + padding);
    range = domain.length < 2 ? [(start + stop) / 2] : d3.range(start + step * padding / 2, stop + step / 2, step);
    rangeBand = 0;
    ranger = {t: "rangePoints", x: x, p: padding};
    return scale;
  };

  scale.rangeBands = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = (stop - start) / (domain.length + padding);
    range = d3.range(start + step * padding, stop, step);
    rangeBand = step * (1 - padding);
    ranger = {t: "rangeBands", x: x, p: padding};
    return scale;
  };

  scale.rangeRoundBands = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = Math.floor((stop - start) / (domain.length + padding)),
        err = stop - start - (domain.length - padding) * step;
    range = d3.range(start + Math.round(err / 2), stop, step);
    rangeBand = Math.round(step * (1 - padding));
    ranger = {t: "rangeRoundBands", x: x, p: padding};
    return scale;
  };

  scale.rangeBand = function() {
    return rangeBand;
  };

  scale.copy = function() {
    return d3_scale_ordinal(domain, ranger);
  };

  return scale.domain(domain);
};
/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/). See lib/colorbrewer for more information.
 */

d3.scale.category10 = function() {
  return d3.scale.ordinal().range(d3_category10);
};

d3.scale.category20 = function() {
  return d3.scale.ordinal().range(d3_category20);
};

d3.scale.category20b = function() {
  return d3.scale.ordinal().range(d3_category20b);
};

d3.scale.category20c = function() {
  return d3.scale.ordinal().range(d3_category20c);
};

var d3_category10 = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

var d3_category20 = [
  "#1f77b4", "#aec7e8",
  "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a",
  "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2",
  "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5"
];

var d3_category20b = [
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
  "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
  "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
  "#843c39", "#ad494a", "#d6616b", "#e7969c",
  "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

var d3_category20c = [
  "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
  "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
  "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
  "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
  "#636363", "#969696", "#bdbdbd", "#d9d9d9"
];
d3.scale.quantile = function() {
  return d3_scale_quantile([], []);
};

function d3_scale_quantile(domain, range) {
  var thresholds;

  function rescale() {
    var k = 0,
        n = domain.length,
        q = range.length;
    thresholds = [];
    while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
    return scale;
  }

  function scale(x) {
    if (isNaN(x = +x)) return NaN;
    return range[d3.bisect(thresholds, x)];
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.filter(function(d) { return !isNaN(d); }).sort(d3.ascending);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.quantiles = function() {
    return thresholds;
  };

  scale.copy = function() {
    return d3_scale_quantile(domain, range); // copy on write!
  };

  return rescale();
};
d3.scale.quantize = function() {
  return d3_scale_quantize(0, 1, [0, 1]);
};

function d3_scale_quantize(x0, x1, range) {
  var kx, i;

  function scale(x) {
    return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
  }

  function rescale() {
    kx = range.length / (x1 - x0);
    i = range.length - 1;
    return scale;
  }

  scale.domain = function(x) {
    if (!arguments.length) return [x0, x1];
    x0 = +x[0];
    x1 = +x[x.length - 1];
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_quantize(x0, x1, range); // copy on write
  };

  return rescale();
};
d3.svg = {};
d3.svg.arc = function() {
  var innerRadius = d3_svg_arcInnerRadius,
      outerRadius = d3_svg_arcOuterRadius,
      startAngle = d3_svg_arcStartAngle,
      endAngle = d3_svg_arcEndAngle;

  function arc() {
    var r0 = innerRadius.apply(this, arguments),
        r1 = outerRadius.apply(this, arguments),
        a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset,
        a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset,
        da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0),
        df = da < Math.PI ? "0" : "1",
        c0 = Math.cos(a0),
        s0 = Math.sin(a0),
        c1 = Math.cos(a1),
        s1 = Math.sin(a1);
    return da >= d3_svg_arcMax
      ? (r0
      ? "M0," + r1
      + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
      + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
      + "M0," + r0
      + "A" + r0 + "," + r0 + " 0 1,0 0," + (-r0)
      + "A" + r0 + "," + r0 + " 0 1,0 0," + r0
      + "Z"
      : "M0," + r1
      + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
      + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
      + "Z")
      : (r0
      ? "M" + r1 * c0 + "," + r1 * s0
      + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1
      + "L" + r0 * c1 + "," + r0 * s1
      + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0
      + "Z"
      : "M" + r1 * c0 + "," + r1 * s0
      + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1
      + "L0,0"
      + "Z");
  }

  arc.innerRadius = function(v) {
    if (!arguments.length) return innerRadius;
    innerRadius = d3.functor(v);
    return arc;
  };

  arc.outerRadius = function(v) {
    if (!arguments.length) return outerRadius;
    outerRadius = d3.functor(v);
    return arc;
  };

  arc.startAngle = function(v) {
    if (!arguments.length) return startAngle;
    startAngle = d3.functor(v);
    return arc;
  };

  arc.endAngle = function(v) {
    if (!arguments.length) return endAngle;
    endAngle = d3.functor(v);
    return arc;
  };

  arc.centroid = function() {
    var r = (innerRadius.apply(this, arguments)
        + outerRadius.apply(this, arguments)) / 2,
        a = (startAngle.apply(this, arguments)
        + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };

  return arc;
};

var d3_svg_arcOffset = -Math.PI / 2,
    d3_svg_arcMax = 2 * Math.PI - 1e-6;

function d3_svg_arcInnerRadius(d) {
  return d.innerRadius;
}

function d3_svg_arcOuterRadius(d) {
  return d.outerRadius;
}

function d3_svg_arcStartAngle(d) {
  return d.startAngle;
}

function d3_svg_arcEndAngle(d) {
  return d.endAngle;
}
function d3_svg_line(projection) {
  var x = d3_svg_lineX,
      y = d3_svg_lineY,
      interpolate = "linear",
      interpolator = d3_svg_lineInterpolators[interpolate],
      tension = .7;

  function line(d) {
    return d.length < 1 ? null : "M" + interpolator(projection(d3_svg_linePoints(this, d, x, y)), tension);
  }

  line.x = function(v) {
    if (!arguments.length) return x;
    x = v;
    return line;
  };

  line.y = function(v) {
    if (!arguments.length) return y;
    y = v;
    return line;
  };

  line.interpolate = function(v) {
    if (!arguments.length) return interpolate;
    interpolator = d3_svg_lineInterpolators[interpolate = v];
    return line;
  };

  line.tension = function(v) {
    if (!arguments.length) return tension;
    tension = v;
    return line;
  };

  return line;
}

d3.svg.line = function() {
  return d3_svg_line(Object);
};

// Converts the specified array of data into an array of points
// (x-y tuples), by evaluating the specified `x` and `y` functions on each
// data point. The `this` context of the evaluated functions is the specified
// "self" object; each function is passed the current datum and index.
function d3_svg_linePoints(self, d, x, y) {
  var points = [],
      i = -1,
      n = d.length,
      fx = typeof x === "function",
      fy = typeof y === "function",
      value;
  if (fx && fy) {
    while (++i < n) points.push([
      x.call(self, value = d[i], i),
      y.call(self, value, i)
    ]);
  } else if (fx) {
    while (++i < n) points.push([x.call(self, d[i], i), y]);
  } else if (fy) {
    while (++i < n) points.push([x, y.call(self, d[i], i)]);
  } else {
    while (++i < n) points.push([x, y]);
  }
  return points;
}

// The default `x` property, which references d[0].
function d3_svg_lineX(d) {
  return d[0];
}

// The default `y` property, which references d[1].
function d3_svg_lineY(d) {
  return d[1];
}

// The various interpolators supported by the `line` class.
var d3_svg_lineInterpolators = {
  "linear": d3_svg_lineLinear,
  "step-before": d3_svg_lineStepBefore,
  "step-after": d3_svg_lineStepAfter,
  "basis": d3_svg_lineBasis,
  "basis-open": d3_svg_lineBasisOpen,
  "basis-closed": d3_svg_lineBasisClosed,
  "bundle": d3_svg_lineBundle,
  "cardinal": d3_svg_lineCardinal,
  "cardinal-open": d3_svg_lineCardinalOpen,
  "cardinal-closed": d3_svg_lineCardinalClosed,
  "monotone": d3_svg_lineMonotone
};

// Linear interpolation; generates "L" commands.
function d3_svg_lineLinear(points) {
  var i = 0,
      n = points.length,
      p = points[0],
      path = [p[0], ",", p[1]];
  while (++i < n) path.push("L", (p = points[i])[0], ",", p[1]);
  return path.join("");
}

// Step interpolation; generates "H" and "V" commands.
function d3_svg_lineStepBefore(points) {
  var i = 0,
      n = points.length,
      p = points[0],
      path = [p[0], ",", p[1]];
  while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
  return path.join("");
}

// Step interpolation; generates "H" and "V" commands.
function d3_svg_lineStepAfter(points) {
  var i = 0,
      n = points.length,
      p = points[0],
      path = [p[0], ",", p[1]];
  while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
  return path.join("");
}

// Open cardinal spline interpolation; generates "C" commands.
function d3_svg_lineCardinalOpen(points, tension) {
  return points.length < 4
      ? d3_svg_lineLinear(points)
      : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1),
        d3_svg_lineCardinalTangents(points, tension));
}

// Closed cardinal spline interpolation; generates "C" commands.
function d3_svg_lineCardinalClosed(points, tension) {
  return points.length < 3
      ? d3_svg_lineLinear(points)
      : points[0] + d3_svg_lineHermite((points.push(points[0]), points),
        d3_svg_lineCardinalTangents([points[points.length - 2]]
        .concat(points, [points[1]]), tension));
}

// Cardinal spline interpolation; generates "C" commands.
function d3_svg_lineCardinal(points, tension, closed) {
  return points.length < 3
      ? d3_svg_lineLinear(points)
      : points[0] + d3_svg_lineHermite(points,
        d3_svg_lineCardinalTangents(points, tension));
}

// Hermite spline construction; generates "C" commands.
function d3_svg_lineHermite(points, tangents) {
  if (tangents.length < 1
      || (points.length != tangents.length
      && points.length != tangents.length + 2)) {
    return d3_svg_lineLinear(points);
  }

  var quad = points.length != tangents.length,
      path = "",
      p0 = points[0],
      p = points[1],
      t0 = tangents[0],
      t = t0,
      pi = 1;

  if (quad) {
    path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3)
        + "," + p[0] + "," + p[1];
    p0 = points[1];
    pi = 2;
  }

  if (tangents.length > 1) {
    t = tangents[1];
    p = points[pi];
    pi++;
    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1])
        + "," + (p[0] - t[0]) + "," + (p[1] - t[1])
        + "," + p[0] + "," + p[1];
    for (var i = 2; i < tangents.length; i++, pi++) {
      p = points[pi];
      t = tangents[i];
      path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1])
          + "," + p[0] + "," + p[1];
    }
  }

  if (quad) {
    var lp = points[pi];
    path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3)
        + "," + lp[0] + "," + lp[1];
  }

  return path;
}

// Generates tangents for a cardinal spline.
function d3_svg_lineCardinalTangents(points, tension) {
  var tangents = [],
      a = (1 - tension) / 2,
      p0,
      p1 = points[0],
      p2 = points[1],
      i = 1,
      n = points.length;
  while (++i < n) {
    p0 = p1;
    p1 = p2;
    p2 = points[i];
    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
  }
  return tangents;
}

// B-spline interpolation; generates "C" commands.
function d3_svg_lineBasis(points) {
  if (points.length < 3) return d3_svg_lineLinear(points);
  var i = 1,
      n = points.length,
      pi = points[0],
      x0 = pi[0],
      y0 = pi[1],
      px = [x0, x0, x0, (pi = points[1])[0]],
      py = [y0, y0, y0, pi[1]],
      path = [x0, ",", y0];
  d3_svg_lineBasisBezier(path, px, py);
  while (++i < n) {
    pi = points[i];
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  i = -1;
  while (++i < 2) {
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  return path.join("");
}

// Open B-spline interpolation; generates "C" commands.
function d3_svg_lineBasisOpen(points) {
  if (points.length < 4) return d3_svg_lineLinear(points);
  var path = [],
      i = -1,
      n = points.length,
      pi,
      px = [0],
      py = [0];
  while (++i < 3) {
    pi = points[i];
    px.push(pi[0]);
    py.push(pi[1]);
  }
  path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px)
    + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
  --i; while (++i < n) {
    pi = points[i];
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  return path.join("");
}

// Closed B-spline interpolation; generates "C" commands.
function d3_svg_lineBasisClosed(points) {
  var path,
      i = -1,
      n = points.length,
      m = n + 4,
      pi,
      px = [],
      py = [];
  while (++i < 4) {
    pi = points[i % n];
    px.push(pi[0]);
    py.push(pi[1]);
  }
  path = [
    d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",",
    d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)
  ];
  --i; while (++i < m) {
    pi = points[i % n];
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  return path.join("");
}

function d3_svg_lineBundle(points, tension) {
  var n = points.length - 1,
      x0 = points[0][0],
      y0 = points[0][1],
      dx = points[n][0] - x0,
      dy = points[n][1] - y0,
      i = -1,
      p,
      t;
  while (++i <= n) {
    p = points[i];
    t = i / n;
    p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
    p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
  }
  return d3_svg_lineBasis(points);
}

// Returns the dot product of the given four-element vectors.
function d3_svg_lineDot4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

// Matrix to transform basis (b-spline) control points to bezier
// control points. Derived from FvD 11.2.8.
var d3_svg_lineBasisBezier1 = [0, 2/3, 1/3, 0],
    d3_svg_lineBasisBezier2 = [0, 1/3, 2/3, 0],
    d3_svg_lineBasisBezier3 = [0, 1/6, 2/3, 1/6];

// Pushes a "C" BÃ©zier curve onto the specified path array, given the
// two specified four-element arrays which define the control points.
function d3_svg_lineBasisBezier(path, x, y) {
  path.push(
      "C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
}

// Computes the slope from points p0 to p1.
function d3_svg_lineSlope(p0, p1) {
  return (p1[1] - p0[1]) / (p1[0] - p0[0]);
}

// Compute three-point differences for the given points.
// http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Finite_difference
function d3_svg_lineFiniteDifferences(points) {
  var i = 0,
      j = points.length - 1,
      m = [],
      p0 = points[0],
      p1 = points[1],
      d = m[0] = d3_svg_lineSlope(p0, p1);
  while (++i < j) {
    m[i] = d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]));
  }
  m[i] = d;
  return m;
}

// Interpolates the given points using Fritsch-Carlson Monotone cubic Hermite
// interpolation. Returns an array of tangent vectors. For details, see
// http://en.wikipedia.org/wiki/Monotone_cubic_interpolation
function d3_svg_lineMonotoneTangents(points) {
  var tangents = [],
      d,
      a,
      b,
      s,
      m = d3_svg_lineFiniteDifferences(points),
      i = -1,
      j = points.length - 1;

  // The first two steps are done by computing finite-differences:
  // 1. Compute the slopes of the secant lines between successive points.
  // 2. Initialize the tangents at every point as the average of the secants.

  // Then, for each segmentâ€¦
  while (++i < j) {
    d = d3_svg_lineSlope(points[i], points[i + 1]);

    // 3. If two successive yk = y{k + 1} are equal (i.e., d is zero), then set
    // mk = m{k + 1} = 0 as the spline connecting these points must be flat to
    // preserve monotonicity. Ignore step 4 and 5 for those k.

    if (Math.abs(d) < 1e-6) {
      m[i] = m[i + 1] = 0;
    } else {
      // 4. Let ak = mk / dk and bk = m{k + 1} / dk.
      a = m[i] / d;
      b = m[i + 1] / d;

      // 5. Prevent overshoot and ensure monotonicity by restricting the
      // magnitude of vector <ak, bk> to a circle of radius 3.
      s = a * a + b * b;
      if (s > 9) {
        s = d * 3 / Math.sqrt(s);
        m[i] = s * a;
        m[i + 1] = s * b;
      }
    }
  }

  // Compute the normalized tangent vector from the slopes. Note that if x is
  // not monotonic, it's possible that the slope will be infinite, so we protect
  // against NaN by setting the coordinate to zero.
  i = -1; while (++i <= j) {
    s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0])
      / (6 * (1 + m[i] * m[i]));
    tangents.push([s || 0, m[i] * s || 0]);
  }

  return tangents;
}

function d3_svg_lineMonotone(points) {
  return points.length < 3
      ? d3_svg_lineLinear(points)
      : points[0] +
        d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
}
d3.svg.line.radial = function() {
  var line = d3_svg_line(d3_svg_lineRadial);
  line.radius = line.x, delete line.x;
  line.angle = line.y, delete line.y;
  return line;
};

function d3_svg_lineRadial(points) {
  var point,
      i = -1,
      n = points.length,
      r,
      a;
  while (++i < n) {
    point = points[i];
    r = point[0];
    a = point[1] + d3_svg_arcOffset;
    point[0] = r * Math.cos(a);
    point[1] = r * Math.sin(a);
  }
  return points;
}
function d3_svg_area(projection) {
  var x0 = d3_svg_lineX,
      x1 = d3_svg_lineX,
      y0 = 0,
      y1 = d3_svg_lineY,
      interpolate = "linear",
      interpolator = d3_svg_lineInterpolators[interpolate],
      tension = .7;

  function area(d) {
    if (d.length < 1) return null;
    var points0 = d3_svg_linePoints(this, d, x0, y0),
        points1 = d3_svg_linePoints(this, d, x0 === x1 ? d3_svg_areaX(points0) : x1, y0 === y1 ? d3_svg_areaY(points0) : y1);
    return "M" + interpolator(projection(points1), tension)
         + "L" + interpolator(projection(points0.reverse()), tension)
         + "Z";
  }

  area.x = function(x) {
    if (!arguments.length) return x1;
    x0 = x1 = x;
    return area;
  };

  area.x0 = function(x) {
    if (!arguments.length) return x0;
    x0 = x;
    return area;
  };

  area.x1 = function(x) {
    if (!arguments.length) return x1;
    x1 = x;
    return area;
  };

  area.y = function(y) {
    if (!arguments.length) return y1;
    y0 = y1 = y;
    return area;
  };

  area.y0 = function(y) {
    if (!arguments.length) return y0;
    y0 = y;
    return area;
  };

  area.y1 = function(y) {
    if (!arguments.length) return y1;
    y1 = y;
    return area;
  };

  area.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolator = d3_svg_lineInterpolators[interpolate = x];
    return area;
  };

  area.tension = function(x) {
    if (!arguments.length) return tension;
    tension = x;
    return area;
  };

  return area;
}

d3.svg.area = function() {
  return d3_svg_area(Object);
};

function d3_svg_areaX(points) {
  return function(d, i) {
    return points[i][0];
  };
}

function d3_svg_areaY(points) {
  return function(d, i) {
    return points[i][1];
  };
}
d3.svg.area.radial = function() {
  var area = d3_svg_area(d3_svg_lineRadial);
  area.radius = area.x, delete area.x;
  area.innerRadius = area.x0, delete area.x0;
  area.outerRadius = area.x1, delete area.x1;
  area.angle = area.y, delete area.y;
  area.startAngle = area.y0, delete area.y0;
  area.endAngle = area.y1, delete area.y1;
  return area;
};
d3.svg.chord = function() {
  var source = d3_svg_chordSource,
      target = d3_svg_chordTarget,
      radius = d3_svg_chordRadius,
      startAngle = d3_svg_arcStartAngle,
      endAngle = d3_svg_arcEndAngle;

  // TODO Allow control point to be customized.

  function chord(d, i) {
    var s = subgroup(this, source, d, i),
        t = subgroup(this, target, d, i);
    return "M" + s.p0
      + arc(s.r, s.p1) + (equals(s, t)
      ? curve(s.r, s.p1, s.r, s.p0)
      : curve(s.r, s.p1, t.r, t.p0)
      + arc(t.r, t.p1)
      + curve(t.r, t.p1, s.r, s.p0))
      + "Z";
  }

  function subgroup(self, f, d, i) {
    var subgroup = f.call(self, d, i),
        r = radius.call(self, subgroup, i),
        a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset,
        a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
    return {
      r: r,
      a0: a0,
      a1: a1,
      p0: [r * Math.cos(a0), r * Math.sin(a0)],
      p1: [r * Math.cos(a1), r * Math.sin(a1)]
    };
  }

  function equals(a, b) {
    return a.a0 == b.a0 && a.a1 == b.a1;
  }

  function arc(r, p) {
    return "A" + r + "," + r + " 0 0,1 " + p;
  }

  function curve(r0, p0, r1, p1) {
    return "Q 0,0 " + p1;
  }

  chord.radius = function(v) {
    if (!arguments.length) return radius;
    radius = d3.functor(v);
    return chord;
  };

  chord.source = function(v) {
    if (!arguments.length) return source;
    source = d3.functor(v);
    return chord;
  };

  chord.target = function(v) {
    if (!arguments.length) return target;
    target = d3.functor(v);
    return chord;
  };

  chord.startAngle = function(v) {
    if (!arguments.length) return startAngle;
    startAngle = d3.functor(v);
    return chord;
  };

  chord.endAngle = function(v) {
    if (!arguments.length) return endAngle;
    endAngle = d3.functor(v);
    return chord;
  };

  return chord;
};

function d3_svg_chordSource(d) {
  return d.source;
}

function d3_svg_chordTarget(d) {
  return d.target;
}

function d3_svg_chordRadius(d) {
  return d.radius;
}

function d3_svg_chordStartAngle(d) {
  return d.startAngle;
}

function d3_svg_chordEndAngle(d) {
  return d.endAngle;
}
d3.svg.diagonal = function() {
  var source = d3_svg_chordSource,
      target = d3_svg_chordTarget,
      projection = d3_svg_diagonalProjection;

  function diagonal(d, i) {
    var p0 = source.call(this, d, i),
        p3 = target.call(this, d, i),
        m = (p0.y + p3.y) / 2,
        p = [p0, {x: p0.x, y: m}, {x: p3.x, y: m}, p3];
    p = p.map(projection);
    return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
  }

  diagonal.source = function(x) {
    if (!arguments.length) return source;
    source = d3.functor(x);
    return diagonal;
  };

  diagonal.target = function(x) {
    if (!arguments.length) return target;
    target = d3.functor(x);
    return diagonal;
  };

  diagonal.projection = function(x) {
    if (!arguments.length) return projection;
    projection = x;
    return diagonal;
  };

  return diagonal;
};

function d3_svg_diagonalProjection(d) {
  return [d.x, d.y];
}
d3.svg.diagonal.radial = function() {
  var diagonal = d3.svg.diagonal(),
      projection = d3_svg_diagonalProjection,
      projection_ = diagonal.projection;

  diagonal.projection = function(x) {
    return arguments.length
        ? projection_(d3_svg_diagonalRadialProjection(projection = x))
        : projection;
  };

  return diagonal;
};

function d3_svg_diagonalRadialProjection(projection) {
  return function() {
    var d = projection.apply(this, arguments),
        r = d[0],
        a = d[1] + d3_svg_arcOffset;
    return [r * Math.cos(a), r * Math.sin(a)];
  };
}
d3.svg.mouse = function(container) {
  return d3_svg_mousePoint(container, d3.event);
};

// https://bugs.webkit.org/show_bug.cgi?id=44083
var d3_mouse_bug44083 = /WebKit/.test(navigator.userAgent) ? -1 : 0;

function d3_svg_mousePoint(container, e) {
  var point = (container.ownerSVGElement || container).createSVGPoint();
  if ((d3_mouse_bug44083 < 0) && (window.scrollX || window.scrollY)) {
    var svg = d3.select(document.body)
      .append("svg:svg")
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);
    var ctm = svg[0][0].getScreenCTM();
    d3_mouse_bug44083 = !(ctm.f || ctm.e);
    svg.remove();
  }
  if (d3_mouse_bug44083) {
    point.x = e.pageX;
    point.y = e.pageY;
  } else {
    point.x = e.clientX;
    point.y = e.clientY;
  }
  point = point.matrixTransform(container.getScreenCTM().inverse());
  return [point.x, point.y];
};
d3.svg.touches = function(container) {
  var touches = d3.event.touches;
  return touches ? d3_array(touches).map(function(touch) {
    var point = d3_svg_mousePoint(container, touch);
    point.identifier = touch.identifier;
    return point;
  }) : [];
};
d3.svg.symbol = function() {
  var type = d3_svg_symbolType,
      size = d3_svg_symbolSize;

  function symbol(d, i) {
    return (d3_svg_symbols[type.call(this, d, i)]
        || d3_svg_symbols.circle)
        (size.call(this, d, i));
  }

  symbol.type = function(x) {
    if (!arguments.length) return type;
    type = d3.functor(x);
    return symbol;
  };

  // size of symbol in square pixels
  symbol.size = function(x) {
    if (!arguments.length) return size;
    size = d3.functor(x);
    return symbol;
  };

  return symbol;
};

function d3_svg_symbolSize() {
  return 64;
}

function d3_svg_symbolType() {
  return "circle";
}

// TODO cross-diagonal?
var d3_svg_symbols = {
  "circle": function(size) {
    var r = Math.sqrt(size / Math.PI);
    return "M0," + r
        + "A" + r + "," + r + " 0 1,1 0," + (-r)
        + "A" + r + "," + r + " 0 1,1 0," + r
        + "Z";
  },
  "cross": function(size) {
    var r = Math.sqrt(size / 5) / 2;
    return "M" + -3 * r + "," + -r
        + "H" + -r
        + "V" + -3 * r
        + "H" + r
        + "V" + -r
        + "H" + 3 * r
        + "V" + r
        + "H" + r
        + "V" + 3 * r
        + "H" + -r
        + "V" + r
        + "H" + -3 * r
        + "Z";
  },
  "diamond": function(size) {
    var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)),
        rx = ry * d3_svg_symbolTan30;
    return "M0," + -ry
        + "L" + rx + ",0"
        + " 0," + ry
        + " " + -rx + ",0"
        + "Z";
  },
  "square": function(size) {
    var r = Math.sqrt(size) / 2;
    return "M" + -r + "," + -r
        + "L" + r + "," + -r
        + " " + r + "," + r
        + " " + -r + "," + r
        + "Z";
  },
  "triangle-down": function(size) {
    var rx = Math.sqrt(size / d3_svg_symbolSqrt3),
        ry = rx * d3_svg_symbolSqrt3 / 2;
    return "M0," + ry
        + "L" + rx +"," + -ry
        + " " + -rx + "," + -ry
        + "Z";
  },
  "triangle-up": function(size) {
    var rx = Math.sqrt(size / d3_svg_symbolSqrt3),
        ry = rx * d3_svg_symbolSqrt3 / 2;
    return "M0," + -ry
        + "L" + rx +"," + ry
        + " " + -rx + "," + ry
        + "Z";
  }
};

d3.svg.symbolTypes = d3.keys(d3_svg_symbols);

var d3_svg_symbolSqrt3 = Math.sqrt(3),
    d3_svg_symbolTan30 = Math.tan(30 * Math.PI / 180);
d3.svg.axis = function() {
  var scale = d3.scale.linear(),
      orient = "bottom",
      tickMajorSize = 6,
      tickMinorSize = 6,
      tickEndSize = 6,
      tickPadding = 3,
      tickArguments_ = [10],
      tickFormat_,
      tickSubdivide = 0;

  function axis(selection) {
    selection.each(function(d, i, j) {
      var g = d3.select(this);

      // Ticks.
      var ticks = scale.ticks.apply(scale, tickArguments_),
          tickFormat = tickFormat_ == null ? scale.tickFormat.apply(scale, tickArguments_) : tickFormat_;

      // Minor ticks.
      var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide),
          subtick = g.selectAll(".minor").data(subticks, String),
          subtickEnter = subtick.enter().insert("svg:line", "g").attr("class", "tick minor").style("opacity", 1e-6),
          subtickExit = transition(subtick.exit()).style("opacity", 1e-6).remove(),
          subtickUpdate = transition(subtick).style("opacity", 1);

      // Major ticks.
      var tick = g.selectAll("g").data(ticks, String),
          tickEnter = tick.enter().insert("svg:g", "path").style("opacity", 1e-6),
          tickExit = transition(tick.exit()).style("opacity", 1e-6).remove(),
          tickUpdate = transition(tick).style("opacity", 1),
          tickTransform;

      // Domain.
      var range = d3_scaleExtent(scale.range()),
          path = g.selectAll(".domain").data([0]),
          pathEnter = path.enter().append("svg:path").attr("class", "domain"),
          pathUpdate = transition(path);

      // Stash the new scale and grab the old scale.
      var scale0 = this.__chart__ || scale;
      this.__chart__ = scale.copy();

      tickEnter.append("svg:line").attr("class", "tick");
      tickEnter.append("svg:text");
      tickUpdate.select("text").text(tickFormat);

      switch (orient) {
        case "bottom": {
          tickTransform = d3_svg_axisX;
          subtickUpdate.attr("y2", tickMinorSize);
          tickEnter.select("text").attr("dy", ".71em").attr("text-anchor", "middle");
          tickUpdate.select("line").attr("y2", tickMajorSize);
          tickUpdate.select("text").attr("y", Math.max(tickMajorSize, 0) + tickPadding);
          pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize);
          break;
        }
        case "top": {
          tickTransform = d3_svg_axisX;
          subtickUpdate.attr("y2", -tickMinorSize);
          tickEnter.select("text").attr("text-anchor", "middle");
          tickUpdate.select("line").attr("y2", -tickMajorSize);
          tickUpdate.select("text").attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
          pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize + "V0H" + range[1] + "V" + -tickEndSize);
          break;
        }
        case "left": {
          tickTransform = d3_svg_axisY;
          subtickUpdate.attr("x2", -tickMinorSize);
          tickEnter.select("text").attr("dy", ".32em").attr("text-anchor", "end");
          tickUpdate.select("line").attr("x2", -tickMajorSize);
          tickUpdate.select("text").attr("x", -(Math.max(tickMajorSize, 0) + tickPadding));
          pathUpdate.attr("d", "M" + -tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize);
          break;
        }
        case "right": {
          tickTransform = d3_svg_axisY;
          subtickUpdate.attr("x2", tickMinorSize);
          tickEnter.select("text").attr("dy", ".32em");
          tickUpdate.select("line").attr("x2", tickMajorSize);
          tickUpdate.select("text").attr("x", Math.max(tickMajorSize, 0) + tickPadding);
          pathUpdate.attr("d", "M" + tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize);
          break;
        }
      }

      tickEnter.call(tickTransform, scale0);
      tickUpdate.call(tickTransform, scale);
      tickExit.call(tickTransform, scale);

      subtickEnter.call(tickTransform, scale0);
      subtickUpdate.call(tickTransform, scale);
      subtickExit.call(tickTransform, scale);

      function transition(o) {
        return selection.delay ? o.transition()
            .delay(selection[j][i].delay)
            .duration(selection[j][i].duration)
            .ease(selection.ease()) : o;
      }
    });
  }

  axis.scale = function(x) {
    if (!arguments.length) return scale;
    scale = x;
    return axis;
  };

  axis.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    return axis;
  };

  axis.ticks = function() {
    if (!arguments.length) return tickArguments_;
    tickArguments_ = arguments;
    return axis;
  };

  axis.tickFormat = function(x) {
    if (!arguments.length) return tickFormat_;
    tickFormat_ = x;
    return axis;
  };

  axis.tickSize = function(x, y, z) {
    if (!arguments.length) return tickMajorSize;
    var n = arguments.length - 1;
    tickMajorSize = +x;
    tickMinorSize = n > 1 ? +y : tickMajorSize;
    tickEndSize = n > 0 ? +arguments[n] : tickMajorSize;
    return axis;
  };

  axis.tickPadding = function(x) {
    if (!arguments.length) return tickPadding;
    tickPadding = +x;
    return axis;
  };

  axis.tickSubdivide = function(x) {
    if (!arguments.length) return tickSubdivide;
    tickSubdivide = +x;
    return axis;
  };

  return axis;
};

function d3_svg_axisX(selection, x) {
  selection.attr("transform", function(d) { return "translate(" + x(d) + ",0)"; });
}

function d3_svg_axisY(selection, y) {
  selection.attr("transform", function(d) { return "translate(0," + y(d) + ")"; });
}

function d3_svg_axisSubdivide(scale, ticks, m) {
  subticks = [];
  if (m && ticks.length > 1) {
    var extent = d3_scaleExtent(scale.domain()),
        subticks,
        i = -1,
        n = ticks.length,
        d = (ticks[1] - ticks[0]) / ++m,
        j,
        v;
    while (++i < n) {
      for (j = m; --j > 0;) {
        if ((v = +ticks[i] - j * d) >= extent[0]) {
          subticks.push(v);
        }
      }
    }
    for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1];) {
      subticks.push(v);
    }
  }
  return subticks;
}
d3.behavior = {};
d3.behavior.drag = function() {
  var event = d3.dispatch("drag", "dragstart", "dragend");

  function drag() {
    this
        .on("mousedown.drag", mousedown)
        .on("touchstart.drag", mousedown);

    d3.select(window)
        .on("mousemove.drag", d3_behavior_dragMove)
        .on("touchmove.drag", d3_behavior_dragMove)
        .on("mouseup.drag", d3_behavior_dragUp, true)
        .on("touchend.drag", d3_behavior_dragUp, true)
        .on("click.drag", d3_behavior_dragClick, true);
  }

  // snapshot the local context for subsequent dispatch
  function start() {
    d3_behavior_dragEvent = event;
    d3_behavior_dragEventTarget = d3.event.target;
    d3_behavior_dragOffset = d3_behavior_dragPoint((d3_behavior_dragTarget = this).parentNode);
    d3_behavior_dragMoved = 0;
    d3_behavior_dragArguments = arguments;
  }

  function mousedown() {
    start.apply(this, arguments);
    d3_behavior_dragDispatch("dragstart");
  }

  drag.on = function(type, listener) {
    event[type].add(listener);
    return drag;
  };

  return drag;
};

var d3_behavior_dragEvent,
    d3_behavior_dragEventTarget,
    d3_behavior_dragTarget,
    d3_behavior_dragArguments,
    d3_behavior_dragOffset,
    d3_behavior_dragMoved,
    d3_behavior_dragStopClick;

function d3_behavior_dragDispatch(type) {
  var o = d3.event, p = d3_behavior_dragTarget.parentNode, dx = 0, dy = 0;

  if (p) {
    p = d3_behavior_dragPoint(p);
    dx = p[0] - d3_behavior_dragOffset[0];
    dy = p[1] - d3_behavior_dragOffset[1];
    d3_behavior_dragOffset = p;
    d3_behavior_dragMoved |= dx | dy;
  }

  try {
    d3.event = {dx: dx, dy: dy};
    d3_behavior_dragEvent[type].dispatch.apply(d3_behavior_dragTarget, d3_behavior_dragArguments);
  } finally {
    d3.event = o;
  }

  o.preventDefault();
}

function d3_behavior_dragPoint(container) {
  return d3.event.touches
      ? d3.svg.touches(container)[0]
      : d3.svg.mouse(container);
}

function d3_behavior_dragMove() {
  if (!d3_behavior_dragTarget) return;
  var parent = d3_behavior_dragTarget.parentNode;

  // O NOES! The drag element was removed from the DOM.
  if (!parent) return d3_behavior_dragUp();

  d3_behavior_dragDispatch("drag");
  d3_behavior_dragCancel();
}

function d3_behavior_dragUp() {
  if (!d3_behavior_dragTarget) return;
  d3_behavior_dragDispatch("dragend");
  d3_behavior_dragTarget = null;

  // If the node was moved, prevent the mouseup from propagating.
  // Also prevent the subsequent click from propagating (e.g., for anchors).
  if (d3_behavior_dragMoved && d3_behavior_dragEventTarget === d3.event.target) {
    d3_behavior_dragStopClick = true;
    d3_behavior_dragCancel();
  }
}

function d3_behavior_dragClick() {
  if (d3_behavior_dragStopClick && d3_behavior_dragEventTarget === d3.event.target) {
    d3_behavior_dragCancel();
    d3_behavior_dragStopClick = false;
    d3_behavior_dragEventTarget = null;
  }
}

function d3_behavior_dragCancel() {
  d3.event.stopPropagation();
  d3.event.preventDefault();
}
// TODO unbind zoom behavior?
// TODO unbind listener?
d3.behavior.zoom = function() {
  var xyz = [0, 0, 0],
      event = d3.dispatch("zoom");

  function zoom() {
    this
        .on("mousedown.zoom", mousedown)
        .on("mousewheel.zoom", mousewheel)
        .on("DOMMouseScroll.zoom", mousewheel)
        .on("dblclick.zoom", dblclick)
        .on("touchstart.zoom", touchstart);

    d3.select(window)
        .on("mousemove.zoom", d3_behavior_zoomMousemove)
        .on("mouseup.zoom", d3_behavior_zoomMouseup)
        .on("touchmove.zoom", d3_behavior_zoomTouchmove)
        .on("touchend.zoom", d3_behavior_zoomTouchup)
        .on("click.zoom", d3_behavior_zoomClick, true);
  }

  // snapshot the local context for subsequent dispatch
  function start() {
    d3_behavior_zoomXyz = xyz;
    d3_behavior_zoomDispatch = event.zoom.dispatch;
    d3_behavior_zoomEventTarget = d3.event.target;
    d3_behavior_zoomTarget = this;
    d3_behavior_zoomArguments = arguments;
  }

  function mousedown() {
    start.apply(this, arguments);
    d3_behavior_zoomPanning = d3_behavior_zoomLocation(d3.svg.mouse(d3_behavior_zoomTarget));
    d3_behavior_zoomMoved = false;
    d3.event.preventDefault();
    window.focus();
  }

  // store starting mouse location
  function mousewheel() {
    start.apply(this, arguments);
    if (!d3_behavior_zoomZooming) d3_behavior_zoomZooming = d3_behavior_zoomLocation(d3.svg.mouse(d3_behavior_zoomTarget));
    d3_behavior_zoomTo(d3_behavior_zoomDelta() + xyz[2], d3.svg.mouse(d3_behavior_zoomTarget), d3_behavior_zoomZooming);
  }

  function dblclick() {
    start.apply(this, arguments);
    var mouse = d3.svg.mouse(d3_behavior_zoomTarget);
    d3_behavior_zoomTo(d3.event.shiftKey ? Math.ceil(xyz[2] - 1) : Math.floor(xyz[2] + 1), mouse, d3_behavior_zoomLocation(mouse));
  }

  // doubletap detection
  function touchstart() {
    start.apply(this, arguments);
    var touches = d3_behavior_zoomTouchup(),
        touch,
        now = Date.now();
    if ((touches.length === 1) && (now - d3_behavior_zoomLast < 300)) {
      d3_behavior_zoomTo(1 + Math.floor(xyz[2]), touch = touches[0], d3_behavior_zoomLocations[touch.identifier]);
    }
    d3_behavior_zoomLast = now;
  }

  zoom.on = function(type, listener) {
    event[type].add(listener);
    return zoom;
  };

  return zoom;
};

var d3_behavior_zoomDiv,
    d3_behavior_zoomPanning,
    d3_behavior_zoomZooming,
    d3_behavior_zoomLocations = {}, // identifier -> location
    d3_behavior_zoomLast = 0,
    d3_behavior_zoomXyz,
    d3_behavior_zoomDispatch,
    d3_behavior_zoomEventTarget,
    d3_behavior_zoomTarget,
    d3_behavior_zoomArguments,
    d3_behavior_zoomMoved,
    d3_behavior_zoomStopClick;

function d3_behavior_zoomLocation(point) {
  return [
    point[0] - d3_behavior_zoomXyz[0],
    point[1] - d3_behavior_zoomXyz[1],
    d3_behavior_zoomXyz[2]
  ];
}

// detect the pixels that would be scrolled by this wheel event
function d3_behavior_zoomDelta() {

  // mousewheel events are totally broken!
  // https://bugs.webkit.org/show_bug.cgi?id=40441
  // not only that, but Chrome and Safari differ in re. to acceleration!
  if (!d3_behavior_zoomDiv) {
    d3_behavior_zoomDiv = d3.select("body").append("div")
        .style("visibility", "hidden")
        .style("top", 0)
        .style("height", 0)
        .style("width", 0)
        .style("overflow-y", "scroll")
      .append("div")
        .style("height", "2000px")
      .node().parentNode;
  }

  var e = d3.event, delta;
  try {
    d3_behavior_zoomDiv.scrollTop = 1000;
    d3_behavior_zoomDiv.dispatchEvent(e);
    delta = 1000 - d3_behavior_zoomDiv.scrollTop;
  } catch (error) {
    delta = e.wheelDelta || (-e.detail * 5);
  }

  return delta * .005;
}

// Note: Since we don't rotate, it's possible for the touches to become
// slightly detached from their original positions. Thus, we recompute the
// touch points on touchend as well as touchstart!
function d3_behavior_zoomTouchup() {
  var touches = d3.svg.touches(d3_behavior_zoomTarget),
      i = -1,
      n = touches.length,
      touch;
  while (++i < n) d3_behavior_zoomLocations[(touch = touches[i]).identifier] = d3_behavior_zoomLocation(touch);
  return touches;
}

function d3_behavior_zoomTouchmove() {
  var touches = d3.svg.touches(d3_behavior_zoomTarget);
  switch (touches.length) {

    // single-touch pan
    case 1: {
      var touch = touches[0];
      d3_behavior_zoomTo(d3_behavior_zoomXyz[2], touch, d3_behavior_zoomLocations[touch.identifier]);
      break;
    }

    // double-touch pan + zoom
    case 2: {
      var p0 = touches[0],
          p1 = touches[1],
          p2 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2],
          l0 = d3_behavior_zoomLocations[p0.identifier],
          l1 = d3_behavior_zoomLocations[p1.identifier],
          l2 = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2, l0[2]];
      d3_behavior_zoomTo(Math.log(d3.event.scale) / Math.LN2 + l0[2], p2, l2);
      break;
    }
  }
}

function d3_behavior_zoomMousemove() {
  d3_behavior_zoomZooming = null;
  if (d3_behavior_zoomPanning) {
    d3_behavior_zoomMoved = true;
    d3_behavior_zoomTo(d3_behavior_zoomXyz[2], d3.svg.mouse(d3_behavior_zoomTarget), d3_behavior_zoomPanning);
  }
}

function d3_behavior_zoomMouseup() {
  if (d3_behavior_zoomPanning) {
    if (d3_behavior_zoomMoved && d3_behavior_zoomEventTarget === d3.event.target) {
      d3_behavior_zoomStopClick = true;
    }
    d3_behavior_zoomMousemove();
    d3_behavior_zoomPanning = null;
  }
}

function d3_behavior_zoomClick() {
  if (d3_behavior_zoomStopClick && d3_behavior_zoomEventTarget === d3.event.target) {
    d3.event.stopPropagation();
    d3.event.preventDefault();
    d3_behavior_zoomStopClick = false;
    d3_behavior_zoomEventTarget = null;
  }
}

function d3_behavior_zoomTo(z, x0, x1) {
  var K = Math.pow(2, (d3_behavior_zoomXyz[2] = z) - x1[2]),
      x = d3_behavior_zoomXyz[0] = x0[0] - K * x1[0],
      y = d3_behavior_zoomXyz[1] = x0[1] - K * x1[1],
      o = d3.event, // Events can be reentrant (e.g., focus).
      k = Math.pow(2, z);

  d3.event = {
    scale: k,
    translate: [x, y],
    transform: function(sx, sy) {
      if (sx) transform(sx, x);
      if (sy) transform(sy, y);
    }
  };

  function transform(scale, o) {
    var domain = scale.__domain || (scale.__domain = scale.domain()),
        range = scale.range().map(function(v) { return (v - o) / k; });
    scale.domain(domain).domain(range.map(scale.invert));
  }

  try {
    d3_behavior_zoomDispatch.apply(d3_behavior_zoomTarget, d3_behavior_zoomArguments);
  } finally {
    d3.event = o;
  }

  o.preventDefault();
}
})();
;
jQuery.extend( KhanUtil, {
	FN_COLOR: "#6495ED",
	DDX_COLOR: "#FFA500",
	TANGENT_COLOR: "#AAA",
	TANGENT_LINE_LENGTH: 200,
	TANGENT_GROWTH_FACTOR: 3,
	TANGENT_SHIFT: 5,

	// Wrap graphInit to create a 600x600px graph properly scaled to the given range
	initAutoscaledGraph: function( range, options ) {
		var graph = KhanUtil.currentGraph;
		options = jQuery.extend({
			xpixels: 600,
			ypixels: 600,
			xdivisions: 20,
			ydivisions: 20,
			labels: true,
			unityLabels: true,
			range: (typeof range === "undefined" ? [ [-10, 10], [-10, 10] ] : range),
		}, options);

		options.scale = [ options.xpixels/(options.range[0][1] - options.range[0][0]),
		                  options.ypixels/(options.range[1][1] - options.range[1][0]) ];
		options.gridStep = [ (options.range[0][1] - options.range[0][0])/options.xdivisions,
		                     (options.range[1][1] - options.range[1][0])/options.ydivisions ];

		// Attach the resulting metrics to the graph for later reference
		graph.xpixels = options.xpixels;
		graph.ypixels = options.ypixels;
		graph.range = options.range;
		graph.scale = options.scale;

		graph.graphInit(options);
	},


	// start the magic
	initDerivativeIntuition: function( fnx, ddx, points ) {
		var graph = KhanUtil.currentGraph;

		KhanUtil.fnx = fnx;
		KhanUtil.ddx = ddx;
		KhanUtil.points = points;
		KhanUtil.highlight = false;
		KhanUtil.dragging = false;
		KhanUtil.ddxShown = false;

		// to store the SVG paths
		graph.tangentLines = [];
		graph.tangentPoints = [];
		graph.slopePoints = [];
		graph.mouseTargets = [];

		// graphie puts text spans on top of the SVG, which looks good, but gets
		// in the way of mouse events. So we add another SVG element on top
		// of everything else where we can add invisible shapes with mouse
		// handlers wherever we want. Is there a better way?
		graph.mouselayer = Raphael( "ddxplot", graph.xpixels, graph.ypixels );
		jQuery( graph.mouselayer.canvas ).css( "z-index", 1 );

		// plot all the tangent lines first so they're underneath the tangent/slope points
		jQuery( points ).each( function ( index, xval ) {
			KhanUtil.plotTangentLine( index );
		});

		jQuery( points ).each( function ( index, xval ) {
			// blue points
			KhanUtil.plotTangentPoint( index );
			// orange points and mouse magic
			KhanUtil.plotSlopePoint( index );
		});

		// Once the problem loads, call setSlope() for each point to set the
		// slopes to 0. This replicates the action of the user placing each point
		// at zero and applies the same "close enough" test so very small slopes
		// aren't graded wrong even if they look almost right.
		jQuery(Khan).one( "newProblem", function() {
			jQuery( points ).each( function ( index, xval ) {
				KhanUtil.setSlope( index, 0 );
			});
		});
	},


	plotTangentLine: function( index ) {
		var graph = KhanUtil.currentGraph;
		var xval = KhanUtil.points[index];
		var yval = KhanUtil.fnx(xval);

		// Now the fun bit: To make it clear that the tangent line only
		// touches at a single point, it's shifted a little bit above or
		// below the curve.

		// The shifted pivot point; defaults to unshifted xval/yval in
		// case we're dealing with an inflection point.
		var xshift = xval;
		var yshift = yval;

		// The slope of a line perpendicular to the tangent line. It is
		// along this direction that we shift the tangent line.
		var perpslope = 0;

		// First and second derivative at the point we're dealing with.
		var ddx1 = KhanUtil.ddx(xval);
		var ddx2 = (KhanUtil.ddx(xval - 0.001) - KhanUtil.ddx(xval + 0.001)) / 0.002;

		if (ddx1 !== 0) {
			// We want to shift *visually* perpendicular to the tangent line,
			// so if the graph has different x and y scales, perpslope isn't
			// quite as simple as (-1/slope)
			perpslope = (-1 / (ddx1 * (graph.scale[1] / graph.scale[0]))) / (graph.scale[1] / graph.scale[0]);

			// Second derivative tells us if the curve is concave up or down, thus which way to
			// shift the tangent line to "get away" from the curve. If perpslope is negative,
			// everything is reversed.
			if ((ddx2 > 0 && perpslope > 0) || (ddx2 < 0 && perpslope < 0)) {
				// atan(perpslope) is the direction to shift; cos() of that gives the x component; the rest of the mess normalizes for different x- and y-scales
				xshift = xval + Math.cos(Math.atan(perpslope * (graph.scale[1] / graph.scale[0]))) * KhanUtil.TANGENT_SHIFT / (2 * graph.scale[0]);
				yshift = perpslope * (xshift - xval) + yval;
			} else if ((ddx2 < 0 && perpslope > 0) || (ddx2 > 0 && perpslope < 0)) {
				xshift = xval - Math.cos(Math.atan(perpslope * (graph.scale[1] / graph.scale[0]))) * KhanUtil.TANGENT_SHIFT / (2 * graph.scale[0]);
				yshift = perpslope * (xshift - xval) + yval;
			}
		} else {
			// Slope is 0, so perpslope is undefined. Just shift up or down based on concavity
			if (ddx2 < 0) {
				yshift = yval - ( KhanUtil.TANGENT_SHIFT / (2 * graph.scale[1]) );
			} else if (ddx2 > 0) {
				yshift = yval + ( KhanUtil.TANGENT_SHIFT / (2 * graph.scale[1]) );
			}
		}

		// at last the slightly nudged line is ready to draw
		graph.style({
			stroke: KhanUtil.TANGENT_COLOR,
			strokeWidth: 2
		}, function() {
			graph.tangentLines[index] = graph.line(
					[ xshift - KhanUtil.TANGENT_LINE_LENGTH / (2 * graph.scale[0]), yshift ],
					[ xshift + KhanUtil.TANGENT_LINE_LENGTH / (2 * graph.scale[0]), yshift ] );
		});
	},


	plotTangentPoint: function( index ) {
		var graph = KhanUtil.currentGraph;
		var xval = KhanUtil.points[index];

		graph.style({
			fill: KhanUtil.FN_COLOR,
			stroke: KhanUtil.FN_COLOR,
		}, function() {
			graph.tangentPoints[index] = graph.ellipse( [ xval, KhanUtil.fnx(xval) ], [ 4 / graph.scale[0], 4 / graph.scale[1] ] );
		});
	},


	plotSlopePoint: function( index ) {
		var graph = KhanUtil.currentGraph;
		var xval = KhanUtil.points[index];

		graph.style({
			fill: KhanUtil.DDX_COLOR,
			stroke: KhanUtil.DDX_COLOR,
		}, function() {
			graph.slopePoints[index] = graph.ellipse( [ xval, 0 ], [ 4 / graph.scale[0], 4 / graph.scale[1] ] );
		});

		// the invisible shape in front of each point that gets mouse events
		graph.mouseTargets[index] = graph.mouselayer.circle(
				(xval - graph.range[0][0]) * graph.scale[0],
				(graph.range[1][1] - 0) * graph.scale[1], 15 );
		graph.mouseTargets[index].attr({fill: "#000", "opacity": 0.0});

		jQuery( graph.mouseTargets[index][0] ).css( "cursor", "move" );
		jQuery( graph.mouseTargets[index][0] ).bind("vmousedown vmouseover vmouseout", function( event ) {
			event.preventDefault();
			var graph = KhanUtil.currentGraph;
			if ( event.type === "vmouseover" ) {
				KhanUtil.highlight = true;
				if ( !KhanUtil.dragging ) {
					graph.slopePoints[index].animate({ scale: 2 }, 50 );
					graph.tangentLines[index].animate({ "stroke": KhanUtil.DDX_COLOR }, 100 );
				}

			} else if ( event.type === "vmouseout" ) {
				KhanUtil.highlight = false;
				if ( !KhanUtil.dragging ) {
					graph.slopePoints[index].animate({ scale: 1 }, 50 );
					graph.tangentLines[index].animate({ "stroke": KhanUtil.TANGENT_COLOR }, 100 );
				}

			} else if ( event.type === "vmousedown" && ( event.which === 1 || event.which === 0) ) {
				event.preventDefault();
				graph.tangentLines[index].toFront();
				graph.tangentPoints[index].toFront();
				graph.slopePoints[index].toFront();
				graph.tangentLines[index].animate( { scale: KhanUtil.TANGENT_GROWTH_FACTOR }, 200 );
				KhanUtil.dragging = true;

				jQuery( document ).bind("vmousemove vmouseup", function( event ) {
					event.preventDefault();

					// mouseY is in pixels relative to the SVG; coordY is the scaled y-coordinate value
					var mouseY = event.pageY - jQuery( "#ddxplot" ).offset().top;
					mouseY = Math.max(10, Math.min(graph.ypixels-10, mouseY));
					var coordY = graph.range[1][1] - mouseY / graph.scale[1];

					if ( event.type === "vmousemove" ) {
						jQuery( jQuery( "div#solutionarea :text" )[index]).val( KhanUtil.roundTo(2, coordY) );
						jQuery( jQuery( "div#solutionarea .answer-label" )[index]).text( KhanUtil.roundTo(2, coordY) );
						graph.tangentLines[index].rotate(-Math.atan(coordY * (graph.scale[1] / graph.scale[0])) * (180 / Math.PI), true);
						graph.slopePoints[index].attr( "cy", mouseY );
						graph.mouseTargets[index].attr( "cy", mouseY );

					} else if ( event.type === "vmouseup" ) {
						jQuery( document ).unbind( "vmousemove vmouseup" );

						KhanUtil.setSlope( index, coordY );

						KhanUtil.dragging = false;

						graph.tangentLines[index].animate( { scale: 1 }, 200 );
						if (!KhanUtil.highlight) {
							graph.slopePoints[index].animate({ scale: 1 }, 200 );
							graph.tangentLines[index].animate({ "stroke": KhanUtil.TANGENT_COLOR }, 100 );
						}

						// If all the points are in the right place, reveal the derivative function
						var answers = jQuery.map(jQuery( "div#solutionarea .answer-label" ), function(x) {
							return parseFloat(jQuery(x).text());
						});
						var correct = jQuery.map(KhanUtil.points, function(x) {
							return KhanUtil.roundTo(2, KhanUtil.ddx(x));
						});
						if (answers.join() === correct.join()) {
							KhanUtil.revealDerivative(400);
						}
					}
				});
			}
		});

	},


	// Set the slope for one point. Snap to the right answer if we're close enough.
	setSlope: function( index, coordY ) {
		var graph = KhanUtil.currentGraph;
		var answer = KhanUtil.ddx(KhanUtil.points[index]);
		var degreesOff = Math.abs(Math.atan(answer * graph.scale[1]/graph.scale[0]) -
				Math.atan(coordY * graph.scale[1]/graph.scale[0])) * (180/Math.PI);

		// How far off you're allowed to be
		if ( degreesOff < 7 ) {
			coordY = answer;
		}

		jQuery( jQuery( "div#solutionarea :text" )[index]).val( KhanUtil.roundTo(2, coordY) );
		jQuery( jQuery( "div#solutionarea .answer-label" )[index]).text( KhanUtil.roundTo(2, coordY) );
		graph.tangentLines[index].rotate(-Math.atan(coordY * (graph.scale[1] / graph.scale[0])) * (180 / Math.PI), true);
		graph.slopePoints[index].attr( "cy", (graph.range[1][1] - coordY) * graph.scale[1] );
		graph.mouseTargets[index].attr( "cy", (graph.range[1][1] - coordY) * graph.scale[1] );
	},


	// Shows the derivative plot and equation
	// Called when all the points are in the right place or as a hint
	revealDerivative: function( duration ) {
		if ( !KhanUtil.ddxShown ) {
			var graph = KhanUtil.currentGraph;
			var ddxplot;
			duration = duration || 0;
			graph.style({
				stroke: KhanUtil.DDX_COLOR,
				strokeWidth: 1,
				opacity: 0,
			}, function() {
				ddxplot = graph.plot( function( x ) {
					return KhanUtil.ddx( x );
				}, KhanUtil.tmpl.getVAR( "XRANGE" ) );
			});

			jQuery( "span#ddxspan" ).show();  // for IE
			jQuery( "span#ddxspan" ).fadeTo(duration, 1);

			ddxplot.animate( { opacity: 1 }, duration );
			KhanUtil.ddxShown = true;
		}
	},

});
;
jQuery.extend( KhanUtil, {

	/* fraction math-format function called with defraction enabled, which is always
	 * what is used in the exponent exercises. */

	frac: function( n, d ) {
		return KhanUtil.fraction( n, d, true, true, false, false );
	},

	fracSmall: function( n, d ) {
		return KhanUtil.fraction( n, d, true, true, true, false );
	},

	fracParens: function( n, d ) {
		return KhanUtil.fraction( n, d, true, true, false, true );
	},

	/* Used to show the contracting of something like (-2)^4 into 16, by showing
	 * (-2)^4 = (-2)(-2)(-2)(-2) = 4(-2)(-2) = -8(-2) = 16. Returns an array of
	 * each of these steps. */
	expandExponent: function( base, exp ) {
		var base_str = KhanUtil.negParens( base ),
			expansion = "\\cdot" + base_str, steps = [], multiplier;

		steps.unshift( Math.round( Math.pow( base, exp ) ) );

		for ( var i = 1; i < exp; i++ ) {
			multiplier = Math.round( Math.pow( base, exp - i ) );

			// we wanth the first hint to say (-2)(-2)(-2)(-2), but the next one to
			// say 4(-2)(-2), -8(-2), etc.
			if (i === exp - 1 ) {
				multiplier = KhanUtil.negParens( multiplier );
			}
			
			steps.unshift( multiplier + expansion );

			expansion += "\\cdot " + base_str;
		}

		return steps;
	},

	/* expandExponent for rational bases, taking into account negative
	 * exponents. Assumes abs(exp)>=1. */
	expandFractionExponent: function( base_n, base_d, exp ) {
		if ( Math.abs( exp ) < 1 ) {
			return "";
		}

		exp = Math.abs( exp );
		var flip_n = exp > 0 ? base_n : base_d,
			flip_d = exp > 0 ? base_d : base_n,
			parens = function( n, d ) { 
				return KhanUtil.fraction( n, d, true, true, false, true );
			}, noParens = function( n, d ) {
				return KhanUtil.fraction( n, d, true, true, false, false );
			}, base_str = parens( flip_n, flip_d ), 
			expansion = "\\cdot" + base_str, steps = [], mult_n, mult_d;

		steps.unshift( noParens(
			Math.round( Math.pow( flip_n, exp ) ),
			Math.round( Math.pow( flip_d, exp ) ) ) );

		for ( var i = 1; i < exp; i++ ) {
			mult_n = Math.round( Math.pow( flip_n, exp - i ) );
			mult_d = Math.round( Math.pow( flip_d, exp - i ) );

			steps.unshift( 
				( i === exp - 1  ? parens : noParens )
					.call(this, mult_n, mult_d ) 
				+ expansion );

			expansion += "\\cdot " + base_str;
		}

		return steps;
	},

	/* Given a base, returns the highest positive integer it is reasonable to
	 * raise that base to. */
	maxReasonableExp: function( n ) {
		// The values are shown in comments to show that they're reasonable.
		return {
			0: 1000,
			1: 1000,
			2: 8,    // 2*2*2*2*2*2*2*2 = 256
			3: 5,    // 3*3*3*3*3 = 243
			4: 4,    // 4*4*4*4 = 256
			5: 4,    // 5*5*5*5 = 625
			6: 3,    // 6*6*6 = 216
			7: 3,    // 7*7*7 = 343
			8: 3,    // 8*8*8 = 512
			9: 3,    // 9*9*9 = 729
			10: 10  // 10^10 = 100000000000
		}[ Math.abs( n ) ];
	},

	/* Picks two bases and one root such that both bases can reasonably be taken
	 * to that root. The first base is chosen evenly from all the reasonable
	 * bases, and then the root is chosen from all the roots which it is
	 * reasonable to take that base to, and then the second base is chosen from
	 * all other bases which it is reasonable to take that base to. */
	twoBasesOneRoot: function() {
		var bases_by_root = {
			//   1   2   3    4    5   6   7   8   9   10
			2: [ 1,  4,  9,  16,  25, 36, 49, 64, 81, 100 ],
			3: [ 1,  8, 27,  64, 125 ],
			4: [ 1, 16, 81, 256 ]
		};

		// these are all the bases that can be rooted.
		var bases = bases_by_root[ 2 ]
			.concat( bases_by_root[ 3 ] )
			.concat( bases_by_root[ 4 ] );

		var roots_by_base = {};
		for ( var i = 0; i < bases.length; i++ ) {
			var base = bases[ i ];
			for ( var j = 2; j <= 4; j++ ) {
				if ( _(bases_by_root[ j ]).indexOf( base ) !== -1 ) {
					if ( roots_by_base[ base ] === undefined ) {
						roots_by_base[ base ] = [ j ];
					} else if ( _(roots_by_base[ base ]).indexOf( j ) === -1 ) {
						roots_by_base[ base ].push( j );
					}
				}
			}
		}

		var base_1 = KhanUtil.randFromArray( bases );

		var root;
		while ( root === undefined || root === 1) {
			root = KhanUtil.randFromArray( roots_by_base[ base_1 ] );
		}

		var base_2;
		while ( base_2 === undefined || base_2 === base_1 ) {
			base_2 = KhanUtil.randFromArray( bases_by_root[ root ] );
		}

		return {
			base_1: base_1,
			base_2: base_2,
			root: root
		};
	}
});
;
jQuery.extend(KhanUtil, {

	expr: function( expr, compute ) {
		if ( typeof expr === "object" ) {
			var op = expr[0],
				args = expr.slice(1),
				table = compute ? KhanUtil.computeOperators : KhanUtil.formatOperators;

			return table[op].apply( this, args );
		} else {
			return compute ? expr : expr.toString();
		}
	},

	exprType: function( expr ) {

		if ( typeof expr === "object" ) {

			return expr[0];

		} else {

			return typeof(expr);

		}
	},

	// Do I start with a minus sign?
	exprIsNegated: function( expr ) {
		switch( KhanUtil.exprType(expr) ) {
			case "color":
			return KhanUtil.exprIsNegated(expr[2]);

			case "/":
			return KhanUtil.exprIsNegated(expr[1]);

			case "+":
			case "-":
			return true;

			case "number":
			return expr < 0;

			case "string":
			return expr.charAt(0) === "-";

			default:
			// case "*":
			return false;
		}
	},

	// Mostly, is it okay to add a coefficient to me without adding parens?
	exprIsShort: function( expr ) {
		switch( KhanUtil.exprType(expr) ) {
			case "color":
			return KhanUtil.exprIsShort(expr[2]);

			case "+":
			case "-":
			case "*":
			case "/":
			case "frac":
			return false;

			case "^":
			return KhanUtil.exprType(expr[1]) !== "number" || expr[1] < 0;

			case "number":
			case "sqrt":
			return true;

			default:
			return expr.length <= 1;
		}
	},

	exprParenthesize: function( expr ) {
		return KhanUtil.exprIsShort(expr) ?
			KhanUtil.expr(expr) :
			"(" + KhanUtil.expr(expr) + ")";
	},

	formatOperators: {
		"color": function( color, arg ) {

			// Arguments should look like [ "blue", [ ... ] ]
			return "\\color{" + color + "}{" + KhanUtil.expr( arg ) + "}";
		},

		"+": function() {
			var args = [].slice.call( arguments, 0 );
			var terms = jQuery.grep( args, function( term, i ) {
				return term != null;
			} );

			terms = jQuery.map(terms, function( term, i ) {
				var parenthesize;
				switch ( KhanUtil.exprType(term) ) {
					case "+":
					parenthesize = true;
					break;

					case "-":
					parenthesize = (term.length > 2);
					break;

					default:
					// case "*":
					// case "/":
					// case "^":
					parenthesize = false;
				}

				term = KhanUtil.expr( term );

				if ( parenthesize ) {
					term = "(" + term + ")";
				}

				if ( term.charAt(0) !== "-" || parenthesize ) {
					term = "+" + term;
				}

				return term;
			});

			var joined = terms.join("");

			if(joined.charAt(0) === "+") {
				return joined.slice(1);
			} else {
				return joined;
			}
		},

		"-": function() {
			if ( arguments.length === 1 ) {
				return KhanUtil.expr( ["*", -1, arguments[0]] );
			} else {
				var args = [].slice.call( arguments, 0 );
				var terms = jQuery.map( args, function( term, i ) {
					var negate = KhanUtil.exprIsNegated( term );
					var parenthesize;
					switch ( KhanUtil.exprType(term) ) {
						case "+":
						case "-":
						parenthesize = true;
						break;

						default:
						// case "*":
						// case "/":
						// case "^":
						parenthesize = false;
					}

					term = KhanUtil.expr( term );

					if ( ( negate && i > 0 ) || parenthesize ) {
						term = "(" + term + ")";
					}

					return term;
				} );

				var joined = terms.join("-");

				return joined;
			}
		},

		"*": function() {
			var rest = Array.prototype.slice.call(arguments, 1);
			rest.unshift("*");

			// If we're multiplying by 1, ignore it, unless we have [ "*", 1 ] and 
			// should return 1
			if ( arguments[0] === 1 && rest.length > 1 ) {
				return KhanUtil.expr(rest);
			} else if ( arguments[0] === -1 && rest.length > 1 ) {
				var form = KhanUtil.expr(rest);
				if( KhanUtil.exprIsNegated(rest[1]) ) {
					return "-(" + form + ")";
				} else {
					return "-" + form;
				}
			}

			if ( arguments.length > 1 ) {
				var args = [].slice.call( arguments, 0 );
				var parenthesizeRest = KhanUtil.exprType(arguments[0]) === "number"
					&& KhanUtil.exprType(arguments[1]) === "number";
				var factors = jQuery.map( args, function( factor, i ) {
					var parenthesize;
					switch ( KhanUtil.exprType( factor ) ) {
						case "number":
						if ( i > 0 ) {
							parenthesize = true;
						}
						break;

						default:
						parenthesize = !KhanUtil.exprIsShort( factor );
						break;
					}

					parenthesizeRest || ( parenthesizeRest = parenthesize );
					factor = KhanUtil.expr( factor );

					if ( parenthesizeRest ) {
						factor = "(" + factor + ")";
					}

					return factor;
				} );

				return factors.join("");
			} else {
				return KhanUtil.expr(arguments[0]);
			}
		},

		"times": function( left, right ) {
			var parenthesizeLeft = !KhanUtil.exprIsShort(left);
			var parenthesizeRight = !KhanUtil.exprIsShort(right);

			left = KhanUtil.expr( left );
			right = KhanUtil.expr( right );

			left = parenthesizeLeft ? "(" + left + ")" : left;
			right = parenthesizeRight ? "(" + right + ")" : right;

			return left + " \\times " + right;
		},

		"/": function( num, den ) {
			var parenthesizeNum = !KhanUtil.exprIsShort(num);
			var parenthesizeDen = !KhanUtil.exprIsShort(den);

			num = KhanUtil.expr( num );
			den = KhanUtil.expr( den );

			num = parenthesizeNum ? "(" + num + ")" : num;
			den = parenthesizeDen ? "(" + den + ")" : den;

			return num + "/" + den;
		},

		"frac": function( num, den ) {
			return "\\frac{" + KhanUtil.expr( num ) + "}{" + 
				KhanUtil.expr( den ) + "}";
		},

		"^": function( base, pow ) {
			var parenthesizeBase, trigFunction;
			switch ( KhanUtil.exprType(base) ) {
				case "+":
				case "-":
				case "*":
				case "/":
				case "^":
				case "ln":
				parenthesizeBase = true;
				break;

				case "number":
				parenthesizeBase = base < 0;
				break;

				case "sin":
				case "cos":
				case "tan":
				case "csc":
				case "sec":
				case "cot":
				parenthesizeBase = false;
				trigFunction = true;
				break;

				default:
				parenthesizeBase = false;
				trigFunction = false;
			}

			base = KhanUtil.expr( base );
			if ( parenthesizeBase ) {
				base = "(" + base + ")";
			}

			pow = KhanUtil.expr( pow );

			if ( trigFunction ) {
				return base.replace( /\\(\S+?)\{/, function( match, word ) {
					return "\\" + word + "^{" + pow + "} {";
				} );
			} else {
				return base + "^{" + pow + "}";
			}
		},

		"sqrt": function( arg ) {
			return "\\sqrt{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"sin": function( arg ) {
			return "\\sin{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"cos": function( arg ) {
			return "\\cos{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"tan": function( arg ) {
			return "\\tan{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"sec": function( arg ) {
			return "\\sec{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"csc": function( arg ) {
			return "\\sec{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"cot": function( arg ) {
			return "\\sec{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"ln": function( arg ) {
			return "\\ln{" + KhanUtil.exprParenthesize( arg ) + "}";
		},

		"+-": function() {
			if ( arguments.length === 1 ) {
				return "\\pm " + KhanUtil.exprParenthesize(arguments[0]);
			} else {
				var args = [].slice.call( arguments, 0 );
				return jQuery.map( args, function( term, i ) {
					return KhanUtil.expr(term);
				} ).join(" \\pm ");
			}
		}
	},

	computeOperators: {
		"color": function( color, arg ) {
			return KhanUtil.expr( arg, true );
		},

		"+": function() {
			var args = [].slice.call( arguments, 0 );
			var sum = 0;

			jQuery.each( args, function( i, term ) {
				sum += KhanUtil.expr( term, true );
			} );

			return sum;
		},

		"-": function() {
			if ( arguments.length === 1 ) {
				return -KhanUtil.expr( arguments[0], true );
			} else {
				var args = [].slice.call( arguments, 0 );
				var sum = 0;

				jQuery.each( args, function( i, term ) {
					sum += ( i === 0 ? 1 : -1 ) * KhanUtil.expr( term, true );
				} );

				return sum;
			}
		},

		"*": function() {
			var args = [].slice.call( arguments, 0 );
			var prod = 1;

			jQuery.each( args, function( i, term ) {
				prod *= KhanUtil.expr( term, true );
			} );

			return prod;
		},

		"/": function() {
			var args = [].slice.call( arguments, 0 );
			var prod = 1;

			jQuery.each( args, function( i, term ) {
				var e = KhanUtil.expr( term, true );
				prod *= ( i === 0 ? e : 1 / e );
			} );

			return prod;
		},

		"^": function( base, pow ) {
			return Math.pow( KhanUtil.expr( base, true ), KhanUtil.expr( pow, true));
		},

		"sqrt": function( arg ) {
			return Math.sqrt( KhanUtil.expr( arg, true ));
		},

		"+-": function() {
			return Number.NaN;
		}
	},

	// Remove [ "color", ...] tags from an expression
	exprStripColor: function( expr ) {
		if ( typeof expr !== "object" ) {
			return expr;
		} else if ( expr[0] === "color" ) {
			return KhanUtil.exprStripColor( expr[2] );
		} else {
			return jQuery.map(expr, function( el, i ) {

				// Wrap in an array because jQuery.map flattens the result by one level
				return [ (i === 0) ? el : KhanUtil.exprStripColor( el ) ];
			});
		}
	},

	// simplify an expression by collapsing all the associative
	// operations.  e.g. ["+", ["+", 1, 2], 3] -> ["+", 1, 2, 3]
	exprSimplifyAssociative : function (expr) {
		if ( typeof expr !== "object" ){
			return expr;
		}

		var simplified = jQuery.map( expr.slice(1), function(x){
			//encapsulate in a list so jQuery.map unpacks it correctly
			return [KhanUtil.exprSimplifyAssociative(x)];
		});
		
		var flattenOneLevel = function (e) {
			switch( expr[0] ){
				case "+":
				if ( e[0] === "+" ) {
					return e.slice(1);
				}
				break;

				case "*":
				if ( e[0] === "*" ) {
					return e.slice(1);
				}
				break;
			}
			//make sure that we encapsulate e in an array so jQuery's map 
			//does't accidently unpacks e itself.
			return [e];
		};
		
		//here we actually want the jQuery behavior of
		//having any lists that flattenOneLevel returns merged into
		//the result
		var ret = jQuery.map( simplified, flattenOneLevel );
		ret.unshift( expr[0] );

		return ret;
	}
});

KhanUtil.computeOperators["frac"] = KhanUtil.computeOperators["/"];
;
jQuery.extend( KhanUtil, {
	tabulate: function( fn, n ) {
		// Return an array, [ fn(), fn(), ... ] of length n if fn does not take arguments
		// or the array [ fn( 0 ), fn( 1 ), ..., fn( n - 1 ) ] if it does
		return jQuery.map( new Array(n), function( val, i ) {
			return [ fn( i ) ];
		});
	}
});
;
// TODO: shove these into KhanUtil or somewhere reasonable

function rotatePoint( p, deg, c ) {
	var rad = KhanUtil.toRadians( deg ),
		cos = Math.cos( rad ),
		sin = Math.sin( rad ),
		c = c || [ 0, 0 ],
		cx = c[ 0 ],
		cy = c[ 1 ],
		px = p[ 0 ],
		py = p[ 1 ],
		x = cx + ( px - cx ) * cos - ( py - cy ) * sin,
		y = cy + ( px - cx ) * sin + ( py - cy ) * cos;
	return [ KhanUtil.roundTo( 9, x ), KhanUtil.roundTo( 9, y ) ];
}

function RegularPolygon( center, numSides, radius, rotation, fillColor ){
	var graph = KhanUtil.currentGraph;
	rotation = rotation || 0;
	rotation = KhanUtil.toRadians( rotation );
	var lines = [];

	this.draw = function() {
		var angle = 2 * Math.PI / numSides;
		var arr = [];
		for( var i = 0; i < numSides; i++ ){
			arr.push( [ center[0] + radius * Math.cos( rotation + i * angle ), center[1] + radius * Math.sin( rotation + i * angle)] );
			arr.push( [ center[0] + radius * Math.cos( rotation + (i + 1)  * angle ), center[1] + radius * Math.sin( rotation + (i + 1) * angle) ] );
		}
		return KhanUtil.currentGraph.path( arr );
	}

	function getSymmetryCoordinates( i ) {
		var angle = rotation + Math.PI * i * 1 / numSides;
		var extend = 2;
		var scaleToEnd = extend + 5.4;
		var p1 = [ center[0] - Math.cos( angle ) * scaleToEnd,  center[1] - Math.sin( angle ) *  scaleToEnd ];
		var p2 = [  scaleToEnd * Math.cos( angle ) + center[0], scaleToEnd * Math.sin( angle ) + center[1] ];
		return [ p1, p2 ];
	}

	this.drawLineOfSymmetry = function( i, color ) {
		var coords = getSymmetryCoordinates( i );
		color = color || KhanUtil.BLUE;
		return graph.line.apply( graph, jQuery.merge( coords, [{ stroke: color }]) );
	}

	this.drawFakeLineOfSymmetry = function( i, color ) {
		color = color || KhanUtil.BLUE;
		var coords = getSymmetryCoordinates( i ),
			angle = 360 / numSides / 2,
			fudge = KhanUtil.randRange( 10, angle - 10 ) * KhanUtil.randFromArray( [ -1, 1 ] );
		return graph.line( rotatePoint( coords[ 0 ],  fudge ), rotatePoint( coords[ 1 ], fudge ), { stroke: color } );
	}

	// Does not currently work with 2 points on one side
	this.splitPath = function( line ) {
		var points = linePathIntersection( line, this.path ),
			paths = [],
			currPath = [];
		for ( var i = 0; i < this.path.graphiePath.length - 1; i = i + 2 ) {
			var pt1 = this.path.graphiePath[ i ];
			var pt2 = this.path.graphiePath[ i + 1 ];
			var intersections = findPointsOnLine( [ pt1, pt2 ], points );

			currPath.push( pt1 );

			if ( intersections.length !== 0 ){
				var point = intersections[ 0 ];
				currPath.push( point );
				paths.push( currPath );
				currPath = [ point ];
				points.splice( _(points).indexOf( point ), 1 );
			}
		}
		currPath.push( this.path[ i ] )
		paths.push( currPath );
		return graph.path( paths[ 1 ], { stroke: KhanUtil.ORANGE, "stroke-width": 5 } );
	}

	this.path = this.draw();
}

function lineLength( line ){
	var a = line[ 0 ];
	var b = line[ 1 ];
	return Math.sqrt( ( a[ 0 ] - b[ 0 ] ) * ( a[ 0 ] - b[ 0 ] )  + ( a[ 1 ] - b[ 1 ] ) * ( a[ 1 ] - b[ 1 ] ) );
}

function dotProduct( a, b ){
		return a[ 0] * b[ 0 ] + a[ 1 ] * b[ 1 ];
}
//http://www.blackpawn.com/texts/pointinpoly/default.html
//Checks whether two points are on the same side of a line
function sameSide( p1, p2, l ){
	var a = l[ 0 ];
	var b = l[ 1 ];

	var cp1 = vectorProduct( b - a, p1 - a )
	var cp2 = vectorProduct( b - a, p2 - a )

    return ( dotProduct( cp1, cp2 ) >= 0 );
}
//Takes an array and an array of positions, all elements whose index is not in the positions array gets replaced by ""
//Very useful for labels, for example, clearArray( [ "x", "x", "x" ], [ ANGLE ] ), where ANGLE is 1, will give you [ "", "x", "" ], which you can use to label angles in a Triangle such that the second angle is labeled x

function clearArray( arr, i ){
	return jQuery.map( arr, function( el, index ) { 
		if( jQuery.inArray( index, i ) !== -1 ){
			return  el;
		}
		else{
			return  "";
	   } 
	} );
}

//Used together with clearArray, for example mergeArray(clearArray( [ "x", "x", "x" ], [ ANGLE ] ), ["a","b","c" ] ), where ANGLE is 1, gives labels for a triangle [ "a", "x", "c" ]
//need to be same length
function mergeArray( ar1, ar2 ){
	var i = 0;
	for( i = 0; i < ar1.length; i ++ ){
		if( ar1[ i ] === "" ){
			ar1[ i ] = ar2[ i ];
		}
	}
	return ar1;
}

function isPointOnLineSegment( l, p, precision ){
	var precision = precision || 0.1;
	//If line is vertical
	if( Math.abs( l[ 1 ][ 0 ] - l[ 0 ][ 0 ] ) < precision ){
		return ( Math.abs( p[ 0 ] - l[ 0 ][ 0 ] ) < precision ) && ( p[1] <= ( Math.max( l[ 1 ][ 1 ], l[ 0 ][ 1 ] ) + precision ) ) && ( p[1] >= ( Math.min( l[ 1 ][ 1 ], l[ 0 ][ 1 ] ) - precision ) );
	}
	var m = ( l[ 1 ][ 1 ] - l[ 0 ][ 1 ] ) / ( l[ 1 ][ 0 ] - l[ 0 ][ 0 ] );
	var k = l[ 0 ][ 1 ] - m * l[ 0 ][ 0 ];
	return ( Math.abs( m * p[ 0 ] + k - p[ 1 ] ) < precision ) ;
}

function findPointsOnLine( l, ps ){
	var points = [];
	var ps = ps || [];
	var i = 0;
	for ( i = 0; i < ps.length; i ++ ){
		if ( isPointOnLineSegment( l, ps[ i ] ) ){
				points.push( ps[ i ] );
		}
	}
	return points;
}

//Are two polygons intersecting
function areIntersecting( pol1, pol2 ){
	var i, k = 0;
	for( i = 0; i < pol1.length; i++ ){
		for( k = 0; k < pol2.length; k++ ){
			if( findIntersection( pol1[ i ], pol2[ k ] )[ 2 ] ){
				return true;
			}	
		}
	}
	return false;
}


//Returns an intersection of two lines, and whether that point is inside both line segments
function findIntersection( a, b ){
	var tY = [ 0, a[ 0 ][ 1 ], a[ 1 ][ 1 ], b[ 0 ][ 1 ], b[ 1 ][ 1 ] ];
	var tX = [ 0, a[ 0 ][ 0 ], a[ 1 ][ 0 ], b[ 0 ][ 0 ], b[ 1 ][ 0 ] ];

	var denominator = ( tY[ 4 ] - tY[ 3 ] ) * ( tX[ 2 ] - tX[ 1 ] ) - (tX[ 4 ] - tX[ 3 ] ) * ( tY[ 2 ] - tY[ 1 ] );
	var ua = ( ( tX[ 4] - tX[ 3 ] ) * ( tY[ 1 ] - tY[ 3 ] ) - ( tY[ 4 ] - tY[ 3 ] ) * ( tX[ 1 ] - tX [ 3 ]) ) / denominator;
	var ub = ( ( tX[ 2 ] - tX[ 1 ] ) * ( tY[ 1 ] - tY[ 3 ] ) - ( tY[ 2 ] - tY[ 1 ] ) * ( tX[ 1 ] - tX[ 3 ] ) ) / denominator;
	var isContained = ( ua >= -0.01 )  && ( ua <= 1.01 ) && ( ub >= -0.01 ) && ( ub <= 1.01 );
	return [ tX[ 1 ] + ua * ( tX[ 2 ] - tX[ 1 ] ), tY[ 1 ] + ua * ( tY[ 2 ] - tY[ 1 ] ), isContained ];

}


//Checks whether there are duplicate points in an array
function checkDuplicate( arr, el ){
	var i = 0;
	for ( i = 0; i < arr.length; i ++ ){
		if ( Math.sqrt( ( arr[ i ][ 0 ]  - el[ 0 ] ) * ( arr[ i ][ 0 ]  - el[ 0 ] ) + ( arr[ i ][ 1 ]  - el[ 1 ] ) * ( arr[ i ][ 1 ]  - el[ 1 ] ) ) < 0.1 ){
			return true;
		}
	}
	return false;
}


function pointLineDistance( p, l ){
	var y = [ l[ 0 ][ 1 ], l[ 1 ][ 1 ] ];
	var x = [ l[ 0 ][ 0 ], l[ 1 ][ 0 ] ];
	var num = ( y[ 0 ] - y[ 1 ]) * p[ 0 ] + ( x[ 1 ] - x[ 0 ] )* p[ 1 ] + ( x[ 0 ]* y[ 1 ] - x[ 1 ] * y[ 0 ] );
	var den = Math.sqrt( ( x[ 1 ]- x[ 0 ] ) * ( x[ 1 ]- x[ 0 ] ) + ( y[ 1] - y[ 0 ] ) * ( y [ 1 ] - y[ 0 ] ) );
	return num/den;
}

//Reflects a point p over line l
function reflectPoint( l, p ){
	var m = ( l[ 1 ][ 1 ] - l[ 0 ][ 1 ] ) / ( l[ 1 ][ 0 ] - l[ 0 ][ 0 ] );
	var k = l[ 0 ][ 1 ] - m * l[ 0 ][ 0 ];
	var d = ( p[0] + ( p[1] - k ) * m )/( 1 + m*m);
	return ( [ 2 * d - p[ 0 ],  2 * d * m - p[1] + 2 * k ] );
}

//Returns an array of points where a path intersects a line
function linePathIntersection( l, p ){
	var points = [];
	var ps = p.graphiePath;
	var l = l.graphiePath;
	var i = 0;
	for( i = 0; i < ps.length-1; i = i + 2 ){
		var x = findIntersection( [ ps[ i ], ps[ i + 1 ] ], l );
		if ( x[ 2 ] === true  && ! checkDuplicate( points, [ x[ 0 ], x[ 1 ] ] ) ){
			points.push( [  x[ 0 ],  x[ 1 ] ] );
		}
	}
	return points;
}

function degToRad( deg ){
	return deg * Math.PI/180;
}

//Returns [ m, k ] of y = mx + k
//Vulnerable to division by 0
function lineEquation( line ){
	var x = [ line[ 0 ][ 0 ], line[ 1 ][ 0 ] ];
	var y = [ line[ 0 ][ 1 ], line[ 1 ][ 1 ] ];

	var m = ( line[ 1 ][ 1 ] - line[ 0 ][ 1 ] ) / ( line[ 1 ][ 0 ] - line[ 0 ][ 0 ] );
	var k = line[ 0 ][ 1 ] - m * line[ 0 ][ 0 ];
	
	return  [ m, k ];

}

//Given a line, returns a segment of that line of length amount starting at start
function lineSegmentFromLine( start, line, amount ){

	var eq = lineEquation( line );	
	var m = eq[ 0 ];
	var angle = Math.atan( m );	
	return [ start, [ start[ 0 ] +  Math.cos( angle ) * amount, start[ 1 ] + Math.sin( angle ) * amount ] ]; 

}

//Gives a line parralel to line going through point
function parallelLine( line, point ){

	var dif = [ point[ 0 ] - line[ 0 ][ 0 ], point[ 1 ] - line[ 0 ][ 1 ] ];
	return [ point, [ line[ 1 ][ 0 ] + dif[ 0 ],  line[ 1 ][ 1 ] + dif[ 1 ] ] ]; 

}

function movePoint( p, a ){

	return [ p[ 0 ] + a[ 0 ], p[ 1 ] + a[ 1 ] ];
}


//Returns a line that bisects an angle defined by line1 and line2
function bisectAngle( line1, line2, scale ){
	var intPoint = findIntersection( line1, line2 );
	var l1 = [];
	var l2 = [];

	if( ( line1[ 1 ][ 0 ] - line1[ 0 ][ 0 ] ) >= 0  ){
		l1 = lineSegmentFromLine( intPoint, line1, scale );	
	}
	else{
		l1 = lineSegmentFromLine( intPoint, line1, -scale );	
	}
	if( ( line2[ 1 ][ 0 ] - line2[ 0 ][ 0 ] ) >= 0  ){
		l2 = lineSegmentFromLine( intPoint, line2, scale );
	}
	else{
		l2 = lineSegmentFromLine( intPoint, line2, -scale );	
	}
	return [ intPoint, parallelLine( l1, l2[ 1 ] )[ 1 ] ];

}

//Midpoint of a line 
function lineMidpoint( line ){
	return  [ ( line[ 0 ][ 0 ] + line[ 1 ][ 0 ] ) / 2, ( line[ 0 ][ 1 ] + line[ 1 ][ 1 ] ) / 2 ] 
}

function vectorProduct( line1, line2 ){
	var x1 = line1[ 1 ][ 0 ] - line1[ 0 ][ 0 ];
	var x2 = line2[ 1 ][ 0 ] - line2[ 0 ][ 0 ];
	var y1 = line1[ 1 ][ 1 ] - line1[ 0 ][ 1 ];
	var y2 = line2[ 1 ][ 1 ] - line2[ 0 ][ 1 ];
	return  x1 * y2  - x2 * y1;
}

//For [ a, b ] returns [b , a] 
function reverseLine( line ){
	return [ line[ 1 ], line[ 0 ] ];
}

function Triangle( center, angles, scale, labels, points ){

	var fromPoints = false
	if ( points ){
			fromPoints = true;
	}

	this.labels = labels;
	if( fromPoints ){
		this.points = points;
		this.sides = [ [ this.points[ 0 ], this.points[ 1 ] ], [ this.points[ 1 ], this.points[ 2 ] ] , [ this.points[ 2 ], this.points[ 0 ] ] ];
		this.sideLengths =  jQuery.map( this.sides, lineLength );
		this.angles = anglesFromSides( this.sideLengths );
	}
	else{
		this.angles = angles;
	}
	
	this.radAngles = $.map( angles, degToRad );
	this.scale = ( scale || 3 );
	
	this.cosines = $.map( this.radAngles, Math.cos );
	this.sines = $.map( this.radAngles, Math.sin );


	this.x = center[ 0 ];
	this.y = center[ 1 ];	
	this.rotation = 0;

	var a = Math.sqrt( ( 2 * this.scale * this.sines[ 1 ] ) / ( this.sines[ 0 ] * this.sines[ 2 ])  ) ;
	var b = a * this.sines[ 2 ] / this.sines[ 1 ];
	if( ! fromPoints ){
		this.points = [ [ this.x, this.y ], [  b  + this.x, this.y ], [ this.cosines[ 0 ] * a + this.x, this.sines[ 0 ] * a  + this.y  ] ];
	}
	this.sides = [ [ this.points[ 0 ], this.points[ 1 ] ], [ this.points[ 1 ], this.points[ 2 ] ] , [ this.points[ 2 ], this.points[ 0 ] ] ];
	
	this.sideLengths =  jQuery.map( this.sides, lineLength );
	
	this.niceSideLengths = jQuery.map( this.sideLengths, function( x ){ return parseFloat( x.toFixed( 1 ) ); } );
	
	this.set = "";
	this.niceAngles = jQuery.map( this.angles, function( x ){ return x + "^{\\circ}"; } );
	this.labelObjects = { "sides": [] , "angles" : [], "points" : [], "name" : [] };

	
	this.angleScale = function ( ang ){
		if( ang > 90 ){
			return 0.5;
		}
		else if ( ang > 40 ){
			return 0.6;
		}
		else if ( ang < 25 ){
			return 0.7;
		}
		return 0.8;
	}

	this.draw = function(){
		this.set = KhanUtil.currentGraph.raphael.set();
		this.set.push( KhanUtil.currentGraph.path( this.points.concat( [ this.points[ 0 ] ] ) ) );
		return this.set;
	}

	this.color = "black";
	this.createLabel = function( p, v ){

		this.set.push( KhanUtil.currentGraph.label( p , v, "center",{ color: this.color } ) );
	}

	this.boxOut = function( pol, amount, type ){
		var type = type || "simple";
		var intersectWith = this.sides;
		var shouldMove =  areIntersecting( pol, this.sides );
		while( areIntersecting( pol, this.sides ) ){
			this.translate( amount );
		}
		if( shouldMove ){
			this.translate( amount );
		} 
	}

	this.findCenterPoints = function(){
		var Ax = this.points[ 0 ][ 0 ];
		var Ay = this.points[ 0 ][ 1 ];
		var Bx = this.points[ 1 ][ 0 ];
		var By = this.points[ 1 ][ 1 ];
		var Cx = this.points[ 2 ][ 0 ];
		var Cy = this.points[ 2 ][ 1 ];
		var D = 2 * ( Ax * ( By - Cy ) + Bx * ( Cy - Ay ) + Cx * ( Ay - By ));
		var a = lineLength( this.sides[ 0 ] );
		var b = lineLength( this.sides[ 1 ] );
		var c = lineLength( this.sides[ 2 ] );
		var P = a + b + c;
		var x1 = ( a * Ax + b * Bx + c * Cx ) / P;
		var y1 = ( a * Ay + b * By + c * Cy ) / P;	
		var x = (( Ay * Ay + Ax * Ax ) * ( By - Cy ) + ( By * By + Bx * Bx ) * ( Cy - Ay ) + ( Cy * Cy  + Cx * Cx) * ( Ay - By )) / D; 
		var y = (( Ay * Ay + Ax * Ax ) * ( Cx - Bx ) + ( By * By + Bx * Bx ) * ( Ax- Cx ) + ( Cy * Cy + Cx * Cx ) * ( Bx - Ax ))/D;
		this.circumCenter = [ x, y ];  
		this.centroid =  [ 1/3 * ( Ax + Bx + Cx ), 1/3 * ( Ay + By + Cy ) ];
		this.inCenter = [ x1, y1 ];
	}

	this.findCenterPoints();

	this.rotationCenter = this.centroid;
	
	this.rotate = function( amount ){
		amount = amount * Math.PI / 180;
		var tr = this;
		this.points = jQuery.map( this.points, function( el, i ){
				return 	[ tr.rotatePoint( el, amount ) ]
		});
		this.genSides();
		this.findCenterPoints();
	}

	this.genSides = function(){
		this.sides = [];
		var x = 0;
		for ( x = 0; x < this.points.length; x++ ){
			this.sides.push( [ this.points[ x ], this.points[ ( x + 1 ) % this.points.length ] ] );
		}
	}

	this.translate = function( amount ){
		this.points = jQuery.map( this.points, function( el, i ){
				return 	[ movePoint( el, amount ) ]
		});
		this.genSides();
		this.findCenterPoints();
	}

	this.rotatePoint = function ( pos, theta ){
		var theta = theta || this.rotation;
		return [ this.rotationCenter[ 0 ] + ( pos[ 0 ] - this.rotationCenter[ 0 ] ) * Math.cos( theta )  +  ( pos[ 1 ] -  this.rotationCenter[ 1 ] ) * Math.sin( theta ),  this.rotationCenter[ 1 ] + ( -1 ) *  ( ( pos[ 0 ] -  this.rotationCenter[ 0 ] ) * Math.sin( theta ) ) + ( ( pos[ 1 ] -  this.rotationCenter[ 1 ] ) * Math.cos( theta ) ) ];
	}

	this.drawLabels = function(){
		var i = 0;
		if ( "points" in this.labels ){
			//Need to change the position of placement into label objects
			for( i = this.angles.length - 1; i >= 0; i-- ){
				this.labelObjects.points.push( this.createLabel( bisectAngle( reverseLine( this.sides[ ( i + 1 ) % this.angles.length ] ), this.sides[ i ], 0.3 )[ 1 ], this.labels.points[ ( i + 1 ) % this.angles.length ] ) );
			}
		}

		if ( "angles" in this.labels ){	
			for( i = this.angles.length - 1; i >= 0; i-- ){
				this.labelObjects.angles.push( this.createLabel( bisectAngle( this.sides[ ( i + 1 ) % this.angles.length ], reverseLine( this.sides[ i ] ), this.angleScale( this.angles[ ( i + 1 ) % this.angles.length ] ) )[ 1 ], this.labels.angles[ ( i + 1 ) % this.angles.length ] ) );
			}
		}

		if ( "sides" in this.labels ){
			for( i = 0; i < this.sides.length; i++){
				//http://www.mathworks.com/matlabcentral/newsreader/view_thread/142201
				var midPoint = lineMidpoint( this.sides[ i ] );
				var t =lineLength( [ this.sides[ i ][ 1 ],  midPoint ] );
				var d = 0.5;
				var x3 = midPoint[ 0 ] + ( this.sides[ i ][ 1 ][ 1 ] - midPoint[ 1 ] )/ t * d ;
				var y3 = midPoint[ 1 ] - ( this.sides[ i ][ 1 ][ 0 ]- midPoint[ 0 ]) / t * d ;	
				this.labelObjects.sides.push( this.createLabel( [ x3, y3 ], this.labels.sides[  i  ] ) );
			}
		}
	
		if ( "name" in this.labels ){
				this.labelObjects[ "name" ] =  this.createLabel( bisectAngle( reverseLine( this.sides[ 2  ] ), this.sides[ 1 ], 0.3 )[ 1 ], this.labels.name );
		}


//DEPRECATED
		if ( "c" in this.labels ){
			this.createLabel( [ ( this.points[ 0 ][ 0 ] + this.points[ 1 ][ 0 ] ) / 2,  ( this.points[ 0 ][ 1 ] + this.points[ 1 ][ 1 ] ) / 2 - 0.4 ]  , labels.c );
		}
		if ( "a" in this.labels ){
			this.createLabel( [ ( this.points[ 1 ][ 0 ] + this.points[ 2 ][ 0 ] ) / 2 + 0.4, ( this.points[ 1 ][ 1 ] + this.points[ 2 ][ 1 ] ) / 2  ] , labels.a );
		}
		if ( "b" in this.labels ){
			this.createLabel( [ ( this.points[ 0 ][ 0 ] + this.points[ 2 ][ 0 ] ) / 2 - 0.4, ( this.points[ 0 ][ 1 ] + this.points[ 2 ][ 1 ] ) / 2 ] , labels.b );
		}
	

		return this.set;
	}

}
function Quadrilateral( center, angles, sideRatio, labels, size ){

	this.sideRatio = sideRatio;
	this.angles = angles;
	this.radAngles = $.map( angles, degToRad );
	this.scale = 1;
	this.rotation = 0;
	this.x = center[ 0 ];
	this.y = center[ 1 ];
	this.rotationCenter = [ center[ 0 ], center[ 1 ] ];
	this.set = "";
	this.size = 10;
	this.cosines = $.map( this.radAngles, Math.cos );
	this.sines = $.map( this.radAngles, Math.sin );
	this.labels = labels || {};
	this.sides = [];

	this.generatePoints = function(){
		var once = false;
		while( ( ! once ) || this.isCrossed() ){
			var len = Math.sqrt( 2 * this.scale * this.scale * this.sideRatio * this.sideRatio  - 2 * this.sideRatio * this.scale * this.scale * this.sideRatio * this.cosines[ 3 ] );
			once = true;
			var tX = [ 0,  this.scale * this.sideRatio * this.cosines[ 0 ] , len * Math.cos( ( this.angles[ 0 ] - ( 180 - this.angles[ 3 ] )/ 2 ) * Math.PI/180 ),  this.scale, this.scale + Math.cos( ( 180 - this.angles[ 1 ] ) * Math.PI / 180 ) ];
			var tY = [ 0,  this.scale * this.sideRatio * this.sines[ 0 ] , len * Math.sin( ( this.angles[ 0 ] - ( 180 - this.angles[ 3 ] )/ 2 ) *  Math.PI/180 ), 0,  Math.sin( ( 180 - this.angles[ 1 ] ) * Math.PI / 180 ) ];

			var denominator = ( tY[ 4 ] - tY[ 3 ] ) * ( tX[ 2 ] - tX[ 1 ] ) - (tX[ 4 ] - tX[ 3 ] ) * ( tY[ 2 ] - tY[ 1 ] );

			var ua = ( ( tX[ 4] - tX[ 3 ] ) * ( tY[ 1 ] - tY[ 3 ] ) - ( tY[ 4 ] - tY[ 3 ] ) * ( tX[ 1 ] - tX [ 3 ]) ) / denominator;

			this.points = [ [ this.x, this.y ], [ this.x + this.scale * this.sideRatio * this.cosines[ 0 ], this.y + this.scale * this.sideRatio * this.sines[ 0 ] ], [ this.x + tX[ 1 ] + ua * ( tX[ 2 ] - tX[ 1 ] ), this.y + tY[ 1 ] + ua * ( tY[ 2 ] - tY[ 1 ] ) ], [ this.x +  this.scale, this.y ] ];

			this.sides = [ [ this.points[ 0 ], this.points[ 3 ] ], [ this.points[ 3 ], this.points[ 2 ] ], [ this.points[ 2 ], this.points[ 1 ] ], [ this.points[ 1 ], this.points[ 0 ] ] ];
			this.sideLengths =  jQuery.map( this.sides, lineLength );
			this.niceSideLengths = jQuery.map( this.sideLengths, function( x ){ return parseFloat( x.toFixed( 1 ) ); } );

			if( vectorProduct( [ this.points[ 0 ], this.points[ 1 ] ], [ this.points[ 0 ], this.points[ 2 ] ] ) > 0  || this.sideLengths[ 2 ] < 0.09 ){
				this.sideRatio -= 0.3;
			}

			if( vectorProduct( [ this.points[ 0 ], this.points[ 3 ] ], [ this.points[ 0 ], this.points[ 2 ] ] ) < 0 ){
				this.sideRatio += 0.3;
			}
		}
	}
	
	this.isCrossed = function(){
		return ( vectorProduct( [ this.points[ 0 ], this.points[ 1 ] ], [ this.points[ 0 ], this.points[ 2 ] ] ) > 0 ) || ( vectorProduct( [ this.points[ 0 ], this.points[ 3 ] ], [ this.points[ 0 ], this.points[ 2 ] ] ) < 0 );
	}

	this.genSides = function(){
		this.sides = [ [ this.points[ 0 ], this.points[ 3 ] ], [ this.points[ 3 ], this.points[ 2 ] ], [ this.points[ 2 ], this.points[ 1 ] ], [ this.points[ 1 ], this.points[ 0 ] ] ];
	}

	this.generatePoints();

	var area = 0.5 *  vectorProduct( [ this.points[ 0 ], this.points[ 2 ] ], [ this.points[ 3 ], this.points[ 1 ] ] );
	this.scale = this.scale *  Math.sqrt( this.size / area );
	this.generatePoints();
	
	area = 0.5 *  vectorProduct( [ this.points[ 0 ], this.points[ 2 ] ], [ this.points[ 3 ], this.points[ 1 ] ] );
	
}


Quadrilateral.prototype = new Triangle( [ 0, 0], [30, 30, 30 ], 3, "" );

//From http://en.wikipedia.org/wiki/Law_of_cosines
function anglesFromSides( sides ){
		var c = sides[ 0 ];
		var a = sides[ 1 ];
		var b = sides[ 2 ];
		var gamma = Math.round( Math.acos( ( a * a + b * b - c * c ) / ( 2 * a * b  ) ) * 180 / Math.PI );
		var beta = Math.round( Math.acos( ( a * a + c * c - b * b ) / ( 2 * a * c  ) )  * 180 / Math.PI );
		var alpha = Math.round( Math.acos( ( b * b + c * c - a * a ) / ( 2 * b * c  ) )  * 180 / Math.PI );
		return [ alpha, beta, gamma ];
}



var randomTriangleAngles = {

		triangle: function(){
			var a, b, c; 
			a = KhanUtil.randRange( 35, 150 );
			b = KhanUtil.randRange( 35, 180 - a );
			if ( a + b > 160 ){
				a = Math.max( 30, a - 15  );
				b = Math.max( 30, b - 15  );
			}
			c = 180 - a - b;
			return [ a, b, c ];
		},

		scalene: function(){
			var a, b, c; 
			do {
				a = KhanUtil.randRange( 25, 150 );
				b = KhanUtil.randRange( 25, 180 - a );
				if ( a + b > 170 ){
					a = Math.max( 30, a - 15  );
					b = Math.max( 30, b - 15  );
				}
				c = 180 - a - b;
			} while( a === b || a === c || b === c );
			return [ a, b, c ];
		},

		isosceles: function(){
			var a = KhanUtil.randRangeExclude( 25, 75, [ 60 ] );
			var c = 180 - 2 * a;
			return KhanUtil.shuffle( [ a, a, c ] );
		},
		equilateral: function(){
			return [ 60, 60, 60 ];
		}
}


var randomQuadAngles = {

		square: function(){
			return [ 90, 90, 90, 90 ];
		},
		
		rectangle: function(){
			return [ 90, 90, 90, 90 ];
		},

		rhombus: function(){
			var angA, angB;
			do{
				angA =  KhanUtil.randRange( 30, 160 );
				angB = 180 - angA;
			}while( Math.abs( angA - angB ) < 5 );
			return [ angA, angB , angA , angB ];
		},

		parallelogram: function(){
			var angA, angB;
			do{
				angA =  KhanUtil.randRange( 30, 160 );
				angB = 180 - angA;
			} while( angA === angB );
			return  [ angA, angB ,angA ,angB ];
		},

		trapezoid: function(){
			var angA, angB, angC, angD;
			do{
				angA =  KhanUtil.randRange( 30, 160 );
				angB = 180 - angA;
				angC =  KhanUtil.randRange( 30, 160 );
				angD = 180 - angC;
			} while( Math.abs( angA - angC ) < 6 || angA + angC === 180 );
			return  [ angA, angC , angD , angB ];
		},

		isoscelesTrapezoid: function(){
			var angC, angD;
			do{
				angC =  KhanUtil.randRange( 30, 160 );
				angD = 180 - angC;
			} while( angC === angD );
			return  [ angC, angC , angD , angD ];
		},

		kite: function(){
			var angA, angB, angC
			do{
				angA = KhanUtil.randRange( 90, 140 );
				angB = KhanUtil.randRange( 30, ( 360 - ( 2 * angA ) ) - 30 );
				angC = 360 - angB - 2 * angA;
			} while( angA === angB );
			return [ angB, angA , angC , angA ];
		}
}

function newSquare( center ){
	var center = center || [ 0, 0 ];
	return new Quadrilateral( center, randomQuadAngles.square(),  1 , "", 3 );
}

function newRectangle( center ){
	var center = center || [ 0, 0 ];
	return  new Quadrilateral( center, randomQuadAngles.rectangle() ,  KhanUtil.randFromArray( [ 0.2, 0.5, 0.7, 1.5 ] ) , "", 3 );
}

function newRhombus( center ){
	var center = center || [ 0, 0 ];
	return new Quadrilateral( center, randomQuadAngles.rhombus(),1  , "", 3 );
}

function newParallelogram( center ){
	var center = center || [ 0, 0 ];
	return  new Quadrilateral( center, randomQuadAngles.parallelogram(), KhanUtil.randFromArray( [ 0.2, 0.5, 0.7, 1.5 ] ) , "", 3 );
}

function newTrapezoid( center ){
	var center = center || [ 0, 0 ];
	return  new Quadrilateral( center, randomQuadAngles.trapezoid(),  KhanUtil.randFromArray( [ 0.2, 0.5, 0.7, 1.5 ] ) , "", 3 );
}

function newKite( center ) {
	var center = center || [ 0, 0 ];
	var angA = KhanUtil.randRange( 90, 140 );
	var angB = KhanUtil.randRange( 30, ( 360 - ( 2 * angA ) ) - 30 );
	var angC = 360 - angB - 2 * angA;
	return  new Quadrilateral( center, randomQuadAngles.kite(), 1 , "", 2 );
}

;
function Adder( a, b, digitsA, digitsB ) {
	var graph = KhanUtil.currentGraph;
	digitsA = digitsA || KhanUtil.digits( a );
	digitsB = digitsB || KhanUtil.digits( b );
	var highlights = [];
	var carry = 0;
	var pos = { max: Math.max( digitsA.length, digitsB.length, KhanUtil.digits( a + b ).length ),
		carry: 3,
		first: 2,
		second: 1,
		sum: 0,
		sideX: Math.max( digitsA.length, digitsB.length ) + 2,
		sideY: 1.5 };

	var index = 0;
	var numHints = Adder.numHintsFor( a, b );

	this.show = function() {
		graph.init({
			range: [ [ -1, 11 ], [ pos.sum - 0.5, pos.carry + 0.5 ] ],
			scale: [30, 45]
		});

		drawDigits( digitsA.slice( 0 ).reverse(), pos.max - digitsA.length + 1, pos.first );
		drawDigits( digitsB.slice( 0 ).reverse(), pos.max - digitsB.length + 1, pos.second );

		graph.path( [ [ -0.5, pos.second - 0.5 ], [ pos.max + 0.5, pos.second - 0.5 ] ]);
		graph.label( [ 0, 1 ] ,"\\huge{+\\vphantom{0}}" );
	};

	this.showHint = function() {
		this.removeHighlights();
		if ( ( index === numHints - 2 ) && ( numHints - 1 > digitsA.length ) ) {
			this.showFinalCarry();
			index++;
			return;
		} else if ( index === numHints - 1 ) {
			return;
		}
		var prevCarry = carry;
		var prevCarryStr = "";
		var carryStr = "";
		var addendStr = "";
		var sum;

		var x = pos.max - index;

		if ( prevCarry !== 0 ) {
			highlights.push( graph.label( [ x, pos.carry ], "\\color{#6495ED}{" + prevCarry + "}", "below" ) );
			prevCarryStr =  "\\color{#6495ED}{" + prevCarry + "} + ";
		}

		sum = digitsA[ index ] + carry;
		highlights = highlights.concat( drawDigits( [ digitsA[ index ] ], x, pos.first, KhanUtil.BLUE ) );

		if ( index < digitsB.length ) {
			highlights = highlights.concat( drawDigits( [ digitsB[ index ] ], x, pos.second, KhanUtil.BLUE ) );
			addendStr = " + \\color{#6495ED}{" + digitsB[ index ] + "}";
			sum += digitsB[ index ];
		}

		drawDigits( [ sum % 10 ], x, pos.sum );
		highlights = highlights.concat( drawDigits( [ sum % 10 ], x, pos.sum, KhanUtil.GREEN ) );

		carry = Math.floor( sum / 10 );
		if ( carry !== 0 ) {
			highlights.push( graph.label( [ x - 1, pos.carry ],
				"\\color{#FFA500}{" + carry + "}", "below" ) );
			carryStr = "\\color{#FFA500}{" + carry + "}";
		}

		this.showSideLabel( "\\Large{"
			+ prevCarryStr
			+ "\\color{#6495ED}{" + digitsA[ index ] + "}"
			+ addendStr
			+ " = "
			+ carryStr
			+ "\\color{#28AE7B}{" + sum % 10 + "}"
			+ "}" );

		index++;
	};

	this.showFinalCarry = function() {
		highlights.push( graph.label( [ pos.max - index, pos.carry ],
			"\\color{#6495ED}{" + carry + "}", "below" ) );
		graph.label( [ pos.max - index, pos.sum ], "\\Huge{" + carry + "}" );
		highlights.push( graph.label( [ pos.max - index, pos.sum ],
			"\\Huge{\\color{#28AE7B}{" + carry + "}}" ) );

		this.showSideLabel("\\Large{"
			+ "\\color{#6495ED}{" + carry + "}"
			+ " = "
			+ "\\color{#28AE7B}{" + carry + "}"
			+ "}" );
	};

	this.getNumHints = function() {
		return numHints;
	};

	this.removeHighlights = function() {
		while( highlights.length ) {
			highlights.pop().remove();
		}
	};

	this.showSideLabel = function( str ) {
		highlights.push( graph.label( [ pos.sideX, pos.sideY ], str, "right" ) );
	};

	this.showDecimals = function( deciA, deciB ) {
		for ( var i = 0; i < 3; i++ ){
			graph.style({ fill: "#000" }, function() {
				graph.ellipse( [ pos.max - Math.max( deciA, deciB ) + 0.5, i - 0.2 ], [ 0.09, 0.06 ] );
			});
		}
		this.showSideLabel( "\\text{Zorg dat de decimaaltekens recht onder elkaar staan.}" );
	}
}

Adder.numHintsFor = function( a, b ) {
	return KhanUtil.digits( a + b ).length + 1;
};

function Subtractor( a, b, digitsA, digitsB, decimalPlaces ) {
	var graph = KhanUtil.currentGraph;
	digitsA = digitsA || KhanUtil.digits( a );
	digitsB = digitsB || KhanUtil.digits( b );
	var workingDigitsA = digitsA.slice( 0 );
	var workingDigitsB = digitsB.slice( 0 );
	var highlights = [];
	var carry = 0;
	var pos = { max: digitsA.length,
		carry: 3,
		first: 2,
		second: 1,
		diff: 0,
		sideX: Math.max( digitsA.length, digitsB.length ) + 2,
		sideY: 1.5 };

	var index = 0;
	var numHints = Subtractor.numHintsFor( a, b );
	decimalPlaces = decimalPlaces || 0;

	this.show = function() {
		graph.init({
			range: [ [ -1, 11 ], [ pos.diff - 0.5, pos.carry + 0.5 ] ],
			scale: [30, 45]
		});
		drawDigits( digitsA.slice( 0 ).reverse(), pos.max - digitsA.length + 1, pos.first );
		drawDigits( digitsB.slice( 0 ).reverse(), pos.max - digitsB.length + 1, pos.second );

		graph.path( [ [ -0.5, pos.second - 0.5 ], [ pos.max + 0.5, pos.second - 0.5 ] ]);
		graph.label( [ 0, 1 ] ,"\\huge{-\\vphantom{0}}" );

		for ( var i = 0; i < digitsA.length; i++ ) {
			highlights.unshift( [] );
		}
	};

	this.borrow = function( idx ) {
		var borrowedIdx = idx + 1;
		if ( workingDigitsA[ idx + 1 ] < 1 ) {
			borrowedIdx = this.borrow( idx + 1 );
		}
		workingDigitsA[ idx + 1 ] -= 1;
		workingDigitsA[ idx ] += 10;

		var depth = borrowedIdx - idx - 1;

		highlights[ idx ].push( graph.label( [ pos.max - idx, pos.carry + ( 0.5 * depth ) ],
											 "\\color{#6495ED}{" + workingDigitsA[ idx ] + "}", "below" ) );
		highlights[ idx ].push( graph.path( [ [ pos.max - 0.3 - idx, pos.first - 0.4 ], [ pos.max + 0.3 - idx, pos.first + 0.4 ] ] ) );

		highlights[ idx + 1 ].push( graph.label( [ pos.max - 1 - idx, pos.carry + ( 0.5 * depth ) ],
												 "\\color{#FFA500}{" + workingDigitsA[ idx + 1 ] + "}", "below" ) );
		highlights[ idx + 1 ].push( graph.path( [ [ pos.max - 1.3 - idx, pos.first - 0.4 ], [ pos.max - 0.7 - idx, pos.first + 0.4 ] ] ) );
		if ( depth !== 0 ) {
			highlights[ idx + 1 ].push( graph.path( [ [ pos.max - 1.3 - idx, pos.carry - 1 + ( 0.5 * depth) ], [ pos.max - 0.7 - idx, pos.carry - 0.7 + ( 0.5 * depth) ] ] ) );
		}
		return borrowedIdx;
	};

	this.showHint = function() {
		this.removeHighlights( index );

		if ( index !== 0 ) {
			this.removeHighlights( index - 1 );
		}
		if ( index === numHints - 1 ) {
			return;
		}

		var value = workingDigitsA[ index ];
		var withinB = index < workingDigitsB.length;
		var subtrahend = withinB ? workingDigitsB[ index ] : 0;
		var subStr = "";

		if ( value < subtrahend ) {
			this.borrow( index );
		} else if ( workingDigitsA[ index ] === digitsA[ index ] ) {
			highlights[ index ].push( graph.label( [ pos.max - index, pos.first ],
				"\\Huge{\\color{#6495ED}{" + workingDigitsA[ index ] +"}}" ) );
		} else {
			highlights[ index ].push( graph.label( [ pos.max - index, pos.carry ],
				"\\color{#6495ED}{" + workingDigitsA[ index ] + "}", "below" ) );
		}

		if ( withinB ) {
			highlights[ index ].push( graph.label( [ pos.max - index, pos.second ],
				"\\Huge{\\color{#6495ED}{" + workingDigitsB[ index ] + "}}" ) );
			subStr = " - \\color{#6495ED}{" + subtrahend + "}";
		}

		var diff = workingDigitsA[ index ] - subtrahend;
		if ( ( ( a - b ) / Math.pow( 10, index ) ) > 1 || index < decimalPlaces ) {
			graph.label( [ pos.max - index, pos.diff ],  "\\Huge{" + diff + "}" );
		}

		highlights[ index ].push( graph.label( [ pos.max - index, pos.diff ],  "\\Huge{\\color{#28AE7B}{" + diff + "}}" ) );
		if ( subStr == "" ){
			subStr = "- \\color{#6495ED}{ 0 }";
		}

		this.showSideLabel( "\\Large{"
			+ "\\color{#6495ED}{" + workingDigitsA[ index ] + "}"
			+ subStr
			+ " = "
			+ "\\color{#28AE7B}{" + diff + "}}" );

		index++;
	};

	this.getNumHints = function() {
		return numHints;
	};

	this.removeHighlights = function( i ) {
		if ( i >= highlights.length ) {
			return;
		}

		var col = highlights[ i ];
		while( col.length ) {
			col.pop().remove();
		}
	};

	this.showSideLabel = function( str ){
		highlights[ index ].push( graph.label( [ pos.sideX, pos.sideY ], str, "right" ) );
	};

	this.showDecimals = function( deciA, deciB ) {
		for ( var i = 0; i < 3; i++ ){
			graph.style({ fill: "#000" }, function() {
				graph.ellipse( [ pos.max - Math.max( deciA, deciB ) + 0.5, i - 0.2 ], [ 0.09, 0.06 ] );
			});
		}
		this.showSideLabel( "\\text{Zorg dat de decimaaltekens recht onder elkaar staan.}" );
	};
}

Subtractor.numHintsFor = function( a, b ) {
	return KhanUtil.digits( a ).length + 1;
};

// convert Adder -> DecimalAdder and Subtractor -> DecimalSubtractor
(function() {
	var decimate = function( drawer ) {
		var news = function( a, aDecimal, b, bDecimal ) {
			var newA = a * ( bDecimal > aDecimal ? Math.pow( 10, bDecimal - aDecimal ) : 1 );
			var newB = b * ( aDecimal > bDecimal ? Math.pow( 10, aDecimal - bDecimal ) : 1 );
			return [ newA, newB ];
		};

		var decimated = function( a, aDecimal, b, bDecimal ) {
			var newAB = news( a, aDecimal, b, bDecimal );
			var newA = newAB[0], newB = newAB[1];

			var aDigits = KhanUtil.digits( newA );
			for ( var i = 0; i < ( aDecimal - bDecimal ) || aDigits.length < aDecimal + 1; i++ ) {
				aDigits.push( 0 );
			}

			var bDigits = KhanUtil.digits( newB );
			for ( var i = 0; i < ( bDecimal - aDecimal ) || bDigits.length < bDecimal + 1; i++ ) {
				bDigits.push( 0 );
			}
			var drawn = new drawer( newA, newB, aDigits, bDigits, Math.max( aDecimal, bDecimal ) );

			drawn.showDecimals = (function( old ) {
				return function() {
					old.call( drawn, aDecimal, bDecimal );
				}
			})( drawn.showDecimals );

			return drawn;
		};

		decimated.numHintsFor = function( a, aDecimal, b, bDecimal ) {
			var newAB = news( a, aDecimal, b, bDecimal );
			var newA = newAB[0], newB = newAB[1];

			return drawer.numHintsFor( newA, newB );
		};

		return decimated;
	};

	// I hate global variables
	DecimalAdder = decimate(Adder);
	DecimalSubtractor = decimate(Subtractor);
})();

function drawCircles( num, color ) {
	with ( KhanUtil.currentGraph ) {
		var numCols = Math.floor( Math.sqrt( num ));
		var numRows = Math.floor( num / numCols );
		var extra = num % numRows;

		init({
			range: [ [ 0, numCols + 1 ], [ -1, numRows + 2 ] ],
			scale: [30, 30]
		});

		style({
			stroke: color,
			fill: color
		});

		for ( var i = numRows; i > 0; i-- ) {
			for (var j = numCols; j > 0; j-- ) {
				circle( [ j, i ], 0.25 );
			}
		}

		for ( var j = extra; j > 0; j-- ) {
			circle( [ j, 0 ], 0.25 );
		}
	}
}

function crossOutCircles( numCircles, numCrossed, color ) {
	with ( KhanUtil.currentGraph ) {
		var numCols = Math.floor( Math.sqrt( numCircles ));
		var numRows = Math.floor( numCircles / numCols );
		var extra = numCircles % numRows;
		var count = 0;

		style({
			stroke: color,
			fill: color
		});

		for ( var i = numRows; i > 0; i-- ) {
			for (var j = numCols; j > 0; j-- ) {
				path( [ [ j - 0.3, i - 0.3 ], [ j + 0.3, i + 0.3 ] ] );
				path( [ [ j - 0.3, i + 0.3 ], [ j + 0.3, i - 0.3 ] ] );
				count += 1;
				if ( count === numCrossed ) {
					return;
				}
			}
		}

		for ( var j = extra; j > 0; j-- ) {
			path( [ [ j - 0.3, i - 0.3 ], [ j + 0.3, i + 0.3 ] ] );
			path( [ [ j - 0.3, i + 0.3 ], [ j + 0.3, i - 0.3 ] ] );
			count += 1;
			if ( count === numCrossed ) {
				return;
			}
		}
	}
}

function drawDigits( digits, startX, startY, color ) {
	var graph = KhanUtil.currentGraph;
	var set = [];
	jQuery.each( digits, function( index, digit ) {
		var str = "\\Huge{" + digit + "}";
		set.push( graph.label( [ startX + index, startY ], str, { color: color } ) );
	});
	return set;
}

// for multiplication 0.5, 1
function drawRow( num, y, color, startCount ) {
	var graph = KhanUtil.currentGraph;

	graph.style({
		stroke: color
	});

	var set = graph.raphael.set();
	for ( var x = 0; x < num; x++ ) {
		set.push( graph.label( [ x, y ], "\\small{\\color{" + color + "}{" + ( startCount + x ) + "}}" ) );
		set.push( graph.circle( [ x, y ], 0.25 ) );
	}

	return set;
}

function Multiplier( a, b, digitsA, digitsB, deciA, deciB ) {
	var graph = KhanUtil.currentGraph;
	deciA = deciA || 0;
	deciB = deciB || 0;
	digitsA = digitsA || KhanUtil.digits( a );
	digitsB = digitsB || KhanUtil.digits( b );
	var digitsProduct = KhanUtil.integerToDigits( a * b );
	var highlights = [];
	var carry = 0;
	var numHints = digitsA.length * digitsB.length + 1;
	var indexA = 0;
	var indexB = 0;
	var maxNumDigits = Math.max( deciA + deciB, digitsProduct.length );

	this.show = function() {
		graph.init({
			range: [ [ -2 - maxNumDigits, 12 ], [ -1 - digitsB.length * digitsA.length, 3 ] ],
			scale: [ 30, 45 ]
		});

		drawDigits( digitsA.slice( 0 ).reverse(), 1 - digitsA.length, 2 );
		drawDigits( digitsB.slice( 0 ).reverse(), 1 - digitsB.length, 1 );

		graph.path( [ [ -1 - digitsProduct.length, 0.5 ], [ 1, 0.5 ] ] );
		graph.label( [  - ( Math.max( digitsA.length, digitsB.length )), 1 ] ,"\\huge{\\times\\vphantom{0}}" );
	};

	this.removeHighlights = function() {
		while( highlights.length ) {
			highlights.pop().remove();
		}
	};

	this.showHint = function() {
		this.removeHighlights();

		if ( indexB === digitsB.length ) {
			this.showFinalAddition();
			return;
		}

		var bigDigit = digitsA[ indexA ];
		var smallDigit = digitsB[ indexB ];

		var product = smallDigit * bigDigit + carry;
		var ones = product % 10;
		var currCarry = Math.floor( product / 10 );

		highlights = highlights.concat( drawDigits( [ bigDigit ], -indexA, 2, KhanUtil.BLUE ) );
		highlights = highlights.concat( drawDigits( [ smallDigit ], -indexB, 1, KhanUtil.PINK ) );
		if ( carry ) {
			highlights = highlights.concat( graph.label( [ -indexA, 3 ], "\\color{#FFA500}{" + carry + "}", "below" ) );
		}
		graph.label( [ 2, -indexB * digitsA.length - indexA + 2 ],
			"\\color{#6495ED}{" + bigDigit + "}"
			+ "\\times"
			+ "\\color{#FF00AF}{" + smallDigit + "}"
			+ ( carry ? "+\\color{#FFA500}{" + carry + "}" : "" )
			+ "="
			+ "\\color{#28AE7B}{" + product + "}", "right" );

		drawDigits( [ ones ], -indexB - indexA, -indexB );
		highlights = highlights.concat( drawDigits( [ ones ], -indexB - indexA, -indexB, KhanUtil.GREEN ) );

		if ( currCarry ) {
			highlights = highlights.concat( graph.label( [ -1 - indexA, 3 ], "\\color{#28AE7B}{" + currCarry + "}", "below" ) );
			if ( indexA === digitsA.length - 1 ) {
				drawDigits( [ currCarry ], -indexB - indexA - 1, -indexB );
				highlights = highlights.concat( drawDigits( [ currCarry ], -indexB - indexA - 1, -indexB, KhanUtil.GREEN ) );
			}
		}
		carry = currCarry;

		if ( indexA === digitsA.length - 1 ) {
			indexB++;
			indexA = 0;
			carry = 0;
		} else {
			indexA++;
		}
	};

	this.showFinalAddition = function() {
		if ( digitsB.length > 1 ) {
			while( digitsProduct.length < deciA + deciB + 1 ) {
				digitsProduct.unshift( 0 );
			}
			graph.path( [ [ -1 - digitsProduct.length, 0.5 - digitsB.length ], [ 1, 0.5 - digitsB.length ] ] );
			graph.label( [ -1 - digitsProduct.length, 1 - digitsB.length ] ,"\\huge{+\\vphantom{0}}" );
			drawDigits( digitsProduct, 1 - digitsProduct.length, -digitsB.length );
		}
	}

	this.getNumHints = function() {
		return numHints;
	};

	this.showDecimals = function() {
		graph.style({
				fill: "#000"
			}, function() {
				graph.ellipse( [ -deciA + 0.5, 1.8 ], [ 0.09, 0.06 ] );
				graph.ellipse( [ -deciB + 0.5, 0.8 ], [ 0.09, 0.06 ] );
			});
	};

	this.showDecimalsInProduct = function() {
		var x = -maxNumDigits;
		var y = -digitsB.length * digitsA.length;
		graph.label( [ x, y + 2 ],
			"\\text{Het bovenste getal heeft " + KhanUtil.plural( deciA, "cijfer" ) + " rechts van het decimaalteken staan.}", "right" );
		graph.label( [ x,  y + 1 ],
			"\\text{Het onderste getal heeft " + KhanUtil.plural( deciB, "cijfer" ) + " rechts van het decimaalteken staan.}", "right" );
		graph.label( [ x,  y ],
			"\\text{Het product heeft " + deciA + " + " + deciB + " = " + ( deciA + deciB )
			 + " cijfers rechts van het decimaalteken staan.}", "right" );
		graph.style({
			fill: "#000"
		}, function() {
			graph.ellipse( [ -deciB - deciA + 0.5,  -0.2 - digitsB.length ], [ 0.09, 0.06 ] );
		});
	};
}

function Divider( divisor, dividend, deciDivisor, deciDividend ) {
	var graph = KhanUtil.currentGraph;
	var digitsDivisor = KhanUtil.integerToDigits( divisor );
	var digitsDividend = KhanUtil.integerToDigits( dividend );
	deciDivisor = deciDivisor || 0;
	deciDividend = deciDividend || 0;
	var deciDiff = deciDivisor - deciDividend;
	var highlights = [];
	var index = 0;
	var remainder = 0;
	var fOnlyZeros = true;
	var fShowFirstHalf = true;
	var leadingZeros = [];
	var value = 0;
	var decimals = [];

	this.show = function() {
		var paddedDivisor = digitsDivisor;

		if ( deciDivisor !== 0 ) {
			paddedDivisor = ( KhanUtil.padDigitsToNum( digitsDivisor.reverse(), deciDivisor + 1 )).reverse();
		}
		graph.init({
			range: [ [ -1 - paddedDivisor.length, 17], [ ( digitsDividend.length + ( deciDiff > 0 ? deciDiff : 0 ) ) * -2 - 1, 2 ] ],
			scale: [ 30, 45 ]
		});
		graph.style({
			fill: "#000"
		}, function() {
			if ( deciDivisor !== 0 ) {
				decimals = decimals.concat( graph.ellipse( [ -1 - deciDivisor, -0.2 ], [ 0.09, 0.06 ] ) );
			}
			if ( deciDividend !== 0 ) {
				decimals = decimals.concat( graph.ellipse( [ digitsDividend.length - deciDividend - 0.5, -0.2 ], [ 0.09, 0.06 ] ) );
			}
		});

		drawDigits( paddedDivisor, -0.5 - paddedDivisor.length, 0 );
		drawDigits( digitsDividend, 0, 0 );
		graph.path( [ [ -0.75, -0.5 ], [ -0.75, 0.5 ], [ digitsDividend.length + ( deciDiff > 0 ? deciDiff : 0 ), 0.5 ] ] );
	};

	this.showHint = function() {
		this.removeHighlights();
		if ( index === digitsDividend.length ) {
			while( leadingZeros.length ) {
				leadingZeros.pop().remove();
			}
			return;
		}

		if ( fShowFirstHalf ) {
			value = digitsDividend[ index ];
			var quotient = value / divisor;
			var total = value + remainder;
			highlights = highlights.concat( drawDigits( [ value ], index, 0, KhanUtil.BLUE ) );
			if ( index !== 0 ) {
				graph.style({
					arrows: "->"
				}, function(){
					highlights.push( graph.path( [ [ index, 0 - 0.5 ], [ index, -2 * index + 0.5 ]] ) );
				});
			}

			drawDigits( [ value ], index, -2 * index );
			var totalDigits = KhanUtil.integerToDigits( total );
			highlights = highlights.concat( drawDigits( totalDigits , index - totalDigits.length + 1, -2 * index, KhanUtil.BLUE ) );

			graph.label( [ digitsDividend.length + 1, -2 * index ],
				"\\text{Hoe vaak past }"
				+ divisor
				+ "\\text{ in }"
				+ "\\color{#6495ED}{" + total + "}"
				+ "\\text{?}", "right" );

			fShowFirstHalf = false;
		} else {
			value += remainder;
			var quotient = Math.floor( value / divisor );
			var diff = value - ( quotient * divisor );
			remainder = diff * 10;
			var quotientLabel = drawDigits( [ quotient ], index, 1 );
			if ( quotient === 0 && fOnlyZeros && digitsDividend.length - deciDividend + deciDivisor > index + 1 ) {
				leadingZeros = leadingZeros.concat( quotientLabel );
			} else {
				fOnlyZeros = false;
			}
			highlights = highlights.concat( drawDigits( [ quotient ], index, 1, KhanUtil.GREEN ) );

			var product = KhanUtil.integerToDigits( divisor * quotient );
			drawDigits( product, index - product.length + 1, -2 * index - 1 );
			highlights = highlights.concat( drawDigits( product, index - product.length + 1, -2 * index - 1, KhanUtil.ORANGE ) );

			var diffDigits = KhanUtil.integerToDigits( diff );
			drawDigits( diffDigits, index - diffDigits.length + 1, -2 * index - 2)
			graph.label( [ index - product.length, -2 * index - 1 ] ,"-\\vphantom{0}" );
			graph.path( [ [ index - product.length - 0.25, -2 * index - 1.5 ], [ index + 0.5, -2 * index - 1.5 ] ] );

			graph.label( [ digitsDividend.length + 1, -2 * index - 1 ],
				"\\color{#6495ED}{" + value + "}"
				+ "\\div"
				+ divisor + "="
				+ "\\color{#28AE7B}{" + quotient + "}"
				+ "\\text{ of }"
				+ divisor
				+ "\\times"
				+ "\\color{#28AE7B}{" + quotient + "}"
				+ " = "
				+ "\\color{#FFA500}{" + (divisor * quotient) + "}", "right" );
			index++;
			fShowFirstHalf = true;
		}
	}

	this.getNumHints = function() {
		return 1 + ( digitsDividend.length + ( deciDiff > 0 ? deciDiff : 0 ) ) * 2;
	};

	this.removeHighlights = function() {
		while ( highlights.length ) {
			highlights.pop().remove();
		}
	};

	this.shiftDecimals = function() {
		while( decimals.length ) {
			decimals.pop().remove();
		}

		if ( deciDivisor !== 0 ) {
			graph.label( [ digitsDividend.length + 1 + ( deciDiff > 0 ? deciDiff : 0 ), 1 ],
				"\\text{Verplaats het decimaalteken " + deciDivisor + " naar rechts.}", "right" );
			graph.style({
				fill: "#000"
			}, function() {
				graph.ellipse( [ -1, -0.2 ], [ 0.09, 0.06 ] );
			});
		} else {
			graph.label( [ digitsDividend.length + 1, 1 ],
				"\\text{Zet het decimaalteken in het antwoord.}", "right" );
		}

		graph.style({
			fill: "#000"
		}, function() {
			graph.ellipse( [ digitsDividend.length + deciDiff - 0.5, -0.2 ], [ 0.09, 0.06 ] );
			graph.ellipse( [ digitsDividend.length + deciDiff - 0.5, 0.8 ], [ 0.09, 0.06 ] );
		});

		if ( deciDiff > 0 ) {
			var orig = digitsDividend;
			digitsDividend = KhanUtil.padDigitsToNum( digitsDividend, digitsDividend.length + deciDiff );
			drawDigits( digitsDividend, 0, 0 );
			highlights = highlights.concat( drawDigits( digitsDividend, 0, 0, KhanUtil.PINK ) );
			highlights = highlights.concat( drawDigits( orig, 0, 0 ) );
		}
	};
}
function squareFractions( nom, den, perLine, spacing, size ){
	spacing = spacing || 2.5;
	perLine = perLine || 10;
	size = size ||  0.2;
	var graph = KhanUtil.currentGraph;
	var arr = [];
	var x = 0;
	var y = 0;

	for( y = 0;  y < den/perLine && y * perLine <= nom  ; y++ ){
		for ( x = 0; x < perLine &&  y * perLine + x < nom   ; x++ ){
			arr.push( graph.regularPolygon( [ x * spacing * size, y * 2.5 * size ], 4, size, Math.PI/4 ).attr("stroke", "none").attr("fill", "#6495ed"  ).attr("stroke-linecap", "square" ) );
		}
	}

	y--;
	for ( x = x; x < perLine; x++ ){
		arr.push( graph.regularPolygon( [ x * spacing * size, y * 2.5 * size ], 4, size, Math.PI/4 ).attr("fill", "black" ).attr("stroke", "none").attr("stroke-linecap", "square" ) );
	}

	y++;
	for( y = y ;  y < den/perLine; y++ ){
		for ( x = 0; x < perLine; x++ ){
			arr.push( graph.regularPolygon( [ x * spacing * size, y * 2.5 * size], 4, size, Math.PI/4 ).attr("fill", "black" ).attr("stroke", "none").attr("stroke-linecap", "square" )  );
		}
	}


	return arr;
}

;
// Temporary not really following convention file, see #160

function numberLine( start, end, step, x, y, denominator ) {
	step = step || 1;
	x = x || 0;
	y = y || 0;
	var decPlaces = (step + "").length - (step + "").indexOf(".")-1;
	if(	 (step + "").indexOf(".") < 0){
		decPlaces = 0;
	}
	var graph = KhanUtil.currentGraph;
	var set = graph.raphael.set();
	set.push( graph.line( [x, y], [x + end - start, y] ) );
	for( var i = 0; i <= end - start; i += step ) {
		set.push( graph.line( [x + i, y - 0.2], [x + i, y + 0.2] ) );

		if ( denominator ){
			var base = KhanUtil.roundTowardsZero( start + i + 0.001 );
			var frac = start + i - base;
			var lab = base;

			if (! ( Math.abs ( Math.round( frac * denominator ) )  === denominator || Math.round( frac * denominator )  ===  0 ) ){
				if ( base === 0 ){
					lab = KhanUtil.fraction( Math.round( frac * denominator ),  denominator, false, false, true);
				}
				else{
					lab =  base + "\\frac{" +  Math.abs( Math.round( frac * denominator )) + "}{" + denominator + "}";
				}
			}
			graph.label( [x + i, y - 0.2], lab, "below", { labelDistance: 3 } );
		}
		else {
			graph.label( [x + i, y - 0.2], (start + i).toFixed(decPlaces), "below", { labelDistance: 3 } );
		}
	}
	return set;
}

function piechart( divisions, colors, radius ) {
	var graph = KhanUtil.currentGraph;
	var set = graph.raphael.set();

	var sum = 0;
	jQuery.each( divisions, function( i, slice ) {
		sum += slice;
	} );

	var partial = 0;
	jQuery.each( divisions, function( i, slice ) {
		set.push( graph.arc( [0, 0], radius, partial * 360 / sum, ( partial + slice ) * 360 / sum, true, {
			stroke: colors[2] || "none",
			fill: colors[i]
		} ) );
		partial += slice;
	} );

	for ( var i = 0; i < sum; i++ ) {
		set.push( graph.line( [0, 0], graph.polar( radius, i * 360 / sum ), { stroke: colors[2] || "#fff" } ) );
	}

	return set;
}

function rectchart( divisions, colors, y ) {
	var graph = KhanUtil.currentGraph;
	var set = graph.raphael.set();

	y = y || 0;

	var sum = 0;
	jQuery.each( divisions, function( i, slice ) {
		sum += slice;
	} );

	var partial = 0;
	jQuery.each( divisions, function( i, slice ) {
		var x = partial / sum, w = slice / sum;
		set.push( graph.path([ [x, y], [x + w, y], [x + w, y + 1], [x, y + 1] ], {
			stroke: "#fff",
			fill: colors[i]
		} ) );
		partial += slice;
	} );

	for ( var i = 0; i <= sum; i++ ) {
		var x = i / sum;
		set.push( graph.line( [x, y + 0], [x, y + 1], { stroke: "#fff" } ) );
	}

	return set;
}

function Rotator( center, r, pro ) {
	var graph = KhanUtil.currentGraph;
	this.set = graph.raphael.set();

	var arcDragStop = function() {

	};

	var arcDragMove = function( dx, dy ) {
		// mildly screwed up at the moment, TODO add dragging
		// var angle = Math.atan2( dy, dx ) * 180 / Math.PI;
		// pro.rotate( angle * -1, true );
	};

	var arcDragStart = function() {
		arcDragMove.call( this, 0, 0 );
	};

	this.set.push( graph.arc( center, r + 1, 150, 180, { "stroke": "#aab", "stroke-width": 20 } )
				   .drag( arcDragMove, arcDragStart, arcDragStop ) );
	
	this.downArrow = graph.path( [ [center[0]-(r+0.25), center[1]],
								  [center[0]-(r+1), center[1]-0.75],
								  [center[0]-(r+1.75), center[1]],
								  [center[0]-(r+0.75), center[1]]],
								{ "stroke-width": 0, "fill": "#aae" } );
	this.set.push( this.downArrow );

	this.upArrow = graph.path( [ [center[0]+(r+0.25)*Math.cos(5 * Math.PI / 6), center[1]+(r+0.25)*Math.sin(5 * Math.PI / 6)],
								 [center[0]+(r+1)*Math.cos(29 * Math.PI / 36), center[1]+(r+1)*Math.sin(29 * Math.PI / 36)], // tip of arrow at 145 degrees
								[center[0]+(r+1.75)*Math.cos(5 * Math.PI / 6), center[1]+(r+1.75)*Math.sin(5 * Math.PI / 6)] ],
							  { "stroke-width": 0, "fill": "#aae" } );
	this.set.push( this.upArrow );

	var RotatorHelp = function( center, r ) {
		var graph = KhanUtil.currentGraph;
		var set = graph.raphael.set();

		// down arrow
		set.push( graph.line( [center[0]-(r+4), center[1]+2-0.3],
							  [center[0]-(r+1)-0.6, center[1]-0.75+0.2],
							  { "stroke-width": 2, arrows: "->" } ) );

		// up arrow
		set.push( graph.line( [center[0]-(r+4), center[1]+2+0.3],
							  [center[0]+(r+1)*Math.cos(29 * Math.PI / 36)-0.8, center[1]+(r+1)*Math.sin(29 * Math.PI / 36)-0.2],
							  { "stroke-width": 2, arrows: "->" } ) );

		set.push( graph.label( [center[0]-(r+4), center[1]+2], "Click hier om te draaien!", "center", false,  { "stroke-width": 1, "font-size": 12, stroke: "black" } ) );

		jQuery(document).one( "mousedown", function( event ) {
			set.remove();
		});

		this.set = set;
		return this;
	};
	this.set.push( new RotatorHelp( center, r ).set );

	jQuery([ this.downArrow.node, this.upArrow.node ]).css( "cursor", "hand" );
	jQuery.each([ this.downArrow, this.upArrow ], function( i, el ) {
		el.hover(
			function( event ) {
				this.attr({ fill: "green" });
			},
			function( event ) {
				this.attr({ fill: "#aae" });
			});
	});

	this.rotationOn = function() {
		jQuery(this.upArrow.node).mousedown(function() {
			var iv = setInterval( function() { pro.rotate( 2 ); }, 50 );
			jQuery(document).one( "mouseup", function() {
				clearInterval( iv );
			});
		});

		jQuery(this.downArrow.node).mousedown(function() {
			var iv = setInterval( function() { pro.rotate( -2 ); }, 50 );
			jQuery(document).one( "mouseup", function() {
				clearInterval( iv );
			});
		});

		this.set.show();
	};

	this.rotationOff = function() {
		jQuery(this.upArrow.node).unbind( "mousedown" ).unbind( "mouseup" );
		jQuery(this.downArrow.node).unbind( "mousedown" ).unbind( "mouseup" );

		this.set.hide();
	};
	return this;
}

function Translator( center, r, pro ) {
	var graph = KhanUtil.currentGraph;
	this.set = graph.raphael.set();

	this.set.push( graph.line( [center[0]+1, center[1]-1], [center[0]+r-1, center[1]-1], { "stroke": "#aab", "stroke-width": 20 } ) );
	
	this.leftArrow = graph.path( [ [center[0]+1, center[1]-0.25],
								   [center[0]+0.25, center[1]-1],
								   [center[0]+1, center[1]-1.75]
								 ],
								{ "stroke-width": 0, "fill": "#aae" } );
	this.set.push( this.leftArrow );

	this.rightArrow = graph.path( [ [center[0]+r-1, center[1]-0.25],
									[center[0]+r-1+0.75, center[1]-1],
									[center[0]+r-1, center[1]-1.75]
								  ],
							  { "stroke-width": 0, "fill": "#aae" } );
	this.set.push( this.rightArrow );

	var TranslatorHelp = function( center, r ) {
		var graph = KhanUtil.currentGraph;
		var set = graph.raphael.set();

		set.push( graph.line( [center[0]+1, center[1]-4],
							  [center[0]+0.25, center[1]-1.5],
							  { "stroke-width": 2, arrows: "->" } ) );
		set.push( graph.line( [center[0]+r-1.5, center[1]-4],
							  [center[0]+r-1+0.5, center[1]-1.5],
							  { "stroke-width": 2, arrows: "->" } ) );

		set.push( graph.label( [center[0]+r/2-1+0.75, center[1]-4], "Click hier om te verplaatsen!", "center", false,  { "stroke-width": 1, "font-size": 12, stroke: "black" } ) );

		jQuery(document).one( "mousedown", function( event ) {
			set.remove();
		});

		this.set = set;
		return this;
	};

	this.set.push( new TranslatorHelp( center, r ).set );

	jQuery([ this.leftArrow.node, this.rightArrow.node ]).css( "cursor", "hand" );
	jQuery.each([ this.leftArrow, this.rightArrow ], function( i, el ) {
		el.hover(
			function( event ) {
				this.attr({ fill: "green" });
			},
			function( event ) {
				this.attr({ fill: "#aae" });
			});
	});

	this.translationOn = function() {
		jQuery(this.leftArrow.node).mousedown(function() {
			var iv = setInterval( function() { pro.rotatedTranslate( -10 ); }, 50 );
			jQuery(document).one( "mouseup", function() {
				clearInterval( iv );
			});
		});

		jQuery(this.rightArrow.node).mousedown(function() {
			var iv = setInterval( function() { pro.rotatedTranslate( 10 ); }, 50 );
			jQuery(document).one( "mouseup", function() {
				clearInterval( iv );
			});
		});

		this.set.show();
	};

	this.translationOff = function() {
		jQuery(this.leftArrow.node).unbind( "mousedown" ).unbind( "mouseup" );
		jQuery(this.rightArrow.node).unbind( "mousedown" ).unbind( "mouseup" );

		this.set.hide();
	};
	return this;
}

function Protractor( center, r ) {
	var graph = KhanUtil.currentGraph;
	this.set = graph.raphael.set();

	this.cx = center[0];
	this.cy = center[1];
	var lineColor = "#789";

	var imgPos = graph.scalePoint([ this.cx - r, this.cy + r ]);
	this.set.push( graph.raphael.image( Khan.urlBase + "images/protractor.png", imgPos[0], imgPos[1], 322, 166 ) );
	
	this._rotation = 0;
	this.getRotation = function() {
		return this._rotation;
	};

	this.drawAngle = function( angle, rOffset, stroke, labelStroke ) {
		rOffset = rOffset || -1;
		stroke = stroke || lineColor;
		labelStroke = stroke || "#000";
		
		var an = angle - this.getRotation(),
		dx = Math.cos( Math.PI * an / 180 ),
		dy = Math.sin( Math.PI * an / 180 ),
		ex = (r + rOffset) * dx,
		ey = (r + rOffset) * dy,
		lx = (r + rOffset + 0.5) * dx,
		ly = (r + rOffset + 0.5) * dy;

		this.set.push( graph.line( [this.cx + dx, this.cy + dy], [this.cx + ex, this.cy + ey], { stroke: stroke } ) );
		this.set.push( graph.label( [this.cx + lx, this.cy + ly], angle, "center", false, { "stroke-width": 1, "font-size": 12, stroke: labelStroke } ) );
	};

	var pro = this;
	var setNodes = jQuery.map( this.set, function( el ) { return el.node; } );
	function makeTranslatable() {
		jQuery( setNodes ).css( "cursor", "move" );
		
		jQuery( setNodes ).mousedown( function( event ) {
			event.preventDefault();
			
			var i;
			//store the starting point for each item in the set
			for ( i=0; i < pro.set.items.length; i++ ) {
				var obj = pro.set.items[i];
				
				obj.ox = event.pageX;
				obj.oy = event.pageY;

				obj.animate( { opacity: 0.25 }, 500, ">" );
			}

			jQuery(document).mousemove( function( event ) {
				var i;
				//reposition the objects relative to their start position
				for ( i = 0; i < pro.set.items.length; i++ ) {
					var obj = pro.set.items[i],
					trans_x = event.pageX - obj.ox,
					trans_y = event.pageY - obj.oy;
					
					obj.translate( trans_x, trans_y );
					
					obj.ox = event.pageX;
					obj.oy = event.pageY;
				}
			});

			jQuery(document).one( "mouseup", function( event ) {
				var i;
				//remove the starting point for each of the objects
				for ( i=0; i < pro.set.items.length; i++ ) {
					var obj = pro.set.items[i];
					
					delete(obj.ox);
					delete(obj.oy);
					
					obj.animate( { opacity: 0.5 }, 500, ">" );
					
					jQuery(document).unbind("mousemove");
				}
			});
		});

		pro.translator.translationOn();
	}

	function makeUntranslatable() {
		jQuery( setNodes ).unbind();
		jQuery( setNodes ).css( "cursor", "auto" );

		pro.translator.translationOff();
	}
	
	this.rotator = new Rotator( [this.cx, this.cy], r, this );
	this.set.push( this.rotator.set );

	this.translator = new Translator( [this.cx, this.cy], r, this );
	this.set.push( this.translator.set );

	this.set.attr( { opacity: 0.5 } );

	jQuery.each( this.set, function( index, el ) {
		// custom attribute so we can rotate the whole set from dragging any element
		el.pro = pro;
	});

	// scaled center point for working directly with raphael
	this.getCenter = function() {
		return [this.set[0].attrs.x + 161,
				this.set[0].attrs.y + 161];
	};

	this.rotate = function( offset, absolute ) {
		var c = this.getCenter(),
		rotation = this.getRotation();

		if ( typeof absolute !== "undefined" && absolute ) {
			rotation = 0;
		}

		this.set.rotate( rotation + offset, c[0], c[1] );
		this._rotation = rotation + offset;
		return this;
	};

	this.translate = function( x, y, absolute ) {
		if ( absolute ) {
			this.cx = x;
			this.cy = y;
			
			var d = graph.scalePoint([ x, y ]),
			c = this.getCenter();

			this.set.translate( d[0] - c[0], d[1] - c[1] );
		} else {
			this.cx += x;
			this.cy += y;
			
			this.set.translate( x, y );
		}
		return this;
	};

	this.rotatedTranslate = function( k ) {
		k = k || 1;
		
		var rot = Math.PI * this.getRotation() / 180;
		
		var x = k * Math.cos( rot ),
		y = k * Math.sin( rot );

		return this.translate( x, y );
	};

	this.translatable = function( tble ) {
		if ( typeof tble === "undefined" ) {
			return this._translatable;
		} else {
			this._translatable = tble;
			if ( tble ) {
				makeTranslatable();
			} else {
				makeUntranslatable();
			}
		}
		return this;
	};
	this.translatable( true );

	this.rotatable = function( rble ) {
		if ( typeof rble === "undefined" ) {
			return this._rotatable;
		} else {
			this._rotatable = rble;
			if ( rble ) {
				this.rotator.rotationOn();
			} else {
				this.rotator.rotationOff();
			}
		}
		return this;
	};
	this.rotatable( true );

	this.set.translate( 0, 0 );

	return this;
}

function analogClock( hour, minute, radius, labelShown ){
	this.hour = hour;
	this.minute = minute;
	this.radius = radius;
	this.set = KhanUtil.currentGraph.raphael.set();

	this.graph = KhanUtil.currentGraph;
	this.draw = function(){
		for( var x = 0; x < 12; x++ ){
			this.set.push( this.graph.line( [ this.radius *  Math.sin( 2 * Math.PI * x/12  ), this.radius * Math.cos( 2 * Math.PI * x/12 ) ], [ 0.8 * this.radius * Math.sin( 2 * Math.PI * x/12 ), 0.8 * this.radius * Math.cos( 2 * Math.PI * x/12 ) ] ) );
		}

		this.set.push( this.graph.line( [ 0.45 * this.radius *  Math.sin( 2 * Math.PI * this.hour/12 + ( this.minute / 60 ) / 12 * 2 * Math.PI ), 0.45 * this.radius * Math.cos( 2 * Math.PI * this.hour/12 + ( this.minute / 60 ) / 12  * 2 * Math.PI ) ], [ 0, 0  ] ) );

		this.set.push( this.graph.line( [ 0.6 * this.radius *  Math.sin( ( this.minute / 60 ) * 2 * Math.PI ), 0.6 * this.radius * Math.cos(  ( this.minute / 60 ) * 2 * Math.PI ) ], [ 0, 0  ] ) );
		this.set.push( this.graph.circle( [ 0, 0 ], this.radius ) );
		this.set.push( this.graph.circle( [ 0, 0 ], this.radius/ 40 ) );
		if( labelShown ){
			this.drawLabels();
		}
		return this.set;
	};

	this.drawLabels = function(){
		for( var x = 1; x < 13; x++ ){
			this.set.push( this.graph.label( [ 0.7 * this.radius *  Math.sin( 2 * Math.PI * x/12  ), 0.7 * this.radius * Math.cos( 2 * Math.PI * x/12 ) ], x  ) );
		}
		return this.set;
	};
}


// for line graph intuition
function updateEquation() {
	var graph = KhanUtil.currentGraph;
	graph.plot.remove();
	graph.style({
		clipRect:[ [-10, -10], [20, 20] ]
	}, function() {
		var ell = function( x ) {
			return x * graph.MN / graph.MD + graph.BN / graph.BD;
		};
		graph.plot = graph.line( [ -10, ell( -10 ) ], [ 10, ell( 10 ) ] );
	});

	graph.labelHolder.remove();

	jQuery( "#equationAnswer").html( "<code>y =" + KhanUtil.fractionReduce( graph.MN, graph.MD ) + "x +" + KhanUtil.fractionReduce( graph.BN, graph.BD )+"</code>" ).tmpl();
	jQuery( "#slope-sol input" ).val( ( graph.MN / graph.MD ) + "" );
	jQuery( "#intercept-sol input" ).val( ( graph.BN / graph.BD ) + "" );
}

// for line graph intuition
function changeSlope( dir ) {
	var graph = KhanUtil.currentGraph;
	var prevDenominator = graph.MD;
	graph.MD = KhanUtil.getLCM( prevDenominator, graph.INCR );
	graph.MN = ( graph.MD / prevDenominator * graph.MN ) + ( dir * graph.MD / graph.INCR );
	updateEquation();
}

// for line graph intuition
function changeIntercept( dir ) {
	var graph = KhanUtil.currentGraph;
	var prevDenominator = graph.BD;
	graph.BD = KhanUtil.getLCM( prevDenominator, graph.INCR );
	graph.BN = ( graph.BD / prevDenominator * graph.BN )
		+ ( dir * graph.BD / graph.INCR );
	updateEquation();
}

function Parabola( lc, x, y ) {
	var leadingCoefficient = lc;
	var x1 = x;
	var y1 = y;
	var raphaelObjects = [];

	this.graphieFunction = function( x ) {
		return ( leadingCoefficient * ( x - x1 ) * ( x - x1 ) ) + y1;
	};

	this.plot = function( fShowFocusDirectrix ) {
		var graph = KhanUtil.currentGraph;
		raphaelObjects.push( graph.plot( this.graphieFunction, [-10, 10] ) );
		if ( fShowFocusDirectrix ) {
			var focusX = this.getFocusX();
			var focusY = this.getFocusY();
			var directrixK = this.getDirectrixK();

			graph.style({
				fill: "#6495ED"
			}, function() {
				raphaelObjects.push( graph.circle( [ focusX, focusY ], 0.1 ) );
				raphaelObjects.push( graph.line( [ -10, directrixK ], [ 10, directrixK ] ) );
			});
		}
	};

	this.redraw = function( fShowFocusDirectrix ) {
		jQuery.each( raphaelObjects, function( i, el ) {
			el.remove();
		});
		raphaelObjects = [];
		this.plot( fShowFocusDirectrix );
	};

	this.update = function( newLC, newX, newY ) {
		leadingCoefficient = newLC;
		x1 = newX;
		y1 = newY;
	};

	this.delta = function( deltaLC, deltaX, deltaY ) {
		this.update( leadingCoefficient + deltaLC, x1 + deltaX, y1 + deltaY );
	};

	this.deltaFocusDirectrix = function( deltaX, deltaY, deltaK ) {
		var focusY = this.getFocusY() + deltaY;
		var k = this.getDirectrixK() + deltaK;

		if ( focusY === k ) {
			focusY += deltaY;
			k += deltaK;
		}
		var newVertexY = ( focusY + k ) / 2;
		var newLeadingCoefficient = 1 / ( 2 * ( focusY - k ) );

		this.update( newLeadingCoefficient, this.getVertexX() + deltaX, newVertexY );
	};

	this.getVertexX = function() {
		return x1;
	};

	this.getVertexY = function() {
		return y1;
	};

	this.getLeadingCoefficient = function() {
		return leadingCoefficient;
	};

	this.getFocusX = function() {
		return x1;
	};

	this.getFocusY = function() {
		return y1 + ( 1 / ( 4 * leadingCoefficient ) );
	};

	this.getDirectrixK = function() {
		return y1 - ( 1 / ( 4 * leadingCoefficient ) );
	};
}

function redrawParabola( fShowFocusDirectrix ) {
	var graph = KhanUtil.currentGraph;
	var storage = graph.graph;
	var currParabola = storage.currParabola;
	currParabola.redraw( fShowFocusDirectrix );

	var leadingCoefficient = currParabola.getLeadingCoefficient();
	var vertexX = currParabola.getVertexX();
	var vertexY = currParabola.getVertexY();

	if ( fShowFocusDirectrix ) {
		jQuery( "#focus-x-label" ).html( "<code>" + currParabola.getFocusX() + "</code>" ).tmpl();
		jQuery( "#focus-y-label" ).html( "<code>" + currParabola.getFocusY().toFixed( 2 ) + "</code>" ).tmpl();
		jQuery( "#directrix-label" ).html( "<code>" + "y = " + currParabola.getDirectrixK().toFixed( 2 ) + "</code>" ).tmpl();
	} else {
		var equation = "y - " + vertexY + "=" + leadingCoefficient + "(x - " + vertexX + ")^{2}";
		equation = KhanUtil.cleanMath( equation );
		jQuery( "#equation-label" ).html( "<code>" + equation + "</code>").tmpl();
	}
	jQuery( "#leading-coefficient input" ).val( leadingCoefficient );
	jQuery( "#vertex-x input" ).val( vertexX );
	jQuery( "#vertex-y input" ).val( vertexY );
}

function updateParabola( deltaA, deltaX, deltaY, fShowFocusDirectrix ) {
	KhanUtil.currentGraph.graph.currParabola.delta( deltaA, deltaX, deltaY );
	redrawParabola( fShowFocusDirectrix );
}

function updateFocusDirectrix( deltaX, deltaY, deltaK ) {
	KhanUtil.currentGraph.graph.currParabola.deltaFocusDirectrix( deltaX, deltaY, deltaK );
	redrawParabola( true );
}

function ParallelLines( x1, y1, x2, y2, distance ) {
	var lowerIntersection;
	var upperIntersection;
	var anchorAngle;

	function stretch( coordArr, dy ) {
		return jQuery.map( coordArr, function( coord, index ){
			if ( index === 0 ) {
				var dx = dy / Math.tan( KhanUtil.toRadians( anchorAngle ) );
				coord += dx;
			}
			if ( index === 1 ) {
				coord += dy;
			}
			return coord;
		});
	}

	function labelAngle( coordArr, angles, color ) {
		var graph = KhanUtil.currentGraph;
		var measure = ( angles[ 1 ] - angles[ 0 ] );
		var bisect = ( angles[ 0 ] + angles[ 1 ] ) / 2;
		var radius = 0.8;
		if ( measure < 90 ) {
			radius = 0.8 / Math.sin( KhanUtil.toRadians ( measure ) );
		}
		var coords = jQuery.map( coordArr, function( coord, index ) {
			if ( index === 0 ) {
				return coord + radius * Math.cos( KhanUtil.toRadians( bisect ) );
			} else {
				return coord + radius * Math.sin( KhanUtil.toRadians( bisect ) );
			}
		});
		graph.label( coords, measure + "^{\\circ}", "center", {color: color});
	}

	this.draw = function() {
		var graph = KhanUtil.currentGraph;
		graph.line( [ x1, y1 ], [ x2, y2 ] );
		graph.line( [ x1, y1 + distance ], [ x2, y2 + distance ] );
	};

	this.drawTransverse = function( angleDeg ) {
		anchorAngle = angleDeg;
		var graph = KhanUtil.currentGraph;
		var width = distance / Math.tan( KhanUtil.toRadians ( anchorAngle ) );
		var lowerX = x1 + ( ( x2 - x1 ) - width ) / 2;
		var upperX = lowerX + width;
		lowerIntersection = [ lowerX, y1 ];
		upperIntersection = [ upperX, y1 + distance ];
		graph.line( stretch( lowerIntersection, -0.8 ), stretch( upperIntersection, 0.8 ) );
	};

	this.drawAngle = function( index, label, color ) {
		var graph = KhanUtil.currentGraph,
			radius = 0.5,
			args, angles;

		color || ( color = "#6495ED" );
		index = ( index + 8 ) % 8;
		if ( index < 4 ) {
			args = [ lowerIntersection, radius ];
		} else {
			args = [ upperIntersection, radius ];
		}

		switch( index % 4 ) {
			case 0:
				angles = [ 0, anchorAngle ];
				break;
			case 1:
				angles = [ anchorAngle, 180 ];
				break;
			case 2:
				angles = [ 180, 180 + anchorAngle ];
				break;
			case 3:
				angles = [ 180 + anchorAngle, 360 ];
				break;
		}
		jQuery.merge( args, angles );

		graph.style({ stroke: color}, function() {
			graph.arc.apply( graph, args );
			if ( label ) {
				labelAngle( args[ 0 ], angles, color );
			}
		});
	};

	this.drawVerticalAngle = function( index, label, color ) {
		index = ( index + 8 ) % 8;
		var vert = ( index + 2 ) % 4;
		if ( index >=4 ) {
			vert += 4;
		}
		this.drawAngle( vert, label, color );
	};

	this.drawAdjacentAngles = function( index, label, color ) {
		index = ( index + 8 ) % 8;
		var adj1 = ( index + 1 ) % 4;
		var adj2 = ( index + 3 ) % 4;
		if ( index >= 4 ) {
			adj1 += 4;
			adj2 += 4;
		}
		this.drawAngle( adj1, label, color );
		this.drawAngle( adj2, label, color );
	};
}

function Chart( data, pos ) {
	var graph = KhanUtil.currentGraph;
	this.transformX = d3.scale.ordinal().domain( data.ordinals ).rangeBands( [ pos.lx, pos.lx + pos.width ], 0.75 );
	this.transformY = d3.scale.linear().domain( [ data.min, data.max ] ).range( [ pos.ly, pos.ly + pos.height ] );

	this.draw = function() {
		// Draw axes
		graph.style({ stroke: "#ccc"});
		graph.line( [ pos.lx, pos.ly ], [ pos.lx + pos.width, pos.ly ] );
		graph.line( [ pos.lx, pos.ly ], [ pos.lx, pos.ly + pos.height ] );

		// Draw data points
		for ( var i = 0; i < data.ordinals.length; i++ ) {
			this.drawDataPoint( i, "#aaa" );
		}

		// Draw ticks
		graph.style({ "stroke-width": 1 });
		var ticks = this.transformY.ticks( data.tickCount );
		for ( var i = 0; i < ticks.length; i++ ) {
			var tick = ticks[ i ];
			graph.line( [ pos.lx - 0.1, this.transformY( tick ) ], [ pos.lx + 0.1, this.transformY( tick ) ] );
			graph.label( [ pos.lx, this.transformY( tick ) ], "\\small{" + tick + "}", "left" );
		}
	};

	this.highlightDataPoint = function( index, color ) {
		this.drawDataPoint( index, color );
	}

	this.labelDataPoint = function( index, color ) {
		color = color || KhanUtil.BLUE;
		var val = data.values[ index ];
		var x = this.transformX( data.ordinals[ index ] );
		var y = this.transformY( val );
		graph.label( [ x, y ], "\\text{" + val + "}", "above", { color: color } );
		graph.style ({ "stroke-dasharray": "-", "stroke-width": 1 });
		graph.line( [ pos.lx, y ], [ x, y ]);
	}
}

function LineChart( data, pos ) {
	var graph = KhanUtil.currentGraph;
	this.base = Chart;
	this.base( data, pos );
	var prevPoint = null;

	this.drawDataPoint = function( index, color ) {
		color = color || KhanUtil.BLUE;
		graph.style({ stroke: color, fill: color });
		var ord = data.ordinals[ index ];
		var x = this.transformX( ord );
		var y = this.transformY( data.values[ index ] );
		var coord = [ x, y ];
		graph.circle( [ x, y ], 0.1 );
		if ( prevPoint ) {
			graph.line( prevPoint, coord );
		}
		prevPoint = coord;
		graph.label( [ x, this.transformY( data.min ) ], "\\text{" + ord + "}", "below" );
	}

	this.highlightDataPoint = function( index, color ) {
		prevPoint = null;
		this.drawDataPoint( index, color );
	}
}

function BarChart( data, pos ) {
	var graph = KhanUtil.currentGraph;
	this.base = Chart;
	this.base( data, pos );

	this.drawDataPoint = function( index, color ) {
		color = color || KhanUtil.BLUE;
		graph.style({ stroke: color, "stroke-width": 10 });
		var ord = data.ordinals[ index ];
		var x = this.transformX( ord );
		var bottomCoord = [ x, this.transformY( data.min ) ];
		graph.line( bottomCoord, [ x, this.transformY( data.values[ index ] ) ] );
		graph.label( bottomCoord, "\\text{" + ord + "}", "below" );
	};
}
;
jQuery.extend( KhanUtil, {
	Polygon: function( numSides ) {
		// This should be renamed...
		// these are the angles between diagonals
		// to construct the polygon.
		var angles = [],
			points = [];
			gExteriorAngles = [];

		function getMaxDiagonalLength( p1, p2, p3 ) {
			var intersection = findIntersection( [ p1, p2 ], [ [ 0, 0 ], p3 ] ),
				x = intersection[ 0 ],
				y = intersection[ 1 ];
			return Math.sqrt( x * x + y * y );
		}

		function getDistance( p1, p2 ) {
			var dx = p2[ 0 ] - p1[ 0 ],
				dy = p2[ 1 ] - p1[ 1 ];
			return Math.sqrt( dx * dx + dy * dy );
		}

		// Creates a convex n-gon by choosing n-2 angles,
		// where each of the n vertices will fall somewhere
		// on these diagonals, or rays from the origin.
		// ( see http://gyazo.com/625bd5662ac07707c86fd83d9d8531a1 )
		// Choose the first two diagonal-lengths willy-nilly,
		// but each subsequent vertex must be closer to the origin
		// than the intersection of the corresponding diagonal
		// and the line created by the previous two vertices.
		// Hippopotamus.
		(function (){
			var graph = KhanUtil.currentGraph,
				curr,
				length,
				min = 1,
				max = 5,
				incr = 1;

			for ( var i = 0; i < numSides - 2; i++ ) {
				var evenlyDivided = 180 / numSides,
					jitter = KhanUtil.randRange( -10, 10 ) / 40;
				angles.push( evenlyDivided * ( 1 + jitter ) );
			}

			while( points.length !== angles.length + 2 ){
				curr = 0;
				points = [ [ 0, 0 ], graph.polar( KhanUtil.randRange( min, max ), curr ) ];
				jQuery.each( angles, function( index, angle ) {
					curr += angle;
					if ( index == 0 ){
						length = KhanUtil.randRange( min, max );
					} else {
						var maxLength = getMaxDiagonalLength( points[ points.length - 2 ], points[ points.length - 1 ], graph.polar( min, curr ) );
						if ( Math.floor( maxLength ) <= min + incr ) {
							return;
						}
						maxLength = Math.min( Math.floor( maxLength ) - incr, max );
						length = KhanUtil.randRange( min, maxLength );
					}
					points.push( graph.polar( length, curr ) );
				});
			}
		})()

		this.draw = function () {
			var graph = KhanUtil.currentGraph;
			graph.style({stroke: KhanUtil.BLUE });
			points.push( [0, 0] );
			graph.path( points );
			points.pop();
		}

		function drawDiagonalTriangle( start ) {
			var graph = KhanUtil.currentGraph,
				length = points.length;
			graph.style({stroke: KhanUtil.ORANGE, "stroke-width": 3});
			graph.line( points[ start % length ], points[ ( start + 1 ) % length ] );
			graph.line( points[ ( start + 1 ) % length ], points[ ( start + 2 ) % length ] );
			graph.line( points[ ( start + 2 ) % length ], points[ start % length ] );
		}

		function drawEndTriangles( start ) {
			drawDiagonalTriangle( start );
			drawDiagonalTriangle( start + points.length - 2 );
		}

		this.drawDiagonals = function( start ) {
			var graph = KhanUtil.currentGraph,
				p1 = points[ start % points.length ];
			jQuery.each( points, function( i, p2 ) {
				if ( start !== i ) {
					graph.line( p1, p2 );
				}
			});
			drawEndTriangles( start );
		}

		this.drawRadialDiagonals = function() {
			var graph = KhanUtil.currentGraph,
				cx = 0,
				cy = 0;

			jQuery.each( points, function( index, point ) {
				cx += point[ 0 ];
				cy += point[ 1 ];
			});
			cx /= points.length;
			cy /= points.length;
			graph.style({stroke: KhanUtil.ORANGE}, function() {
				jQuery.each( points, function( index, point ) {
					graph.line( [ cx, cy ], point );
				});
			});
			graph.circle( [ cx, cy ], 0.3 );
		}

		this.drawExteriorAngles = function() {
			var graph = KhanUtil.currentGraph,
				prevTheta = 0,
				prevPoint;
			graph.style({ "stroke-dasharray": "-"});
			points.push( [ 0, 0 ] );
			jQuery.each( points, function( index, point ) {
				if ( index != 0 ) {
					var distance = getDistance( prevPoint, point ),
						dx = point[ 0 ] - prevPoint[ 0 ],
						dy = point[ 1 ] - prevPoint[ 1 ],
						theta = Math.acos( dx / distance ) * 180 / Math.PI,
						coord;
					if ( dy < 0 ) {
						theta = 360 - theta;
					}
					coord = graph.polar( distance + 2, theta );
					coord[ 0 ] += prevPoint[ 0 ];
					coord[ 1 ] += prevPoint[ 1 ];
					graph.line( prevPoint, coord );
					if ( index != 1 ) {
						graph.style({"stroke-dasharray":""}, function() {
							gExteriorAngles.push( graph.arc( prevPoint, 0.5, prevTheta, theta ) );
						});
					}
					prevTheta = theta;
				}
				prevPoint = point;
			});
			graph.style({"stroke-dasharray":""}, function() {
				gExteriorAngles.push( graph.arc( prevPoint, 0.5, prevTheta, 360 ) );
			});
			points.pop();
		}
		
		function getColor( i ) {
			switch( i % 4 ) {
				case 0: return KhanUtil.BLUE;
				case 1: return KhanUtil.ORANGE;
				case 2: return KhanUtil.GREEN;
				case 3: return KhanUtil.PINK;
			}
		}

		this.animateExteriorAngles = function( start ) {
			var graph = KhanUtil.currentGraph,
				origin = graph.scalePoint( points[ start ] );
			points.push( [ 0, 0 ] );
			gExteriorAngles.unshift( "dummy" );
			for ( var i = 1; i < gExteriorAngles.length; i++ ) {
				var gAngle = gExteriorAngles[ i ],
					point = points[ i ],
					coord = graph.scalePoint( point ),
					clone = gAngle.attr( "stroke", getColor( i ) ).clone();
				clone.animate( { translation: [ origin[ 0 ] - coord[ 0 ], origin[ 1 ] - coord[ 1 ] ] }, 1000 );
			}
			points.pop();
			gExteriorAngles.shift();
		}

		this.clone = function() {
			return jQuery.extend( true, {}, this );
		}

		this.ex = function() {
			return gExteriorAngles;
		}
	},

	Circle: function( radius, center ) {
		center = center || [ 0, 0 ];
		var pointRadius = 0.1;

		(function() {
			var graph = KhanUtil.currentGraph;
			graph.style({stroke: KhanUtil.BLUE});
			graph.circle( center, radius );
		})()

		this.drawPoint = function( theta ) {
			var graph = KhanUtil.currentGraph,
				point = graph.polar( radius, theta );
			return graph.circle( point, pointRadius );
		}

		this.drawCenter = function() {
			var graph = KhanUtil.currentGraph;
			graph.style({ fill: KhanUtil.BLUE }, function() {
				graph.circle( center, pointRadius );
			});
		}

		this.drawRadius = function( theta ) {
			var graph = KhanUtil.currentGraph,
				point = graph.polar( radius, theta );
			return graph.line( center, point );
		}

		this.drawChord = function( theta1, theta2 ) {
			var graph = KhanUtil.currentGraph,
				point1 = graph.polar( radius, theta1 ),
				point2 = graph.polar( radius, theta2 );
			return graph.line( point1, point2 );
		}

		function isThetaWithin( theta, min, max ) {
			min = min % 360;
			max = max % 360;
			if ( min > max ) {
				return theta < max || theta > min;
			} else {
				return theta > min && theta < max;
			}
		}

		function getThetaFromXY( x, y ) {
			var angle = Math.atan( y / x );
			if (x <= 0 && y > 0) {
				angle += Math.PI;
			} else if (x < 0 && y < 0) {
				angle += Math.PI;
			} else if (x >= 0 && y < 0) {
				angle += 2 * Math.PI;
			}
			angle = angle * 180 / Math.PI;
			return angle;
		}

		this.drawMovablePoint = function( theta, min, max  ) {
			var graph = KhanUtil.currentGraph,
				point = graph.polar( radius, theta )
				min = min || 0,
				max = max || 360,
				graph.graph.movable = { vertex: KhanUtil.bogusShape, arc: KhanUtil.bogusShape, chords: [ KhanUtil.bogusShape, KhanUtil.bogusShape ] };

			graph.graph.inscribedPoint = KhanUtil.addMovablePoint( {coordX: point[ 0 ], coordY: point[ 1 ] } );

			graph.graph.inscribedPoint.onMove = function( x, y ) {
				var theta = getThetaFromXY( x, y );
				if ( !isThetaWithin( theta, min, max ) ) {
					return false;
				}
				graph.style({stroke: KhanUtil.ORANGE});
				graph.graph.movable.arc.remove();
				graph.graph.movable.chords[0].remove();
				graph.graph.movable.chords[1].remove();
				graph.graph.movable.vertex.remove();
				graph.graph.movable = graph.graph.circle.drawInscribedAngle( theta, max, min );
				return graph.polar( radius, theta );
			};
		}

		this.drawCentralArc = function( start, end, arcRadius ) {
			var graph = KhanUtil.currentGraph,
				arcRadius = arcRadius || 0.5,
				arc;
			graph.style( {fill: ""}, function() {
				arc = graph.arc( center, arcRadius, start, end );
			});
			return arc;
		}

		this.drawCentralAngle = function( start, end, arcRadius ) {
			var result = { radii: [] };
			result.radii.push( this.drawRadius( start ) );
			result.radii.push( this.drawRadius( end ) );
			result.arc = this.drawCentralArc( start, end, arcRadius );
			return result;
		}

		this.drawInscribedArc = function( inscribed, start, end, arcRadius ) {
			var graph = KhanUtil.currentGraph,
				vertex = graph.polar( radius, inscribed ),
				point1 = graph.polar( radius, start ),
				point2 = graph.polar( radius, end ),
				theta1 = getThetaFromXY( point1[0] - vertex[0], point1[1] - vertex[1] ),
				theta2 = getThetaFromXY( point2[0] - vertex[0], point2[1] - vertex[1] ),
				arcRadius = arcRadius || 0.5,
				arc;
			graph.style( { fill: "" }, function() {
				arc = graph.arc( vertex, arcRadius, theta1, theta2 );
			})
			return arc;
		}

		this.drawInscribedAngle = function( inscribed, start, end, arcRadius ) {
			var graph = KhanUtil.currentGraph,
				chords = [ this.drawChord( inscribed, start ), this.drawChord( inscribed, end) ],
				vertex = this.drawPoint( inscribed ),
				arc = this.drawInscribedArc( inscribed, start, end, arcRadius );
			return { chords: chords, vertex: vertex, arc: arc };
		}
	}
});
;
(function() {
	var createGraph = function( el ) {
		var xScale = 40, yScale = 40, xRange, yRange;

		jQuery( el ).css( "position", "relative" );
		var raphael = Raphael( el );

		// For a sometimes-reproducible IE8 bug; doesn't affect SVG browsers at all
		jQuery( el ).children( "div" ).css( "position", "absolute" );

		// Set up some reasonable defaults
		var currentStyle = {
			"stroke-width": 2,
			"fill": "none"
		};

		var scaleVector = function( point ) {
			if ( typeof point === "number" ) {
				return scaleVector([ point, point ]);
			}

			var x = point[0], y = point[1];
			return [ x * xScale, y * yScale ];
		};

		var scalePoint = function scalePoint( point ) {
			if ( typeof point === "number" ) {
				return scalePoint([ point, point ]);
			}

			var x = point[0], y = point[1];
			return [ ( x - xRange[0] ) * xScale, ( yRange[1] - y ) * yScale ];
		};

		var svgPath = function( points ) {
			// Bound a number by 1e-6 and 1e20 to avoid exponents after toString
			function boundNumber( num ) {
				if ( num === 0 ) {
					return num;
				} else if ( num < 0 ) {
					return -boundNumber( -num );
				} else {
					return Math.max( 1e-6, Math.min( num, 1e20 ) );
				}
			}

			return jQuery.map(points, function( point, i ) {
				if ( point === true ) {
					return "z";
				} else {
					var scaled = scalePoint( point );
					return ( i === 0 ? "M" : "L") + boundNumber(scaled[0]) + " " + boundNumber(scaled[1]);
				}
			}).join("");
		};

		var processAttributes = function( attrs ) {
			var transformers = {
				scale: function( scale ) {
					if ( typeof scale === "number" ) {
						scale = [ scale, scale ];
					}

					xScale = scale[0];
					yScale = scale[1];

					// Update the canvas size
					raphael.setSize( ( xRange[1] - xRange[0] ) * xScale, ( yRange[1] - yRange[0] ) * yScale );
				},

				clipRect: function( pair ) {
					var point = pair[0], size = pair[1];
					point[1] += size[1]; // because our coordinates are flipped

					return { "clip-rect": scalePoint( point ).concat( scaleVector( size ) ).join(" ") };
				},

				strokeWidth: function( val ) {
					return { "stroke-width": parseFloat(val) };
				},

				rx: function( val ) {
					return { rx: scaleVector([ val, 0 ])[0] };
				},

				ry: function( val ) {
					return { ry: scaleVector([ 0, val ])[1] };
				},

				r: function( val ) {
					var scaled = scaleVector([ val, val ]);
					return { rx: scaled[0], ry: scaled[1] };
				}
			};

			var processed = {};
			jQuery.each(attrs || {}, function( key, value ) {
				var transformer = transformers[ key ];

				if ( typeof transformer === "function" ) {
					jQuery.extend( processed, transformer( value ) );
				} else {
					var dasherized = key.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
						.replace(/([a-z\d])([A-Z])/g, '$1-$2')
						.toLowerCase();
					processed[ dasherized ] = value;
				}
			});

			return processed;
		};

		/* Convert cartesian coordinates to polar coordinates (angle in degrees).
		 * - Will return angle in radians if `angleInRadians` is specified as truthy.
		 */
		var cartToPolar = function( coord, angleInRadians ) {
			var r = Math.sqrt( Math.pow(coord[0],2) + Math.pow(coord[1],2) );
			var theta = Math.atan2( coord[1], coord[0] );
			// convert angle range from [-pi, pi] to [0, 2pi]
			if ( theta < 0 ) {
				theta += 2 * Math.PI;
			}
			if ( !angleInRadians ) {
				theta = theta * 180 / Math.PI;
			}
			return [ r, theta ];
		};

		var polar = function( r, th ) {
			if ( typeof r === "number" ) {
				r = [ r, r ];
			}
			th = th * Math.PI / 180;
			return [ r[0] * Math.cos( th ), r[1] * Math.sin( th ) ];
		};

		var addArrowheads = function arrows( path ) {
			var type = path.constructor.prototype;

			if ( type === Raphael.el ) {
				if ( path.type === "path" && typeof path.arrowheadsDrawn === "undefined" ) {
					var w = path.attr( "stroke-width" ), s = 0.6 + 0.4 * w;
					var l = path.getTotalLength();

					if ( l < 0.75 * s ) {
						// You're weird because that's a *really* short path
						// Giving up now before I get more confused

					} else {
						// This makes a lot more sense
						var set = raphael.set();
						var head = raphael.path( "M-3 4 C-2.75 2.5 0 0.25 0.75 0C0 -0.25 -2.75 -2.5 -3 -4" );
						var end = path.getPointAtLength( l - 0.4 );
						var almostTheEnd = path.getPointAtLength( l - 0.75 * s );
						var angle = Math.atan2( end.y - almostTheEnd.y, end.x - almostTheEnd.x ) * 180 / Math.PI;
						var attrs = path.attr();
						delete attrs.path;

						var subpath = path.getSubpath( 0, l - 0.75 * s );
						subpath = raphael.path( subpath ).attr( attrs );
						subpath.arrowheadsDrawn = true;
						path.remove();

						head.rotate( angle, 0.75, 0 ).scale( s, s, 0.75, 0 )
							.translate( almostTheEnd.x, almostTheEnd.y ).attr( attrs )
							.attr({ "stroke-linejoin": "round", "stroke-linecap": "round" });
						head.arrowheadsDrawn = true;
						set.push( subpath );
						set.push( head );
						return set;
					}
				}
			} else if ( type === Raphael.st ) {
				for (var i = 0, l = path.items.length; i < l; i++) {
					arrows( path.items[i] );
				}
			}
		};

		var drawingTools = {
			circle: function( center, radius ) {
				return raphael.ellipse.apply( raphael, scalePoint( center ).concat( scaleVector([ radius, radius ]) ) );
			},

			ellipse: function( center, radii ) {
				return raphael.ellipse.apply( raphael, scalePoint( center ).concat( scaleVector( radii ) ) );
			},

			arc: function( center, radius, startAngle, endAngle, sector ) {
				startAngle = ( startAngle % 360 + 360 ) % 360;
				endAngle = ( endAngle % 360 + 360 ) % 360;

				var cent = scalePoint( center );
				var radii = scaleVector( radius );
				var startVector = polar( radius, startAngle );
				var endVector = polar( radius, endAngle );

				var startPoint = scalePoint([ center[0] + startVector[0], center[1] + startVector[1] ]);
				var endPoint = scalePoint([ center[0] + endVector[0], center[1] + endVector[1] ]);

				var largeAngle = ( (endAngle - startAngle) % 360 + 360) % 360 > 180;

				return raphael.path(
					"M" + startPoint.join(" ") +
					"A" + radii.join(" ") +
					" 0 " + // ellipse rotation
					( largeAngle ? 1 : 0 ) +
					" 0 " + // sweep flag
					endPoint.join(" ") +
					( sector ? "L" + cent.join(" ") + "z" : "" ) );
			},

			path: function( points ) {
				var p = raphael.path( svgPath( points) );
				p.graphiePath = points;
				return p;
			},

			line: function( start, end ) {
				return this.path( [start, end] );
			},

			grid: function( xr, yr ) {
				var step = currentStyle.step || [ 1, 1 ];
				var set = raphael.set();

				var x = step[0] * Math.ceil(xr[0] / step[0]);
				for ( ; x <= xr[1]; x += step[0] ) {
					set.push( this.line( [x, yr[0]], [x, yr[1]] ) );
				}

				var y = step[1] * Math.ceil(yr[0] / step[1]);
				for ( ; y <= yr[1]; y += step[1] ) {
					set.push( this.line( [xr[0], y], [xr[1], y] ) );
				}

				return set;
			},

			label: function( point, text, direction, latex ) {
				var directions = {
					"center":      [ -0.5, -0.5 ],
					"above":       [ -0.5, -1.0 ],
					"above right": [  0.0, -1.0 ],
					"right":       [  0.0, -0.5 ],
					"below right": [  0.0,  0.0 ],
					"below":       [ -0.5,  0.0 ],
					"below left":  [ -1.0,  0.0 ],
					"left":        [ -1.0, -0.5 ],
					"above left":  [ -1.0, -1.0 ]
				};

				var scaled = scalePoint( point );

				latex = (typeof latex === "undefined") || latex;

				var span;

				if ( latex ) {
					var code = jQuery( "<code>" ).text( text );
					span = jQuery( "<span>" ).append( code )
					// Add to the MathJax queue
					if ( typeof MathJax !== "undefined") {
						jQuery.tmpl.type.code()( code[0] );
					}
				} else {
					span = jQuery( "<span>" ).html( text );
				}

				var pad = currentStyle["label-distance"];
				span.css({
					position: "absolute",
					left: scaled[0],
					top: scaled[1],
					padding: ( pad != null ? pad : 7 ) + "px"
				}).appendTo( el );

				if ( typeof MathJax !== "undefined") {
					// Run after MathJax typesetting
					MathJax.Hub.Queue(function() {
						// Avoid an icky flash
						span.css( "visibility", "hidden" );

						var setMargins = function( size ) {
							span.css( "visibility", "" );
							var multipliers = directions[ direction || "center" ];
							span.css({
								marginLeft: Math.round( size[0] * multipliers[0] ),
								marginTop: Math.round( size[1] * multipliers[1] )
							});
						};

						var callback = MathJax.Callback( function() {} );

						// Wait for the browser to render it
						var tries = 0;
						var size = [ span.outerWidth(), span.outerHeight() ];

						if ( size[1] > 18 ) {
							setMargins( size );
							callback();
						} else {
							var inter = setInterval(function() {
								size = [ span.outerWidth(), span.outerHeight() ];

								// Heuristic to guess if the font has kicked in so we have box metrics
								// (Magic number ick, but this seems to work mostly-consistently)
								if ( size[1] > 18 || ++tries >= 10 ) {
									setMargins( size );
									clearInterval(inter);
									callback();
								}
							}, 100);
						}

						return callback;
					});
				}

				return span;
			},

			plotParametric: function( fn, range ) {
				currentStyle.strokeLinejoin || ( currentStyle.strokeLinejoin = "round" );
				currentStyle.strokeLinecap || ( currentStyle.strokeLinecap = "round" );

				var points = [];

				var min = range[0], max = range[1];
				var step = ( max - min ) / ( currentStyle["plot-points"] || 800 );
				for ( var t = min; t <= max; t += step ) {
					points.push( fn( t ) );
				}

				return this.path( points );
			},

			plotPolar: function( fn, range ) {
				var min = range[0], max = range[1];

				// There is probably a better heuristic for this
				currentStyle["plot-points"] || ( currentStyle["plot-points"] = 2 * ( max - min ) * xScale );

				return this.plotParametric( function( th ) {
					return polar( fn(th), th * 180 / Math.PI );
				}, range );
			},

			plot: function( fn, range ) {
				var min = range[0], max = range[1];
				currentStyle["plot-points"] || ( currentStyle["plot-points"] = 2 * ( max - min ) * xScale );

				return this.plotParametric( function( x ) {
					return [ x, fn(x) ];
				}, range );
			}
		};

		var graphie = {
			raphael: raphael,

			init: function( options ) {
				var scale = options.scale || [ 40, 40 ];
				scale = ( typeof scale === "number" ? [ scale, scale ] : scale );

				xScale = scale[0];
				yScale = scale[1];

				if( options.range == null ) {
					return Khan.error( "range should be specified in graph init" );
				}

				xRange = options.range[0];
				yRange = options.range[1];

				var w = ( xRange[1] - xRange[0] ) * xScale, h = ( yRange[1] - yRange[0] ) * yScale;
				raphael.setSize( w, h );
				jQuery( el ).css({
					"width": w,
					"height": h
				});

				return this;
			},

			style: function( attrs, fn ) {
				var processed = processAttributes( attrs );

				if ( typeof fn === "function" ) {
					var oldStyle = currentStyle;
					currentStyle = jQuery.extend( {}, currentStyle, processed );
					fn.call( graphie );
					currentStyle = oldStyle;
				} else {
					jQuery.extend( currentStyle, processed );
				}
			},

			scalePoint: scalePoint,
			scaleVector: scaleVector,

			polar: polar,
			cartToPolar: cartToPolar

		};

		jQuery.each( drawingTools, function( name ) {
			graphie[ name ] = function() {
				var last = arguments[ arguments.length - 1 ];
				var oldStyle = currentStyle;
				var result;

				// The last argument is probably trying to change the style
				if ( typeof last === "object" && !jQuery.isArray( last ) ) {
					currentStyle = jQuery.extend( {}, currentStyle, processAttributes( last ) );

					var rest = [].slice.call( arguments, 0, arguments.length - 1 );
					result = drawingTools[ name ].apply( drawingTools, rest );
				} else {
					currentStyle = jQuery.extend( {}, currentStyle );

					result = drawingTools[ name ].apply( drawingTools, arguments );
				}

				// Bad heuristic for recognizing Raphael elements and sets
				var type = result.constructor.prototype;
				if ( type === Raphael.el || type === Raphael.st ) {
					result.attr( currentStyle );

					if ( currentStyle.arrows ) {
						result = addArrowheads( result );
					}
				} else if ( result instanceof jQuery ) {
					result.css( currentStyle );
				}

				currentStyle = oldStyle;
				return result;
			};
		});


		// Initializes graphie settings for a graph and draws the basic graph
		// features (axes, grid, tick marks, and axis labels)
		// Options expected are:
		// - range: [ [a, b], [c, d] ] or [ a, b ]
		// - scale: [ a, b ] or number
		// - gridOpacity: number (0 - 1)
		// - gridStep: [ a, b ] or number (relative to units)
		// - tickStep: [ a, b ] or number (relative to grid steps)
		// - tickLen: [ a, b ] or number (in pixels)
		// - labelStep: [ a, b ] or number (relative to tick steps)
		// - yLabelFormat: fn to format label string for y-axis
		// - xLabelFormat: fn to format label string for x-axis
		// - smartLabelPositioning: true or false to ignore minus sign
		graphie.graphInit = function( options ) {

			options = options || {};

			jQuery.each( options, function( prop, val ) {

				// allow options to be specified by a single number for shorthand if
				// the horizontal and vertical components are the same
				if ( !prop.match( /.*Opacity$/ ) && prop !== "range"
						&& typeof val === "number" ) {
					options[ prop ] = [ val, val ];
				}

				// allow symmetric ranges to be specified by the absolute values
				if ( prop === "range" ) {
					if ( val.constructor === Array ) {
						if ( val[0].constructor !== Array ) {  // but don't mandate symmetric ranges
							options[ prop ] = [ [ -val[0], val[0] ], [ -val[1], val[1] ] ];
						}
					} else if ( typeof val === "number" ) {
						options[ prop ] = [ [ -val, val ], [ -val, val ] ];
					}
				}

			});

			var range = options.range || [ [-10, 10], [-10, 10] ],
				scale = options.scale || [ 20, 20 ],
				grid = options.grid || true,
				gridOpacity = options.gridOpacity || 0.1,
				gridStep = options.gridStep || [ 1, 1 ],
				axes = options.axes || true,
				axisArrows = options.axisArrows || "",
				axisOpacity = options.axisOpacity || 1.0,
				ticks = options.ticks || true,
				tickStep = options.tickStep || [ 2, 2 ],
				tickLen = options.tickLen || [ 5, 5 ],
				tickOpacity = options.tickOpacity || 1.0,
				labels = options.labels || options.labelStep || false,
				labelStep = options.labelStep || [ 1, 1 ],
				labelOpacity = options.labelOpacity || 1.0,
				unityLabels = options.unityLabels || false,
				labelFormat = options.labelFormat || function(a) { return a; },
				xLabelFormat = options.xLabelFormat || labelFormat,
				yLabelFormat = options.yLabelFormat || labelFormat,
				smartLabelPositioning = options.smartLabelPositioning != null ?
					options.smartLabelPositioning : true;

			if ( smartLabelPositioning ) {
				var minusIgnorer = function( lf ) { return function( a ) {
					return ( lf( a ) + "" ).replace( /-(\d)/g, "\\llap{-}$1" );
				}; };

				xLabelFormat = minusIgnorer( xLabelFormat );
				yLabelFormat = minusIgnorer( yLabelFormat );
			}

			this.init({
				range: range,
				scale: scale
			});

			// draw grid
			if ( grid ) {
				this.grid( range[0], range[1], {
					stroke: "#000000",
					opacity: gridOpacity,
					step: gridStep
				});
			}

			// draw axes
			if ( axes ) {

				// this is a slight hack until <-> arrowheads work
				if ( axisArrows === "<->" || true ) {
					this.style({
						stroke: "#000000",
						opacity: axisOpacity,
						strokeWidth: 2,
						arrows: "->"
					}, function() {
						this.path([ [ 0, 0 ], [ range[0][0], 0 ] ]);
						this.path([ [ 0, 0 ], [ range[0][1], 0 ] ]);
						this.path([ [ 0, 0 ], [ 0, range[1][0] ] ]);
						this.path([ [ 0, 0 ], [ 0, range[1][1] ] ]);
					});

				// also, we don't support "<-" arrows yet, but why you
				// would want that on your graph is beyond me.
				} else if ( axisArrows === "->" || axisArrows === "" ) {
					this.style({
						stroke: "#000000",
						opacity: axisOpacity,
						strokeWidth: 2,
						arrows: axisArrows
					}, function() {
						this.path([ [ range[0][0], 0 ], [ range[0][1], 0 ] ]);
						this.path([ [ 0, range[1][0] ], [ 0, range[1][1] ] ]);
					});

				}

			}

			// draw tick marks
			if ( ticks ) {
				this.style({
					stroke: "#000000",
					opacity: tickOpacity,
					strokeWidth: 1
				}, function() {

					// horizontal axis
					var step = gridStep[0] * tickStep[0],
				 len = tickLen[0] / scale[1],
				 start = range[0][0],
				 stop = range[0][1];

					for ( var x = step; x <= stop; x += step ) {
						if ( x < stop || !axisArrows ) {
							this.line( [ x, -len ], [ x, len ] );
						}
					}

					for ( var x = -step; x >= start; x -= step ) {
						if ( x > start || !axisArrows ) {
							this.line( [ x, -len ], [ x, len ] );
						}
					}

					// vertical axis
					step = gridStep[1] * tickStep[1];
					len = tickLen[1] / scale[0];
					start = range[1][0];
					stop = range[1][1];

					for ( var y = step; y <= stop; y += step ) {
						if ( y < stop || !axisArrows ) {
							this.line( [ -len, y ], [ len, y ] );
						}
					}

					for ( var y = -step; y >= start; y -= step ) {
						if ( y > start || !axisArrows ) {
							this.line( [ -len, y ], [ len, y ] );
						}
					}

				});
			}

			// draw axis labels
			if ( labels ) {
				this.style({
					stroke: "#000000",
					opacity: labelOpacity
				}, function() {

					// horizontal axis
					var step = gridStep[0] * tickStep[0] * labelStep[0],
						start = range[0][0],
						stop = range[0][1];

					// positive x-axis
					for ( var x = step; x <= stop; x += step ) {
						if ( x < stop || !axisArrows ) {
							this.label( [ x, 0 ], xLabelFormat( x ), "below" );
						}
					}

					// negative x-axis
					for ( var x = -step * (unityLabels ? 1 : 2); x >= start; x -= step ) {
						if ( x > start || !axisArrows ) {
							this.label( [ x, 0 ], xLabelFormat( x ), "below" );
						}
					}

					step = gridStep[1] * tickStep[1] * labelStep[1];
					start = range[1][0];
					stop = range[1][1];

					// positive y-axis
					for ( var y = step; y <= stop; y += step ) {
						if ( y < stop || !axisArrows ) {
							this.label( [ 0, y ], yLabelFormat( y ), "left" );
						}
					}

					// negative y-axis
					for ( var y = -step * (unityLabels ? 1 : 2); y >= start; y -= step ) {
						if ( y > start || !axisArrows ) {
							this.label( [ 0, y ], yLabelFormat( y ), "left" );
						}
					}

				});
			}

		};

		return graphie;
	};

	jQuery.fn.graphie = function( problem ) {
		return this.find( ".graphie" ).andSelf().filter( ".graphie" ).each(function() {
			// Grab code for later execution
			var code = jQuery( this ).text(), graphie;

			// Ignore code that isn't really code ;)
			if (code.match(/Created with Rapha\xebl/)) {
				return;
			}

			// Remove any of the code that's in there
			jQuery( this ).empty();

			// Initialize the graph
			if ( jQuery( this ).data( "update" ) ) {
				var id = jQuery( this ).data( "update" );
				jQuery( this ).remove();

				// Graph could be in either of these
				var area = jQuery( "#problemarea" ).add(problem);
				graphie = area.find( "#" + id ).data( "graphie" );
			} else {
				graphie = createGraph( this );
				jQuery( this ).data( "graphie", graphie );
			}

			// So we can write graph.bwahahaha = 17 to save stuff between updates
			if ( typeof graphie.graph === "undefined" ) {
				graphie.graph = {};
			}

			code = "(function() {" + code + "})()";

			// Execute the graph-specific code
			KhanUtil.currentGraph = graphie;
			jQuery.tmpl.getVAR( code, graphie );
			// delete KhanUtil.currentGraph;
		}).end();
	};
})();
;
jQuery.extend( KhanUtil, {

	// Fill opacity for inequality shading
	FILL_OPACITY: 0.3,

	dragging: false,

	// Wrap graphInit to create a fixed-size graph automatically scaled to the given range
	initAutoscaledGraph: function( range, options ) {
		var graph = KhanUtil.currentGraph;
		options = jQuery.extend({
			xpixels: 500,
			ypixels: 500,
			xdivisions: 20,
			ydivisions: 20,
			labels: true,
			unityLabels: true,
			range: ( range === undefined ? [ [-10, 10], [-10, 10] ] : range)
		}, options);

		options.scale = [
			options.xpixels/(options.range[0][1] - options.range[0][0]),
			options.ypixels/(options.range[1][1] - options.range[1][0])
		];
		options.gridStep = [
			(options.range[0][1] - options.range[0][0])/options.xdivisions,
			(options.range[1][1] - options.range[1][0])/options.ydivisions
		];

		// Attach the resulting metrics to the graph for later reference
		graph.xpixels = options.xpixels;
		graph.ypixels = options.ypixels;
		graph.range = options.range;
		graph.scale = options.scale;

		graph.graphInit(options);
	},

	// graphie puts text spans on top of the SVG, which looks good, but gets
	// in the way of mouse events. This adds another SVG element on top
	// of everything else where we can add invisible shapes with mouse
	// handlers wherever we want.
	addMouseLayer: function() {
		var graph = KhanUtil.currentGraph;

		// Attach various metrics that are used by the interactive functions.
		// TODO: Add appropriate helper functions in graphie and replace a lot of
		// the cryptic references to scale, range, xpixels, ypixels, etc.
		graph.xpixels = graph.raphael.canvas.offsetWidth;
		graph.ypixels = graph.raphael.canvas.offsetHeight;
		if ( graph.xpixels === undefined ) {
			graph.xpixels = graph.raphael.width;
			graph.ypixels = graph.raphael.height;
		}
		graph.scale = [ graph.scalePoint([ 1, 1 ])[0] - graph.scalePoint([ 0, 0 ])[0], graph.scalePoint([ 0, 0 ])[1] - graph.scalePoint([ 1, 1 ])[1] ];
		var xmin = 0 - (graph.scalePoint([0, 0])[0] / graph.scale[0]);
		var xmax = (graph.xpixels / graph.scale[0]) + xmin;
		var ymax = graph.scalePoint([0, 0])[1] / graph.scale[1];
		var ymin = ymax - (graph.ypixels / graph.scale[1]);
		graph.range = [ [ xmin, xmax ], [ ymin, ymax ] ];

		graph.mouselayer = Raphael( graph.raphael.canvas.parentNode, graph.xpixels, graph.ypixels );
		jQuery( graph.mouselayer.canvas ).css( "z-index", 1 );
		Khan.scratchpad.disable();
	},


	// Find the angle between two or three points
	findAngle: function ( point1, point2, vertex ) {
		if ( vertex === undefined ) {
			var x = point1[0] - point2[0];
			var y = point1[1] - point2[1];
			if ( !x && !y ) {
				return 0;
			}
			return ( 180 + Math.atan2( -y, -x ) * 180 / Math.PI + 360) % 360;
		} else {
			return KhanUtil.findAngle( point1, vertex ) - KhanUtil.findAngle( point2, vertex );
		}
	},

	// Draw angle arcs
	drawArcs: function( point1, vertex, point3, numArcs ) {
		var startAngle = KhanUtil.findAngle( point1, vertex);
		var endAngle = KhanUtil.findAngle( point3, vertex);
		if (( (endAngle - startAngle) % 360 + 360) % 360 > 180) {
			var temp = startAngle;
			startAngle = endAngle;
			endAngle = temp;
		}

		var radius = 0.3;
		// smaller angles need a bigger radius
		if ((((endAngle - startAngle) % 360 + 360) % 360) < 75) {
			radius = (-0.6/90) * (((endAngle - startAngle) % 360 + 360) % 360) + 0.8;
		}

		var arcset = [];
		for (var arc = 0; arc < numArcs; ++arc) {
			arcset.push( KhanUtil.currentGraph.arc( vertex, radius + (0.15 * arc), startAngle, endAngle ) );
		}
		return arcset;
	},


	// Add a point to the graph that can be dragged around.
	// It allows automatic constraints on its movement as well as automatically
	// managing line segments that terminate at the point.
	//
	// Options can be set to control how the point behaves:
	//   coord[]:
	//     The initial position of the point
	//   snapX, snapY:
	//     The minimum increment the point can be moved
	//
	// The return value is an object that can be used to manipulate the point:
	//   The coordX and coordY properties tell you the current position
	//
	//   By adding an onMove() method to the returned object, you can install an
	//   event handler that gets called every time the user moves the point.
	//
	//   The returned object also provides a moveTo(x,y) method that will move
	//   the point to a specific coordinate
	//
	// Constraints can be set on the on the returned object:
	//
	//  - Set point to be immovable:
	//        movablePoint.fixed = true
	//
	//  - Constrain point to a fixed distance from another point. The resulting
	//    point will move in a circle:
	//        movablePoint.fixedDistance = {
	//           dist: 2,
	//           point: point1
	//        }
	//
	//  - Constrain point to a line defined by a fixed angle between it and
	//    two other points:
	//        movablePoint.fixedAngle = {
	//           angle: 45,
	//           vertex: point1,
	//           ref: point2
	//        }
	//
	//  - Confined the point to traveling in a vertical or horizontal line,
	//    respectively
	//        movablePoint.constrainX = true;
	//        movablePoint.constrainY = true;
	//
	//  - Connect a movableLineSegment to a movablePoint. The point is attached
	//    to a specific end of the line segment by adding the segment either to
	//    the list of lines that start at the point or the list of lines that
	//    end at the point (movableLineSegment can do this for you):
	//        movablePoint.lineStarts.push( movableLineSegment );
	//          - or -
	//        movablePoint.lineEnds.push( movableLineSegment );
	//
	addMovablePoint: function( options ) {
		// The state object that gets returned
		var movablePoint = jQuery.extend(true, {
			graph: KhanUtil.currentGraph,
			coord: [ 0, 0 ],
			snapX: 0,
			snapY: 0,
			highlight: false,
			dragging: false,
			visible: true,
			constraints: {
				fixed: false,
				constrainX: false,
				constrainY: false,
				fixedAngle: {},
				fixedDistance: {}
			},
			lineStarts: [],
			lineEnds: [],
			normalStyle: {
				fill: KhanUtil.ORANGE,
				stroke: KhanUtil.ORANGE
			},
			highlightStyle: {
				fill: KhanUtil.ORANGE,
				stroke: KhanUtil.ORANGE
			}
		}, options);

		// deprecated: don't use coordX/coordY; use coord[]
		if ( options.coordX !== undefined ) {
			movablePoint.coord[0] = options.coordX;
		}
		if ( options.coordY !== undefined ) {
			movablePoint.coord[1] = options.coordY;
		}

		var graph = movablePoint.graph;

		if ( movablePoint.visible ) {
			graph.style( movablePoint.normalStyle, function() {
				movablePoint.visibleShape = graph.ellipse( movablePoint.coord, [ 4 / graph.scale[0], 4 / graph.scale[1] ] );
			});
		}
		movablePoint.normalStyle.scale = 1;
		movablePoint.highlightStyle.scale = 2;

		// Using the passed coordinates, apply any constraints and return the closest coordinates
		// that match the constraints.
		movablePoint.applyConstraint = function( coord, extraConstraints, override ) {
			var newCoord = coord.slice();
			// use the configured constraints for the point plus any passed-in constraints; use only passed-in constraints if override is set
			var constraints = {};
			if ( override ) {
				jQuery.extend( constraints, {
					fixed: false,
					constrainX: false,
					constrainY: false,
					fixedAngle: {},
					fixedDistance: {}
				}, extraConstraints );
			} else {
				jQuery.extend( constraints, this.constraints, extraConstraints );
			}

			// constrain to vertical movement
			if ( constraints.constrainX ) {
				newCoord = [ this.coord[0], coord[1] ];

			// constrain to horizontal movement
			} else if ( constraints.constrainY ) {
				newCoord = [ coord[0], this.coord[1] ];

			// both distance and angle are constrained
			} else if ( typeof constraints.fixedAngle.angle === "number" && typeof constraints.fixedDistance.dist === "number") {
				var vertex = constraints.fixedAngle.vertex.coord || constraints.fixedAngle.vertex;
				var ref = constraints.fixedAngle.ref.coord || constraints.fixedAngle.ref;
				var distPoint = constraints.fixedDistance.point.coord || constraints.fixedDistance.point;

				var constrainedAngle = (constraints.fixedAngle.angle + KhanUtil.findAngle( ref, vertex ) ) * Math.PI / 180;
				var length = constraints.fixedDistance.dist;
				newCoord[0] = length * Math.cos(constrainedAngle) + distPoint[0];
				newCoord[1] = length * Math.sin(constrainedAngle) + distPoint[1];

			// angle is constrained
			} else if ( typeof constraints.fixedAngle.angle === "number" ) {
				var vertex = constraints.fixedAngle.vertex.coord || constraints.fixedAngle.vertex;
				var ref = constraints.fixedAngle.ref.coord || constraints.fixedAngle.ref;

				// constrainedAngle is the angle from vertex to the point with reference to the screen
				var constrainedAngle = (constraints.fixedAngle.angle + KhanUtil.findAngle( ref, vertex ) ) * Math.PI / 180;
				// angle is the angle from vertex to the mouse with reference to the screen
				var angle = KhanUtil.findAngle( coord, vertex ) * Math.PI / 180;
				var distance = KhanUtil.getDistance( coord, vertex );
				var length = distance * Math.cos(constrainedAngle - angle);
				length = length < 1.0 ? 1.0 : length;
				newCoord[0] = length * Math.cos(constrainedAngle) + vertex[0];
				newCoord[1] = length * Math.sin(constrainedAngle) + vertex[1];

			// distance is constrained
			} else if ( typeof constraints.fixedDistance.dist === "number" ) {
				var distPoint = constraints.fixedDistance.point.coord || constraints.fixedDistance.point;

				var angle = KhanUtil.findAngle( coord, distPoint );
				var length = constraints.fixedDistance.dist;
				angle = angle * Math.PI / 180;
				newCoord[0] = length * Math.cos(angle) + distPoint[0];
				newCoord[1] = length * Math.sin(angle) + distPoint[1];

			// point is fixed
			} else if ( constraints.fixed ) {
				newCoord = movablePoint.coord;
			}
			return newCoord;
		};


		if ( movablePoint.visible && !movablePoint.constraints.fixed ) {
			// the invisible shape in front of the point that gets mouse events
			movablePoint.mouseTarget = graph.mouselayer.circle( graph.scalePoint( movablePoint.coord )[0], graph.scalePoint( movablePoint.coord )[1], 15 );
			movablePoint.mouseTarget.attr({fill: "#000", "opacity": 0.0});

			jQuery( movablePoint.mouseTarget[0] ).css( "cursor", "move" );
			jQuery( movablePoint.mouseTarget[0] ).bind("vmousedown vmouseover vmouseout", function( event ) {
				if ( event.type === "vmouseover" ) {
					movablePoint.highlight = true;
					if ( !KhanUtil.dragging ) {
						movablePoint.visibleShape.animate( movablePoint.highlightStyle, 50 );
					}

				} else if ( event.type === "vmouseout" ) {
					movablePoint.highlight = false;
					if ( !movablePoint.dragging ) {
						movablePoint.visibleShape.animate( movablePoint.normalStyle, 50 );
					}

				} else if ( event.type === "vmousedown" && (event.which === 1 || event.which === 0) ) {
					event.preventDefault();

					jQuery( document ).bind("vmousemove vmouseup", function( event ) {
						event.preventDefault();
						movablePoint.dragging = true;
						KhanUtil.dragging = true;

						// mouse{X|Y} are in pixels relative to the SVG
						var mouseX = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
						var mouseY = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;
						// can't go beyond 10 pixels from the edge
						mouseX = Math.max(10, Math.min(graph.xpixels-10, mouseX));
						mouseY = Math.max(10, Math.min(graph.ypixels-10, mouseY));

						// snap to grid
						if (movablePoint.snapX) {
							mouseX = Math.round(mouseX / (graph.scale[0] * movablePoint.snapX)) * (graph.scale[0] * movablePoint.snapX);
						}
						if (movablePoint.snapY) {
							mouseY = Math.round(mouseY / (graph.scale[1] * movablePoint.snapY)) * (graph.scale[1] * movablePoint.snapY);
						}
						// snap mouse to grid
						if ( movablePoint.snapX !== 0 ) {
							mouseX = Math.round(mouseX / (graph.scale[0] * movablePoint.snapX)) * (graph.scale[0] * movablePoint.snapX);
						}
						if ( movablePoint.snapY !== 0 ) {
							mouseY = Math.round(mouseY / (graph.scale[1] * movablePoint.snapY)) * (graph.scale[1] * movablePoint.snapY);
						}

						// coord{X|Y} are the scaled coordinate values
						var coordX = mouseX / graph.scale[0] + graph.range[0][0];
						var coordY = graph.range[1][1] - mouseY / graph.scale[1];

						// snap coordinates to grid
						if ( movablePoint.snapX !== 0 ) {
							coordX = Math.round( coordX / movablePoint.snapX ) * movablePoint.snapX;
						}
						if ( movablePoint.snapY !== 0 ) {
							coordY = Math.round( coordY / movablePoint.snapY ) * movablePoint.snapY;
						}

						// snap to points around circle
						if ( movablePoint.constraints.fixedDistance.snapPoints ) {

							var snapRadians = 2 * Math.PI / movablePoint.constraints.fixedDistance.snapPoints;
							var radius = movablePoint.constraints.fixedDistance.dist;

							// get coordinates relative to the fixedDistance center
							var centerCoord = movablePoint.constraints.fixedDistance.point;
							var centerX = (centerCoord[0] - graph.range[0][0]) * graph.scale[0];
							var centerY = (-centerCoord[1] + graph.range[1][1]) * graph.scale[1];

							var mouseXrel = mouseX - centerX;
							var mouseYrel = -mouseY + centerY;
							var radians = Math.atan(mouseYrel / mouseXrel);
							var outsideArcTanRange = mouseXrel < 0;

							// adjust so that angles increase from 0 to 2 pi as you go around the circle
							if (outsideArcTanRange) {
								radians += Math.PI;
							}

							// perform the snap
							radians = Math.round(radians / snapRadians) * snapRadians;

							// convert from radians back to pixels
							mouseXrel = radius * Math.cos(radians);
							mouseYrel = radius * Math.sin(radians);
							// convert back to coordinates relative to graphie canvas
							mouseX = mouseXrel + centerX;
							mouseY = - mouseYrel + centerY;
							coordX = KhanUtil.roundTo( 5, mouseX / graph.scale[0] + graph.range[0][0] );
							coordY = KhanUtil.roundTo( 5, graph.range[1][1] - mouseY / graph.scale[1] );
						}

						// apply any constraints on movement
						var coord = movablePoint.applyConstraint([ coordX, coordY ]);
						coordX = coord[0];
						coordY = coord[1];

						if ( event.type === "vmousemove" ) {
							var doMove = true;
							// The caller has the option of adding an onMove() method to the
							// movablePoint object we return as a sort of event handler
							// By returning false from onMove(), the move can be vetoed,
							// providing custom constraints on where the point can be moved.
							// By returning array [x, y], the move can be overridden
							if ( jQuery.isFunction( movablePoint.onMove ) ) {
								var result = movablePoint.onMove( coordX, coordY );
								if (result === false) {
									doMove = false;
								}
								if ( jQuery.isArray( result ) ) {
									coordX = result[0];
									coordY = result[1];
								}
							}
							// coord{X|Y} may have been modified by constraints or onMove handler; adjust mouse{X|Y} to match
							mouseX = (coordX - graph.range[0][0]) * graph.scale[0];
							mouseY = (-coordY + graph.range[1][1]) * graph.scale[1];

							if (doMove) {
								movablePoint.visibleShape.attr( "cx", mouseX );
								movablePoint.mouseTarget.attr( "cx", mouseX );
								movablePoint.visibleShape.attr( "cy", mouseY );
								movablePoint.mouseTarget.attr( "cy", mouseY );
								movablePoint.coord = [ coordX, coordY ];
								movablePoint.updateLineEnds();
							}


						} else if ( event.type === "vmouseup" ) {
							jQuery( document ).unbind( "vmousemove vmouseup" );
							movablePoint.dragging = false;
							KhanUtil.dragging = false;
							if ( jQuery.isFunction( movablePoint.onMoveEnd ) ) {
								var result = movablePoint.onMoveEnd( coordX, coordY );
								if ( jQuery.isArray( result ) ) {
									coordX = result[0];
									coordY = result[1];
									mouseX = (coordX - graph.range[0][0]) * graph.scale[0];
									mouseY = (-coordY + graph.range[1][1]) * graph.scale[1];
									movablePoint.visibleShape.attr( "cx", mouseX );
									movablePoint.mouseTarget.attr( "cx", mouseX );
									movablePoint.visibleShape.attr( "cy", mouseY );
									movablePoint.mouseTarget.attr( "cy", mouseY );
									movablePoint.coord = [ coordX, coordY ];
								}
							}
							// FIXME: check is commented out since firefox isn't always sending mouseout for some reason
							//if (!movablePoint.highlight) {
								movablePoint.visibleShape.animate( movablePoint.normalStyle, 50 );
							//}
						}
					});
				}
			});
		}

		// Method to let the caller animate the point to a new position. Useful
		// as part of a hint to show the user the correct place to put the point.
		movablePoint.moveTo = function( coordX, coordY, updateLines ) {
			// find distance in pixels to move
			var distance = KhanUtil.getDistance( this.graph.scalePoint([ coordX, coordY ]), this.graph.scalePoint( this.coord ) );

			// 5ms per pixel seems good
			var time = distance * 5;

			var scaled = graph.scalePoint([ coordX, coordY ]);
			var end = { cx: scaled[0], cy: scaled[1] };
			if ( updateLines ) {
				var start = {
					cx: this.visibleShape.attr("cx"),
					cy: this.visibleShape.attr("cy")
				};
				jQuery( start ).animate( end, {
					duration: time,
					easing: "linear",
					step: function( now, fx ) {
						movablePoint.visibleShape.attr( fx.prop, now );
						movablePoint.mouseTarget.attr( fx.prop, now );
						if ( fx.prop === "cx" ) {
							movablePoint.coord[0] = now / graph.scale[0] + graph.range[0][0];
						} else {
							movablePoint.coord[1] = graph.range[1][1] - now / graph.scale[1];
						}
						movablePoint.updateLineEnds();
					}
				});

			} else {
				this.visibleShape.animate( end, time );
				this.mouseTarget.animate( end, time );
			}
			this.coord = [ coordX, coordY ];
			if ( jQuery.isFunction( this.onMove ) ) {
				this.onMove( coordX, coordY );
			}
		};


		// After moving the point, call this to update all line segments terminating at the point
		movablePoint.updateLineEnds = function() {
			jQuery( this.lineStarts ).each( function() {
				this.coordA = movablePoint.coord;
				this.transform();
			});
			jQuery( this.lineEnds ).each( function() {
				this.coordZ = movablePoint.coord;
				this.transform();
			});
		};

		// Put the point at a new position without any checks, animation, or callbacks
		movablePoint.setCoord = function( coord ) {
			if ( this.visible ) {
				var scaledPoint = graph.scalePoint( coord );
				this.visibleShape.attr({ cx: scaledPoint[0] });
				this.visibleShape.attr({ cy: scaledPoint[1] });
				this.mouseTarget.attr({ cx: scaledPoint[0] });
				this.mouseTarget.attr({ cy: scaledPoint[1] });
			}
			this.coord = coord.slice();
		};

		// Change z-order to back
		movablePoint.toBack = function() {
			if ( this.visible ) {
				this.mouseTarget.toBack();
				this.visibleShape.toBack();
			}
		};

		// Change z-order to front
		movablePoint.toFront = function() {
			if ( this.visible ) {
				this.mouseTarget.toFront();
				this.visibleShape.toFront();
			}
		};


		return movablePoint;
	},


	// Add a horizontal or vertical line to the graph that can be dragged around.
	//
	// Options can be set to control how the point behaves:
	//   vertical:
	//     Boolean indicating whether the line is horizontal or vertical.
	//   coord:
	//     The initial location of the line (x or y value)
	//   snap:
	//     The minimum increment the line can be moved
	//
	// The return value is an object that can be used to manipulate the line:
	//   The coord property tells you the current position
	//
	//   By adding an onMove() method to the returned object, you can install an
	//   event handler that gets called every time the user moves the line.
	//
	//   The returned object also provides a moveTo(coord) method that will move
	//   the line to a specific location
	//
	addMovableLine: function( options ) {
		options = jQuery.extend({
			graph: KhanUtil.currentGraph,
			coord: 0,
			snap: 0,
			vertical: false
		}, options);
		var graph = options.graph;
		var movableLine = {
			highlight: false,
			dragging: false,
			coord: options.coord
		};

		graph.style({
			fill: KhanUtil.ORANGE,
			stroke: KhanUtil.ORANGE
		}, function() {
			if (!options.vertical) {
				movableLine.visibleShape = graph.line( [ graph.range[0][0], 0 ], [ graph.range[0][1], 0 ] );
				movableLine.visibleShape.translate( 0, -options.coord * graph.scale[0] );
			} else {
				movableLine.visibleShape = graph.line( [ 0, graph.range[1][0] ], [ 0, graph.range[1][1] ] );
				movableLine.visibleShape.translate( options.coord * graph.scale[1], 0 );
			}
		});

		// the invisible rectangle in front of the line that gets mouse events
		if (!options.vertical) {
			movableLine.mouseTarget = graph.mouselayer.rect(0, -(graph.range[0][0] + options.coord) * graph.scale[0] - 10, graph.xpixels, 20);
		} else {
			movableLine.mouseTarget = graph.mouselayer.rect((graph.range[1][1] + options.coord) * graph.scale[1] - 10, 0, 20, graph.ypixels);
		}
		movableLine.mouseTarget.attr({fill: "#000", "opacity": 0.0});

		jQuery( movableLine.mouseTarget[0] ).css( "cursor", "move" );
		jQuery( movableLine.mouseTarget[0] ).bind("vmousedown vmouseover vmouseout", function( event ) {
			if ( event.type === "vmouseover" ) {
				if ( !KhanUtil.dragging ) {
					movableLine.highlight = true;
					movableLine.visibleShape.animate({ "stroke-width": 5 }, 50 );
				}

			} else if ( event.type === "vmouseout" ) {
				movableLine.highlight = false;
				if ( !movableLine.dragging ) {
					movableLine.visibleShape.animate({ "stroke-width": 2 }, 50 );
				}

			} else if ( event.type === "vmousedown" && (event.which === 1 || event.which === 0) ) {
				event.preventDefault();

				jQuery( document ).bind("vmousemove vmouseup", function( event ) {
					event.preventDefault();
					movableLine.dragging = true;
					KhanUtil.dragging = true;

					// mouse{X|Y} are in pixels relative to the SVG
					var mouseX = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
					var mouseY = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;
					// can't go beyond 10 pixels from the edge
					mouseX = Math.max(10, Math.min(graph.xpixels-10, mouseX));
					mouseY = Math.max(10, Math.min(graph.ypixels-10, mouseY));
					// snap to grid
					if (options.snap) {
						mouseX = Math.round(mouseX / (graph.scale[0] * options.snap)) * (graph.scale[0] * options.snap);
						mouseY = Math.round(mouseY / (graph.scale[1] * options.snap)) * (graph.scale[1] * options.snap);
					}
					// coord{X|Y} are the scaled coordinate values
					var coordX = mouseX / graph.scale[0] + graph.range[0][0];
					var coordY = graph.range[1][1] - mouseY / graph.scale[1];

					if ( event.type === "vmousemove" ) {
						if (options.vertical) {
							movableLine.visibleShape.translate( (coordX * graph.scale[0]) - movableLine.visibleShape.attr("translation").x, 0 );
							movableLine.mouseTarget.attr( "x", mouseX - 10 );
							movableLine.coord = coordX;

							// The caller has the option of adding an onMove() method to the
							// movablePoint object we return as a sort of event handler
							if ( jQuery.isFunction( movableLine.onMove ) ) {
								movableLine.onMove(coordX);
							}
						} else {
							movableLine.visibleShape.translate( 0, (-coordY * graph.scale[1]) - movableLine.visibleShape.attr("translation").y, 0 );
							movableLine.mouseTarget.attr( "y", mouseY - 10 );
							movableLine.coord = coordY;

							// The caller has the option of adding an onMove() method to the
							// movablePoint object we return as a sort of event handler
							if ( jQuery.isFunction( movableLine.onMove ) ) {
								movableLine.onMove(coordY);
							}
						}

					} else if ( event.type === "vmouseup" ) {
						jQuery( document ).unbind( "vmousemove vmouseup" );
						movableLine.dragging = false;
						KhanUtil.dragging = false;
						if (!movableLine.highlight) {
							movableLine.visibleShape.animate({ "stroke-width": 2 }, 50 );
						}

					}
				});
			}
		});

		// Method to let the caller animate the line to a new position. Useful
		// as part of a hint to show the user the correct place to put the line.
		movableLine.moveTo = function( coord ) {
			if (options.vertical) {
				// find distance in pixels to move
				var distance = Math.abs(this.coord - coord) * graph.scale[0];
				// 5ms per pixel seems good
				var time = distance * 5;

				this.visibleShape.animate({ translation: [ coord * graph.scale[0] - this.visibleShape.attr("translation").x, 0 ] }, time );
				this.mouseTarget.animate({ y: coord / graph.scale[0] + graph.range[0][0] - 10 }, time );

			} else {
				// find distance in pixels to move
				var distance = Math.abs(this.coord - coord) * graph.scale[1];
				// 5ms per pixel seems good
				var time = distance * 5;

				this.visibleShape.animate({ translation: [ 0, -coord * graph.scale[1] - this.visibleShape.attr("translation").y ] }, time );
				this.mouseTarget.animate({ y: (graph.range[1][1] - coord) * graph.scale[1] - 10 }, time );
			}

			this.coord = coord;
			if ( jQuery.isFunction( this.onMove ) ) {
				movableLine.onMove(coord);
			}
		};

		return movableLine;
	},


	svgPath: function( points ) {
		return jQuery.map(points, function( point, i ) {
			if ( point === true ) {
				return "z";
			}
			return ( i === 0 ? "M" : "L") + point[0] + " " + point[1];
		}).join("");
	},

	getDistance: function( point1, point2 ) {
		return Math.sqrt( (point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]) );
	},

	// Plot a function that allows the user to mouse over points on the function.
	// * currently, the function must be continuous
	//
	// The return value is an object:
	//   By adding an onMove() method to the returned object, you can install an
	//   event handler that gets called every time the user moves the mouse over
	//   the function.
	//
	//   By adding an onLeave() method to the returned object, you can install an
	//   event handler that gets called when the mouse moves away from the function.
	//
	addInteractiveFn: function( fn, options ) {
		options = jQuery.extend({
			graph: KhanUtil.currentGraph,
			snap: 0,
			range: [ KhanUtil.currentGraph.range[0][0], KhanUtil.currentGraph.range[0][1] ]
		}, options);
		var graph = options.graph;
		var interactiveFn = {
			highlight: false
		};

		// Plot the function
		graph.style({
			stroke: KhanUtil.BLUE
		}, function() {
			interactiveFn.visibleShape = graph.plot( fn, options.range );
		});

		// Draw a circle that will be used to highlight the point on the function the mouse is closest to
		graph.style({
			fill: KhanUtil.BLUE,
			stroke: KhanUtil.BLUE
		}, function() {
			interactiveFn.cursorPoint = graph.ellipse( [ 0, fn(0) ], [ 4 / graph.scale[0], 4 / graph.scale[1] ] );
		});
		// Hide the point for now
		interactiveFn.cursorPoint.attr("opacity", 0.0 );

		// We want the mouse target to be much wider than the line itself, so you don't
		// have to hit a 2px target. Ideally, this would be done with an invisible
		// line following the same path, but with a really big strokeWidth. That
		// mostly works, but unfortunately there seem to be some bugs in Firefox
		// where it gets a bit confused about whether the mouse is or isn't over
		// a really thick curved line :(
		//
		// So instead, we have to use a polygon.
		var mouseAreaWidth = 30;
		var points = [];
		var step = ( options.range[1] - options.range[0] ) / 100;
		// Draw a curve parallel to, but (mouseAreaWidth/2 pixels) above the function
		for ( var x = options.range[0]; x <= options.range[1]; x += step ) {
			var ddx = (fn(x - 0.001) - fn(x + 0.001)) / 0.002;
			var x1 = x;
			var y1 = fn(x) + (mouseAreaWidth / (2 * graph.scale[1]));

			if (ddx !== 0) {
				var normalslope = (-1 / (ddx * (graph.scale[1] / graph.scale[0]))) / (graph.scale[1] / graph.scale[0]);
				if ( ddx < 0 ) {
					x1 = x - Math.cos( -Math.atan(normalslope * (graph.scale[1] / graph.scale[0]))) * mouseAreaWidth / (2 * graph.scale[0]);
					y1 = normalslope * (x - x1) + fn(x);
				} else if (ddx > 0) {
					x1 = x + Math.cos( -Math.atan(normalslope * (graph.scale[1] / graph.scale[0]))) * mouseAreaWidth / (2 * graph.scale[0]);
					y1 = normalslope * (x - x1) + fn(x);
				}
			}
			points.push( [(x1 - graph.range[0][0]) * graph.scale[0], (graph.range[1][1] - y1) * graph.scale[1] ] );
		}
		// Draw a curve parallel to, but (mouseAreaWidth/2 pixels) below the function
		for ( var x = options.range[1]; x >= options.range[0]; x -= step ) {
			var ddx = (fn(x - 0.001) - fn(x + 0.001)) / 0.002;
			var x1 = x;
			var y1 = fn(x) - (mouseAreaWidth / (2 * graph.scale[1]));

			if (ddx !== 0) {
				var normalslope = (-1 / (ddx * (graph.scale[1] / graph.scale[0]))) / (graph.scale[1] / graph.scale[0]);
				if ( ddx < 0 ) {
					x1 = x + Math.cos( -Math.atan(normalslope * (graph.scale[1] / graph.scale[0]))) * mouseAreaWidth / (2 * graph.scale[0]);
					y1 = normalslope * (x - x1) + fn(x);
				} else if (ddx > 0) {
					x1 = x - Math.cos( -Math.atan(normalslope * (graph.scale[1] / graph.scale[0]))) * mouseAreaWidth / (2 * graph.scale[0]);
					y1 = normalslope * (x - x1) + fn(x);
				}
			}
			points.push( [(x1 - graph.range[0][0]) * graph.scale[0], (graph.range[1][1] - y1) * graph.scale[1] ] );
		}
		// plot the polygon and make it invisible
		interactiveFn.mouseTarget = graph.mouselayer.path(this.svgPath(points));
		interactiveFn.mouseTarget.attr({ fill: "#000", "opacity": 0.0 });

		// Add mouse handlers to the polygon
		jQuery( interactiveFn.mouseTarget[0] ).bind("vmouseover vmouseout vmousemove", function( event ) {
			event.preventDefault();
			var mouseX = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
			var mouseY = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;
			// can't go beyond 10 pixels from the edge
			mouseX = Math.max(10, Math.min(graph.xpixels-10, mouseX));
			mouseY = Math.max(10, Math.min(graph.ypixels-10, mouseY));
			// snap to grid
			if (options.snap) {
				mouseX = Math.round(mouseX / (graph.scale[0] * options.snap)) * (graph.scale[0] * options.snap);
			}
			// coord{X|Y} are the scaled coordinate values
			var coordX = mouseX / graph.scale[0] + graph.range[0][0];
			var coordY = graph.range[1][1] - mouseY / graph.scale[1];

			// Find the closest point on the curve to the mouse (by brute force)
			var closestX = 0;
			var minDist = Math.sqrt((coordX) * (coordX) + (coordY) * (coordY));
			for ( var x = options.range[0]; x < options.range[1]; x += (( options.range[1] - options.range[0])/graph.xpixels ) ) {
				if (Math.sqrt((x-coordX) * (x-coordX) + (fn(x) -coordY) * (fn(x)-coordY)) < minDist) {
					closestX = x;
					minDist = Math.sqrt((x-coordX) * (x-coordX) + (fn(x) -coordY) * (fn(x)-coordY));
				}
			}

			interactiveFn.cursorPoint.attr("cx", (graph.range[0][1] + closestX) * graph.scale[0]);
			interactiveFn.cursorPoint.attr("cy", (graph.range[1][1] - fn(closestX)) * graph.scale[1]);

			coordX = closestX;
			coordY = fn(closestX);

			// If the caller wants to be notified when the user points to the function
			if ( jQuery.isFunction( interactiveFn.onMove ) ) {
				interactiveFn.onMove(coordX, coordY);
			}

			if ( event.type === "vmouseover" ) {
				interactiveFn.cursorPoint.animate({ opacity: 1.0 }, 50 );
				interactiveFn.highlight = true;

			} else if ( event.type === "vmouseout" ) {
				interactiveFn.highlight = false;
				interactiveFn.cursorPoint.animate({ opacity: 0.0 }, 50 );
				// If the caller wants to be notified when the user stops pointing to the function
				if ( jQuery.isFunction( interactiveFn.onLeave ) ) {
					interactiveFn.onLeave(coordX, coordY);
				}
			}
		});

		interactiveFn.mouseTarget.toBack();
		return interactiveFn;
	},


	// Useful for shapes that are only sometimes drawn. If a shape isn't
	// needed, it can be replaced with bogusShape which just has stub methods
	// that successfully do nothing.
	// The alternative would be 'if..typeof' checks all over the place.
	bogusShape: {
		animate: function(){},
		attr: function(){},
		remove: function(){}
	},


	// MovableLineSegment is a line segment that can be dragged around the
	// screen. By attaching a smartPoint to each (or one) end, the ends can be
	// manipulated individually.
	//
	// To use with smartPoints, add the smartPoints first, then:
	//   addMovableLineSegment({ pointA: smartPoint1, pointZ: smartPoint2 });
	// Or just one end:
	//   addMovableLineSegment({ pointA: smartPoint, coordZ: [0, 0] });
	//
	// Include "fixed: true" in the options if you don't want the entire line
	// to be draggable (you can still use points to make the endpoints
	// draggable)
	//
	// The returned object includes the following properties/methods:
	//
	//   - lineSegment.coordA / lineSegment.coordZ
	//         The coordinates of each end of the line segment
	//
	//   - lineSegment.transform( syncToPoints )
	//         Repositions the line segment. Call after changing coordA and/or
	//         coordZ, or pass syncToPoints = true to use the current position
	//         of the corresponding smartPoints, if the segment was defined using
	//         smartPoints
	//
	addMovableLineSegment: function( options ) {
		var lineSegment = jQuery.extend({
			graph: KhanUtil.currentGraph,
			coordA: [ 0, 0 ],
			coordZ: [ 1, 1 ],
			snapX: 0,
			snapY: 0,
			fixed: false,
			ticks: 0,
			normalStyle: {
				"stroke": KhanUtil.BLUE,
				"stroke-width": 2
			},
			highlightStyle: {
				"stroke": KhanUtil.ORANGE,
				"stroke-width": 6
			},
			highlight: false,
			dragging: false,
			tick: [],
			extendLine: false,
			constraints: {
				fixed: false,
				constrainX: false,
				constrainY: false
			}
		}, options);

		// If the line segment is defined by movablePoints, coordA/coordZ are
		// owned by the points, otherwise they're owned by us
		if ( options.pointA !== undefined ) {
			lineSegment.coordA = options.pointA.coord;
			lineSegment.pointA.lineStarts.push( lineSegment );
		} else if ( options.coordA !== undefined ) {
			lineSegment.coordA = options.coordA.slice();
		}

		if ( options.pointZ !== undefined ) {
			lineSegment.coordZ = options.pointZ.coord;
			lineSegment.pointZ.lineEnds.push( lineSegment );
		} else if ( options.coordA !== undefined ) {
			lineSegment.coordA = lineSegment.coordA.slice();
		}

		var graph = lineSegment.graph;

		graph.style( lineSegment.normalStyle );
		for (var i = 0; i < lineSegment.ticks; ++i) {
			lineSegment.tick[i] = KhanUtil.bogusShape;
		}
		var path = KhanUtil.svgPath([ [ 0, 0 ], [ graph.scale[0], 0 ] ]);
		for (var i = 0; i < lineSegment.ticks; ++i) {
			var tickoffset = (0.5 * graph.scale[0]) - (lineSegment.ticks - 1) * 1 + (i * 2);
			path += KhanUtil.svgPath([ [ tickoffset, -7 ], [ tickoffset, 7 ] ]);
		}
		lineSegment.visibleLine = graph.raphael.path( path );
		lineSegment.visibleLine.attr( lineSegment.normalStyle );
		if ( !lineSegment.fixed ) {
			lineSegment.mouseTarget = graph.mouselayer.rect(
				graph.scalePoint([graph.range[0][0], graph.range[1][1]])[0],
				graph.scalePoint([graph.range[0][0], graph.range[1][1]])[1] - 15,
				graph.scaleVector([1, 1])[0], 30
			);
			lineSegment.mouseTarget.attr({fill: "#000", "opacity": 0.0});
		}

		// Reposition the line segment. Call after changing coordA and/or
		// coordZ, or pass syncToPoints = true to use the current position of
		// the corresponding movablePoints, if the segment was defined using
		// movablePoints
		lineSegment.transform = function( syncToPoints ) {
			if ( syncToPoints ) {
				if ( typeof this.pointA === "object" ) {
					this.coordA = this.pointA.coord;
				}
				if ( typeof this.pointZ === "object" ) {
					this.coordZ = this.pointZ.coord;
				}
			}
			var angle = KhanUtil.findAngle( this.coordZ, this.coordA );
			var scaledA = graph.scalePoint( this.coordA );
			var lineLength = KhanUtil.getDistance(this.coordA, this.coordZ);
			if ( this.extendLine ) {
				if ( this.coordA[0] !== this.coordZ[0] ) {
					var slope = ( this.coordZ[1] - this.coordA[1] ) / ( this.coordZ[0] - this.coordA[0] );
					var y1 = slope * ( graph.range[0][0] - this.coordA[0] ) + this.coordA[1];
					var y2 = slope * ( graph.range[0][1] - this.coordA[0] ) + this.coordA[1];
					if (this.coordA[0] < this.coordZ[0] ) {
						scaledA = graph.scalePoint([ graph.range[0][0], y1 ]);
						scaledA[0]++;
					} else {
						scaledA = graph.scalePoint([ graph.range[0][1], y2 ]);
						scaledA[0]--;
					}
					lineLength = KhanUtil.getDistance( [ graph.range[0][0], y1 ], [ graph.range[0][1], y2 ] );
				} else {
					if (this.coordA[1] < this.coordZ[1] ) {
						scaledA = graph.scalePoint([ this.coordA[0], graph.range[1][0] ]);
					} else {
						scaledA = graph.scalePoint([ this.coordA[0], graph.range[1][1] ]);
					}
					lineLength = graph.range[1][1] - graph.range[1][0];
				}
			}
			this.visibleLine.translate( scaledA[0] - this.visibleLine.attr("translation").x,
					scaledA[1] - this.visibleLine.attr("translation").y );
			this.visibleLine.rotate( -angle, scaledA[0], scaledA[1] );
			this.visibleLine.scale( lineLength, 1, scaledA[0], scaledA[1] );

			if ( !this.fixed ) {
				this.mouseTarget.translate( scaledA[0] - this.mouseTarget.attr("translation").x,
						scaledA[1] - this.mouseTarget.attr("translation").y );
				this.mouseTarget.rotate( -angle, scaledA[0], scaledA[1] );
				this.mouseTarget.scale( lineLength, 1, scaledA[0], scaledA[1] );
			}
		};

		// Change z-order to back;
		lineSegment.toBack = function() {
			if ( !lineSegment.fixed ) {
				lineSegment.mouseTarget.toBack();
			}
			lineSegment.visibleLine.toBack();
		};

		// Change z-order to front
		lineSegment.toFront = function() {
			if ( !lineSegment.fixed ) {
				lineSegment.mouseTarget.toFront();
			}
			lineSegment.visibleLine.toFront();
		};

		if ( !lineSegment.fixed && !lineSegment.constraints.fixed ) {
			jQuery( lineSegment.mouseTarget[0] ).css( "cursor", "move" );
			jQuery( lineSegment.mouseTarget[0] ).bind("vmousedown vmouseover vmouseout", function( event ) {
				if ( event.type === "vmouseover" ) {
					if ( !KhanUtil.dragging ) {
						lineSegment.highlight = true;
						lineSegment.visibleLine.animate( lineSegment.highlightStyle, 50 );
					}

				} else if ( event.type === "vmouseout" ) {
					lineSegment.highlight = false;
					if ( !lineSegment.dragging ) {
						lineSegment.visibleLine.animate( lineSegment.normalStyle, 50 );
					}

				} else if ( event.type === "vmousedown" && (event.which === 1 || event.which === 0) ) {
					event.preventDefault();
					// coord{X|Y} are the scaled coordinate values of the mouse position
					var coordX = (event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left) / graph.scale[0] + graph.range[0][0];
					var coordY = graph.range[1][1] - (event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top) / graph.scale[1];
					if ( lineSegment.snapX > 0 ) {
						coordX = Math.round( coordX / lineSegment.snapX ) * lineSegment.snapX;
					}
					if ( lineSegment.snapY > 0 ) {
						coordY = Math.round( coordY / lineSegment.snapY ) * lineSegment.snapY;
					}
					// Offsets between the mouse and each end of the line segment
					var mouseOffsetA = [ lineSegment.coordA[0] - coordX, lineSegment.coordA[1] - coordY ];
					var mouseOffsetZ = [ lineSegment.coordZ[0] - coordX, lineSegment.coordZ[1] - coordY ];

					// Figure out how many pixels of the bounding box of the line segment lie to each direction of the mouse
					var offsetLeft = -Math.min( graph.scaleVector(mouseOffsetA)[0], graph.scaleVector(mouseOffsetZ)[0] );
					var offsetRight = Math.max( graph.scaleVector(mouseOffsetA)[0], graph.scaleVector(mouseOffsetZ)[0] );
					var offsetTop = Math.max( graph.scaleVector(mouseOffsetA)[1], graph.scaleVector(mouseOffsetZ)[1] );
					var offsetBottom = -Math.min( graph.scaleVector(mouseOffsetA)[1], graph.scaleVector(mouseOffsetZ)[1] );

					jQuery( document ).bind("vmousemove vmouseup", function( event ) {
						event.preventDefault();
						lineSegment.dragging = true;
						KhanUtil.dragging = true;

						// mouse{X|Y} are in pixels relative to the SVG
						var mouseX = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
						var mouseY = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;
						// no part of the line segment can go beyond 10 pixels from the edge
						mouseX = Math.max(offsetLeft + 10, Math.min(graph.xpixels-10-offsetRight, mouseX));
						mouseY = Math.max(offsetTop + 10, Math.min(graph.ypixels-10-offsetBottom, mouseY));

						// coord{X|Y} are the scaled coordinate values
						var coordX = mouseX / graph.scale[0] + graph.range[0][0];
						var coordY = graph.range[1][1] - mouseY / graph.scale[1];
						if ( lineSegment.snapX > 0 ) {
							coordX = Math.round( coordX / lineSegment.snapX ) * lineSegment.snapX;
						}
						if ( lineSegment.snapY > 0 ) {
							coordY = Math.round( coordY / lineSegment.snapY ) * lineSegment.snapY;
						}

						if ( event.type === "vmousemove" ) {
							if ( lineSegment.constraints.constrainX ) {
								coordX = lineSegment.coordA[0] - mouseOffsetA[0];
							}
							if ( lineSegment.constraints.constrainY ) {
								coordY = lineSegment.coordA[1] - mouseOffsetA[1];
							}
							var dX = coordX + mouseOffsetA[0] - lineSegment.coordA[0];
							var dY = coordY + mouseOffsetA[1] - lineSegment.coordA[1];
							lineSegment.coordA = [coordX + mouseOffsetA[0], coordY + mouseOffsetA[1]];
							lineSegment.coordZ = [coordX + mouseOffsetZ[0], coordY + mouseOffsetZ[1]];
							lineSegment.transform();
							if ( jQuery.isFunction( lineSegment.onMove ) ) {
								lineSegment.onMove( dX, dY );
							}

						} else if ( event.type === "vmouseup" ) {
							jQuery( document ).unbind( "vmousemove vmouseup" );
							lineSegment.dragging = false;
							KhanUtil.dragging = false;
							if (!lineSegment.highlight) {
								lineSegment.visibleLine.animate( lineSegment.normalStyle, 50 );
							}
							if ( jQuery.isFunction( lineSegment.onMoveEnd ) ) {
								lineSegment.onMoveEnd();
							}

						}
					});
				}
			});
		}


		if ( lineSegment.pointA !== undefined ) {
			lineSegment.pointA.toFront();
		}
		if ( lineSegment.pointZ !== undefined ) {
			lineSegment.pointZ.toFront();
		}
		lineSegment.transform();
		return lineSegment;
	},


	createSorter: function() {
		var sorter = {};
		var list;

		sorter.init = function( element ) {
			list = jQuery( "[id=" + element + "]" ).last();
			var container = list.wrap( "<div>" ).parent();
			var placeholder = jQuery( "<li>" );
			placeholder.addClass( "placeholder" );
			container.addClass( "sortable ui-helper-clearfix" );
			var tileWidth = list.find( "li" ).outerWidth( true );
			var numTiles = list.find( "li" ).length;

			list.find( "li" ).each(function( tileNum, tile ) {
				jQuery( tile ).bind( "vmousedown", function( event ) {
					if ( event.type === "vmousedown" && (event.which === 1 || event.which === 0) ) {
						event.preventDefault();
						jQuery( tile ).addClass( "dragging" );
						var tileIndex = jQuery( this ).index();
						placeholder.insertAfter( tile );
						jQuery( this ).css( "z-index", 100 );
						var offset = jQuery( this ).offset();
						var click = {
							left: event.pageX - offset.left - 3,
							top: event.pageY - offset.top - 3
						};
						jQuery( tile ).css({ position: "absolute" });
						jQuery( tile ).offset({
							left: offset.left,
							top: offset.top
						});
						jQuery( document ).bind( "vmousemove vmouseup", function( event ) {
							event.preventDefault();
							if ( event.type === "vmousemove" ) {
								jQuery( tile ).offset({
									left: event.pageX - click.left,
									top: event.pageY - click.top
								});
								var leftEdge = list.offset().left;
								var index = Math.max( 0, Math.min( numTiles - 1, Math.floor( ( event.pageX - leftEdge ) / tileWidth ) ) );
								if ( index !== tileIndex ) {
									tileIndex = index;
									if ( index === 0 ) {
										placeholder.prependTo( list );
										jQuery( tile ).prependTo( list );
									} else {
										placeholder.detach();
										jQuery( tile ).detach();
										var preceeding = list.find( "li" )[index - 1];
										placeholder.insertAfter( preceeding );
										jQuery( tile ).insertAfter( preceeding );
									}
									offset.left = leftEdge + tileWidth * index;
								}
							} else if ( event.type === "vmouseup" ) {
								jQuery( document ).unbind( "vmousemove vmouseup" );
								var position = jQuery( tile ).offset();
								jQuery( position ).animate( offset, {
									duration: 150,
									step: function( now, fx ) {
										position[ fx.prop ] = now;
										jQuery( tile ).offset( position );
									},
									complete: function() {
										jQuery( tile ).css( "z-index", 0 );
										placeholder.detach();
										jQuery( tile ).css({ position: "static" });
										jQuery( tile ).removeClass( "dragging" );
									}
								});
							}
						});
					}
				});
			});
		};

		sorter.getContent = function() {
			content = [];
			list.find( "li" ).each(function( tileNum, tile ) {
				content.push( jQuery.trim( jQuery( tile ).find( "code" ).text() ) );
			});
			return content;
		};

		sorter.setContent = function( content ) {
			list.find( "li" ).each(function( tileNum, tile ) {
				jQuery( tile ).find( "code" ).text( content[ tileNum ] );
				MathJax.Hub.Queue([ "Reprocess", MathJax.Hub, tile ]);
			});
		};

		return sorter;
	}

});


function Protractor( center ) {
	var graph = KhanUtil.currentGraph;
	this.set = graph.raphael.set();

	this.cx = center[0];
	this.cy = center[1];
	var lineColor = "#789";
	var pro = this;

	var r = 8.05;
	var imgPos = graph.scalePoint([ this.cx - r, this.cy + r - 0.225 ]);
	this.set.push( graph.mouselayer.image( Khan.urlBase + "images/protractor.png", imgPos[0], imgPos[1], 322, 161 ) );


	// Customized polar coordinate thingie to make it easier to draw the double-headed arrow thing.
	// angle is what you'd expect -- use that big protractor on your screen :)
	// pixels from edge is relative to the edge of the protractor; it's not the full radius
	var arrowHelper  = function( angle, pixelsFromEdge ) {
		var scaledRadius = graph.scaleVector( r );
		var scaledCenter = graph.scalePoint( center );
		var x = Math.sin( ( angle + 90 ) * Math.PI / 180 ) * ( scaledRadius[0] + pixelsFromEdge ) + scaledCenter[0];
		var y = Math.cos( ( angle + 90 ) * Math.PI / 180 ) * ( scaledRadius[1] + pixelsFromEdge ) + scaledCenter[1];
		return x + "," + y;
	};

	// Draw the double-headed arrow thing that shows users where to click and drag to rotate
	var arrow = graph.raphael.path(
		" M" + arrowHelper( 180, 6 ) +
		" L" + arrowHelper( 180, 2 ) +
		" L" + arrowHelper( 183, 10 ) +
		" L" + arrowHelper( 180, 18 ) +
		" L" + arrowHelper( 180, 14 ) +
		" A" + ( graph.scaleVector(r)[0] + 10 ) + "," + ( graph.scaleVector(r)[1] + 10 ) + ",0,0,1," + arrowHelper( 170, 14 ) +
		" L" + arrowHelper( 170, 18 ) +
		" L" + arrowHelper( 167, 10 ) +
		" L" + arrowHelper( 170, 2 ) +
		" L" + arrowHelper( 170, 6 ) +
		" A" + ( graph.scaleVector(r)[0] + 10 ) + "," + ( graph.scaleVector(r)[1] + 10 ) + ",0,0,0," + arrowHelper( 180, 6 ) +
		" Z"
	).attr({
		"stroke": null,
		"fill": KhanUtil.ORANGE
	});

	// add it to the set so it translates with everything else
	this.set.push( arrow );

	this.centerPoint = KhanUtil.addMovablePoint({
		coord: center,
		visible: false
	});

	// Use a movablePoint for rotation
	this.rotateHandle = KhanUtil.addMovablePoint({
		coord: [
			Math.sin( 275 * Math.PI / 180 ) * ( r + 0.5 ) + this.cx,
			Math.cos( 275 * Math.PI / 180 ) * ( r + 0.5 ) + this.cy
		],
		onMove: function( x, y ) {
			var angle = Math.atan2( pro.centerPoint.coord[1] - y, pro.centerPoint.coord[0] - x) * 180 / Math.PI;
			pro.rotate( -angle - 5, true );
		}
	});

	// Add a constraint so the point moves in a circle
	this.rotateHandle.constraints.fixedDistance.dist = r + 0.5;
	this.rotateHandle.constraints.fixedDistance.point = this.centerPoint;

	// Remove the default dot added by the movablePoint since we have our double-arrow thing
	this.rotateHandle.visibleShape.remove();
	// Make the mouse target bigger to encompass the whole area around the double-arrow thing
	this.rotateHandle.mouseTarget.attr({ scale: 2.0 });

	// Make the arrow-thing grow and shrink with mouseover/out
	jQuery( this.rotateHandle.mouseTarget[0] ).bind( "vmouseover", function( event ) {
		arrow.animate({ scale: 1.5 }, 50 );
	});
	jQuery( this.rotateHandle.mouseTarget[0] ).bind( "vmouseout", function( event ) {
		arrow.animate({ scale: 1.0 }, 50 );
	});


	var setNodes = jQuery.map( this.set, function( el ) { return el.node; } );
	this.makeTranslatable = function makeTranslatable() {
		jQuery( setNodes ).css( "cursor", "move" );

		jQuery( setNodes ).bind( "vmousedown", function( event ) {
			event.preventDefault();
			var startx = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
			var starty = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;

			jQuery( setNodes ).animate( { opacity: 0.25 }, 150 );

			jQuery( document ).bind ( "vmousemove", function( event ) {
				// mouse{X|Y} are in pixels relative to the SVG
				var mouseX = event.pageX - jQuery( graph.raphael.canvas.parentNode ).offset().left;
				var mouseY = event.pageY - jQuery( graph.raphael.canvas.parentNode ).offset().top;
				// can't go beyond 10 pixels from the edge
				mouseX = Math.max( 10, Math.min( graph.xpixels - 10, mouseX ) );
				mouseY = Math.max( 10, Math.min( graph.ypixels - 10, mouseY ) );

				var dx = mouseX - startx;
				var dy = mouseY - starty;

				jQuery.each( pro.set.items, function() {
					this.translate( dx, dy );
				});
				pro.centerPoint.setCoord([ pro.centerPoint.coord[0] + dx / graph.scale[0], pro.centerPoint.coord[1] - dy / graph.scale[1] ]);
				pro.rotateHandle.setCoord([ pro.rotateHandle.coord[0] + dx / graph.scale[0], pro.rotateHandle.coord[1] - dy / graph.scale[1] ]);
				startx = mouseX;
				starty = mouseY;
			});

			jQuery( document ).one( "vmouseup", function( event ) {
				jQuery( setNodes ).animate( { opacity: 0.50 }, 150 );
				jQuery( document ).unbind( "vmousemove" );
			});
		});
	};


	this.rotation = 0;

	this.rotate = function( offset, absolute ) {
		var center = graph.scalePoint( this.centerPoint.coord );

		if ( absolute ) {
			this.rotation = 0;
		}

		this.set.rotate( this.rotation + offset, center[0], center[1] );
		this.rotation = this.rotation + offset;

		return this;
	};

	this.moveTo = function moveTo( x, y ) {
		var graph = KhanUtil.currentGraph;
		var start = graph.scalePoint( pro.centerPoint.coord );
		var end = graph.scalePoint([ x, y ]);
		var time = KhanUtil.getDistance( start, end ) * 2;  // 2ms per pixel

		jQuery({ x: start[0], y: start[1] }).animate({ x: end[0], y: end[1] }, {
			duration: time,
			step: function( now, fx ) {
				var dx = 0;
				var dy = 0;
				if ( fx.prop === "x" ) {
					dx = now - graph.scalePoint( pro.centerPoint.coord )[0];
				} else if ( fx.prop === "y") {
					dy = now - graph.scalePoint( pro.centerPoint.coord )[1];
				}
				jQuery.each( pro.set.items, function() {
					this.translate( dx, dy );
				});
				pro.centerPoint.setCoord([ pro.centerPoint.coord[0] + dx / graph.scale[0], pro.centerPoint.coord[1] - dy / graph.scale[1] ]);
				pro.rotateHandle.setCoord([ pro.rotateHandle.coord[0] + dx / graph.scale[0], pro.rotateHandle.coord[1] - dy / graph.scale[1] ]);
			}
		});
	};

	this.rotateTo = function rotateTo( angle ) {
		if ( Math.abs( this.rotation - angle ) > 180 ) {
			this.rotation += 360;
		}
		var time = Math.abs( this.rotation - angle ) * 5;  // 5ms per deg
		jQuery({ 0: this.rotation }).animate({ 0: angle }, {
			duration: time,
			step: function( now, fx ) {
				pro.rotate( now, true );
				pro.rotateHandle.setCoord([
					Math.sin( ( now + 275 ) * Math.PI / 180 ) * ( r + 0.5 ) + pro.centerPoint.coord[0],
					Math.cos( ( now + 275 ) * Math.PI / 180 ) * ( r + 0.5 ) + pro.centerPoint.coord[1]
				]);
			}
		});
	};

	this.set.attr( { opacity: 0.5 } );
	this.makeTranslatable();
	return this;
}
;
/*
* jQuery Mobile Framework : "mouse" plugin
* Copyright (c) jQuery Project
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*/

// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

(function( $, window, document, undefined ) {

var dataPropertyName = "virtualMouseBindings",
	touchTargetPropertyName = "virtualTouchID",
	virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
	touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
	activeDocHandlers = {},
	resetTimerID = 0,
	startX = 0,
	startY = 0,
	didScroll = false,
	clickBlockList = [],
	blockMouseTriggers = false,
	blockTouchTriggers = false,
	eventCaptureSupported = "addEventListener" in document,
	$document = $( document ),
	nextTouchID = 1,
	lastTouchID = 0;

$.vmouse = {
	moveDistanceThreshold: 10,
	clickDistanceThreshold: 10,
	resetTimerDuration: 1500
};

function getNativeEvent( event ) {

	while ( event && typeof event.originalEvent !== "undefined" ) {
		event = event.originalEvent;
	}
	return event;
}

function createVirtualEvent( event, eventType ) {

	var t = event.type,
		oe, props, ne, prop, ct, touch, i, j;

	event = $.Event(event);
	event.type = eventType;

	oe = event.originalEvent;
	props = $.event.props;

	// copy original event properties over to the new event
	// this would happen if we could call $.event.fix instead of $.Event
	// but we don't have a way to force an event to be fixed multiple times
	if ( oe ) {
		for ( i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = oe[ prop ];
		}
	}

	// make sure that if the mouse and click virtual events are generated
	// without a .which one is defined
	if ( t.search(/mouse(down|up)|click/) > -1 && !event.which ){
		event.which = 1;
	}

	if ( t.search(/^touch/) !== -1 ) {
		ne = getNativeEvent( oe );
		t = ne.touches;
		ct = ne.changedTouches;
		touch = ( t && t.length ) ? t[0] : ( (ct && ct.length) ? ct[ 0 ] : undefined );

		if ( touch ) {
			for ( j = 0, len = touchEventProps.length; j < len; j++){
				prop = touchEventProps[ j ];
				event[ prop ] = touch[ prop ];
			}
		}
	}

	return event;
}

function getVirtualBindingFlags( element ) {

	var flags = {},
		b, k;

	while ( element ) {

		b = $.data( element, dataPropertyName );

		for (  k in b ) {
			if ( b[ k ] ) {
				flags[ k ] = flags.hasVirtualBinding = true;
			}
		}
		element = element.parentNode;
	}
	return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
	var b;
	while ( element ) {

		b = $.data( element, dataPropertyName );

		if ( b && ( !eventType || b[ eventType ] ) ) {
			return element;
		}
		element = element.parentNode;
	}
	return null;
}

function enableTouchBindings() {
	blockTouchTriggers = false;
}

function disableTouchBindings() {
	blockTouchTriggers = true;
}

function enableMouseBindings() {
	lastTouchID = 0;
	clickBlockList.length = 0;
	blockMouseTriggers = false;

	// When mouse bindings are enabled, our
	// touch bindings are disabled.
	disableTouchBindings();
}

function disableMouseBindings() {
	// When mouse bindings are disabled, our
	// touch bindings are enabled.
	enableTouchBindings();
}

function startResetTimer() {
	clearResetTimer();
	resetTimerID = setTimeout(function(){
		resetTimerID = 0;
		enableMouseBindings();
	}, $.vmouse.resetTimerDuration );
}

function clearResetTimer() {
	if ( resetTimerID ){
		clearTimeout( resetTimerID );
		resetTimerID = 0;
	}
}

function triggerVirtualEvent( eventType, event, flags ) {
	var ve;

	if ( ( flags && flags[ eventType ] ) ||
				( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

		ve = createVirtualEvent( event, eventType );

		$( event.target).trigger( ve );
	}

	return ve;
}

function mouseEventCallback( event ) {
	var touchID = $.data(event.target, touchTargetPropertyName);

	if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ){
		var ve = triggerVirtualEvent( "v" + event.type, event );
		if ( ve ) {
			if ( ve.isDefaultPrevented() ) {
				event.preventDefault();
			}
			if ( ve.isPropagationStopped() ) {
				event.stopPropagation();
			}
			if ( ve.isImmediatePropagationStopped() ) {
				event.stopImmediatePropagation();
			}
		}
	}
}

function handleTouchStart( event ) {

	var touches = getNativeEvent( event ).touches,
		target, flags;

	if ( touches && touches.length === 1 ) {

		target = event.target;
		flags = getVirtualBindingFlags( target );

		if ( flags.hasVirtualBinding ) {

			lastTouchID = nextTouchID++;
			$.data( target, touchTargetPropertyName, lastTouchID );

			clearResetTimer();

			disableMouseBindings();
			didScroll = false;

			var t = getNativeEvent( event ).touches[ 0 ];
			startX = t.pageX;
			startY = t.pageY;

			triggerVirtualEvent( "vmouseover", event, flags );
			triggerVirtualEvent( "vmousedown", event, flags );
		}
	}
}

function handleScroll( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	if ( !didScroll ) {
		triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
	}

	didScroll = true;
	startResetTimer();
}

function handleTouchMove( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	var t = getNativeEvent( event ).touches[ 0 ],
		didCancel = didScroll,
		moveThreshold = $.vmouse.moveDistanceThreshold;
		didScroll = didScroll ||
			( Math.abs(t.pageX - startX) > moveThreshold ||
				Math.abs(t.pageY - startY) > moveThreshold ),
		flags = getVirtualBindingFlags( event.target );

	if ( didScroll && !didCancel ) {
		triggerVirtualEvent( "vmousecancel", event, flags );
	}

	triggerVirtualEvent( "vmousemove", event, flags );
	startResetTimer();
}

function handleTouchEnd( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	disableTouchBindings();

	var flags = getVirtualBindingFlags( event.target ),
		t;
	triggerVirtualEvent( "vmouseup", event, flags );

	if ( !didScroll ) {
		var ve = triggerVirtualEvent( "vclick", event, flags );
		if ( ve && ve.isDefaultPrevented() ) {
			// The target of the mouse events that follow the touchend
			// event don't necessarily match the target used during the
			// touch. This means we need to rely on coordinates for blocking
			// any click that is generated.
			t = getNativeEvent( event ).changedTouches[ 0 ];
			clickBlockList.push({
				touchID: lastTouchID,
				x: t.clientX,
				y: t.clientY
			});

			// Prevent any mouse events that follow from triggering
			// virtual event notifications.
			blockMouseTriggers = true;
		}
	}
	triggerVirtualEvent( "vmouseout", event, flags);
	didScroll = false;

	startResetTimer();
}

function hasVirtualBindings( ele ) {
	var bindings = $.data( ele, dataPropertyName ),
		k;

	if ( bindings ) {
		for ( k in bindings ) {
			if ( bindings[ k ] ) {
				return true;
			}
		}
	}
	return false;
}

function dummyMouseHandler(){}

function getSpecialEventObject( eventType ) {
	var realType = eventType.substr( 1 );

	return {
		setup: function( data, namespace ) {
			// If this is the first virtual mouse binding for this element,
			// add a bindings object to its data.

			if ( !hasVirtualBindings( this ) ) {
				$.data( this, dataPropertyName, {});
			}

			// If setup is called, we know it is the first binding for this
			// eventType, so initialize the count for the eventType to zero.
			var bindings = $.data( this, dataPropertyName );
			bindings[ eventType ] = true;

			// If this is the first virtual mouse event for this type,
			// register a global handler on the document.

			activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

			if ( activeDocHandlers[ eventType ] === 1 ) {
				$document.bind( realType, mouseEventCallback );
			}

			// Some browsers, like Opera Mini, won't dispatch mouse/click events
			// for elements unless they actually have handlers registered on them.
			// To get around this, we register dummy handlers on the elements.

			$( this ).bind( realType, dummyMouseHandler );

			// For now, if event capture is not supported, we rely on mouse handlers.
			if ( eventCaptureSupported ) {
				// If this is the first virtual mouse binding for the document,
				// register our touchstart handler on the document.

				activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0) + 1;

				if (activeDocHandlers[ "touchstart" ] === 1) {
					$document.bind( "touchstart", handleTouchStart )
						.bind( "touchend", handleTouchEnd )

						// On touch platforms, touching the screen and then dragging your finger
						// causes the window content to scroll after some distance threshold is
						// exceeded. On these platforms, a scroll prevents a click event from being
						// dispatched, and on some platforms, even the touchend is suppressed. To
						// mimic the suppression of the click event, we need to watch for a scroll
						// event. Unfortunately, some platforms like iOS don't dispatch scroll
						// events until *AFTER* the user lifts their finger (touchend). This means
						// we need to watch both scroll and touchmove events to figure out whether
						// or not a scroll happenens before the touchend event is fired.

						.bind( "touchmove", handleTouchMove )
						.bind( "scroll", handleScroll );
				}
			}
		},

		teardown: function( data, namespace ) {
			// If this is the last virtual binding for this eventType,
			// remove its global handler from the document.

			--activeDocHandlers[ eventType ];

			if ( !activeDocHandlers[ eventType ] ) {
				$document.unbind( realType, mouseEventCallback );
			}

			if ( eventCaptureSupported ) {
				// If this is the last virtual mouse binding in existence,
				// remove our document touchstart listener.

				--activeDocHandlers[ "touchstart" ];

				if ( !activeDocHandlers[ "touchstart" ] ) {
					$document.unbind( "touchstart", handleTouchStart )
						.unbind( "touchmove", handleTouchMove )
						.unbind( "touchend", handleTouchEnd )
						.unbind( "scroll", handleScroll );
				}
			}

			var $this = $( this ),
				bindings = $.data( this, dataPropertyName );

			// teardown may be called when an element was
			// removed from the DOM. If this is the case,
			// jQuery core may have already stripped the element
			// of any data bindings so we need to check it before
			// using it.
			if ( bindings ) {
				bindings[ eventType ] = false;
			}

			// Unregister the dummy event handler.

			$this.unbind( realType, dummyMouseHandler );

			// If this is the last virtual mouse binding on the
			// element, remove the binding data from the element.

			if ( !hasVirtualBindings( this ) ) {
				$this.removeData( dataPropertyName );
			}
		}
	};
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( var i = 0; i < virtualEventNames.length; i++ ){
	$.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if ( eventCaptureSupported ) {
	document.addEventListener( "click", function( e ){
		var cnt = clickBlockList.length,
			target = e.target,
			x, y, ele, i, o, touchID;

		if ( cnt ) {
			x = e.clientX;
			y = e.clientY;
			threshold = $.vmouse.clickDistanceThreshold;

			// The idea here is to run through the clickBlockList to see if
			// the current click event is in the proximity of one of our
			// vclick events that had preventDefault() called on it. If we find
			// one, then we block the click.
			//
			// Why do we have to rely on proximity?
			//
			// Because the target of the touch event that triggered the vclick
			// can be different from the target of the click event synthesized
			// by the browser. The target of a mouse/click event that is syntehsized
			// from a touch event seems to be implementation specific. For example,
			// some browsers will fire mouse/click events for a link that is near
			// a touch event, even though the target of the touchstart/touchend event
			// says the user touched outside the link. Also, it seems that with most
			// browsers, the target of the mouse/click event is not calculated until the
			// time it is dispatched, so if you replace an element that you touched
			// with another element, the target of the mouse/click will be the new
			// element underneath that point.
			//
			// Aside from proximity, we also check to see if the target and any
			// of its ancestors were the ones that blocked a click. This is necessary
			// because of the strange mouse/click target calculation done in the
			// Android 2.1 browser, where if you click on an element, and there is a
			// mouse/click handler on one of its ancestors, the target will be the
			// innermost child of the touched element, even if that child is no where
			// near the point of touch.

			ele = target;

			while ( ele ) {
				for ( i = 0; i < cnt; i++ ) {
					o = clickBlockList[ i ];
					touchID = 0;

					if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
								$.data( ele, touchTargetPropertyName ) === o.touchID ) {
						// XXX: We may want to consider removing matches from the block list
						//      instead of waiting for the reset timer to fire.
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				ele = ele.parentNode;
			}
		}
	}, true);
}
})( jQuery, window, document );
;
jQuery.extend(KhanUtil, {
	/* Wraps a number in paretheses if it's negative. */
	negParens: function( n ) {
		return n < 0 ? "(" + n + ")" : n;
	},

	/* Wrapper for `fraction` which takes a decimal instead of a numerator and
	 * denominator. */
	decimalFraction: function( num, defraction, reduce, small, parens ) {
		var f = KhanUtil.toFraction( num );
		return KhanUtil.fraction( f[0], f[1], defraction, reduce, small, parens );
	},

	reduce: function( n, d){
		var gcd = KhanUtil.getGCD( n, d );
		n = n / gcd;
		d = d / gcd;
		return [ n, d ];
	},

	toFractionTex: function( n, dfrac ) {
		var f = KhanUtil.toFraction( n );
		if ( f[1] === 1 ) {
			return f[0];
		} else {
			return "\\" + ( dfrac ? "d" : "" ) + "frac{" + f[0] + "}{" + f[1] + "}";
		}
	},

	/* Format the latex of the fraction `n`/`d`.
	 * - Will use latex's `dfrac` unless `small` is specified as truthy.
	 * - Will wrap the fraction in parentheses if necessary (ie, unless the
	 * fraction reduces to a positive integer) if `parens` is specified as
	 * truthy.
	 * - Will reduce the fraction `n`/`d` if `reduce` is specified as truthy.
	 * - Will defraction (spit out 0 if `n` is 0, spit out `n` if `d` is 1, or
	 * spit out `undefined` if `d` is 0) if `defraction` is specified as
	 * truthy. */
	fraction: function( n, d, defraction, reduce, small, parens ) {
		var frac = function( n, d ) {
			return ( small ? "\\frac" : "\\dfrac" ) + "{" + n + "}{" + d + "}";
		};

		var neg = n * d < 0;
		var sign = neg ? "-" : "";
		n = Math.abs( n );
		d = Math.abs( d );

		if ( reduce ) {
			var gcd = KhanUtil.getGCD( n, d );
			n = n / gcd;
			d = d / gcd;
		}

		defraction = defraction && ( n === 0 || d === 0 || d === 1 );
		parens = parens && ( !defraction || neg );
		var begin = parens ? "\\left(" : "";
		var end = parens ? "\\right)" : "";

		var main;
		if ( defraction ) {
			if ( n === 0 ) {
				main = "0";
			} else if ( d === 0 ) {
				main = "\\text{undefined}";
			} else if ( d === 1 ) {
				main = sign + n;
			}
		} else {
			main = sign + frac( n, d );
		}

		return begin + main + end;
	},

	mixedFractionFromImproper: function( n, d, defraction, reduce, small, parens ) {
		return KhanUtil.mixedFraction( Math.floor( n / d ), n % d, d, defraction, reduce, small, parens );
	},

	/* Format the latex of the mixed fraction 'num n/d"
	 * - For negative numbers, if it is a mixed fraction, make sure the whole
	 * number portion is negative.  '-5, 2/3' should be 'mixedFraction(-5,2,3)'
	 * do not put negative for both whole number and numerator portion.
	 * - Will use latex's `dfrac` unless `small` is specified as truthy.
	 * - Will wrap the fraction in parentheses if necessary (ie, unless the
	 * fraction reduces to a positive integer) if `parens` is specified as
	 * truthy.
	 * - Will reduce the fraction `n`/`d` if `reduce` is specified as truthy.
	 * - Will defraction (spit out 0 if `n` is 0, spit out `n` if `d` is 1, or
	 * spit out `undefined` if `d` is 0) if `defraction` is specified as
	 * truthy. */
	mixedFraction: function( number, n, d, defraction, reduce, small, parens ) {
		var wholeNum = number ? number : 0;
		var numerator = n ? n : 0;
		var denominator = d ? d : 1;

		if ( wholeNum < 0 && numerator < 0 ) {
			throw "NumberFormatException: Both integer portion and fraction cannot both be negative.";
		}
		if ( denominator < 0 ) {
			throw "NumberFormatException: Denominator cannot be be negative.";
		}
		if ( denominator === 0 ) {
			throw "NumberFormatException: Denominator cannot be be 0.";
		}

		if ( reduce ) {
			if( wholeNum < 0 ) {
				wholeNum -= Math.floor( numerator / denominator );
			} else {
				wholeNum += Math.floor( numerator / denominator );
			}

			numerator = numerator % denominator;
		}

		if ( wholeNum !== 0 && numerator !== 0 ) {
			return wholeNum + " " + KhanUtil.fraction( n, d, defraction, reduce, small, parens );
		} else if ( wholeNum !== 0 && numerator === 0 ) {
			return wholeNum;
		} else if ( wholeNum === 0 && numerator !== 0 ) {
			return KhanUtil.fraction( n, d, defraction, reduce, small, parens );
		} else {
			return 0;
		}
	},

	/* Calls fraction with the reduce and defraction flag enabled. Additional
	 * parameters correspond to the remaining fraction flags. */
	fractionReduce: function( n, d, small, parens ) {
		return KhanUtil.fraction( n, d, true, true, small, parens );
	},

	/* Calls fraction with the small flag enabled. Additional parameters
	 * correspond to the remaining fraction flags. */
	fractionSmall: function( n, d, defraction, reduce, parens ) {
		return KhanUtil.fraction( n, d, defraction, reduce, true, parens );
	},

	/* Interprets a decimal as a multiple of pi and formats it as would be
	 * expected. */
	piFraction: function( num ) {
		if ( num.constructor === Number ) {
			var f = KhanUtil.toFraction( num / Math.PI, 0.001 ),
			 n = f[0],
			 d = f[1];

			return d === 1 ? n + "\\pi" : KhanUtil.fractionSmall( n, d ) + "\\pi";
		}
	},

	/* Returns whether the fraction n/d reduces. */
	reduces: function( n, d ) {
		// if the GCD is greater than 1, then there is a factor in common and the
		// fraction reduces.
		return KhanUtil.getGCD( n, d ) > 1;
	},

	fractionSimplification: function( n, d ) {
		var result = "\\frac{" + n + "}{" + d + "}";

		if ( d <= 1 || KhanUtil.getGCD( n, d ) > 1 ) {
			result += " = " + KhanUtil.fractionReduce( n, d );
		}

		return result;
	},

	// Randomly return the fraction in its mixed or improper form.
	mixedOrImproper: function( n, d ) {
		// mixed
		if ( n < d || KhanUtil.rand( 2 ) > 0 ) {
			return KhanUtil.fraction( n, d );

		// improper
		} else {
			var imp = Math.floor( n / d );		
			return imp + KhanUtil.fraction( n - ( d * imp ), d );
		}
	},

	// splitRadical( 24 ) gives [ 2, 6 ] to mean 2 sqrt(6)
	splitRadical: function( n ) {
		if ( n === 0 ) {
			return [ 0, 1 ];
		}

		var coefficient = 1;
		var radical = n;

		for(var i = 2; i * i <= n; i++) {
			while(radical % (i * i) === 0) {
				radical /= i * i;
				coefficient *= i;
			}
		}

		return [coefficient, radical];
	},

	// formattedSquareRootOf(24) gives 2\sqrt{6}
	formattedSquareRootOf: function( n ) {
		if( n === 1 || n === 0 ) {
			/* so as to not return "" or "\\sqrt{0}" later */
			return n.toString();
		} else {
			var split = KhanUtil.splitRadical( n );
			var coefficient = split[0] === 1 ? "" : split[0].toString();
			var radical = split[1] === 1 ? "" : "\\sqrt{" + split[1] + "}";

			return coefficient + radical;
		}
	},

	squareRootCanSimplify: function(n) {
		return KhanUtil.formattedSquareRootOf(n) !== ("\\sqrt{" + n + "}");
	},

	// Ported from https://github.com/clojure/clojure/blob/master/src/clj/clojure/pprint/cl_format.clj#L285
	cardinal: function( n ) {
		var cardinalScales = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion", "sexdecillion", "septendecillion", "octodecillion", "novemdecillion", "vigintillion"];
		var cardinalUnits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
		var cardinalTens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
		// For formatting numbers less than 1000
		var smallNumberWords = function( n ) {
			var hundredDigit = Math.floor( n / 100 );
			var rest = n % 100;
			var str = "";

			if ( hundredDigit ) {
				str += cardinalUnits[ hundredDigit ] + " hundred";
			}

			if ( hundredDigit && rest ) {
				str += " ";
			}

			if ( rest ) {
				if ( rest < 20 ) {
					str += cardinalUnits [ rest ];
				} else {
					var tenDigit = Math.floor( rest / 10 );
					var unitDigit = rest % 10;

					if ( tenDigit ) {
						str += cardinalTens [ tenDigit ];
					}

					if ( tenDigit && unitDigit ) {
						str += "-";
					}

					if ( unitDigit ) {
						str += cardinalUnits [ unitDigit ];
					}
				}
			}

			return str;
		};

		if ( n === 0 ) {
			return "zero";
		} else {
			var neg = false;
			if ( n < 0 ) {
				neg = true;
				n = Math.abs( n );
			}

			var words = [];
			var scale = 0;
			while ( n > 0 ) {
				var end = n % 1000;

				if ( end > 0 ) {
					if ( scale > 0 ) {
						words.unshift( cardinalScales[ scale ] );
					}

					words.unshift( smallNumberWords( end ) );
				}

				n = Math.floor( n / 1000 );
				scale += 1;
			}

			if ( neg ) {
				words.unshift( "negative" );
			}

			return words.join( " " );
		}
	},

	kardinaal: function(n){
		if(n >= 10000){
			return n
		}
		var basis = ["", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen"]
		var tienen = ["", "tien", "twintig", "dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig"]
		var uitzonderingen = ["tien", "elf", "twaalf", "dertien", "veertien"]
		var result = ""

		n4 = Math.floor(n/1000)
		n3 = Math.floor((n%1000)/100)
		n2 = Math.floor((n%100)/10)
		n1 = (n%10)

		if(n4 >= 1){
			if(n4 >= 2){
				result += basis[n4]
			}
			result += "duizend "
		}

		if(n3 >= 1){
			if(n3 >= 2){
				result += basis[n3]
			}
			result += "honderd "
		}

		if(n2 >= 2){
			if(n1 >= 1){
				if(n1 == 2 || n1 == 3){
					result += basis[n1] + "&euml;n" + tienen[n2]
				}
				else{
					result += basis[n1] + "en" + tienen[n2]
				}
			}
			else{
				result += tienen[n2]
			}
		}
		else if(n2 == 1){
			if(n1 >= 5){
				result += basis[n1] + tienen[n2]
			}
			else{
				result += uitzonderingen[n1]
			}
		}
		else if(n1 >= 1){
			result += basis[n1]
		}

		return result

	},

	Cardinal: function( n ) {
		var card = KhanUtil.cardinal( n );
		return card.charAt(0).toUpperCase() + card.slice(1);
	},

	// Depends on expressions.js for expression formatting
	// Returns a string with the expression for the formatted roots of the quadratic
	// with coefficients a, b, c
	// i.e. "x = \pm 3", "
	quadraticRoots: function( a, b, c ) {
		var underRadical = KhanUtil.splitRadical( b * b - 4 * a * c );
		var rootString = "x =";

		if ( (b * b - 4 * a * c) === 0 ) {
			// 0 under the radical
			rootString += KhanUtil.fraction(-b, 2*a, true, true, true);
		} else if ( underRadical[0] === 1 ) {
			// The number under the radical cannot be simplified
			rootString += KhanUtil.expr(["frac", ["+-", -b, ["sqrt", underRadical[1]]],
												 2 * a]);
		} else if ( underRadical[1] === 1 ) {
			// The absolute value of the number under the radical is a perfect square

			rootString += KhanUtil.fraction(-b + underRadical[0], 2*a, true, true, true) + ","
				+ KhanUtil.fraction(-b - underRadical[0], 2*a, true, true, true);
		} else {
			// under the radical can be partially simplified
			var divisor = KhanUtil.getGCD( b, 2 * a, underRadical[0] );

			if ( divisor === Math.abs(2*a) ) {
				rootString += KhanUtil.expr(["+-", -b / (2 * a), ["*", underRadical[0] / divisor,
																 ["sqrt", underRadical[1]] ]]);
			} else {
				rootString += KhanUtil.expr(["frac", ["+-", -b / divisor, ["*", underRadical[0] / divisor,
																				["sqrt", underRadical[1]] ]],
													 2 * a / divisor]);
			}
		}
		return rootString;
	},

	// Thanks to Ghostoy on http://stackoverflow.com/questions/6784894/commafy/6786040#6786040
	commafy: function( num ) {
		var str = num.toString().split( "." );

		if ( str[0].length >= 5 ) {
			str[0] = str[0].replace( /(\d)(?=(\d{3})+$)/g, '$1{,}' );
		}

		if ( str[1] && str[1].length >= 5 ) {
			str[1] = str[1].replace( /(\d{3})(?=\d)/g, '$1\\;' );
		}

		return str.join( "," );
	},

	// Formats strings like "Axy + By + Cz + D" where A, B, and C are variables
	// initialized to unknown values. Formats things so that TeX takes care of
	// negatives, and also handles cases where the strings beind added are wrapped
	// in TeX color declarations (\color{blue}{Axy} to \color{blue}{xy} if A is 1,
	// and won't be inserted at all if A is 0). Also <code><var>plus( A, B, C )
	// </var></code> is cleaner than <code><var>A</var> + <var>B</var> + <var>C</var></code>.
	// Note: this is somewhat treading on the territory of expressions.js, but has
	// a slightly different use case.
	plus: function() {

		var args = [], s;

		for ( var i = 0; i < arguments.length; i++ ) {
			s = KhanUtil._plusTrim( arguments[i] );
			if ( s ) {
				args.push( s );
			}
		}

		return args.length > 0 ? args.join( " + " ) : "0";
	},

	_plusTrim: function( s ) {

		if ( typeof s === "string" && isNaN( s ) ) {

			// extract color, so we can handle stripping the 1 out of \color{blue}{1xy}
			if ( s.indexOf( "{" ) !== -1 ) {

				// we're expecting something like "\color{blue}{-1}..."
				var l, r;
				l = s.indexOf( "{", s.indexOf( "{" ) + 1 ) + 1;
				r = s.indexOf( "}", s.indexOf( "}" ) + 1 );

				// if we've encountered \color{blue}{1}\color{xy} somehow
				if ( l !== s.lastIndexOf( "{" ) + 1 && +KhanUtil._plusTrim( s.slice( l, r ) ) === 1 ) {
					if ( s.indexOf( "\\" ) !== -1 ) {
						return s.slice( 0, s.indexOf( "\\" ) ) + s.slice( r + 1 );
					} else {
						return s.slice( r + 1 );
					}
				}

				return s.slice( 0, l ) + KhanUtil._plusTrim( s.slice( l, r ) ) + s.slice( r );
			}

			if ( s.indexOf( "1" ) === 0 && isNaN( s[1] ) ) {
				return s.slice( 1 );
			} else if ( s.indexOf( "-1" ) === 0 && isNaN( s[2] ) ) {
				return "-" + s.slice( 2 );
			} else if ( s.indexOf( "0" ) === 0 || s.indexOf( "-0" ) === 0 ) {
				return "";
			} else {
				return s;
			}

		} else if ( typeof s === "number" ) {

			// we'll just return the number, but this will actually end up getting
			// rid of 0's since a returned 0 will be falsey.
			return s;

			// if we're dealing with a string that looks like a number
		} else if ( !isNaN( s ) ) {
			
			return +s;

		}

	},

	randVar: function() {
		return KhanUtil.randFromArray([ "x", "k", "y", "a", "n", "r", "p", "u", "v" ])
	}
});

;
jQuery.extend(KhanUtil, {
	
	// Simplify formulas before display
	cleanMath: function( expr ) {
		return typeof expr === "string" ?
			KhanUtil.tmpl.cleanHTML( expr )
				.replace(/\+ -/g, "- ")
				.replace(/- -/g, "+ ")
				.replace(/\^1/g, "") :
			expr;
	},

	// A simple random number picker
	// Returns a random int in [0, num)
	rand: function( num ) {
		return Math.floor( num * KhanUtil.random() );
	},

	/* Returns an array of the digits of a nonnegative integer in reverse
	 * order: digits(376) = [6, 7, 3] */
	digits: function( n ) {
		if (n === 0) {
			return [0];
		}

		var list = [];

		while(n > 0) {
			list.push(n % 10);
			n = Math.floor(n / 10);
		}

		return list;
	},

	// Similar to above digits, but in original order (not reversed)
	integerToDigits: function( n ) {
		return KhanUtil.digits( n ).reverse();
	},

	digitsToInteger: function( digits ) {
		var place = Math.floor( Math.pow( 10, digits.length - 1 ) );
		var number = 0;

		jQuery.each( digits, function(index, digit) {
			number += digit * place;
			place /= 10;
		});

		return number;
	},

	padDigitsToNum: function( digits, num ) {
		digits = digits.slice( 0 );
		while ( digits.length < num ) {
			digits.push( 0 );
		}
		return digits;
	},

	placesLeftOfDecimal: ["hele getal", "tiental", "honderdtal", "duizendtal"],
	placesRightOfDecimal: ["hele getal", "tiende", "honderdste", "duizendste"],

	powerToPlace: function( power ) {
		if ( power < 0 ) {
			return KhanUtil.placesRightOfDecimal[ -1 * power ];
		} else {
			return KhanUtil.placesLeftOfDecimal[ power ];
		}
	},


	//Adds 0.001 because of floating points uncertainty so it errs on the side of going further away from 0
	roundTowardsZero: function( x ){
		if ( x < 0 ){
			return Math.ceil( x - 0.001 );
		}
		return Math.floor( x + 0.001 );
	},

	getGCD: function( a, b ) {
		if ( arguments.length > 2 ) {
			var rest = [].slice.call( arguments, 1 );
			return KhanUtil.getGCD( a, KhanUtil.getGCD.apply( KhanUtil, rest ) );
		} else {
			var mod;

			a = Math.abs( a );
			b = Math.abs( b );

			while ( b ) {
				mod = a % b;
				a = b;
				b = mod;
			}

			return a;
		}
	},

	getLCM: function( a, b ) {
		if ( arguments.length > 2 ) {
			var rest = [].slice.call( arguments, 1 );
			return KhanUtil.getLCM( a, KhanUtil.getLCM.apply( KhanUtil, rest ) );
		} else {
			return Math.abs( a * b ) / KhanUtil.getGCD( a, b );
		}
	},

	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43,
		47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],

	getPrime: function() {
		return KhanUtil.primes[ KhanUtil.rand( KhanUtil.primes.length ) ];
	},

	isPrime: function(n) {
		if (n <= 1) {
			return false;
		} else if (n < 101) {
			return !!jQuery.grep(KhanUtil.primes, function(p, i) {
				return Math.abs(p - n) <= 0.5;
			}).length;
		} else {
			if (n <= 1 || n > 2 && n % 2 === 0) {
				return false;
			} else {
				for(var i = 3, sqrt = Math.sqrt(n); i <= sqrt; i += 2) {
					if ( n % i === 0 ) {
						return false;
					}
				}
			}
			
			return true;
		}

	},

	isOdd: function( n ) {
		return n % 2 === 1;
	},

	isEven: function( n ) {
		return n % 2 === 0;
	},

	getOddComposite: function( min, max ) {
		if ( min === undefined ) {
			min = 0;
		}

		if ( max === undefined ) {
			max = 100;
		}

		var oddComposites = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55];
		oddComposites = oddComposites.concat([57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95, 99]);

		var result = -1;
		while ( result < min || result > max ) {
			result = oddComposites[ KhanUtil.rand( oddComposites.length ) ];
		}
		return result;
	},

	getEvenComposite: function( min, max ) {
		if ( min === undefined ) {
			min = 0;
		}

		if ( max === undefined ) {
			max = 100;
		}

		var evenComposites = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
		evenComposites = evenComposites.concat([28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48]);
		evenComposites = evenComposites.concat([50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72]);
		evenComposites = evenComposites.concat([74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98]);

		var result = -1;
		while ( result < min || result > max ) {
			result = evenComposites[ KhanUtil.rand( evenComposites.length ) ];
		}
		return result;
	},

	getComposite: function() {
		if (KhanUtil.randRange( 0, 1 )) {
			return KhanUtil.getEvenComposite();
		} else {
			return KhanUtil.getOddComposite();
		}
	},

	getPrimeFactorization: function( number ) {
		if ( number === 1 ) {
			return [];
		} else if ( KhanUtil.isPrime( number ) ) {
			return [ number ];
		}

		var maxf = Math.sqrt( number );
		for (var f = 2; f <= maxf; f++) {
			if ( number % f === 0 ) {
				return jQuery.merge(KhanUtil.getPrimeFactorization( f ), KhanUtil.getPrimeFactorization( number / f ));
			}
		}
	},

	getFactors: function( number ) {
		var factors = [],
			ins = function( n ) {
				if ( _(factors).indexOf( n ) === -1 ) {
					factors.push( n );
				}
			};

		var maxf2 = number;
		for (var f = 1; f * f <= maxf2; f++) {
			if ( number % f === 0 ) {
				ins( f );
				ins( number / f );
			}
		}
		return KhanUtil.sortNumbers( factors );
	},

	// Get a random factor of a composite number which is not 1 or that number
	getNontrivialFactor: function( number ) {
		var factors = KhanUtil.getFactors( number );
		return factors[ KhanUtil.randRange( 1, factors.length - 2 ) ];
	},

	getMultiples: function( number, upperLimit ) {
		var multiples = [];
		for ( var i = 1; i * number <= upperLimit; i++ ) {
			multiples.push( i * number );
		}
		return multiples;
	},

	// splitRadical( 24 ) gives [ 2, 6 ] to mean 2 sqrt(6)
	splitRadical: function( n ) {
		if ( n === 0 ) {
			return [ 0, 1 ];
		}

		var coefficient = 1;
		var radical = n;

		for(var i = 2; i * i <= n; i++) {
			while(radical % (i * i) === 0) {
				radical /= i * i;
				coefficient *= i;
			}
		}

		return [coefficient, radical];
	},

	// randRange( min, max ) - Get a random integer between min and max, inclusive
	// randRange( min, max, count ) - Get count random integers
	// randRange( min, max, rows, cols ) - Get a rows x cols matrix of random integers
	// randRange( min, max, x, y, z ) - You get the point...
	randRange: function( min, max ) {
		var dimensions = [].slice.call( arguments, 2 );

		if ( dimensions.length === 0 ) {
			return Math.floor( KhanUtil.rand( max - min + 1 ) ) + min;
		} else {
			var args = [ min, max ].concat( dimensions.slice( 1 ) );
			return jQuery.map(new Array( dimensions[ 0 ] ), function() {
				return [ KhanUtil.randRange.apply( null, args ) ];
			});
		}
	},

	// Get an array of unique random numbers between min and max
	randRangeUnique: function( min, max, count ) {
		if ( count == null ) {
			return KhanUtil.randRange( min, max );
		} else {
			var toReturn = [];
			for ( var i = min; i < max; i++ ){
				toReturn.push( i );
			}

			return KhanUtil.shuffle( toReturn, count );
		}
	},

	// Get an array of unique random numbers between min and max,
	// that ensures that none of the integers in the array are 0.
	randRangeUniqueNonZero: function( min, max, count ) {
		if ( count == null ) {
			return KhanUtil.randRangeNonZero( min, max );
		} else {
			var toReturn = [];
			for ( var i = min; i < max; i++ ){
				if ( i === 0 ) {
					continue;
				}
				toReturn.push( i );
			}

			return KhanUtil.shuffle( toReturn, count );
		}
	},

	// Get a random integer between min and max with a perc chance of hitting
	// target (which is assumed to be in the range, but it doesn't have to be).
	randRangeWeighted: function( min, max, target, perc ) {
		if ( KhanUtil.random() < perc ) {
			return target;
		} else {
			return KhanUtil.randRangeExclude( min, max, [target] );
		}
	},

	// Get a random integer between min and max that is never any of the values
	// in the excludes array.
	randRangeExclude: function( min, max, excludes ) {
		var result;

		do {
			result = KhanUtil.randRange( min, max );
		} while ( _(excludes).indexOf(result) !== -1 );

		return result;
	},

	// Get a random integer between min and max with a perc chance of hitting
	// target (which is assumed to be in the range, but it doesn't have to be).
	// It never returns any of the values in the excludes array.
	randRangeWeightedExclude: function( min, max, target, perc, excludes ) {
		var result;

		do {
			result = KhanUtil.randRangeWeighted( min, max, target, perc );
		} while ( _(excludes).indexOf(result) !== -1 );

		return result;
	},

	// From limits_1
	randRangeNonZero: function( min, max ) {
		return KhanUtil.randRangeExclude( min, max, [0] );
	},

	// Returns a random member of the given array
	// If a count is passed, it gives an array of random members of the given array
	randFromArray: function( arr, count ) {
		if ( count == null ) {
			return arr[ KhanUtil.rand( arr.length ) ];
		} else {
			return jQuery.map( new Array(count), function() {
				return KhanUtil.randFromArray( arr );
			});
		}
	},

	// Returns a random member of the given array that is never any of the values
	// in the excludes array.
	randFromArrayExclude: function( arr, excludes ) {
		var cleanArr = [];
		for ( var i = 0; i < arr.length; i++ ) {
			if ( _(excludes).indexOf( arr[i] ) === -1 ) {
				cleanArr.push( arr[i] );
			}
		}
		return KhanUtil.randFromArray( cleanArr );
	},

	// Round a number to the nearest increment
	// E.g., if increment = 30 and num = 40, return 30. if increment = 30 and num = 45, return 60.
	roundToNearest: function( increment, num ) {
		return Math.round( num / increment ) * increment;
	},

	// Round a number to a certain number of decimal places
	roundTo: function( precision, num ) {
		var factor = Math.pow( 10, precision ).toFixed(5);
		return Math.round( ( num * factor ).toFixed(5) ) / factor;
	},

	floorTo: function( precision, num ) {
		var factor = Math.pow( 10, precision ).toFixed(5);
		return Math.floor( ( num * factor ).toFixed(5) ) / factor;
	},

	ceilTo: function( precision, num ) {
		var factor = Math.pow( 10, precision ).toFixed(5);
		return Math.ceil( ( num * factor ).toFixed(5) ) / factor;
	},

	// toFraction( 4/8 ) => [1, 2]
	// toFraction( 0.666 ) => [333, 500]
	// toFraction( 0.666, 0.001 ) => [2, 3]
	//
	// tolerance can't be bigger than 1, sorry
	toFraction: function( decimal, tolerance ) {
		if ( tolerance == null ) {
			tolerance = Math.pow( 2, -46 );
		}

		if ( decimal < 0 || decimal > 1 ) {
			var fract = decimal % 1;
			fract += ( fract < 0 ? 1 : 0 );

			var nd = KhanUtil.toFraction( fract, tolerance );
			nd[0] += Math.round( decimal - fract ) * nd[1];
			return nd;
		} else if ( Math.abs( Math.round( Number( decimal ) ) - decimal ) <= tolerance ) {
			return [ Math.round( decimal ), 1 ];
		} else {
			var loN = 0, loD = 1, hiN = 1, hiD = 1, midN = 1, midD = 2;

			while ( 1 ) {
				if ( Math.abs( Number(midN / midD) - decimal ) <= tolerance ) {
					return [ midN, midD ];
				} else if ( midN / midD < decimal) {
					loN = midN;
					loD = midD;
				} else {
					hiN = midN;
					hiD = midD;
				}

				midN = loN + hiN;
				midD = loD + hiD;
			}
		}
	},

	// Shuffle an array using a Fischer-Yates shuffle
	// If count is passed, returns an random sublist of that size
	shuffle: function( array, count ) {
		array = [].slice.call( array, 0 );
		var beginning = typeof count === "undefined" || count > array.length ? 0 : array.length - count;

		for ( var top = array.length; top > beginning; top-- ) {
			var newEnd = Math.floor(KhanUtil.random() * top),
				tmp = array[newEnd];

			array[newEnd] = array[top - 1];
			array[top - 1] = tmp;
		}

		return array.slice(beginning);
	},

	sortNumbers: function( array ) {
		return array.slice( 0 ).sort( function( a, b ) {
			return a - b;
		});
	},

	// From limits_1
	truncate_to_max: function( num, digits ) {
		return parseFloat( num.toFixed( digits ) );
	},

	//Gives -1 or 1 so you can multiply to restore the sign of a number
	restoreSign: function( num ) {
		num = parseFloat( num );
		if ( num < 0 ){
			return -1;
		}
		return 1;
	},

	// Checks if a number or string representation thereof is an integer
	isInt: function( num ) {
		return parseFloat( num ) === parseInt( num, 10 ) && !isNaN( num );
	},
	BLUE: "#6495ED",
	ORANGE: "#FFA500",
	PINK: "#FF00AF",
	GREEN: "#28AE7B"
});
;
jQuery.extend( KhanUtil, {

	updateMean: function( mean ) {
		var graph = KhanUtil.currentGraph;

		jQuery( graph.graph.meanValueLabel ).html( mean ).tmpl();

		graph.graph.meanArrow.translate( (mean * graph.scale[0]) - graph.graph.meanArrow.attr("translation").x, 0 );
		graph.graph.meanValueLabel.remove();
		graph.graph.meanValueLabel = graph.label( [ mean, 0.8 ],
			( mean + "" ).replace( /-(\d)/g, "\\llap{-}$1" ),
			"above",
			{ color: KhanUtil.BLUE }
		);

		graph.graph.meanLabel.remove();
		graph.graph.meanLabel = graph.label( [ mean, 1.3 ],	"\\text{gemiddelde}", "above", { color: KhanUtil.BLUE });

		graph.graph.mean = mean;
	},


	updateMedian: function( median ) {
		var graph = KhanUtil.currentGraph;

		graph.graph.medianArrow.translate( (median * graph.scale[0]) - graph.graph.medianArrow.attr("translation").x, 0 );
		graph.graph.medianValueLabel.remove();
		graph.graph.medianValueLabel = graph.label( [ median, -1.2 ],
			( median + "" ).replace( /-(\d)/g, "\\llap{-}$1" ),
			"below",
			{ color: KhanUtil.GREEN }
		);

		graph.graph.medianLabel.remove();
		graph.graph.medianLabel = graph.label( [ median, -1.7 ],	"\\text{mediaan}", "below", { color: KhanUtil.GREEN });

		graph.graph.median = median;
	},

	updateMeanAndMedian: function() {
		var points = KhanUtil.currentGraph.graph.points;
		var mean = KhanUtil.mean( jQuery.map( points, function( el ) { return el.coord[0]; } ) );
		var median = KhanUtil.median( jQuery.map( points, function( el ) { return el.coord[0]; } ) );

		KhanUtil.updateMean( KhanUtil.roundTo( 2, mean ) );
		KhanUtil.updateMedian( KhanUtil.roundTo( 2, median ) );
	},

	updateMeanAndStddev: function() {
		var graph = KhanUtil.currentGraph;
		var points = KhanUtil.currentGraph.graph.points;
		var mean = KhanUtil.mean( jQuery.map( points, function( el ) { return el.coord[0]; } ) );
		var stddev = KhanUtil.stdDev( jQuery.map( points, function( el ) { return el.coord[0]; } ) );

		mean = KhanUtil.roundTo( 1, mean );
		stddev = KhanUtil.roundTo( 1, stddev );

		graph.graph.stddevLeft.translate( ((mean) * graph.scale[0]) - graph.graph.stddevLeft.attr("translation").x, 0 );
		graph.graph.stddevRight.translate( ((mean + stddev) * graph.scale[0]) - graph.graph.stddevRight.attr("translation").x, 0 );
		graph.graph.stddevLine.translate( ((mean) * graph.scale[0]) - graph.graph.stddevLine.attr("translation").x, 0 );
		graph.graph.stddevLine.scale( stddev, 1, graph.graph.stddevLine.attr( "path" )[0][1], graph.graph.stddevLine.attr( "path" )[0][2] );

		graph.graph.stddevValueLabel.remove();
		graph.graph.stddevValueLabel = graph.label( [ stddev / 2 + mean, -1.3 ], "s \\approx " + stddev, "below", { color: KhanUtil.GREEN });

		if ( stddev > 0 ) {

			graph.style({ strokeWidth: 2, stroke: "#bbb", fill: null, "plot-points": 100 }, function() {
				graph.graph.pdf.remove();
				graph.graph.pdf = graph.plot( function( x ) {
					return KhanUtil.gaussianPDF( mean, stddev, x ) * 5 - 0.2;
				}, [ -7, 7 ]).toBack();
			});

			graph.style({ strokeWidth: 2, stroke: KhanUtil.BLUE, fill: null }, function() {
				graph.graph.meanLine.remove();
				graph.graph.meanLine = graph.line( [ mean, -0.2 ], [ mean, KhanUtil.gaussianPDF( mean, stddev, mean ) * 5 - 0.2 ] ).toBack();
			});

			graph.graph.meanValueLabel.remove();
			graph.graph.meanValueLabel = graph.label(
				[ mean, KhanUtil.gaussianPDF( mean, stddev, mean ) * 5 - 0.2 ],
				"\\bar{x} \\approx " + mean, "above", { color: KhanUtil.BLUE }
			);

			var points = [];

			points.push([ mean - stddev, -0.2 ]);
			points.push([ mean - stddev, KhanUtil.gaussianPDF( mean, stddev, mean - stddev ) * 5 - 0.2 ]);
			var step = stddev / 50;
			for ( var x = mean - stddev; x <= mean + stddev; x += step ) {
				points.push([ x, KhanUtil.gaussianPDF( mean, stddev, x ) * 5 - 0.2 ]);
			}
			points.push([ mean + stddev, KhanUtil.gaussianPDF( mean, stddev, mean + stddev ) * 5 - 0.2 ]);
			points.push([ mean + stddev, -0.2 ]);

			graph.style({ strokeWidth: 0, stroke: null, fill: KhanUtil.GREEN, opacity: 0.3 }, function() {
				graph.graph.stddevArea.remove();
				graph.graph.stddevArea = graph.path( points ).toBack();
			});

		} else {
			graph.graph.pdf.remove();
			graph.graph.pdf = KhanUtil.bogusShape;
		}


		graph.graph.mean = mean;
		graph.graph.stddev = stddev;
	},


	onMovePoint: function( point, x, y, updateFunction ) {
		var points = KhanUtil.currentGraph.graph.points;

		// Don't do anything unless the point actually moved
		if ( point.coord[0] !== x ) {

			// don't allow the point to move past the bounds
			if ( x < -7 || x > 7 ) {
				return false;
			}

			point.coord = [ x, 0 ];

			// Figure out which points are at the same position
			var positions = {};
			// The point being dragged is always at the bottom of the pile
			positions[ Math.round(x * 2) / 2 ] = [ point ];

			jQuery.each( points, function() {
				if ( this !== point ) {
					var pos = Math.round( this.coord[0] * 2 ) / 2;
					if (!jQuery.isArray( positions[ pos ] )) {
						positions[ pos ] = [];
					}
					positions[ pos ].push( this );
				}
			});

			if ( jQuery.isFunction( updateFunction ) ) {
				updateFunction();
			}

			// Adjust the y-value of each point in case points are stacked
			jQuery.each( positions, function( value, points ) {
				points = points.sort (function(a, b){ return a.coord[1]-b.coord[1]; });
				jQuery.each( points, function( i, point ) {
					if ( updateFunction !== undefined ) {
						point.moveTo(point.coord[0], 0.3 * i);
					} else {
						point.setCoord([ point.coord[0], 0.3 * i ]);
					}
				});
			});

			return [ x, 0 ];
		}
	},


	arrangePointsAroundMedian: function() {
		var graph = KhanUtil.currentGraph;
		var points = graph.graph.points;
		var targetMedian = graph.graph.targetMedian;
		var numPoints = graph.graph.numPoints;
		var maxWidth = Math.min( Math.abs( -7 - targetMedian ), Math.abs( 7 - targetMedian ) );

		var distance = 0.5;
		var newValues = [];
		if ( numPoints % 2 === 0 ) {
			newValues.push( targetMedian + distance );
			newValues.push( targetMedian - distance );
			distance += 0.5;
		} else {
			newValues.push( targetMedian );
		}

		while ( newValues.length < points.length ) {
			newValues.push( targetMedian + distance );
			newValues.push( targetMedian - distance );
			if ( distance >= maxWidth ) {
				distance = 0.5;
			} else {
				distance += 0.5;
			}
		}
		return KhanUtil.sortNumbers( newValues );
	},


	animatePoints: function( oldValues, newValues, newMedian, newMean ) {
		var graph = KhanUtil.currentGraph;
		var points = graph.graph.points;
		var sortedPoints = points.sort (function(a, b){ return a.coord[0]-b.coord[0]; });

		jQuery.each( oldValues, function( i, oldValue ) {
			jQuery({ 0: oldValue }).animate({ 0: newValues[i] }, {
				duration: 500,
				step: function( now, fx ) {
					KhanUtil.onMovePoint( sortedPoints[ i ], now, 0 );
				}
			});
		});

		jQuery({ median: graph.graph.median, mean: graph.graph.mean }).animate({
			median: newMedian, mean: newMean
		}, {
			duration: 500,
			step: function( now, fx ) {
				if ( fx.prop === "median" ) {
					KhanUtil.updateMedian( KhanUtil.roundTo(2, now) );
				} else if ( fx.prop === "mean" ) {
					KhanUtil.updateMean( KhanUtil.roundTo(2, now) );
				}
			}
		});
	},


	showMedianExample: function( onComplete ) {
		var points = KhanUtil.currentGraph.graph.points;
		var targetMedian = KhanUtil.currentGraph.graph.targetMedian;
		var maxWidth = Math.min( Math.abs( -7 - targetMedian ), Math.abs( 7 - targetMedian ) );
		var sortedPoints = points.sort( function( a, b ) { return a.coord[0]-b.coord[0]; });
		var oldValues = [];
		jQuery.each( sortedPoints, function( i, point ) {
			oldValues.push( point.coord[0] );
		});
		var newValues = KhanUtil.arrangePointsAroundMedian();

		KhanUtil.animatePoints( oldValues, newValues, targetMedian, targetMedian );
		KhanUtil.currentGraph.graph.moved = true;
	},


	showMeanExample: function() {
		var graph = KhanUtil.currentGraph;
		var points = graph.graph.points;

		var calculateMean = function( values ) {
			var mean = 0;
			jQuery.each( values, function() {
				mean += this;
			});
			mean /= values.length;
			return mean;
		};

		var sortedPoints = points.sort (function(a, b){ return a.coord[0]-b.coord[0]; });
		var oldValues = [];
		var newValues = [];
		jQuery.each( sortedPoints, function( i, point ) {
			oldValues.push( point.coord[0] );
		});

		var newValues = KhanUtil.arrangePointsAroundMedian();

		// Keep moving outlier points further away from the median until
		// we get to the right mean
		var mean = calculateMean( newValues );
		while ( mean != graph.graph.targetMean ) {
			if ( mean < graph.graph.targetMean ) {
				// Start by moving the right-most point further to the right, then the next, etc.
				var pointToMove = newValues.length - 1;
				while ( newValues[pointToMove] === 7 && pointToMove > (points.length / 2) ) {
					--pointToMove;
				}
				// If we move all the points on the right of the median all the way to the right
				// and we still don't have the right mean, start moving points on the left
				// closer to the median
				if ( pointToMove <= (points.length / 2) ) {
					pointToMove = 0;
				}
				newValues[pointToMove] += 0.5;
			} else {
				// Start by moving the left-most point further to the left, then the next, etc.
				var pointToMove = 0;
				while ( newValues[pointToMove] === -7 && pointToMove < (points.length / 2 - 1) ) {
					++pointToMove;
				}
				// If we move all the points on the left of the median all the way to the left
				// and we still don't have the right mean, start moving points on the right
				// closer to the median
				if ( pointToMove >= (points.length / 2 - 1) ) {
					pointToMove = newValues.length - 1;
				}
				newValues[pointToMove] -= 0.5;
			}
			mean = calculateMean( newValues );
			newValues = KhanUtil.sortNumbers( newValues );
		}

		KhanUtil.animatePoints( oldValues, newValues, graph.graph.targetMedian, graph.graph.targetMean );
		KhanUtil.currentGraph.graph.moved = true;
	},

	showStddevExample: function() {
		var points = KhanUtil.currentGraph.graph.points;
		var targetStddev = KhanUtil.currentGraph.graph.targetStddev;
		var sortedPoints = points.sort( function( a, b ) { return a.coord[0]-b.coord[0]; });
		var oldValues = [];
		jQuery.each( sortedPoints, function( i, point ) {
			oldValues.push( point.coord[0] );
		});
		var newValues = new Array( points.length );

		// brute force answer finder :(
		var loopCount = 0;
		do {
			newValues = jQuery.map( newValues , function() {
				return KhanUtil.roundToNearest( 0.5, KhanUtil.randGaussian() * targetStddev );
			});
			newValues = KhanUtil.sortNumbers( newValues );
			++loopCount;
		} while ( loopCount < 1000 && (
			KhanUtil.roundTo( 1, KhanUtil.mean( newValues ) !== 0 ) ||
			KhanUtil.roundTo( 1, KhanUtil.stdDev( newValues ) ) !== targetStddev ||
			_.isEqual( oldValues, newValues )
		));
		if ( loopCount === 1000 ) {
			// better this than an infinte loop
			newValues = oldValues.slice();
		}


		jQuery.each( oldValues, function( i, oldValue ) {
			jQuery({ 0: oldValue }).animate({ 0: newValues[i] }, {
				duration: 500,
				step: function( now, fx ) {
					KhanUtil.onMovePoint( sortedPoints[ i ], now, 0 );
				}
			});
		});
		jQuery({ 0: 0 }).animate({ 0: 1 }, {
			duration: 600,
			step: function( now, fx ) {
				KhanUtil.updateMeanAndStddev();
			}
		});
		KhanUtil.currentGraph.graph.moved = true;
	}

});
;
jQuery.extend( KhanUtil, {

	NL: {
		werkwoordmap: [
				//Type 1 Werkwoorden waarbij -EN de stam geeft
			[
				["barsten","barst"],
				["bedriegen","bedrieg"],
				["bergen","berg"],
				["bezwijken","bezwijk"],
				["bieden","bied"],
				["bijten","bijt"],
				["binden","bind"],
				["blijken","blijk"],
				["blinken","blink"],
				["bouwen","bouw"],
				["breien","brei"],
				["brengen","breng"],
				["brouwen","brouw"],
				["buigen","buig"],
				["denken","denk"],
				["dringen","dring"],
				["drinken","drink"],
				["druipen","druip"],
				["duiken","duik"],
				["dwingen","dwing"],
				["fietsen","fiets"],
				["fluiten","fluit"],
				["gelden","geld"],
				["genieten","geniet"],
				["gieten","giet"],
				["glijden","glijd"],
				["grijpen","grijp"],
				["hangen","hang"],
				["helpen","help"],
				["hijsen","hijs"],
				["houden","houd"],
				["kijken","kijk"],
				["klinken","klink"],
				["knijpen","knijp"],
				["komen","kom"],
				["krijgen","krijg"],
				["krijsen","krijs"],
				["krimpen","krimp"],
				["kruipen","kruip"],
				["lachen","lach"],
				["liegen","lieg"],
				["lijden","lijd"],
				["lijken","lijk"],
				["melken","melk"],
				["mijden","mijd"],
				["moeten","moet"],
				["rijden","rijd"],
				["rijgen","rijg"],
				["roepen","roep"],
				["ruiken","ruik"],
				["scheiden","scheid"],
				["schelden","scheld"],
				["schenden","schend"],
				["schenken","schenk"],
				["schieten","schiet"],
				["schijnen","schijn"],
				["schijten","schijt"],
				["schrijden","schrijd"],
				["schuilen","schuil"],
				["slijpen","slijp"],
				["slijten","slijt"],
				["slinken","slink"],
				["sluipen","sluip"],
				["sluiten","sluit"],
				["smelten","smelt"],
				["smijten","smijt"],
				["snijden","snijd"],
				["snuiten","snuit"],
				["splijten","splijt"],
				["springen","spring"],
				["spuiten","spuit"],
				["stijgen","stijg"],
				["stinken","stink"],
				["strijden","strijd"],
				["strijken","strijk"],
				["vangen","vang"],
				["vechten","vecht"],
				["verdwijnen","verdwijn"],
				["verslinden","verslind"],
				["verzwelgen","verzwelg"],
				["vinden","vind"],
				["vlechten","vlecht"],
				["vliegen","vlieg"],
				["vluchten","vlucht"],
				["vouwen","vouw"],
				["vrijen","vrij"],
				["waaien","waai"],
				["werken","werk"],
				["werpen","werp"],
				["wijken","wijk"],
				["wijten","wijt"],
				["winden","wind"],
				["worden","word"],
				["wringen","wring"],
				["zeiken","zeik"],
				["zenden","zend"],
				["zingen","zing"],
				["zinken","zink"],
				["zoeken","zoek"],
				["zouten","zout"],
				["zuigen","zuig"],
				["zuipen","zuip"],
				["zwaaien","zwaai"],
				["zwijgen","zwijg"]
			],
				// Type 2 Werkwoorden waarbij eerst -EN, dan extra klinker
			[
				["bevelen","beveel"],
				["braden","braad"],
				["breken","breek"],
				["dragen","draag"],
				["ervaren","ervaar"],
				["eten","eet"],
				["heten","heet"],
				["jagen","jaag"],
				["klagen","klaag"],
				["kopen","koop"],
				["laden","laad"],
				["laten","laat"],
				["lopen","loop"],
				["meten","meet"],
				["nemen","neem"],
				["plegen","pleeg"],
				["raden","raad"],
				["raken","raak"],
				["scheren","scheer"],
				["slapen","slaap"],
				["spreken","spreek"],
				["spugen","spuug"],
				["steken","steek"],
				["stelen","steel"],
				["stoten","stoot"],
				["treden","treed"],
				["varen","vaar"],				
				["vergeten","vergeet"],
				["vragen","vraag"],
				["vreten","vreet"],
				["wegen","weeg"],
				["weten","weet"],
				["wreken","wreek"],
				["zweren","zweer"],
				["zweten","zweet"]
			],
				// Type 3 Werkwoorden -EN en dan 1 van dubbele medeklinker weghalen
			[
				["bakken","bak"],
				["bannen","ban"],
				["beginnen","begin"],
				["glimmen","glim"],
				["heffen","hef"],
				["klimmen","klim"],
				["leggen","leg"],
				["liggen","lig"],
				["scheppen","schep"],
				["schrikken","schrik"],
				["spannen","span"],
				["spinnen","spin"],
				["treffen","tref"],
				["trekken","trek"],
				["vallen","val"],
				["wassen","was"],
				["willen","wil"],
				["winnen","win"],
				["zeggen","zeg"],
				["zinnen","zin"],
				["zitten","zit"],
				["zwellen","zwel"],
				["zwemmen","zwem"]
			],
				// Type 4 Gebruiken we nu nog niet in stam werkwoorden
			[
				["zijn", "ben"]
			]
		]
	},

	randomWerkwoordset: function(type){
		type--
		return this.NL.werkwoordmap[type][
			Math.floor(Math.random()*this.NL. werkwoordmap[type].length)
		]
	},

	shuffle: function( array, count ) {
		array = [].slice.call( array, 0 );
		var beginning = typeof count === "undefined" || count > array.length ? 0 : array.length - count;

		for ( var top = array.length; top > beginning; top-- ) {
			var newEnd = Math.floor(KhanUtil.random() * top),
				tmp = array[newEnd];

			array[newEnd] = array[top - 1];
			array[top - 1] = tmp;
		}

		return array.slice(beginning);
	}

});
;
jQuery.extend( KhanUtil, {

	doParabolaInteraction: function( func, vertex, directrix ) {
		var graph = KhanUtil.currentGraph;

		var vertexLine = KhanUtil.bogusShape;
		var directrixLine = KhanUtil.bogusShape;
		var lineEndcap = KhanUtil.bogusShape;
		var highlighted = false;

		// Attach an onMove handler that gets called whenever the mouse hovers over
		// the parabola
		func.onMove = function( coordX, coordY ) {
			vertexLine.remove();
			directrixLine.remove();
			lineEndcap.remove();
			graph.style({ strokeWidth: 1.5, stroke: KhanUtil.GREEN, opacity: 0.0 });
			var vertexDistance = KhanUtil.distance( [ coordX, coordY ], vertex.coord );

			// Draw a line from the vertex to the highlighted point on the parabola
			vertexLine = graph.line( [coordX, coordY], vertex.coord );
			// Draw the horizontal line from the highlighted point on the parabola towards the directrix
			if (directrix.coord < coordY) {
				directrixLine = graph.line( [coordX, coordY], [ coordX, coordY - vertexDistance] );
				lineEndcap = graph.line( [coordX - 0.05, coordY - vertexDistance ], [coordX + 0.05, coordY - vertexDistance] );
			} else {
				directrixLine = graph.line( [coordX, coordY], [ coordX, coordY + vertexDistance] );
				lineEndcap = graph.line( [coordX - 0.05, coordY + vertexDistance ], [coordX + 0.05, coordY + vertexDistance] );
			}
			vertexLine.toBack();
			directrixLine.toBack();
			if (!highlighted) {
				vertexLine.animate({opacity: 1.0}, 100);
				directrixLine.animate({opacity: 1.0}, 100);
				lineEndcap.animate({opacity: 1.0}, 100);
			} else {
				vertexLine.attr({ opacity: 1.0 });
				directrixLine.attr({ opacity: 1.0 });
				lineEndcap.attr({ opacity: 1.0 });
			}
			highlighted = true;
		};

		// Attach an onLeave handler that gets called whenever the mouse moves away
		// from the parabola
		func.onLeave = function( coordX, coordY ) {
			vertexLine.animate( {opacity: 0.0}, 100 );
			directrixLine.animate( {opacity: 0.0}, 100 );
			lineEndcap.animate({ opacity: 0.0 }, 100);
			highlighted = false;
		};

	}

});
;
jQuery.extend(KhanUtil, {
	Polynomial: function( minDegree, maxDegree, coefs, variable, name ) {
		var term = function( coef, vari, degree ) {

			// sort of a weird error behavior
			if ( typeof coef === "undefined" || coef === 0 ) {
				return null;
			}

			if ( degree === 0 ) {
				return coef;
			} else if ( degree === 1 ) {
				return [ "*", coef, vari ];
			} else {
				return [ "*", coef, [ "^", vari, degree ] ];
			}

		};

		// inverse of term.	Given an expression it returns the coef and degree. 
		// calculus needs this for hints
		var extractFromExpr = function ( expr ){
			var coef,degree;
			if ( typeof expr === "number" ){
				coef = expr;
				degree = 0;
			} else if (jQuery.isArray( expr ) && !jQuery.isArray( expr[2] )){
				coef = expr[1];
				degree = 1;
			} else if (jQuery.isArray( expr ) && jQuery.isArray( expr[2] )){
				coef = expr[1];
				degree = expr[2][2];
			}
			return {
				coef: coef,
				degree: degree
			};
		};

		// These seem royally useless to me
		if ( maxDegree >= minDegree ) {
			this.minDegree = minDegree;
			this.maxDegree = maxDegree;
		} else {
			this.minDegree = maxDegree;
			this.maxDegree = minDegree;
		}

		this.coefs = coefs || KhanUtil.randCoefs( this.minDegree, this.maxDegree );

		this.variable = (typeof variable !== "undefined") ? variable : "x";

		this.name = name || "f";

		this.findMaxDegree = function( coefs ) {
			if ( !coefs ) {
				for ( var i = this.maxDegree; i >= this.minDegree; i-- ) {
					if ( this.coefs[i] !== 0 ) {
						return i;
					}
				}
			} else {
				for ( var i = coefs.length - 1; i >= 0; i-- ) {
					if ( coefs[i] !== 0 ) {
						return i;
					}
				}
				return -1;
			}
		};

		this.findMinDegree = function( coefs ) {
			if ( !coefs ) {
				for ( var i = this.minDegree; i <= this.maxDegree; i++ ) {
					if ( this.coefs[i] !== 0 ) {
						return i;
					}
				}
			} else {
				for ( var i = 0; i < coefs.length; i++ ) {
					if ( coefs[i] !== 0 ) {
						return i;
					}
				}
				return -1;
			}
		};

		this.expr = function( vari ) {
			if ( typeof vari === "undefined" ) {
				vari = this.variable;
			}

			var expr = ["+"];

			for ( var i = this.maxDegree; i >= this.minDegree; i-- ) {
				var theTerm = term( this.coefs[i], vari, i );

				if ( theTerm != null ) {
					expr.push( theTerm );
				}
			}

			return expr;
		};

		this.getNumberOfTerms = function() {

			// -1 as the first term in the expression for a polynomial is always a "+"
			return this.expr().length - 1 ; 

		};

		this.getCoefAndDegreeForTerm = function( termIndex ) { 
			
			//returns the coef and degree for a particular term
			var numberOfTerms = this.getNumberOfTerms();

			//mod twice to always get positive
			termIndex = ( ( termIndex % numberOfTerms ) + numberOfTerms ) % numberOfTerms;

			//upshift by one due to "+" sign at the front of the expression
			return extractFromExpr( this.expr()[ termIndex + 1 ] );

		};

		this.text = function() {
			return KhanUtil.expr( this.expr( this.variable ) );
		};

		this.toString = this.text;

		this.hintEvalOf = function( val ) {
			return KhanUtil.expr( this.expr( val ) );
		};

		this.evalOf = function( val ) {
			return KhanUtil.expr( this.expr( val ), true );
		};

		this.hint = function( val ) {
			var hints = [];
			hints.push( "<p><code>" + this.name+"("+val+") = " +
				this.hintEvalOf( val ) + "</code></p>" );
			hints.push( "<p><code>" + this.name+"("+val+") = " +
				this.evalOf( val ) + "</code></p>" );

			return hints;
		};

		// Adds two polynomials
		// It assumes the second polynomial's variable is the same as the first polynomial's
		// Does not change the polynomials, returns the result
		this.add = function( polynomial ) {
			var coefs = [];
			var minDegree = Math.min( this.minDegree, polynomial.minDegree );
			var maxDegree = Math.max( this.maxDegree, polynomial.maxDegree );

			for ( var i = minDegree; i <= maxDegree; i++ ) {
				var value = 0;

				value += i <= this.maxDegree ? this.coefs[ i ] : 0;
				value += i <= polynomial.maxDegree ? polynomial.coefs[ i ] : 0;

				coefs[ i ] = value;
			}

			return new KhanUtil.Polynomial(minDegree, maxDegree, coefs, this.variable );
		};

		// Subtracts polynomial from this
		// It assumes the second polynomial's variable is the same as the first polynomial's
		// Does not change the polynomials, returns the result
		this.subtract = function( polynomial ) {
			return this.add( polynomial.multiply(-1) )
		}

		// Multiply a polynomial by a number or other polynomial
		this.multiply = function( value ) {
			var coefs = [];
			if ( typeof value === "number" ) {

				for ( var i = 0; i < this.coefs.length; i++ ) {
					coefs[ i ] = this.coefs[ i ] * value;
				}

				return new KhanUtil.Polynomial( this.minDegree, this.maxDegree, coefs, this.variable );

			// Assume if it's not a number it's a polynomial
			} else {
				for ( var i = this.minDegree; i <= this.maxDegree; i++ ) {
					if ( this.coefs[ i ] === 0 ) {
						continue;
					}
					for ( var j = value.minDegree; j <= value.maxDegree; j++ ) {
						if ( value.coefs[ j ] === 0 ) {
							continue;
						}

						var coef = this.coefs[ i ] * value.coefs[ j ];

						if ( coefs[ i + j ] === undefined ) {
							coefs[ i + j ] = coef; 
						} else {
							coefs[ i + j ] += coef; 
						}
					}
				}

				// Fill in any missing values of coefs with 0s
				for ( var i = 0; i < coefs.length; i++ ) {
					if ( coefs[ i ] === undefined ) {
						coefs[ i ] = 0;
					}
				}

				return new KhanUtil.Polynomial( Math.min( this.minDegree, value.minDegree ), coefs.length, coefs, this.variable );
			}
		}

		return this;
	},

	CompositePolynomial: function( minDegree, maxDegree, coefs, variable, name,
			composed, composedCoef ) {
		var base = new KhanUtil.Polynomial( 
			minDegree, maxDegree, coefs, variable, name );

		jQuery.extend(this, base);

		if ( !composedCoef ) {
			composedCoef = KhanUtil.randRangeNonZero( -5, 5 );
		}
		var composedFunc = composed.name+"("+this.variable+")";

		var tackOn = function( expr, tack ) {
			expr = jQuery.merge( [], expr );

			if ( expr[0] === "+" ) {
				expr.push( tack );
			} else {
				expr = [ "+", expr, tack ];
			}

			return expr;
		};

		this.expr = function( vari ) {
			return tackOn( base.expr( vari ), ["*", composedCoef, composedFunc] );
		};

		this.text = function() {
			return KhanUtil.expr( this.expr( this.variable ) );
		};

		this.toString = this.text;

		this.hintEvalOf = function( val, evalInner ) {
			if ( evalInner ) {

				return KhanUtil.expr( tackOn( base.expr( val ), 
					["*", composedCoef, composed.evalOf( val )] ) );

			} else {

				return KhanUtil.expr( tackOn( base.expr( val ), 
					["*", composedCoef, composed.name+"("+val+")"] ) );

			}
		};

		this.evalOf = function( val ) {
			return base.evalOf( val ) + composedCoef * composed.evalOf( val );
		};

		this.hint = function( val ) {
			var hints = [];
			hints.push( "<p><code>" + this.name + "(" + val + ") = " +
				this.hintEvalOf(val) + "</code></p>" );

			var composedFuncWithVal = composed.name+"("+val+")";

			hints.push( "<p>To solve for the value of <code>" + this.name + "</code>,"
				+ "we need to solve for the value of <code>"
				+ composedFuncWithVal + "</code>.</p>" );

			hints = hints.concat( composed.hint( val ) );

			hints.push( "<p>Okay, so <code>" + composedFuncWithVal + " = " +
				composed.evalOf(val) + "</code>.</p>" );

			hints.push( "<p>That means <code>" + this.name + "(" + val + ") = " +
				this.hintEvalOf(val, true) + "</code></p>" );

			hints.push( "<p><code>" + this.name+"("+val+") = " +
				this.evalOf( val ) + "</code></p>" );

			return hints;

		};

		return this;

	},

	randCoefs: function randCoefs( minDegree, maxDegree ) {
		var coefs = [];
		var allZero = true;

		for ( var i = maxDegree; i >= minDegree; i-- ) {
			coefs[i] = KhanUtil.randRange( -7, 7 );
			allZero = allZero && coefs[i] === 0;
		}

		return allZero ? randCoefs( minDegree, maxDegree ) : coefs;
	}
});
;
jQuery.extend(KhanUtil, {
	/* coinFlips( 2 ) returns
	 * [["HH", 2], ["HT", 1], ["TH", 1], ["TT", 0]] */
	coinFlips: function( n ) {
		if ( n === 0 ) {
			return [ ["", 0] ];
		} else {
			var preceding = KhanUtil.coinFlips( n - 1 );

			var andAHead = jQuery.map(preceding, function(_arg, i) {
				var seq = _arg[0];
				var h = _arg[1];
				return [["H" + seq, h + 1]];
			});

			var andATail = jQuery.map(preceding, function(_arg, i) {
				var seq = _arg[0];
				var h = _arg[1];
				return [["T" + seq, h]];
			});

			return andAHead.concat(andATail);
		}
	},

	/* returns binomial coefficient (n choose k) or
	 * sum of choose(n, i) for i in k:
	 * choose( 4, [0, 1, 2] ) = 1 + 4 + 6 = 11 */
	choose: function( n, k ) {
		if ( typeof k === "number" ) {
			if ( k * 2 > n ) {
				return KhanUtil.choose( n, n - k );
			} else if ( k > 0.5 ) {
				return KhanUtil.choose( n, k - 1 ) * (n - k + 1) / (k);
			} else if( Math.abs( k ) <= 0.5 ) {
				return 1;
			} else {
				return 0;
			}
		} else {
			var sum = 0;
			jQuery.each(k, function( ind, elem ) {
				sum += KhanUtil.choose( n, elem );
			});
			return sum;
		}
	}
});
;
/*!
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
(function () {
    function R() {
        if (R.is(arguments[0], array)) {
            var a = arguments[0],
                cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                res = cnv.set();
            for (var i = 0, ii = a[length]; i < ii; i++) {
                var j = a[i] || {};
                elements[has](j.type) && res[push](cnv[j.type]().attr(j));
            }
            return res;
        }
        return create[apply](R, arguments);
    }
    R.version = "1.5.2";
    var separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        doc = document,
        win = window,
        oldRaphael = {
            was: Object[proto][has].call(win, "Raphael"),
            is: win.Raphael
        },
        Paper = function () {
            this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        join = "join",
        length = "length",
        lowerCase = Str[proto].toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object[proto][toString],
        paper = {},
        push = "push",
        ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        ms = " progid:DXImageTransform.Microsoft",
        upperCase = Str[proto].toUpperCase,
        availableAttrs = {blur: 0, "clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {along: "along", blur: nu, "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace",
        animKeyFrames= /^(from|to|\d+%?)$/,
        commaSpaces = /\s*,\s*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
        radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
        sortByKey = function (a, b) {
            return a.key - b.key;
        };

    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return R.type = null;
        }
        d = null;
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    paperproto = Paper[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        return  (type == "null" && o === null) ||
                (type == typeof o) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return ((x < 0) * 180 + math.atan(-y / -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [],
            i = 0;
        for (; i < 32; i++) {
            s[i] = (~~(math.random() * 16))[toString](16);
        }
        s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = ((s[16] & 3) | 8)[toString](16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        return "r-" + s[join]("");
    }

    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color)[rp](trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    };
    R.hsb2rgb = function (h, s, b, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            b = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        return R.hsl2rgb(h, s, b / 2, o);
    };
    R.hsl2rgb = function (h, s, l, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        var rgb = {},
            channels = ["r", "g", "b"],
            t2, t1, t3, r, g, b;
        if (!s) {
            rgb = {
                r: l,
                g: l,
                b: l
            };
        } else {
            if (l < .5) {
                t2 = l * (1 + s);
            } else {
                t2 = l + s - l * s;
            }
            t1 = 2 * l - t2;
            for (var i = 0; i < 3; i++) {
                t3 = h + 1 / 3 * -(i - 1);
                t3 < 0 && t3++;
                t3 > 1 && t3--;
                if (t3 * 6 < 1) {
                    rgb[channels[i]] = t1 + (t2 - t1) * 6 * t3;
                } else if (t3 * 2 < 1) {
                    rgb[channels[i]] = t2;
                } else if (t3 * 3 < 2) {
                    rgb[channels[i]] = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                } else {
                    rgb[channels[i]] = t1;
                }
            }
        }
        rgb.r *= 255;
        rgb.g *= 255;
        rgb.b *= 255;
        rgb.hex = "#" + (16777216 | rgb.b | (rgb.g << 8) | (rgb.r << 16)).toString(16).slice(1);
        R.is(o, "finite") && (rgb.opacity = o);
        rgb.toString = rgbtoString;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max, toString: hsbtoString};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness, toString: hsbtoString};
    };
    R.rgb2hsl = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            h,
            s,
            l = (max + min) / 2,
            hsl;
        if (min == max) {
            hsl =  {h: 0, s: 0, l: l};
        } else {
            var delta = max - min;
            s = l < .5 ? delta / (max + min) : delta / (2 - max - min);
            if (red == max) {
                h = (green - blue) / delta;
            } else if (green == max) {
                h = 2 + (blue - red) / delta;
            } else {
                h = 4 + (red - green) / delta;
            }
            h /= 6;
            h < 0 && h++;
            h > 1 && h--;
            hsl = {h: h, s: s, l: l};
        }
        hsl.toString = hsltoString;
        return hsl;
    };
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            Str(pathString)[rp](pathCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](pathValues, function (a, b) {
                    b && params[push](+b);
                });
                if (name == "m" && params[length] > 2) {
                    data[push]([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
            y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
            ax = (1 - t) * p1x + t * c1x,
            ay = (1 - t) * p1y + t * c1y,
            cx = (1 - t) * c2x + t * p2x,
            cy = (1 - t) * c2y + t * p2y,
            alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0,
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = res[i][res[i][length] - 2];
                        my = res[i][res[i][length] - 1];
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join]()[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function (x, y, w, h) {
            var container;
            if (R.is(x, string) || R.is(x, "object")) {
                container = R.is(x, string) ? doc.getElementById(x) : x;
                if (container.tagName) {
                    if (y == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: y, height: w};
                    }
                }
            } else {
                return {container: 1, x: x, y: y, width: w, height: h};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) {
                if (add[has](prop) && !(prop in con)) {
                    switch (typeof add[prop]) {
                        case "function":
                            (function (f) {
                                con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                            })(add[prop]);
                        break;
                        case "object":
                            con[prop] = con[prop] || {};
                            plugins.call(this, con[prop], add[prop]);
                        break;
                        default:
                            con[prop] = add[prop];
                        break;
                    }
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        removed = function (methodname) {
            return function () {
                throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
            };
        };
    R.pathToRelative = pathToRelative;
    // SVG
    if (R.svg) {
        paperproto.svgns = "http://www.w3.org/2000/svg";
        paperproto.xlink = "http://www.w3.org/1999/xlink";
        round = function (num) {
            return +num + (~~num === num) * .5;
        };
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) {
                    if (attr[has](key)) {
                        el[setAttribute](key, Str(attr[key]));
                    }
                }
            } else {
                el = doc.createElementNS(paperproto.svgns, el);
                el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                return el;
            }
        };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = Str(gradient)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * PI / 180), math.sin(angle * PI / 180)],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var id = o.getAttribute(fillString);
            id = id.match(/^url\(#(.*)\)$/);
            id && SVG.defs.removeChild(doc.getElementById(id[1]));

            var el = $(type + "Gradient");
            el.id = createUUID();
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            }
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = Str(rot)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) {
                if (params[has](att)) {
                    if (!availableAttrs[has](att)) {
                        continue;
                    }
                    var value = params[att];
                    attrs[att] = value;
                    switch (att) {
                        case "blur":
                            o.blur(value);
                            break;
                        case "rotation":
                            o.rotate(value, true);
                            break;
                        case "href":
                        case "title":
                        case "target":
                            var pn = node.parentNode;
                            if (lowerCase.call(pn.tagName) != "a") {
                                var hl = $("a");
                                pn.insertBefore(hl, node);
                                hl[appendChild](node);
                                pn = hl;
                            }
                            if (att == "target" && value == "blank") {
                                pn.setAttributeNS(o.paper.xlink, "show", "new");
                            } else {
                                pn.setAttributeNS(o.paper.xlink, att, value);
                            }
                            break;
                        case "cursor":
                            node.style.cursor = value;
                            break;
                        case "clip-rect":
                            var rect = Str(value)[split](separator);
                            if (rect[length] == 4) {
                                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                var el = $("clipPath"),
                                    rc = $("rect");
                                el.id = createUUID();
                                $(rc, {
                                    x: rect[0],
                                    y: rect[1],
                                    width: rect[2],
                                    height: rect[3]
                                });
                                el[appendChild](rc);
                                o.paper.defs[appendChild](el);
                                $(node, {"clip-path": "url(#" + el.id + ")"});
                                o.clip = rc;
                            }
                            if (!value) {
                                var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        break;
                        case "path":
                            if (o.type == "path") {
                                $(node, {d: value ? attrs.path = pathToAbsolute(value) : "M0,0"});
                            }
                            break;
                        case "width":
                            node[setAttribute](att, value);
                            if (attrs.fx) {
                                att = "x";
                                value = attrs.x;
                            } else {
                                break;
                            }
                        case "x":
                            if (attrs.fx) {
                                value = -attrs.x - (attrs.width || 0);
                            }
                        case "rx":
                            if (att == "rx" && o.type == "rect") {
                                break;
                            }
                        case "cx":
                            rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "height":
                            node[setAttribute](att, value);
                            if (attrs.fy) {
                                att = "y";
                                value = attrs.y;
                            } else {
                                break;
                            }
                        case "y":
                            if (attrs.fy) {
                                value = -attrs.y - (attrs.height || 0);
                            }
                        case "ry":
                            if (att == "ry" && o.type == "rect") {
                                break;
                            }
                        case "cy":
                            rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "r":
                            if (o.type == "rect") {
                                $(node, {rx: value, ry: value});
                            } else {
                                node[setAttribute](att, value);
                            }
                            break;
                        case "src":
                            if (o.type == "image") {
                                node.setAttributeNS(o.paper.xlink, "href", value);
                            }
                            break;
                        case "stroke-width":
                            node.style.strokeWidth = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            if (attrs["stroke-dasharray"]) {
                                addDashes(o, attrs["stroke-dasharray"]);
                            }
                            break;
                        case "stroke-dasharray":
                            addDashes(o, value);
                            break;
                        case "translation":
                            var xy = Str(value)[split](separator);
                            xy[0] = +xy[0] || 0;
                            xy[1] = +xy[1] || 0;
                            if (rotxy) {
                                rotxy[1] += xy[0];
                                rotxy[2] += xy[1];
                            }
                            translate.call(o, xy[0], xy[1]);
                            break;
                        case "scale":
                            xy = Str(value)[split](separator);
                            o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, isNaN(toFloat(xy[2])) ? null : +xy[2], isNaN(toFloat(xy[3])) ? null : +xy[3]);
                            break;
                        case fillString:
                            var isURL = Str(value).match(ISURL);
                            if (isURL) {
                                el = $("pattern");
                                var ig = $("image");
                                el.id = createUUID();
                                $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                $(ig, {x: 0, y: 0});
                                ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                                el[appendChild](ig);

                                var img = doc.createElement("img");
                                img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                                img.onload = function () {
                                    $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                    $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                    doc.body.removeChild(this);
                                    o.paper.safari();
                                };
                                doc.body[appendChild](img);
                                img.src = isURL[1];
                                o.paper.defs[appendChild](el);
                                node.style.fill = "url(#" + el.id + ")";
                                $(node, {fill: "url(#" + el.id + ")"});
                                o.pattern = el;
                                o.pattern && updatePosition(o);
                                break;
                            }
                            var clr = R.getRGB(value);
                            if (!clr.error) {
                                delete params.gradient;
                                delete attrs.gradient;
                                !R.is(attrs.opacity, "undefined") &&
                                    R.is(params.opacity, "undefined") &&
                                    $(node, {opacity: attrs.opacity});
                                !R.is(attrs["fill-opacity"], "undefined") &&
                                    R.is(params["fill-opacity"], "undefined") &&
                                    $(node, {"fill-opacity": attrs["fill-opacity"]});
                            } else if ((({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                                attrs.gradient = value;
                                attrs.fill = "none";
                                break;
                            }
                            clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        case "stroke":
                            clr = R.getRGB(value);
                            node[setAttribute](att, clr.hex);
                            att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            break;
                        case "gradient":
                            (({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper);
                            break;
                        case "opacity":
                            if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                            }
                            // fall
                        case "fill-opacity":
                            if (attrs.gradient) {
                                var gradient = doc.getElementById(node.getAttribute(fillString)[rp](/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                                }
                                break;
                            }
                        default:
                            att == "font-size" && (value = toInt(value, 10) + "px");
                            var cssrule = att[rp](/(\-.)/g, function (w) {
                                return upperCase.call(w.substring(1));
                            });
                            node.style[cssrule] = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            break;
                    }
                }
            }

            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2,
        tuneText = function (el, params) {
            if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

            if (params[has]("text")) {
                a.text = params.text;
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = Str(params.text)[split]("\n");
                for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                    var tspan = $("tspan");
                    i && $(tspan, {dy: fontSize * leading, x: a.x});
                    tspan[appendChild](doc.createTextNode(texts[i]));
                    node[appendChild](tspan);
                }
            } else {
                texts = node.getElementsByTagName("tspan");
                for (i = 0, ii = texts[length]; i < ii; i++) {
                    i && $(texts[i], {dy: fontSize * leading, x: a.x});
                }
            }
            $(node, {y: a.y});
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && R.is(dif, "finite") && $(node, {y: a.y + dif});
        },
        Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, cx: 0, cy: 0},
                sx: 1,
                sy: 1
            };
            !svg.bottom && (svg.bottom = this);
            this.prev = svg.top;
            svg.top && (svg.top.next = this);
            svg.top = this;
            this.next = null;
        };
        var elproto = Element[proto];
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null && cx !== false) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, string)) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (value == null && R.is(name, array)) {
                var values = {};
                for (var j = 0, jj = name.length; j < jj; j++) {
                    values[name[j]] = this.attr(name[j]);
                }
                return values;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        Element[proto].blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                    blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
        };
        var theCircle = function (svg, x, y, r) {
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        },
        theRect = function (svg, x, y, w, h, r) {
            var el = $("rect");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        },
        theEllipse = function (svg, x, y, rx, ry) {
            var el = $("ellipse");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        },
        theImage = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(svg.xlink, "href", src);
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        },
        theText = function (svg, x, y, text) {
            var el = $("text");
            $(el, {x: x, y: y, "text-anchor": "middle"});
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        },
        setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas[setAttribute]("width", this.width);
            this.canvas[setAttribute]("height", this.height);
            return this;
        },
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            var cnvs = $("svg");
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            $(cnvs, {
                xmlns: "http://www.w3.org/2000/svg",
                version: 1.1,
                width: width,
                height: height
            });
            if (container == 1) {
                cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                doc.body[appendChild](cnvs);
            } else {
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container[appendChild](cnvs);
                }
            }
            container = new Paper;
            container.width = width;
            container.height = height;
            container.canvas = cnvs;
            plugins.call(container, container, R.fn);
            container.clear();
            return container;
        };
        paperproto.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paperproto.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }

    // VML
    if (R.vml) {
        var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
            bites = /([clmz]),?([^clmz]*)/gi,
            blurregexp = / progid:\S+Blur\([^\)]+\)/g,
            val = /-?[^,\s-]+/g,
            coordsize = 1e3 + S + 1e3,
            zoom = 10,
            pathlike = {path: 1, rect: 1},
            path2vml = function (path) {
                var total =  /[ahqstv]/ig,
                    command = pathToAbsolute;
                Str(path).match(total) && (command = path2curve);
                total = /[clmz]/g;
                if (command == pathToAbsolute && !Str(path).match(total)) {
                    var res = Str(path)[rp](bites, function (all, command, args) {
                        var vals = [],
                            isMove = lowerCase.call(command) == "m",
                            res = map[command];
                        args[rp](val, function (value) {
                            if (isMove && vals[length] == 2) {
                                res += vals + map[command == "m" ? "l" : "L"];
                                vals = [];
                            }
                            vals[push](round(value * zoom));
                        });
                        return res + vals;
                    });
                    return res;
                }
                var pa = command(path), p, r;
                res = [];
                for (var i = 0, ii = pa[length]; i < ii; i++) {
                    p = pa[i];
                    r = lowerCase.call(pa[i][0]);
                    r == "z" && (r = "x");
                    for (var j = 1, jj = p[length]; j < jj; j++) {
                        r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                    }
                    res[push](r);
                }
                return res[join](S);
            };

        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        thePath = function (pathString, vml) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = vml.width + "px";
            ol.height = vml.height + "px";
            el.coordsize = coordsize;
            el.coordorigin = vml.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, vml),
                attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas[appendChild](g);
            return p;
        };
        setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                newpath = (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
                res = o;

            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            if (newpath) {
                a.path = rectPath(a.x, a.y, a.width, a.height, a.r);
                o.X = a.x;
                o.Y = a.y;
                o.W = a.width;
                o.H = a.height;
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            "blur" in params && o.blur(params.blur);
            if (params.path && o.type == "path" || newpath) {
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = Str(params.translation)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = Str(params.scale)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = Str(params["clip-rect"])[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = ms + ".Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null ||
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName(fillString) && node.getElementsByTagName(fillString)[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode(fillString));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                    opacity = mmin(mmax(opacity, 0), 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                var strokeColor = R.getRGB(params.stroke);
                stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                var width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity = mmin(mmax(opacity, 0), 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;

                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = Str(res.node.string)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);

                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill,
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = Str(gradient)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = o.getElementsByTagName(fillString)[0] || createNode(fillString);
            !fill.parentNode && o.appendChild(fill);
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join]() : "0% " + fill.color);
                if (type == "radial") {
                    fill.type = "gradientradial";
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.type = "gradient";
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        elproto = Element[proto];
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName(fillString);
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        elproto.setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "rect":
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2, t;
            gs.left != (t = left + "px") && (gs.left = t);
            gs.top != (t = top + "px") && (gs.top = t);
            this.X = pathlike[has](this.type) ? -left : x;
            this.Y = pathlike[has](this.type) ? -top : y;
            this.W = w;
            this.H = h;
            if (pathlike[has](this.type)) {
                os.left != (t = -left * zoom + "px") && (os.left = t);
                os.top != (t = -top * zoom + "px") && (os.top = t);
            } else if (this.type == "text") {
                os.left != (t = -left + "px") && (os.left = t);
                os.top != (t = -top + "px") && (os.top = t);
            } else {
                gs.width != (t = this.paper.width + "px") && (gs.width = t);
                gs.height != (t = this.paper.height + "px") && (gs.height = t);
                os.left != (t = x - left + "px") && (os.left = t);
                os.top != (t = y - top + "px") && (os.top = t);
                os.width != (t = w + "px") && (os.width = t);
                os.height != (t = h + "px") && (os.height = t);
            }
        };
        elproto.hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        elproto.getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (pathlike[has](this.type)) {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (this.attrs && value == null && R.is(name, array)) {
                var ii, values = {};
                for (i = 0, ii = name[length]; i < ii; i++) {
                    values[name[i]] = this.attr(name[i]);
                }
                return values;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            if (params) {
                for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || Str(params.gradient).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (!pathlike[has](this.type) || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[element.length - 1];
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[0];
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
        };

        theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        function rectPath(x, y, w, h, r) {
            if (r) {
                return R.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", x + r, y, w - r * 2, r, -r, h - r * 2, r * 2 - w, r * 2 - h);
            } else {
                return R.format("M{0},{1}l{2},0,0,{3},{4},0z", x, y, w, h, -w);
            }
        }
        theRect = function (vml, x, y, w, h, r) {
            var path = rectPath(x, y, w, h, r),
                res = vml.path(path),
                a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x * 10), round(y * 10), round(x * 10) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = Str(text);
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        var createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        paperproto.clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        paperproto.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
            return true;
        };
    }

    // rest
    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP")) {
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            win.setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = function () {};
    }

    // Events
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type;
                var f = function (e) {
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || win.event;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
            scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            x += scrollX;
            y += scrollY;
            dragi.move && dragi.move.call(dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            dragi.end && dragi.end.call(dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    };
    for (var i = events[length]; i--;) {
        (function (eventName) {
            R[eventName] = Element[proto][eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this._drag = {};
        this.mousedown(function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            onstart && onstart.call(start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move: onmove, end: onend, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
        });
        return this;
    };
    elproto.undrag = function (onmove, onstart, onend) {
        var i = drag.length;
        while (i--) {
            drag[i].el == this && (drag[i].move == onmove && drag[i].end == onend) && drag.splice(i++, 1);
        }
        !drag.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    paperproto.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paperproto.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paperproto.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paperproto.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paperproto.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, Str(text));
    };
    paperproto.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paperproto.setSize = setSize;
    paperproto.top = paperproto.bottom = null;
    paperproto.raphael = R;
    function x_y() {
        return this.x + S + this.y;
    }
    elproto.resetScale = function () {
        if (this.removed) {
            return this;
        }
        this._.sx = 1;
        this._.sy = 1;
        this.attrs.scale = "1 1";
    };
    elproto.scale = function (x, y, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = abs(x / this._.sx),
                ky = abs(y / this._.sy);
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var posx = this._.sx > 0,
                posy = this._.sy > 0,
                dirx = ~~(x / abs(x)),
                diry = ~~(y / abs(y)),
                dkx = kx * dirx,
                dky = ky * diry,
                s = this.node.style,
                ncx = cx + abs(rcx - cx) * dkx * (rcx > cx == posx ? 1 : -1),
                ncy = cy + abs(rcy - cy) * dky * (rcy > cy == posy ? 1 : -1),
                fr = (x * dirx > y * diry ? ky : kx);
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * kx,
                        newh = a.height * ky;
                    this.attr({
                        height: newh,
                        r: a.r * fr,
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * kx,
                        ry: a.ry * ky,
                        r: a.r * fr,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "text":
                    this.attr({
                        x: ncx,
                        y: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true,
                        fx = posx ? dkx : kx,
                        fy = posy ? dky : ky;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= fx;
                            p[path[i][length] - 1] *= fy;
                            p[1] *= kx;
                            p[2] *= ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (var j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fy;
                            }
                         } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? fx : fy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path);
                    dx = ncx - dim2.x - dim2.width / 2;
                    dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = ms + ".Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        // Is this a straight line?
        // Added for huge speed improvements
        if ( p1x === c1x && p1y === c1y && c2x === p2x && c2y == p2y ) {
            var dx = p2x - p1x, dy = p2y - p1y;
            var totalLength = Math.sqrt( dx * dx + dy * dy );

            if ( length == null ) {
                return totalLength;
            } else {
                var fract = length / totalLength;
                return {
                    start: { x: p1x, y: p1y },
                    m: { x: p1x, y: p1y },
                    n: { x: p2x, y: p2y },
                    end: { x: p2x, y: p2y },
                    x: p1x + fract * dx,
                    y: p1y + fract * dy,
                    alpha: (90 - math.atan(dx / dy) * 180 / PI)
                };
            }
        }

        var len = 0,
            precision = 100,
            name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
            cache = curveslengths[name],
            old, dot;
        !cache && (curveslengths[name] = cache = {data: []});
        cache.timer && clearTimeout(cache.timer);
        cache.timer = setTimeout(function () {delete curveslengths[name];}, 2000);
        if (length != null) {
            var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
            precision = ~~total * 10;
        }
        for (var i = 0; i < precision + 1; i++) {
            if (cache.data[length] > i) {
                dot = cache.data[i * precision];
            } else {
                dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                cache.data[i] = dot;
            }
            i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
            if (length != null && len >= length) {
                return dot;
            }
            old = dot;
        }
        if (length == null) {
            return len;
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        if (abs(this.getTotalLength() - to) < "1e-6") {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = [],
        animation = function () {
            var Now = +new Date;
            for (var l = 0; l < animationElements[length]; l++) {
                var e = animationElements[l];
                if (e.stop || e.el.removed) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "along":
                                now = pos * ms * diff[attr];
                                to.back && (now = to.len - now);
                                var point = getPointAtLength(to[attr], now);
                                that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                diff.x = point.x;
                                diff.y = point.y;
                                that.translate(point.x - diff.sx, point.y - diff.sy);
                                to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                break;
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = pos * ms * diff[attr][0] - t.x,
                                            y = pos * ms * diff[attr][1] - t.y;
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                    break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                    break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                    break;
                                    case "clip-rect":
                                        now = [];
                                        i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                    break;
                                }
                                break;
                            default:
                              var from2 = [].concat(from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    if (to.along) {
                        point = getPointAtLength(to.along, to.len * !to.back);
                        that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                        to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                    }
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale += E);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        keyframesRun = function (attr, element, time, prev, prevcallback) {
            var dif = time - prev;
            element.timeouts.push(setTimeout(function () {
                R.is(prevcallback, "function") && prevcallback.call(element);
                element.animate(attr, dif, attr.easing);
            }, prev));
        },
        upto255 = function (color) {
            return mmax(mmin(color, 255), 0);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty, toString: x_y};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                break;
            }
            return this;
        };
    elproto.animateWith = function (element, params, ms, easing, callback) {
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].el.id == element.id) {
                params.start = animationElements[i].start;
            }
        }
        return this.animate(params, ms, easing, callback);
    };
    elproto.animateAlong = along();
    elproto.animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        element.timeouts = element.timeouts || [];
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var from = {},
            to = {},
            animateable = false,
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                animateable = true;
                from[attr] = element.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]);
                        var point = getPointAtLength(params[attr], len * !!params.back);
                        var bb = element.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(element.rotate()) || 0);
                        break;
                    case nu:
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = Str(params[attr])[split](separator),
                            from2 = Str(from[attr])[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                            break;
                            case "clip-rect":
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [];
                                i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            break;
                        }
                        to[attr] = values;
                        break;
                    default:
                        values = [].concat(params[attr]);
                        from2 = [].concat(from[attr]);
                        diff[attr] = [];
                        i = element.paper.customAttributes[attr][length];
                        while (i--) {
                            diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                        }
                        break;
                }
            }
        }
        if (!animateable) {
            var attrs = [],
                lastcall;
            for (var key in params) if (params[has](key) && animKeyFrames.test(key)) {
                attr = {value: params[key]};
                key == "from" && (key = 0);
                key == "to" && (key = 100);
                attr.key = toInt(key, 10);
                attrs.push(attr);
            }
            attrs.sort(sortByKey);
            if (attrs[0].key) {
                attrs.unshift({key: 0, value: element.attrs});
            }
            for (i = 0, ii = attrs[length]; i < ii; i++) {
                keyframesRun(attrs[i].value, element, ms / 100 * attrs[i].key, ms / 100 * (attrs[i - 1] && attrs[i - 1].key || 0), attrs[i - 1] && attrs[i - 1].value.callback);
            }
            lastcall = attrs[attrs[length] - 1].value.callback;
            if (lastcall) {
                element.timeouts.push(setTimeout(function () {lastcall.call(element);}, ms));
            }
        } else {
            var easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy[length] == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = function (t) {
                        return t;
                    };
                }
            }
            animationElements.push({
                start: params.start || +new Date,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                t: {x: 0, y: 0}
            });
            R.is(callback, "function") && (element._ac = setTimeout(function () {
                callback.call(element);
            }, ms));
            animationElements[length] == 1 && setTimeout(animation);
        }
        return this;
    };
    elproto.stop = function () {
        for (var i = 0; i < animationElements.length; i++) {
            animationElements[i].el.id == this.id && animationElements.splice(i--, 1);
        }
        for (i = 0, ii = this.timeouts && this.timeouts.length; i < ii; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
        clearTimeout(this._ac);
        delete this._ac;
        return this;
    };
    elproto.translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    elproto[toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;

    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in elproto) if (elproto[has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            item,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(params, ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, params, ms, easing, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    Set[proto].clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items[length]; i < ii; i++) {
            s[push](this.items[i].clone());
        }
        return s;
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
            letters = Str(string)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args[length] - 1 && (token = token[rp](formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        oldRaphael.was ? (win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    R.el = elproto;
    R.st = Set[proto];

    oldRaphael.was ? (win.Raphael = R) : (Raphael = R);
})();
;
function Scratchpad( elem ){
	var pen = 'M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z';
	var clear = 'M23.024,5.673c-1.744-1.694-3.625-3.051-5.168-3.236c-0.084-0.012-0.171-0.019-0.263-0.021H7.438c-0.162,0-0.322,0.063-0.436,0.18C6.889,2.71,6.822,2.87,6.822,3.033v25.75c0,0.162,0.063,0.317,0.18,0.435c0.117,0.116,0.271,0.179,0.436,0.179h18.364c0.162,0,0.317-0.062,0.434-0.179c0.117-0.117,0.182-0.272,0.182-0.435V11.648C26.382,9.659,24.824,7.49,23.024,5.673zM22.157,6.545c0.805,0.786,1.529,1.676,2.069,2.534c-0.468-0.185-0.959-0.322-1.42-0.431c-1.015-0.228-2.008-0.32-2.625-0.357c0.003-0.133,0.004-0.283,0.004-0.446c0-0.869-0.055-2.108-0.356-3.2c-0.003-0.01-0.005-0.02-0.009-0.03C20.584,5.119,21.416,5.788,22.157,6.545zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z';
	var erase = 'M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248';
	var undo = 'M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z';
	var accept = "M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308";

	var mobilesafari = /AppleWebKit.*Mobile/.test(navigator.userAgent);
	var container = jQuery( elem );

	var pad = Raphael( container[0], container.width(), container.height() );

	this.resize = function() {
		pad.setSize( container.width(), container.height() );
	};

	$('body').bind('selectstart', function(e) {
		return false;
	});

	var palette = pad.set(), stroke = '#000000', colors = ["#000000", "#3f3f3f", "#7f7f7f", "#bfbfbf", "#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#00ffff", "#007fff", "#0000ff", "#7f00ff"];
	for(var i = 0; i < colors.length; i++){
		(function(color){
			var setcolor = function(e){
				stroke = color
				palette.animate({x: 7}, 100)
				this.animate({x: 15}, 100)
				penclick()
			};
			palette.push(pad.rect(7, 90 + i * 24, 24, 24).attr({
				fill: color,
				stroke: ''
				}).touchstart(setcolor).click(setcolor));
		})(colors[i])
	}
	palette[0].attr({x: 15});

	var selected = pad.rect(2, 2, 30, 30).attr({
		r: 5,
		stroke: '',
		fill: 'rgba(30, 157, 186, 0.5)'
	});

	var line_default = {
		'stroke-width': 2,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round'};

	var shapes = pad.set();
	var history = [[]];

	function saveState(){
		for(var i = 0, state = []; i < shapes.length; i++){
			if(!shapes[i].removed){
				if(shapes[i].type == 'path'){
					state.push({
						path: shapes[i].attr('path').toString(),
						stroke: shapes[i].attr('stroke'),
						type: 'path'
					});
				}
			}
		}
		history.push(state);
	}

	function loadState(state){
		shapes.remove();
		for(var i = 0; i < state.length; i++){
			if(state[i].type == 'path'){
				shapes.push(pad.path(state[i].path).attr(line_default).attr('stroke', state[i].stroke))
			}
		}
	}

	/*
	* Hi. I did this with VectorEdtor, so I guess I'll try to do the same here with scratchpad
	* If someone is there, reading this code, in the distant future, say, the year 2012 and you
	* are, as any sensible human would, be preparing for the mayan-predicted impending apocalypse,
	* (or not) it doesn't matter. You should totally email me at antimatter15@gmail.com because,
	* it's always an interesting feeling.
	*/

	var tools = pad.set();

	tools.push(pad.path(pen).scale(0.8).translate(0,0))
	tools.push(pad.path(erase).translate(0,30))
	tools.push(pad.path(undo).scale(0.7).translate(1,60))

	var tool = "draw";
	function penclick(){
		selected.animate({y: 2}, 100);
		tool = "draw";
	}
	pad.rect(2, 2, 30, 30)
		.attr({
			stroke: '',
			fill: 'black',
			'fill-opacity': 0
		})
		.click(penclick).touchstart(penclick);
	function eraseclick(){
		selected.animate({y: 2 + 30}, 100);
		tool = "erase";
	}
	pad.rect(2, 2+30, 30, 30)
		.attr({
			stroke: '',
			fill: 'black',
			'fill-opacity': 0
		})
		.click(eraseclick).touchstart(eraseclick);
	function undoclick(){
		loadState(history.pop())
	}
	pad.rect(2, 2+30*2, 30, 30)
		.attr({
			stroke: '',
			fill: 'black',
			'fill-opacity': 0
		})
		.click(undoclick).touchstart(undoclick);

	tools.attr({fill: '#000', stroke: 'none'});
	var path = null, pathstr = '';
	var eraser = null;

	function mousedown(X,Y,e){
		if(!X || !Y || !e) return;

		if(eraser){
			eraser.remove();
			eraser = null;
		}
		saveState();
		var startlen = shapes.length;

		if(X > 40){
			if(tool == 'draw'){
				startPen(X, Y)
			}else if(tool == 'erase'){
				eraser = pad.rect(X, Y, 0, 0).attr({"fill-opacity": 0.15,
				"stroke-opacity": 0.5,
				"fill": "#ff0000", //oh noes! its red and gonna asplodes!
				"stroke": "#ff0000"});
				eraser.sx = X;
				eraser.sy = Y;
			}
		}
		if(shapes.length == startlen){
			history.pop();
		}
	}

	function startPen(x, y){
		path = pad.path("M"+x+","+y).attr(line_default).attr({
			stroke: stroke
		});
		pathstr = path.attr('path');
		shapes.push(path);
	}

	function rectsIntersect(r1, r2) {
		return r2.x < (r1.x+r1.width) &&
			(r2.x+r2.width) > r1.x &&
			r2.y < (r1.y+r1.height) &&
			(r2.y+r2.height) > r1.y;
	}


	function smoothPath(str){
		var parts = str.toString().split("L");
		var start = parts[0].substr(1).split(',')
		var lastx = +start[0], lasty = +start[1];
		var np = parts[0];
		var lastdist = 0;
		for(var i = 1; i < parts.length; i++){
			var p = parts[i].split(',');
			var dist = (Math.pow(+p[0] - lastx,2) +Math.pow(+p[1] - lasty, 2));
			if(dist > 10 || dist < lastdist|| i == parts.length -1){
				np += "L"+parts[i];
				lasty = p[1];
				lastx = p[0];
			}
			lastdist = dist;
		}
		return np
	}

	function mouseup(){
		if(path){
			path.attr('path', smoothPath(pathstr));
		}
		path = null;
		if(tool == 'erase' && eraser){
			saveState();
			var ebox = eraser.getBBox();
			for(var i = 0; i < shapes.length; i++){
				if(rectsIntersect(ebox, shapes[i].getBBox())){
					shapes[i].remove();
				}
			}
			eraser.animate({'fill-opacity': 0}, 100, function(){
				eraser.remove();
				eraser = null;
			});
		}

	}

	function mousemove(X,Y){
			if(X <= 40) return;
			if(path && tool == 'draw'){
				pathstr += 'L'+X+','+Y
				path.attr('path', pathstr);
			}else if(tool == 'erase' && eraser){
				var x1 = Math.min(X, eraser.sx),
				y1 = Math.min(Y, eraser.sy),
				x2 = Math.max(X, eraser.sx),
				y2 = Math.max(Y, eraser.sy);
				eraser.attr({
					x: x1,
					y: y1,
					width: x2 - x1,
					height: y2 - y1
				});
			}
	}

	container.mousemove(function(e){
		var offset = jQuery( container ).offset();
		mousemove( e.pageX - offset.left, e.pageY - offset.top );
		e.preventDefault();
	});
	container.mousedown(function(e){
		var offset = jQuery( container ).offset();
		mousedown(e.pageX - offset.left, e.pageY - offset.top, e);
		e.preventDefault();

		$(document).one("mouseup", function(e){
			mouseup();
			e.preventDefault();
		});
	});

	container.bind('touchstart', function(e){
		var offset = jQuery( container ).offset();
		mousedown(e.originalEvent.touches[0].pageX - offset.left, e.originalEvent.touches[0].pageY - offset.top, e.originalEvent);
		e.preventDefault();
	});
	container.bind('touchmove', function(e){
		var offset = jQuery( container ).offset();
		mousemove(e.originalEvent.touches[0].pageX - offset.left, e.originalEvent.touches[0].pageY - offset.top)
		e.preventDefault();
	});
	container.bind('touchend', function(e){
		mouseup();
		e.preventDefault();
	});

	this.clear = function() {
		shapes.remove();
	}
}
;
// Helper for fractions_cut_and_copy_1 and fractions_cut_and_copy_2
jQuery.extend( KhanUtil, {
	initSliceClone: function( goalBlocks ) {
		KhanUtil.pieces = 1;
		KhanUtil.times = {};
		for ( var i = 0; i < goalBlocks.length; i++ ) {
			KhanUtil.times[ goalBlocks[ i ] ] = 1;
		}
	},

	// Change the number of pieces the starting block
	// is sliced into.
	changePieces: function( increase ) {
		if ( KhanUtil.pieces === 1 && !increase ) {
			return;
		}

		KhanUtil.pieces += ( increase ) ? 1 : -1;

		jQuery( "#pieces" ).text( KhanUtil.plural(KhanUtil.pieces, "stukje") ); 

		KhanUtil.currentGraph = jQuery( "#problemarea" ).find( "#parent_block" ).data( "graphie" );
		rectchart( [ 1, KhanUtil.pieces - 1 ], ["#e00", "#999" ] );

		KhanUtil.updateGraphAndAnswer();
	},

	// Change the number of times the slice is copied.
	changeTimes: function( increase, id ) {
		if ( KhanUtil.times[ id ] === 1 && !increase ) {
			return;
		}

		KhanUtil.times[ id ] += ( increase ) ? 1 : -1;

		jQuery( "#" + id + "_times" ).text( KhanUtil.plural(KhanUtil.times[ id ], "keer") );

		KhanUtil.updateGraphAndAnswer();
	},

	updateGraphAndAnswer: function() {
		var pieces = KhanUtil.pieces;
		var times;
		for ( var id in KhanUtil.times ) {
			times = KhanUtil.times[ id ];
			KhanUtil.currentGraph = jQuery( "#problemarea" ).find( "#" + id ).data( "graphie" );
			KhanUtil.currentGraph.init({ range: [ [ 0, 1 ], [ 0, 1 ] ],scale: [ 600 / pieces * times, 25 ] });
			rectchart( [ times, 0 ], ["#e00", "#999" ] );
			jQuery( "#" + id + "_answer input" ).val( KhanUtil.roundTo(3, times / pieces) );
		}
	}
});
;
jQuery.extend(KhanUtil, {
	sum: function( values ) {
		var sum = 0;

		$.each(values, function( index, value ) {
			sum += value;
		});
		return sum;
	},

	mean: function( values ) {
		return KhanUtil.sum( values ) / values.length;
	},

	median: function( values ) {
		var sortedInts, median;
		sortedInts = KhanUtil.sortNumbers( values );

		if ( values.length % 2 === 0 ) {
			median = KhanUtil.roundTo( 1,
				( sortedInts[(values.length / 2) - 1] + sortedInts[values.length / 2] ) / 2 );
		} else {
			median = sortedInts[ Math.floor( values.length / 2 ) ];
		}
		return median;
	},

	mode: function( values ) {
		var numInstances = [];
		var modeInstances = -1;

		var mode;
		for ( var i = 0; i < values.length; i++ ) {
			if ( !numInstances[ values[i] ] ) {
				numInstances[ values[i] ] = 1;
			} else {
				numInstances[ values[i] ] += 1;
				if ( numInstances[ values[i] ] > modeInstances ) {
					modeInstances = numInstances[ values[i] ];
					mode = values[i];
				}
			}
		}

		// iterate again to check for 'no mode'
		for ( var i = 0; i < numInstances.length; i++ ) {
			if ( numInstances[i] ) {
				if ( i !== mode && numInstances[i] >= modeInstances ) {
					return false;
				}
			}
		}

		return mode;
	}
});
;
(function() {

// Keep the template variables private, to prevent external access
var VARS = {};

jQuery.tmpl = {
	// Processors that act based on element attributes
	attr: {
		"data-ensure": function( elem, ensure ) {
			// Returns a function in order to run after other templating and var assignment
			return function( elem ) {
				// Return a boolean corresponding to the ensure's value
				// False means all templating will be run again, so new values will be chosen
				return !!(ensure && jQuery.tmpl.getVAR( ensure ));
			};
		},

		"data-if": function( elem, value ) {
			var $elem = jQuery( elem );

			value = value && jQuery.tmpl.getVAR( value );

			// Save the result of this data-if in the next sibling for data-else-if and data-else
			$elem.next().data( "lastCond", value );

			if ( !value ) {
				// Delete the element if the data-if evaluated to false
				return [];
			}
		},

		"data-else-if": function( elem, value ) {
			var $elem = jQuery( elem );

			var lastCond = $elem.data( "lastCond" );

			// Show this element iff the preceding element was hidden AND this data-if returns truthily
			value = !lastCond && value && jQuery.tmpl.getVAR( value );

			// Succeeding elements care about the visibility of both me and my preceding siblings
			$elem.next().data( "lastCond", lastCond || value );

			if ( !value ) {
				// Delete the element if appropriate
				return [];
			}
		},

		"data-else": function( elem ) {
			var $elem = jQuery( elem );

			if ( $elem.data( "lastCond" ) ) {
				// Delete the element if the data-if of the preceding element was true
				return [];
			}
		},

		"data-each": function( elem, value ) {
			var match;

			// Remove the data-each attribute so it doesn't end up in the generated elements
			jQuery( elem ).removeAttr( "data-each" );

			// HINT_COUNT times
			// HINT_COUNT times as INDEX
			if ( (match = /^(.+) times(?: as (\w+))?$/.exec( value )) ) {
				var times = jQuery.tmpl.getVAR( match[1] );

				return {
					items: jQuery.map( new Array( times ), function ( e, i ) { return i; } ),
					value: match[2],
					oldValue: VARS[ match[2] ]
				}

			// Extract the 1, 2, or 3 parts of the data-each attribute, which could be
			//   - items
			//   - items as value
			//   - items as pos, value
			} else if ( (match = /^(.*?)(?: as (?:(\w+), )?(\w+))?$/.exec( value )) ) {
				// See "if ( ret.items )" in traverse() for the other half of the data-each code
				return {
					// The collection which we'll iterate through
					items: jQuery.tmpl.getVAR( match[1] ),

					// "value" and "pos" as strings
					value: match[3],
					pos: match[2],

					// Save the values of the iterator variables so we don't permanently overwrite them
					oldValue: VARS[ match[3] ],
					oldPos: VARS[ match[2] ]
				};
			}
		},

		"data-unwrap": function( elem ) {
			return jQuery( elem ).contents();
		}
	},

	// Processors that act based on tag names
	type: {
		"var": function( elem, value ) {
			// When called by process(), value is undefined

			// If the <var> has any child elements, run later with the innerHTML
			// Use jQuery instead of getElementsByTagName to exclude comment nodes in IE
			if ( !value && jQuery( elem ).children().length > 0 ) {
				return function( elem ) {
					return jQuery.tmpl.type["var"]( elem, elem.innerHTML );
				};
			}

			// Evaluate the contents of the <var> as a JS string
			value = value || jQuery.tmpl.getVAR( elem );

			// If an ID was specified then we're going to save the value
			var name = elem.id;
			if ( name ) {

				// Utility function for VARS[ name ] = value, warning if the name overshadows a KhanUtil property
				var setVAR = function( name, value ) {
					if ( KhanUtil[ name ] ) {
						Khan.error( "Defining variable '" + name + "' overwrites utility property of same name." );
					}

					VARS[ name ] = value;
				};

				// Destructure the array if appropriate
				if ( name.indexOf( "," ) !== -1 ) {
					// Nested arrays are not supported
					var parts = name.split(/\s*,\s*/);

					jQuery.each( parts, function( i, part ) {
						// Ignore empty parts
						if ( part.length > 0 ) {
							setVAR( part, value[i] );
						}
					});

				// Just a normal assignment
				} else {
					setVAR( name, value );
				}

			// No value was specified so we replace it with a text node of the value
			} else {
				if ( value == null ) {
					// Don't show anything
					return [];
				} else {
					// Convert the value to a string and replace with those elements and text nodes
					// Add a space so that it can end with a "<" in Safari
					var div = jQuery( "<div>" );
					var html = div.append( value + " " ).html();
					return div.html( html.slice( 0, -1 ) ).contents();
				}
			}
		},

		code: function( elem ) {
			// Returns a function in order to run after other templating and var assignment
			return function( elem ) {
				if ( typeof elem.MathJax === "undefined" ) {
					var $elem = jQuery( elem );

					// Maintain the classes from the original element
					if ( elem.className ) {
						$elem.wrap( "<span class='" + elem.className + "'></span>" );
					}

					// Trick MathJax into thinking that we're dealing with a script block
					elem.type = "math/tex";

					// Make sure that the old value isn't being displayed anymore
					elem.style.display = "none";

					// Clean up any strange mathematical expressions
					var text = $elem.text();
					$elem.text( KhanUtil.cleanMath ? KhanUtil.cleanMath( text ) : text );

					// Stick the processing request onto the queue
					if ( typeof MathJax !== "undefined" ) {
						MathJax.Hub.Queue([ "Typeset", MathJax.Hub, elem ]);
					}
				} else {
					MathJax.Hub.Queue([ "Reprocess", MathJax.Hub, elem ]);
				}
			};
		}
	},

	// Eval a string in the context of Math, KhanUtil, VARS, and optionally another passed context
	getVAR: function( elem, ctx ) {
		// We need to compute the value
		var code = elem.nodeName ? jQuery(elem).text() : elem;

		// Make sure any HTML formatting is stripped
		code = jQuery.trim( jQuery.tmpl.cleanHTML( code ) );

		// If no extra context was passed, use an empty object
		if ( ctx == null ) {
			ctx = {};
		}

		try {
			// Use the methods from JavaScript's built-in Math methods
			with ( Math ) {
				// And the methods provided by the library
				with ( KhanUtil ) {
					// And the passed-in context
					with ( ctx ) {
						// And all the computed variables
						with ( VARS ) {
							return eval( "(function() { return (" + code + "); })()" );
						}
					}
				}
			}

		} catch ( e ) {
			var info;

			if ( elem.nodeName ) {
				info = elem.nodeName.toLowerCase();

				if ( elem.id != null && elem.id.length > 0 ) {
					info += "#" + elem.id;
				}
			} else {
				info = JSON.stringify( code );
			}

			Khan.error( "Error while evaluating " + info, e );
		}
	},

	// Make sure any HTML formatting is stripped
	cleanHTML: function( text ) {
		return text.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
	}
};

if ( typeof KhanUtil !== "undefined" ) {
	KhanUtil.tmpl = jQuery.tmpl;
}

// Reinitialize VARS for each problem
jQuery.fn.tmplLoad = function( problem, info ) {
	VARS = {};

	// Check to see if we're in test mode
	if ( info.testMode ) {
		// Expose the variables if we're in test mode
		jQuery.tmpl.VARS = VARS;
	}
};

jQuery.fn.tmplCleanup = function() {
	this.find( "code" ).each( function() {
		MathJax.Hub.getJaxFor( this ).Remove();
	} );
};

jQuery.fn.tmpl = function() {
	// Call traverse() for each element in the jQuery object
	for ( var i = 0, l = this.length; i < l; i++ ) {
		traverse( this[i] );
	}

	return this;

	// Walk through the element and its descendants, process()-ing each one using the processors defined above
	function traverse( elem ) {
		// Array of functions to run after doing the rest of the processing
		var post = [],

			// Live NodeList of child nodes to traverse if we don't remove/replace this element
			child = elem.childNodes,

			// Result of running the attribute and tag processors on the element
			ret = process( elem, post );

		// If false, rerun all templating (like data-ensure)
		if ( ret === false ) {
			return traverse( elem );

		// If undefined, do nothing
		} else if ( ret === undefined ) {
			;

		// If a (possibly-empty) array of nodes, replace this one with those
		// The type of ret is checked to ensure it is not a function
		} else if ( typeof ret === "object" && typeof ret.length !== "undefined" ) {
			if ( elem.parentNode ) {
				// All nodes must be inserted before any are traversed
				jQuery.each( ret, function( i, rep ) {
					if ( rep.nodeType ) {
						elem.parentNode.insertBefore( rep, elem );
					}
				} );

				jQuery.each( ret, function( i, rep ) {
					traverse( rep );
				} );

				elem.parentNode.removeChild( elem );
			}

			return null;

		// If { items: ... }, this is a data-each loop
		} else if ( ret.items ) {
			// We need these references to insert the elements in the appropriate places
			var origParent = elem.parentNode,
				origNext = elem.nextSibling;

			// Loop though the given array
			jQuery.each( ret.items, function( pos, value ) {
				// Set the value if appropriate
				if ( ret.value ) {
					VARS[ ret.value ] = value;
				}

				// Set the position if appropriate
				if ( ret.pos ) {
					VARS[ ret.pos ] = pos;
				}

				// Do a deep clone (including event handlers and data) of the element
				var clone = jQuery( elem ).clone( true )
					.removeAttr( "data-each" ).removeData( "each" )[0];

				// Prepend all conditional statements with a declaration of ret.value
				// and ret.post and an assignment of their current values so that
				// the conditional will still make sense even when outside of the
				// data-each context
				var conditionals = [ "data-if", "data-else-if", "data-else" ];

				var declarations = "";
				declarations += ( ret.pos ) ? "var " + ret.pos + " = " + JSON.stringify( pos ) + ";" : "";
				declarations += ( ret.value ) ? "var " + ret.value + " = " + JSON.stringify( value ) + ";" : "";

				for ( var i = 0; i < conditionals.length; i++ ) {
					var conditional = conditionals[i];
					jQuery( clone ).find( "[" + conditional + "]" ).each(function() {
						var code = jQuery( this ).attr( conditional );
						code = "(function() {  " + declarations + " return " + code + " })()";
						jQuery( this ).attr( conditional, code );
					});
				}

				// Do the same for graphie code
				jQuery( clone ).find( ".graphie" ).andSelf().filter( ".graphie" ).each(function() {
					var code = jQuery( this ).text();
					jQuery( this ).text( declarations + code );
				});

				// Insert in the proper place (depends on whether the loops is the last of its siblings)
				if ( origNext ) {
					origParent.insertBefore( clone, origNext );
				} else {
					origParent.appendChild( clone );
				}

				// Run all templating on the new element
				traverse( clone );
			});

			// Restore the old value of the value variable, if it had one
			if ( ret.value ) {
				VARS[ ret.value ] = ret.oldValue;
			}

			// Restore the old value of the position variable, if it had one
			if ( ret.pos ) {
				VARS[ ret.pos ] = ret.oldPos;
			}

			// Remove the loop element and its handlers now that we've processed it
			jQuery( elem ).remove();

			// Say that the element was removed so that child traversal doesn't skip anything
			return null;
		}

		// Loop through the element's children if it was not removed
		for ( var i = 0; i < child.length; i++ ) {
			// Traverse the child; decrement the counter if the child was removed
			if ( child[i].nodeType === 1 && traverse( child[i] ) === null ) {
				i--;
			}
		}

		// Run through each post-processing function
		for ( var i = 0, l = post.length; i < l; i++ ) {
			// If false, rerun all templating (for data-ensure and <code> math)
			if ( post[i]( elem ) === false ) {
				return traverse( elem );
			}
		}

		return elem;
	}

	// Run through the attr and type processors, return as soon as one of them is decisive about a plan of action
	function process( elem, post ) {
		var ret, newElem,
			$elem = jQuery( elem );

		// Look through each of the attr processors, see if our element has the matching attribute
		for ( var attr in jQuery.tmpl.attr ) {
			var value;

			if ( ( /^data-/ ).test( attr ) ) {
				value = $elem.data( attr.replace( /^data-/, "" ) );
			} else {
				value = $elem.attr( attr );
			}

			if ( value !== undefined ) {
				ret = jQuery.tmpl.attr[ attr ]( elem, value );

				// If a function, run after all of the other templating
				if ( typeof ret === "function" ) {
					post.push( ret );

				// Return anything else (boolean, array of nodes for replacement, object for data-each)
				} else if ( ret !== undefined ) {
					return ret;
				}
			}
		}

		// Look up the processor based on the tag name
		var type = elem.nodeName.toLowerCase();
		if ( jQuery.tmpl.type[ type ] != null ) {
			ret = jQuery.tmpl.type[ type ]( elem );

			// If a function, run after all of the other templating
			if ( typeof ret === "function" ) {
				post.push( ret );
			}
		}

		return ret;
	}
};

jQuery.extend( jQuery.expr[":"], {
	inherited: function(el) {
		return jQuery( el ).data( "inherited" );
	}
} );

jQuery.fn.extend({
	tmplApply: function( options ) {
		options = options || {};

		// Get the attribute which we'll be checking, defaults to "id"
		// but "class" is sometimes used
		var attribute = options.attribute || "id",

			// Figure out the way in which the application will occur
			defaultApply = options.defaultApply || "replace",

			// Store for elements to be used later
			parent = {};

		return this.each(function() {
			var $this = jQuery( this ),
				name = $this.attr( attribute ),
				hint = $this.data( "apply" ) && !$this.data( "apply" ).indexOf( "hint" );

			// Only operate on the element if it has the attribute that we're using
			if ( name ) {
				// The inheritance only works if we've seen an element already
				// that matches the particular name and we're not looking at hint
				// templating
				if ( name in parent && !hint ) {
					// Get the method through which we'll be doing the application
					// You can specify an application style directly on the sub-element
					parent[ name ] = jQuery.tmplApplyMethods[ $this.data( "apply" ) || defaultApply ]

						// Call it with the context of the parent and the sub-element itself
						.call( parent[ name ], this );

					if ( parent[ name ] == null ) {
						delete parent[ name ];
					}

				// Store the parent element for later use if it was inherited from somewhere else
				} else if ( $this.closest( ":inherited" ).length > 0 ) {
					parent[ name ] = this;
				}
			}
		});
	}
});

jQuery.extend({
	// These methods should be called with context being the parent
	// and first argument being the child.
	tmplApplyMethods: {
		// Removes both the parent and the child
		remove: function( elem ) {
			jQuery( this ).remove();
			jQuery( elem ).remove();
		},

		// Replaces the parent with the child
		replace: function( elem ) {
			jQuery( this ).replaceWith( elem );
			return elem;
		},

		// Replaces the parent with the child's content. Useful when
		// needed to replace an element without introducing additional
		// wrappers.
		splice: function( elem ) {
			jQuery( this ).replaceWith( jQuery( elem ).contents() );
		},

		// Appends the child element to the parent element
		append: function( elem ) {
			jQuery( this ).append( elem );
			return this;
		},

		// Appends the child element's contents to the parent element.
		appendContents: function( elem ) {
			jQuery( this ).append( jQuery( elem ).contents() );
			jQuery( elem ).remove();
			return this;
		},

		// Prepends the child element to the parent.
		prepend: function( elem ) {
			jQuery( this ).prepend( elem );
			return this;
		},

		// Prepends the child element's contents to the parent element.
		prependContents: function( elem ) {
			jQuery( this ).prepend( jQuery( elem ).contents() );
			jQuery( elem ).remove();
			return this;
		},

		// Insert child before the parent.
		before: function( elem ) {
			jQuery( this ).before( elem );
			return this;
		},

		// Insert child's contents before the parent.
		beforeContents: function( elem ) {
			jQuery( this ).before( jQuery( elem ).contents() );
			jQuery( elem ).remove();
			return this;
		},

		// Insert child after the parent.
		after: function( elem ) {
			jQuery( this ).after( elem );
			return this;
		},

		// Insert child's contents after the parent.
		afterContents: function( elem ) {
			jQuery( this ).after( jQuery( elem ).contents() );
			jQuery( elem ).remove();
			return this;
		},

		// Like appendContents but also merges the data-ensures
		appendVars: function( elem ) {
			var parentEnsure = jQuery( this ).data("ensure") || "1";
			var childEnsure = jQuery( elem ).data("ensure") || "1";
			jQuery( this ).data("ensure",
				"(" + parentEnsure + ") && (" + childEnsure + ")");

			return jQuery.tmplApplyMethods.appendContents.call( this, elem );
		}
	}
});

})();
;
// Example usage:
// <var>person(1)</var> traveled 5 mi by <var>vehicle(1)</var>. Let
// <var>his(1)</var> average speed be <var>personVar(1)</var>.
// Let <var>person(2)</var>'s speed be <var>personVar(2)</var>.
//
// Note that initials (-Var) are guaranteed to be unique in each category,
// but not across them.

jQuery.extend( KhanUtil, {
	toSentence: function( array, conjunction ) {
		if ( conjunction == null ) {
			conjunction = "en";
		}

		if ( array.length === 0 ) {
			return "";
		} else if ( array.length === 1 ) {
			return array[0];
		} else if ( array.length === 2 ) {
			return array[0] + " " + conjunction + " " + array[1];
		} else {
			return array.slice(0, -1).join(", ") + ", " + conjunction + " " + array[ array.length - 1 ];
		}
	},

	toSentenceTex: function( array, conjunction, highlight, highlightClass ) {
		var wrapped = jQuery.map( array, function( elem ) {
			if ( ( jQuery.isFunction( highlight ) && highlight( elem ) ) || ( highlight !== undefined && elem === highlight ) ) {
				return "<code class='" + highlightClass + "'>" + elem + "</code>";
			}
			return "<code>" + elem + "</code>";
		});
		return KhanUtil.toSentence( wrapped, conjunction );
	},

	// pluralization helper.  There are five signatures
	// - plural(NUMBER): return "s" if NUMBER is not 1
	// - plural(NUMBER, singular):
	//		- if necessary, magically pluralize <singular>
	//		- return "NUMBER word"
	// - plural(NUMBER, singular, plural): bijvoorbeeld plural (x, "paard","paarden") Als X=1: 1 paard, als x=5 5 paarden
	//		- return "NUMBER word"
	// - plural(singular, NUMBER):
	//		- if necessary, magically pluralize <singular>
	//		- return "word"
	// - plural(singular, plural, NUMBER): bijvoorbeeld plural ("paard","paarden",x) Als X=1: paard, als x=5: paarden
	//		- return "word"
	plural: (function() {
		var oneOffs = {
			'quiz': 'quizzes',
			'plank': 'planken',
			'rij': 'rijen',
			'druif': 'druiven',
			'is': 'zijn',
			'was': 'waren',
			'tomaat': 'tomaten',
			'banaan':'bananen',
			'kokosnoot':'kokosnoten',
			'kiwi':'kiwi\'s',
			'citroen':'citroenen',
			'mango':'mango\'s',
			'watermeloen':'watermeloenen',
			'pen':'pennen',
			'potlood':'potloden',
			'schrift':'schriften',
			'zaag':'zagen',
			'brood':'broden',
			'pak melk':'pakken melk',
			'knuffelbeer':'knuffelberen',
			'pop':'poppen',
			'taart':'taarten',
			'pizza':'pizza\'s',
			'persoon':'personen',
			'auto':'auto\'s',
			'boom':'bomen',
			'hele getal':'hele getallen',
			'tiental':'tientallen',
			'honderdtal':'honderdtallen',
			'duizendtal':'duizendtallen',
			'broek':'broeken',
			'riem':'riemen',
			'ketting':'kettingen',
			'stropdas':'stropdassen',
			'trui':'truien',
			'jas':'jassen',
			'keer':'keer'
		};

		var pluralizeWord = function(word) {

			// noone really needs extra spaces at the edges, do they?
			word = jQuery.trim( word );

			// determine if our word is all caps.  If so, we'll need to
			// re-capitalize at the end
			var isUpperCase = (word.toUpperCase() === word);
			var oneOff = oneOffs[word.toLowerCase()];
			var words = word.split(/\s+/);

			// first handle simple one-offs
			// ({}).watch is a function in Firefox, blargh
			if ( typeof oneOff === "string" ) {
				return oneOff;
			}

			// multiple words
			else if ( words.length > 1 ) {
				// for 3-word phrases where the middle word is 'in' or 'of',
				// pluralize the first word
				if ( words.length === 3 && /\b(in|of)\b/i.test(words[1]) ) {
					words[0] = KhanUtil.plural( words[0] );
				}

				// otherwise, just pluraize the last word
				else {
					words[ words.length-1 ] =
						KhanUtil.plural( words[ words.length-1 ] );
				}

				return words.join(" ");
			}

			// single words
			else {
				// "-y" => "-ies"
				if ( /[^aeiou]y$/i.test( word ) ) {
					word = word.replace(/y$/i, "ies");
				}

				// add "es"; things like "fish" => "fishes"
				else if ( /[sxz]$/i.test( word ) || /[bcfhjlmnqsvwxyz]h$/.test( word ) ) {
					word += "es";
				}

				// all the rest, just add "s"
				else {
					word += "s";
				}

				if ( isUpperCase ) {
					word = word.toUpperCase();
				}
				return word;
			}
		};

		return function(value, arg1, arg2) {
			if ( typeof value === "number" ) {
				var usePlural = (value !== 1);

				// if no extra args, just add "s" (if plural)
				if ( arguments.length === 1 ) {
					return usePlural ? "s" : "";
				}

				if ( usePlural ) {
					arg1 = arg2 || pluralizeWord(arg1);
				}

				return value + " " + arg1;
			} else if ( typeof value === "string" ) {
				var plural = pluralizeWord(value);
				if ( typeof arg1 === "string" && arguments.length === 3 ) {
					plural = arg1;
					arg1 = arg2;
				}
				var usePlural = (arguments.length < 2 || (typeof arg1 === "number" && arg1 !== 1));
				return usePlural ? plural : value;
			}
		};
	})()
});

jQuery.fn[ "word-problemsLoad" ] = function() {
	var people = KhanUtil.shuffle([
		["Yvonne", "f"],
		["Arco", "m"],
		["Philipp", "m"],
		["Ronald", "m"],
		["Britta", "f"],
		["Pauline", "f"],
		["Josh", "m"],
		["Jessica", "f"],
		["Tjalle", "m"],
		["Diederik", "m"],
		["Julius", "m"],
		["Frum", "f"],
		["Dennis", "m"],
		["Els", "f"],
		["Maud", "f"],
		["Bambi", "f"],
		["Hanneke", "f"],
		["Levi", "m"]
	]);

	var vehicles = KhanUtil.shuffle([
		"fiets",
		"auto",
		"tram",
		"motor",
		"scooter",
		"trein",
		"bus"
	]);

	var courses = KhanUtil.shuffle([
		"algebra",
		"chemistry",
		"geometry",
		"history",
		"physics",
		"Spanish"
	]);

	var exams = KhanUtil.shuffle([
		"examen",
		"toets",
		"quiz"
	]);

	var binops = KhanUtil.shuffle([
		"\\barwedge",
		"\\veebar",
		"\\odot",
		"\\oplus",
		"\\otimes",
		"\\oslash",
		"\\circledcirc",
		"\\boxdot",
		"\\bigtriangleup",
		"\\bigtriangledown",
		"\\dagger",
		"\\diamond",
		"\\star",
		"\\triangleleft",
		"\\triangleright"
	]);

	var collections = KhanUtil.shuffle([
		["stoel", "rij", "maakt"],
		["snoepjes", "zak", "vult"],
		["koekjes", "stapel", "maakt"],
		["boek", "plank", "vult"],
		["blikken soep", "doos", "vult"]
	]);

	var stores = KhanUtil.shuffle([
		{
			name: "kantoorboekhandel",
			items: KhanUtil.shuffle( ["pen", "potlood", "schrift"] )
		},
		{
			name: "gereedschapswinkel",
			items: KhanUtil.shuffle( ["hamer", "spijker", "zaag"] )
		},
		{
			name: "supermarkt",
			items: KhanUtil.shuffle( ["banaan", "brood", "pak melk", "aardappel"] )
		},
		{
			name: "cadeauwinkel",
			items: KhanUtil.shuffle( ["speeltje", "game", "souvenir"] )
		},
		{
			name: "speelgoedwinkel",
			items: KhanUtil.shuffle( ["knuffelbeer", "videospelletje", "autootje", "pop"] )
		}
	]);

	var pizzas = KhanUtil.shuffle([
		"pizza",
		"taart",
		"cake"
	]);

	var timesofday = KhanUtil.shuffle([
		"in de ochtend",
		"in de middag",
		"\'s avonds"
	]);

	var exercises = KhanUtil.shuffle([
		"push-up",
		"sit-up"
	]);

	var fruits = KhanUtil.shuffle([
		"appel",
		"banaan",
		"kokosnoot",
		"kiwi",
		"citroen",
		"mango",
		"nectarine",
		"sinaasappel",
		"watermeloen",
		"druif"
	]);

	var deskItems = KhanUtil.shuffle([
		"schrift",
		"krijtje",
		"gum",
		"map",
		"glue stick",
		"stift",
		"notebook",
		"pen",
		"potlood"
	]);

	var colors = KhanUtil.shuffle([
		"rode",
		"oranje",
		"gele",
		"groene",
		"blauwe",
		"paarse",
		"witte",
		"zwarte",
		"bruine",
		"zilveren",
		"gouden",
		"roze"
	]);

	var schools = KhanUtil.shuffle([
		"Noordwijkse school",
		"Emmaschool",
		"Almond",
		"Covington",
		"Springer",
		"Santa Rita",
		"Oak"
	]);

	var clothes = KhanUtil.shuffle([
		"hoedje",
		"broek",
		"riem",
		"ketting",
		"tasje",
		"bloesje",
		"rokje",
		"horloge",
		"trui",
		"sweater",
		"stropdas",
		"sjaal",
		"jurkje",
		"jas"
	]);

	var sides = KhanUtil.shuffle([
		"linker",
		"rechter"
	]);

	var shirtStyles = KhanUtil.shuffle([
		"lange mouwen",
		"korte mouwen"
	]);

	// animal, avg-lifespan, stddev-lifespan
	// (data is from cursory google searches and wild guessing)
	var animals = KhanUtil.shuffle([
		[ "krokodil", 68, 20 ],
		[ "miereneter", 15, 10 ],
		[ "beer", 40, 20],
		[ "olifant", 60, 10 ],
		[ "gorilla", 20, 5 ],
		[ "leeuw", 12, 5 ],
		[ "hagedis", 3, 1 ],
		[ "stokstaartje", 13, 5 ],
		[ "stekelvarken", 20, 5 ],
		[ "zeehond", 15, 10 ],
		[ "luiaard", 16, 5 ],
		[ "slang", 25, 10 ],
		[ "tijger", 22, 5 ],
		[ "schildpad", 100, 20 ],
		[ "zebra", 25, 10 ]
	]);

	var farmers = KhanUtil.shuffle([
		{farmer:"tuinder", crops:KhanUtil.shuffle(["tomaat", "aardappel", "wortel", "bonen", "mais"]), field:"land"},
		{farmer:"kweker", crops:KhanUtil.shuffle(["roos", "tulp", "narcis", "sneeuwklokje", "lelie"]), field:"kas"}
	]);

	var distances = KhanUtil.shuffle([
		"kilometer"
	]);

	var distanceActivities = KhanUtil.shuffle([
		{present:"rijdt", past:"reed", noun:"fiets", done:"heeft gefietst", continuous:"aan het fietsen"},
		{present:"roeit", past:"roeide", noun:"boot", done:"heeft geroeid", continuous:"aan het roeien"},
		{present:"rijdt", past:"reed", noun:"auto", done:"heeft gereden", continuous:"aan het rijden"},
		{present:"loopt", past:"liep", noun:"hond", done:"heeft gelopen", continuous:"aan het lopen"}
	]);

	var indefiniteArticle = function(word) {
		var vowels = ['a', 'e', 'i', 'o', 'u'];
		if ( _(vowels).indexOf( word[0].toLowerCase() ) > -1 ) {
			return 'An ' + word;
		}
		return 'A ' + word;
	};

	jQuery.extend( KhanUtil, {
		person: function( i ) {
			return people[i - 1][0];
		},

		personVar: function( i ) {
			return people[i - 1][0].charAt(0).toLowerCase();
		},

		he: function( i ) {
			return people[i - 1][1] === "m" ? "hij" : "zij";
		},

		He: function( i ) {
			return people[i - 1][1] === "m" ? "Hij" : "Zij";
		},

		him: function( i ) {
			return people[i - 1][1] === "m" ? "hem" : "haar";
		},

		his: function( i ) {
			return people[i - 1][1] === "m" ? "zijn" : "haar";
		},

		His: function( i ) {
			return people[i - 1][1] === "m" ? "Zijn" : "Haar";
		},


		An: function(word) {
			return indefiniteArticle(word);
		},

		an: function(word) {
			return indefiniteArticle(word).toLowerCase();
		},

		vehicle: function( i ) {
			return vehicles[i - 1];
		},

		vehicleVar: function( i ) {
			return vehicles[i - 1].charAt(0);
		},

		course: function( i ) {
			return courses[i - 1];
		},

		courseVar: function( i ) {
			return courses[i - 1].charAt(0).toLowerCase();
		},

		exam: function( i ) {
			return exams[i - 1];
		},

		binop: function( i ) {
			return binops[i - 1];
		},

		item: function( i ) {
			return collections[i - 1][0];
		},

		group: function( i ) {
				return collections[i - 1][1];
		},

		groupVerb: function( i ) {
			return collections[i - 1][2];
		},

		store: function( i ) {
			return stores[i].name;
		},

		storeItem: function( i, j ) {
			return stores[i].items[j];
		},

		pizza: function( i ) {
			return pizzas[i];
		},

		exercise: function( i ) {
			return exercises[i - 1];
		},

		timeofday: function( i ) {
			return timesofday[i - 1];
		},

		school: function( i ) {
			return schools[i - 1];
		},

		clothing: function( i ) {
			return clothes[i - 1];
		},

		color: function( i ) {
			return colors[i - 1];
		},

		fruit: function( i ) {
			return fruits[i];
		},

		deskItem: function( i ) {
			return deskItems[i];
		},

		distance: function( i ) {
			return distances[i - 1];
		},

		rode: function( i ) {
			return distanceActivities[i - 1].past;
		},

		ride: function( i ) {
			return distanceActivities[i - 1].present;
		},

		bike: function( i ) {
			return distanceActivities[i - 1].noun;
		},

		biked: function( i ) {
			return distanceActivities[i - 1].done;
		},

		biking: function( i ) {
			return distanceActivities[i - 1].continuous;
		},

		farmer: function( i ) {
			return farmers[i - 1].farmer;
		},

		crop: function( i ) {
			return farmers[i - 1].crops[0];
		},

		field: function( i ) {
			return farmers[i - 1].field;
		},

		side: function( i ) {
			return sides[i - 1];
		},

		shirtStyle: function( i ) {
			return shirtStyles[i - 1];
		},

		animal: function( i ) {
			return animals[i - 1][0];
		},

		animalAvgLifespan: function( i ) {
			return animals[i - 1][1];
		},

		animalStddevLifespan: function( i ) {
			return animals[i - 1][2];
		}
	});
};
;
jQuery.extend( KhanUtil, { 
	spin: function( content ) { 
		// First find all top-level blocks and spin them
		var startingBracePos = -1;
		var nestingLevel = 0;

		for ( var i = 0; i < content.length; i++ ) {
			if ( content.charAt( i ) === "{" ) {

				// We encounter our first "{"
				if ( startingBracePos === -1 ) {
					startingBracePos = i;		

				// We are already inside a top-level block, this starts a nested block
				} else {
					nestingLevel++;
				}

			// We encounter a "}" and have seen a "{" before
			} else if ( content.charAt( i ) === "}" && startingBracePos !== -1 ) {

				// This is the closing brace for a top-level block
				if ( nestingLevel === 0 ) {
					// Spin the top-level block
					var spun = KhanUtil.spin( content.substring(startingBracePos + 1, i) );
					content = content.substring( 0, startingBracePos ) + spun + content.substring( i + 1 );
					i -= ( i - startingBracePos ) - spun.length + 1;
					startingBracePos = -1;

				// This brace closes a nested block
				} else {
					nestingLevel--;
				}
			}
		}

		return KhanUtil.randFromArray( content.split("|") );
	}
});


jQuery.fn.spin = function() {
	this.find( ".spin" ).each(function() {
		var spun = KhanUtil.spin( jQuery( this ).html() );
		jQuery( this ).html( spun );
	});
};
;
jQuery.extend( KhanUtil, {
	initUnitCircle: function( degrees ) {
		var graph = KhanUtil.currentGraph;

		// Create a properly scaled 600x600px graph
		var options = {
			xpixels: 600,
			ypixels: 600,
			range: [ [-1.2, 1.2], [-1.2, 1.2] ]
		};
		options.scale = [ options.xpixels/(options.range[0][1] - options.range[0][0]),
		                  options.ypixels/(options.range[1][1] - options.range[1][0]) ];
		graph.init(options);

		// Attach the metrics to the graph for later reference
		graph.xpixels = options.xpixels;
		graph.ypixels = options.ypixels;
		graph.range = options.range;
		graph.scale = options.scale;

		graph.angle = 0;
		graph.revolutions = 0;
		graph.quadrant = 1;

		graph.dragging = false;
		graph.highlight = false;
		graph.degrees = degrees;

		// Axes and circle
		graph.style({
			stroke: "#ddd",
			strokeWidth: 1,
			arrows: "->"
		}, function() {
			graph.circle( [ 0, 0 ], 1 );
			graph.line( [-1.2, 0], [1.2, 0] );
			graph.line( [0, -1.2], [0, 1.2] );
			graph.line( [1.2, 0], [-1.2, 0] );
			graph.line( [0, 1.2], [0, -1.2] );
		});

		// Tick marks at -1, 1
		graph.style({
			strokeWidth: 2
		}, function() {
			graph.line( [ -1, -5 / graph.scale[0] ], [ -1, 5 / graph.scale[0] ] );
			graph.line( [ 1, -5 / graph.scale[0] ], [ 1, 5 / graph.scale[0] ] );
			graph.line( [ -5 / graph.scale[0], -1 ], [ 5 / graph.scale[0], -1 ] );
			graph.line( [ -5 / graph.scale[0], 1 ], [ 5 / graph.scale[0], 1 ] );
		});

		// Declare all the graphic elements that get manipulated each time the angle changes
		graph.triangle = KhanUtil.bogusShape;
		graph.rightangle = KhanUtil.bogusShape;
		graph.spiral = KhanUtil.bogusShape;
		graph.arrow = KhanUtil.bogusShape;
		graph.cosLabel = KhanUtil.bogusShape;
		graph.sinLabel = KhanUtil.bogusShape;
		graph.radiusLabel = KhanUtil.bogusShape;
		graph.angleLabel = KhanUtil.bogusShape;
		graph.angleLines = KhanUtil.bogusShape;

		KhanUtil.initMouseHandlers();
		KhanUtil.setAngle( graph.angle );
	},

	// Not all shapes are needed to depict every angle. If a shape isn't
	// needed, it's replaced with bogusShape which just has stub methods
	// that successfully do nothing.
	// The alternative would be 'if..typeof' checks all over the place.
	bogusShape: {
		animate: function(){},
		attr: function(){},
		remove: function(){}
	},


	initMouseHandlers: function() {
		var graph = KhanUtil.currentGraph;

		// Another SVG element on top of everything else where we can add
		// invisible shapes with mouse handlers wherever we want.
		graph.mouselayer = Raphael( "unitcircle", graph.xpixels, graph.ypixels );
		jQuery( graph.mouselayer.canvas ).css( "z-index", 1 );
		Khan.scratchpad.disable();

		// Visible orange point that gets dragged
		graph.style({
			stroke: KhanUtil.ORANGE,
			fill: KhanUtil.ORANGE
		}, function() {
			graph.dragPoint = graph.circle( [ 1, 0 ], 4 / graph.scale[0] );
		});

		// The invisible circle that gets mouse events.
		graph.mouseTarget = graph.mouselayer.circle(
				(1 - graph.range[0][0]) * graph.scale[0],
				(graph.range[1][1] - 0) * graph.scale[1], 15 );
		graph.mouseTarget.attr({fill: "#000", "opacity": 0.0});

		jQuery( graph.mouseTarget[0] ).css( "cursor", "move" );
		jQuery( graph.mouseTarget[0] ).bind("vmousedown vmouseover vmouseout", function( event ) {
			var graph = KhanUtil.currentGraph;
			if ( event.type === "vmouseover" ) {
				graph.highlight = true;
				if ( !graph.dragging ) {
					KhanUtil.highlightAngle();
				}

			} else if ( event.type === "vmouseout" ) {
				graph.highlight = false;
				if ( !graph.dragging ) {
					KhanUtil.unhighlightAngle();
				}

			} else if ( event.type === "vmousedown" && (event.which === 1 || event.which === 0) ) {
				event.preventDefault();
				jQuery( document ).bind("vmousemove vmouseup", function( event ) {
					event.preventDefault();
					graph.dragging = true;

					// mouseY is in pixels relative to the SVG; coordY is the scaled y-coordinate value
					var mouseY = event.pageY - jQuery( "#unitcircle" ).offset().top;
					var mouseX = event.pageX - jQuery( "#unitcircle" ).offset().left;
					var coordX = (mouseX / graph.scale[0]) + graph.range[0][0];
					var coordY = graph.range[1][1] - mouseY / graph.scale[1];

					if ( event.type === "vmousemove" ) {
						// Find the angle from the origin to the mouse pointer
						var angle;
						if (coordX) {
							angle = Math.atan(coordY / coordX);
						} else {
							// Fill in where atan is undefined
							if (coordY > 0) {
								angle = -Math.PI/2;
							} else {
								angle = -Math.PI/2;
							}
						}

						// Round the angle to the nearest 5 degree increment
						angle = Math.round( angle / (Math.PI/36) ) * (Math.PI/36);

						// Figure out what quadrant the mouse is in. Since atan
						// is only defined in Q1 and Q4 (and is negative in Q4),
						// adjust the angle appropriately to represent the correct
						// positive angle in the unit circle.
						//
						// If moving between Q1 and Q4, keep track of the number of revolutions.
						if (coordX > 0 && coordY >= 0) {
							if (graph.quadrant === 4) {
								++graph.revolutions;
							}
							graph.quadrant = 1;

						} else if (coordX <= 0 && coordY > 0) {
							angle += Math.PI;
							graph.quadrant = 2;

						} else if (coordX < 0 && coordY <= 0) {
							angle += Math.PI;
							graph.quadrant = 3;

						} else if (coordX >= 0 && coordY < 0) {
							angle += 2 * Math.PI;
							if (graph.quadrant === 1) {
								--graph.revolutions;
							}
							graph.quadrant = 4;
						}

						// Limit the number of revolutions to 2 in either direction.
						if (graph.revolutions <= -3) {
							graph.revolutions = -3;
							angle = 2 * Math.PI;
						} else if (graph.revolutions >= 2) {
							graph.revolutions = 2;
							angle = 0;
						}

						// Now ((2pi * revolutions) + angle) represents the full angle
						// Redraw the angle only if it's changed
						if (graph.angle != angle + (graph.revolutions * 2 * Math.PI)) {
							KhanUtil.setAngle( angle + (graph.revolutions * 2 * Math.PI) );
						}

					} else if ( event.type === "vmouseup" ) {
						jQuery( document ).unbind( "vmousemove vmouseup" );
						graph.dragging = false;
						if (!graph.highlight) {
							KhanUtil.unhighlightAngle();
						}
					}
				});
			}
		});

	},


	highlightAngle: function() {
		var graph = KhanUtil.currentGraph;
		graph.dragPoint.animate({ scale: 2 }, 50 );
		graph.angleLines.animate( { stroke: KhanUtil.ORANGE }, 100 );
		graph.spiral.animate({ stroke: KhanUtil.ORANGE }, 100 );
		graph.arrow.animate({ fill: KhanUtil.ORANGE }, 100 );
		jQuery( graph.angleLabel ).animate({ color: KhanUtil.ORANGE }, 100 );
		//jQuery( graph.angleLabel ).css({ color: KhanUtil.ORANGE });
	},


	unhighlightAngle: function() {
		var graph = KhanUtil.currentGraph;
		graph.dragPoint.animate({ scale: 1 }, 50 );
		graph.angleLines.animate( { stroke: KhanUtil.BLUE }, 100 );
		graph.spiral.animate({ stroke: KhanUtil.BLUE }, 100 );
		graph.arrow.animate({ fill: KhanUtil.BLUE }, 100 );
		jQuery( graph.angleLabel ).animate({ color: KhanUtil.BLUE }, 100 );
		//jQuery( graph.angleLabel ).css({ color: KhanUtil.BLUE });
	},


	// Redraw the angle
	setAngle: function( angle ) {
		var graph = KhanUtil.currentGraph;
		graph.angle = angle;

		graph.quadrant = (Math.floor((angle + 10 * Math.PI) / (Math.PI / 2)) % 4) + 1;
		graph.revolutions = Math.floor(angle / (2 * Math.PI));

		// Remove everything dynamic. It should be safe to call remove()
		// on everything since unused stuff should be instances of bogusShape
		graph.triangle.remove();
		graph.rightangle.remove();
		graph.spiral.remove();
		graph.arrow.remove();
		graph.cosLabel.remove();
		graph.sinLabel.remove();
		graph.radiusLabel.remove();
		graph.angleLabel.remove();
		graph.angleLines.remove();

		var highlightColor = KhanUtil.BLUE;
		if (graph.dragging || graph.highlight) {
			highlightColor = KhanUtil.ORANGE;
		}

		// Draw the bold angle lines
		graph.style({ stroke: highlightColor, strokeWidth: 3 });
		graph.angleLines = graph.path([ [ 1, 0 ], [ 0, 0 ], [ Math.cos( angle ), Math.sin( angle ) ] ]);


		graph.style({ stroke: KhanUtil.BLUE, strokeWidth: 1 });
		graph.triangle = graph.path( [ [ 0, 0 ], [ Math.cos( angle ), 0 ], [ Math.cos( angle ), Math.sin( angle ) ], [0, 0] ] );

		var cosText = KhanUtil.roundTo(3, Math.cos(angle));
		var sinText = KhanUtil.roundTo(3, Math.sin(angle));

		// Include radicals for common 45-45-90 and 30-60-90 values
		var prettyAngles = {
			"0.866": "\\frac{\\sqrt{3}}{2}\\;(0.866)",
			"-0.866": "-\\frac{\\sqrt{3}}{2}\\;(-0.866)",
			"0.707": "\\frac{\\sqrt{2}}{2}\\;(0.707)",
			"-0.707": "-\\frac{\\sqrt{2}}{2}\\;(-0.707)",
			"0.5": "\\frac{1}{2}\\;(0.5)",
			"-0.5": "-\\frac{1}{2}\\;(-0.5)"
		};

		cosText = prettyAngles[cosText] ? prettyAngles[cosText] : cosText;
		sinText = prettyAngles[sinText] ? prettyAngles[sinText] : sinText;

		// Position the distance labels and right-angle marker based on quadrant
		if (!(angle % Math.PI)) {
			graph.cosLabel = graph.label( [Math.cos(angle) / 2, 0], cosText, "below" );
		} else if (!(angle % (Math.PI / 2))) {
			graph.sinLabel = graph.label( [Math.cos(angle), Math.sin(angle) / 2], sinText, "right" );
		} else if (graph.quadrant === 1) {
			graph.cosLabel = graph.label( [Math.cos(angle) / 2, 0], cosText, "below" );
			graph.sinLabel = graph.label( [Math.cos(angle), Math.sin(angle) / 2], sinText, "right" );
			graph.radiusLabel = graph.label( [Math.cos(angle) / 2, Math.sin(angle) / 2], 1, "above left" );
			graph.rightangle = graph.path([ [Math.cos(angle) - 0.04, 0], [Math.cos(angle) - 0.04, 0.04], [Math.cos(angle), 0.04] ]);
		} else if (graph.quadrant === 2) {
			graph.cosLabel = graph.label( [Math.cos(angle) / 2, 0], cosText, "below" );
			graph.sinLabel = graph.label( [Math.cos(angle), Math.sin(angle) / 2], sinText, "left"  );
			graph.radiusLabel = graph.label( [Math.cos(angle) / 2, Math.sin(angle) / 2], 1, "above right" );
			graph.rightangle = graph.path([ [Math.cos(angle) + 0.04, 0], [Math.cos(angle) + 0.04, 0.04], [Math.cos(angle), 0.04] ]);
		} else if (graph.quadrant === 3) {
			graph.cosLabel = graph.label( [Math.cos(angle)/2, 0], cosText, "above" );
			graph.sinLabel = graph.label( [Math.cos(angle), Math.sin(angle) / 2], sinText, "left" );
			graph.radiusLabel = graph.label( [Math.cos(angle)/2, Math.sin(angle)/2], 1, "below right" );
			graph.rightangle = graph.path([ [Math.cos(angle) + 0.04, 0], [Math.cos(angle) + 0.04, -0.04], [Math.cos(angle), -0.04] ]);
		} else if (graph.quadrant === 4) {
			graph.cosLabel = graph.label( [Math.cos(angle) / 2, 0], cosText, "above" );
			graph.sinLabel = graph.label( [Math.cos(angle), Math.sin(angle) / 2], sinText, "right" );
			graph.radiusLabel = graph.label( [Math.cos(angle) / 2, Math.sin(angle) / 2 ], 1, "below left" );
			graph.rightangle = graph.path([ [Math.cos(angle) - 0.04, 0], [Math.cos(angle) - 0.04, -0.04], [Math.cos(angle), -0.04] ]);
		}

		// Draw the spiral angle indicator
		var points = [];
		for (var i = 0; i <= 50; ++i) {
			points.push([ Math.cos(i * angle / 50) * (0.1 + ((i * Math.abs(angle) / 50 / Math.PI) * 0.02)),
			              Math.sin(i * angle / 50) * (0.1 + ((i * Math.abs(angle) / 50 / Math.PI) * 0.02)) ]);
		}
		graph.style({ strokeWidth: 2, stroke: highlightColor });

		graph.spiral = graph.path(points);

		// Draw an arrow at the end of the spiral angle indicator
		var spiralEndX = points[50][0];
		var spiralEndY = points[50][1];
		graph.style( { stroke: false, fill: highlightColor }, function() {
			if (angle > Math.PI/12) {
				// positive angles big enough to need an arrow
				graph.arrow = graph.path([ [spiralEndX, spiralEndY - 0.005],
				                           [spiralEndX - 0.02, spiralEndY-0.03],
				                           [spiralEndX + 0.02, spiralEndY-0.03],
				                           [spiralEndX, spiralEndY-0.005] ]);
				graph.arrow.rotate((angle-Math.PI/20) * (-180/Math.PI), (spiralEndX - graph.range[0][0]) * graph.scale[0], (graph.range[1][1] - spiralEndY) * graph.scale[1]);
			} else if (angle < -Math.PI/12) {
				// negative angles "big" enough to need an arrow
				graph.arrow = graph.path([ [spiralEndX, spiralEndY+0.005],
				                           [spiralEndX - 0.02, spiralEndY+0.03],
				                           [spiralEndX + 0.02, spiralEndY+0.03],
				                           [spiralEndX, spiralEndY+0.005] ]);
				graph.arrow.rotate((angle+Math.PI/20) * (-180/Math.PI), (spiralEndX - graph.range[0][0]) * graph.scale[0], (graph.range[1][1] - spiralEndY) * graph.scale[1]);
			} else {
				// no room for an arrow
				graph.arrow = KhanUtil.bogusShape;
			}
		});


		// Figure out how to display the angle
		var angleText = angle;
		if (graph.degrees) {
			angleText *= (180 / Math.PI);
			angleText = Math.round(angleText);
			angleText += "^{\\circ}";
		} else if (-15 < angle && angle < 15 && angle !== 0) {
			angleText = KhanUtil.piFraction( angle );
		}

		// Put the angle value somewhere obvious, but not in the way of anything else. This
		// could probably be improved, but it at least prevents text on top of other text.
		if (angle < -3.5 * Math.PI) {
			graph.angleLabel = graph.label( [-0.2, 0.2], angleText, "center");
		} else if (angle < -0.15 * Math.PI) {
			graph.angleLabel = graph.label( [Math.cos(angle/2)/5, Math.sin(angle/2)/5], angleText, "center");
		} else if (angle < 0.15 * Math.PI) {
			graph.angleLabel = graph.label( [0, 0], angleText, "left");
		} else if (angle < 3.5 * Math.PI) {
			graph.angleLabel = graph.label( [Math.cos(angle/2)/5, Math.sin(angle/2)/5], angleText, "center");
		} else {
			graph.angleLabel = graph.label( [-0.2, -0.2], angleText, "center");
		}
		jQuery( graph.angleLabel ).css("color", highlightColor );


		// Reposition the mouse target and indicator
		graph.mouseTarget.attr("cx", (Math.cos( angle ) - graph.range[0][0]) * graph.scale[0]);
		graph.mouseTarget.attr("cy", (graph.range[1][1] - Math.sin( angle )) * graph.scale[1]);
		graph.dragPoint.attr("cx", (Math.cos( angle ) - graph.range[0][0]) * graph.scale[0]);
		graph.dragPoint.attr("cy", (graph.range[1][1] - Math.sin( angle )) * graph.scale[1]);
		graph.angleLines.toFront();
		graph.dragPoint.toFront();
	},


	goToAngle: function( angle ) {
		var graph = KhanUtil.currentGraph;
		if (graph.degrees) {
			angle *= (Math.PI/180);
		}
		var duration = 1000 * Math.abs(angle - graph.angle) / Math.PI;
		jQuery( graph ).animate({
			angle: angle
		}, {
			duration: duration,
			easing: "linear",
			step: function( now, fx ) {
				KhanUtil.setAngle(now);
			}
		});
	},


	showCoordinates: function( angle ) {
		var graph = KhanUtil.currentGraph;
		if (graph.degrees) {
			angle *= (Math.PI/180);
		}

		var coordText = "(" + KhanUtil.roundTo(3, Math.cos(angle)) + ", " + KhanUtil.roundTo(3, Math.sin(angle)) + ")";

		graph.style( {stroke: 0, fill: KhanUtil.BLUE}, function() {
			graph.circle( [ Math.cos(angle), Math.sin(angle) ], 4 / graph.scale[0] );
		});
		graph.dragPoint.toFront();

		if ( Math.floor(angle / Math.PI) % 2 ) {
			graph.coordLabel = graph.label( [ Math.cos(angle), Math.sin(angle) ], coordText, "below" );
		} else {
			graph.coordLabel = graph.label( [ Math.cos(angle), Math.sin(angle) ], coordText, "above" );
		}

	}

});
