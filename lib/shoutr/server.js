/*
 * shoutr - A decentralized social networking platform
 * 
 * Copyright (C) 2010 Laurent Eschenauer <laurent@eschenauer.be>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

var Connect    = require('connect')
,	Auth	   = require("connect-auth")
,   Flow	   = require("flow")
,	Path 	   = require('path')
,   Shoutr   = require('shoutr')
,	Util	   = require('util');

// Load the various resources controllers
var Controllers = {
		webfinger:  require("./resources/ostatus/webfinger")
,		hcard:	    require("./resources/ostatus/hcard")
,		feed:       require("./resources/ostatus/feed")
,		push:	    require("./resources/ostatus/push")
,		salmon: 	require("./resources/ostatus/salmon")
,		activities: require("./resources/api/activities")
,		profile:    require("./resources/api/profile")
,		friends:    require("./resources/api/friends")
};

// run() is the only public function exported from this module,
// it first prepare the database and then launch the server.
var run = function() {
	Shoutr.database.init(Shoutr.config.database, function(err) {
		_start();
	});
};

var _start = function() {
	var port = Shoutr.config.port || 3000;
	Connect(
			Connect.logger()
		   ,Auth([Auth.Basic({validatePassword: require('./service/auth').authenticate})])
		   ,Connect.router(Controllers.webfinger.routes)
		   ,Connect.router(Controllers.hcard.routes)
		   ,Connect.router(Controllers.push.routes)
		   ,Connect.router(Controllers.feed.routes)
		   ,Connect.router(Controllers.salmon.routes)
		   ,Connect.router(Controllers.activities.routes)
		   ,Connect.router(Controllers.profile.routes)
		   ,Connect.router(Controllers.friends.routes)
	).listen(port);
	
	console.log('Connect server listening on port ' + port);
};

exports.run = run;