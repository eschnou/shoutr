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

var Ostatus = require("ostatus")
,   Atom = Ostatus.atom
,   Util = require("util")
,	Flow = require("flow")
,	Http = require("../../support/http")
,	Url = require("url")
,   Api = require("../../service/api");

function index(app){
    app.get('/:user.atom', function(req, res, next){
    	var username = req.params.user;
    	var profile, updates;
    	var api = new Api();
    	Flow.exec(
			function() {
				api.getProfile(username, this);
			},
    		function (err, result) {
	    		if (err) return Http.response(res, err.message, 500, "text/plain");
	    		profile = result;
	    		profile.username = username;
	        	api.getActivities(username, this);
			},
			function (err, result) {
				if (err) return Http.response(res, err.message, 500, "text/plain");
				updates = result;
		    	Atom.render(updates, profile, this);
			},
			function(err, result) {
	    		if (err) {
	    			return Http.response(res, err.message, 500, "text/plain");
	    		} else {
	    			return Http.response(res, result, 200, "application/atom+xml");
	    		}
		    });
    });   
}

exports.index  = index;