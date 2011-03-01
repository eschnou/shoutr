/*
 * social.js - A decentralized social networking service
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
var Api		= require("../../service/api")
, 	Http 	= require("../../support/http")
,	Url	    = require("url")
,	Ostatus = require("ostatus")
,   Social  = require("social.js")
,	Util	= require("util");

function routes(app) {
	// Example: /api/activities?user=acct:eschnou@identi.ca
	// The user argument is optional. If not provided, the activities of the authenticated 
	// user are returned. If a user account is provided (must be a valid webfinger acct uri) then
	// the activities of that user are lookedup on behalf of the authenticated user. If the account
	// is remote, this is done via webfinger.
	app.get('/activities', function(req, res) {
		req.authenticate(['basic'], function(err, authenticated) {
			if (authenticated) {
				var auth = req.getAuthDetails();
				var username = auth.user.username;
				var url = Url.parse(req.url, true);
		    	var pUser = url.query != undefined ? url.query["user"] : undefined;
		    	
		    	// Parse the user param and check if the account is local or remote
		    	if (pUser != undefined) {
		    		var user = Ostatus.webfinger.parseAcct(pUser);
		    		if (!user) return Http.response(res, "Malformed user account", 400, "text/plain");
		    		if (user.hostname != Social.config.host) return _remoteGet(req, res, pUser);
		    		username = user.username;
		    	}
		    	
		    	// A local user account, we can lookup directly via the database engine
				new Api().getActivities(username, function(err, result) {
					if (err) {
						console.log("Error: " + err.message);
						return Http.response(res, err.message, err.code ? err.code : 500, "text/plain");
					}
					return Http.response(res, JSON.stringify(result), 200, "application/json");
				});
			} else {
				return Http.response(res, "Authentication failed", 500, "text/plain");
			}
		});
	});

	// Post a new entry in the stream of the authenticated user.
	app.post('/activities', function(req, res) {
		var buffer = '';
		req.on('data', function(c) {
			buffer += c.toString();
		}).on('end', function() {
			 _postEntry(req, res, buffer);
		});
	});
}

function _postEntry(req, res, buffer) {
	req.authenticate(['basic'], function(err, authenticated) {
		if (authenticated) {
			var entry = JSON.parse(buffer);
			var auth = req.getAuthDetails();
			new Api(auth.user).addActivity(entry, function(err, result) {
				if (err) {
					console.log("Error: " + err.message);
					return Http.response(res, err.message, err.code ? err.code : 500, "text/plain");
				}
				return Http.response(res, JSON.stringify(result), 200, "application/json");
			});
		} else {
			return Http.response(res, "Authentication failed", 500, "text/plain");
		}
	});
};

function _remoteGet(req, res, user) {
	Ostatus.webfinger.lookup(user, function(err, result) {
		if (err) return Http.response(res, err.message, 400, "text/plain");
    	var links = result.documentElement.getElementsByTagName("Link");
    	for (i=0;i<links.length;i++) {
    		var attributes = links[i].attributes;
    		var rel = attributes.getNamedItem("rel");
    		if (rel.nodeValue == "http://schemas.google.com/g/2010#updates-from") {
    			var href = attributes.getNamedItem("href");
    			Ostatus.atom.parseFeed(href.nodeValue, function(err, result) {
    				if (err) return Http.response(res, err.message, 400, "text/plain");
    				return Http.response(res, JSON.stringify(result), 200, "application/json")
    			});
    		}
    	}
	});
}

exports.routes = routes;