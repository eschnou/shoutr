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

var Ostatus = require("ostatus")
,   Webfinger = Ostatus.webfinger
,   Api = require("../../service/api") 
,	Url 	= require("url")
,	Http = require("../../support/http");

function host_meta(app){
    app.get('/', function(req, res, next){
    	Webfinger.xrd(global.config.host, function(err, result) {
    		if (err) {
    			console.log("Error: " + err.message);
    			return Http.response(res, err.message, 500, "text/plain");
    		} else {
    			return Http.response(res, result, 200, "application/xml");
    		}
    	});
    });   
}

function user_meta(app){
    app.get('/', function(req, res, next){
    	// Fetch the request parameter
    	var url = Url.parse(req.url, true);
    	var pAcct = url.query != undefined ? url.query["q"] : undefined;
    	if (pAcct == undefined) {
    		return Http.response(res, "Missing request parameter", 404);
    	}
    	
    	// Add the acct prefix if required
		if (pAcct<5 || pAcct.substring(0,5) != "acct:") {
			pAcct = "acct:" + pAcct;
		}
		
		// Validate the user account
		var acct = Url.parse(pAcct);
		if (acct == undefined || acct.auth == undefined || acct.hostname == undefined) {
			return Http.response(res, "Invalid request parameter", 400);
		}
		
		// Validate the domain
		if (acct.hostname != global.config.host) {
			return Http.response(res, "Domain do not match", 400);
		}
		
		// Verify that the user exists
		new Api().getUser(acct.auth, function(err, user) {
			if (err) return Http.response(res, "User unknown", 404);
			_lrdd(user, res);
		});
    });   
}

function _lrdd(user, res) {
	var host = global.config.host;
	var username = user.username;
	var subject = username + "@" + host;
	var alias = "http://" + host + "/users/" + username;
	var links = [
	     {
	    	 rel:  "http://microformats.org/profile/hcard",
	    	 href: "http://" + host + "/hcard/" + username
	     },
	     {
	    	 rel:  "salmon",
	    	 href: "http://" + host + "/salmon/" + username
	     },
	     {
	    	 rel:  "http://salmon-protocol.org/ns/salmon-mention",
	    	 href: "http://" + host + "/salmon/" + username
	     },
	     {
	    	 rel:  "http://schemas.google.com/g/2010#updates-from",
	    	 href: "http://" + host + "/updates/" + username + ".atom"
	     }    	     
	];
	
	Webfinger.lrdd(subject, alias, links, function(err, result) {
		if (err) {
			return Http.response(res, err.message, 500, "text/plain");
		} else {
			return Http.response(res, result, 200, "application/xml");
		}
	});
}
    
exports.host_meta  = host_meta;
exports.user_meta  = user_meta;