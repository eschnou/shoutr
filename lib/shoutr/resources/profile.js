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

var Ostatus = require("ostatus"),
    Atom = Ostatus.atom,
	Http = require("../support/http");
	Url = require("url"),
    Path = require('path'),
    Mu 	 = require('mu');

function index(app){
    app.get('/:user', function(req, res, next){
    	var user = req.params.user;
    	console.log("User: " + user);
    	global.backend.profile(user, function(err, profile) {
    		if (err) return Http.response(res, err.message, 500, "text/plain");
    		global.backend.updates(user, function(err, updates) {
	    		if (err) return Http.response(res, err.message, 500, "text/plain");
	    		Mu.compile('user.html.mu', function (err, parsed) {
	    		    if (err) return Http.response(res, err.message, 500, "text/plain");
	    		    var host = global.config.host;
	    		    var buffer = '';
	    		    var context = profile;
	    		    context.updates = updates;
	    		    context.host = host;
	    		    Mu.render(parsed,context)
	    		      .on('data', function (c) { buffer += c.toString(); })
	    		      .on('end', function () {Http.response(res, buffer);})
	    		      .on('error', function(err) {Http.response(res, err.message, 500, "text/plain");});
	    		  });
	    	});
    	});
    });   
}

exports.index  = index;