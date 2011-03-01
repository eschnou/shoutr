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
,	Flow = require("flow")
,   Error = require("../../support/error")
,   Push = Ostatus.push
,	Http = require("../../support/http")
,	Url = require("url")
,	Qs = require("querystring")
,   Api = require("../../service/api")
,	Util = require('util');   
 
function routes(app){
	app.post('/salmon/:username', function(req, res){
    	var username = req.params.username;
	    var body = '';
		console.log("Incoming Salmon for user " + username);
		req.on('data', function (c) { body += c.toString(); })
	       .on('end', function () {
	    	   // Some temporary debugging stuff
	    	   console.log("Received " + body);
	    	   console.log("Headers: " + Util.inspect(req.headers));
	    	   query = Qs.parse(body);
	    	   for (k in query) {
	    		   console.log(k + ": " + query[k]);
	    	   }
    		   return Http.response(res, false, 204, "text/plain");
	       });
	});
}

exports.routes = routes;