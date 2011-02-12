/*
 * Shoutr - A decentralized social networking service
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
,	Mu 	 	   = require('mu')
,	Util	   = require('util');

// Load the various resources controllers
// TODO It would be awesome to auto-discover from the resources folder
var Controllers = {
		webfinger:  require("./resources/ostatus/webfinger")
,		hcard:	    require("./resources/ostatus/hcard")
,		feed:       require("./resources/ostatus/feed")
,		push:	    require("./resources/ostatus/push")
,		activities: require("./resources/api/activities")
,		profile:    require("./resources/api/profile")
};

// run() is the only public function exported from this module,
// it first prepare the database and then launch the server.
var run = function() {
	global.database.init(global.config.database, function(err) {
		_start();
	});
};

var _start = function() {
	var server = Connect.createServer(
            		Auth([Auth.Basic({validatePassword: require('./service/auth').authenticate})]));
	
	// TODO Automatic scanning of the resources/ folder to auto provision the router.
	server.use("/.well-known/host-meta", Connect.router(Controllers.webfinger.host_meta));
	server.use("/webfinger", Connect.router(Controllers.webfinger.user_meta));
	server.use("/hcard", Connect.router(Controllers.hcard.index));
	server.use("/updates", Connect.router(Controllers.feed.index));
	server.use("/push/hub", Connect.router(Controllers.push.hub));
	server.use("/push/inbox", Connect.router(Controllers.push.inbox));
	server.use("/api/activities", Connect.router(Controllers.activities.collection));
	server.use("/api/profile", Connect.router(Controllers.profile.resource));
	server.listen(3000);
	console.log('Connect server listening on port 3000');
};

exports.run = run;