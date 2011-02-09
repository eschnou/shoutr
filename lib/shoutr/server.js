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
,	Path 	   = require('path')
,	Mu 	 	   = require('mu')
,	Util	   = require('util')
,	Config	   = require('../../config')
,	Backend    = require('./backend');

global.config = Config.data;
global.backend = Backend;

Mu.root = Path.join(__dirname,'./templates');	

var Controllers = {
		webfinger: require("./resources/webfinger")
,		hcard:	   require("./resources/hcard")
,		feed:      require("./resources/feed")
,		push:	   require("./resources/push")
,		entry:	   require("./resources/entry")
};

var run = function() {
	var pending = 2;
	Backend.users.connect({"path": Path.join(global.config.database, "/users.db")}, function() {
		pending = pending - 1;
		if (pending == 0) _start();
	});
	Backend.updates.connect({"path": Path.join(global.config.database, "/updates.db")}, function() {
		pending = pending - 1;
		if (pending == 0) _start();
	});
};

var _start = function() {
	var server = Connect.createServer();
	
	// TODO Automatic scanning of the resources/ folder to auto provision the router.
	server.use("/.well-known/host-meta", Connect.router(Controllers.webfinger.host_meta));
	server.use("/webfinger", Connect.router(Controllers.webfinger.user_meta));
	server.use("/hcard", Connect.router(Controllers.hcard.index));
	server.use("/updates", Connect.router(Controllers.feed.index));
	server.use("/push/hub", Connect.router(Controllers.push.hub));
	server.use("/push/inbox", Connect.router(Controllers.push.inbox));
	server.use("/api/activities", Connect.router(Controllers.entry.collection));
	server.listen(3000);
	console.log('Connect server listening on port 3000');
};

exports.run = run;