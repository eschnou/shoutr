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
	
	// Someone is posting on the root hub url. This is a subscribe/unsubscribe
	// request.
	app.post('/push/hub', function(req, res){
	    var body = '';
		req.on('data', function (c) { body += c.toString(); })
	       .on('end', function () {
	    	   // Some temporary debugging stuff
	    	   console.log("Received " + body);
	    	   console.log("Headers: " + Util.inspect(req.headers));
	    	   query = Qs.parse(body);
	    	   for (k in query) {
	    		   console.log(k + ": " + query[k]);
	    	   }
	    	   new Api().subscribe(query, function(err) {
	    		   if (err)  return Http.response(res, err.message, 500, "text/plain");
	    		   return Http.response(res, false, 204, "text/plain");
	    	   });
	       });
	});

	// A get request on a callback URI is a verification request
    app.get('/push/inbox/:id', function(req, res, next){
    	var id = req.params.id;
    	var url = Url.parse(req.url, true);
    	var options = url.query;
 	    new Api().verify(id, options, function(err, challenge) {
		   if (err)  {
			   console.log("verify error: " + err.message);
			   return Http.response(res, err.message, err.code || 500, "text/plain");
		   }
		   return Http.response(res, challenge, 200, "text/plain");
	   });
    }); 
	
    // Incoming notification
	app.post('/push/inbox/:id', function(req, res){
    	var id = req.params.id;
		console.log("Incoming PuSH to inbox " + id);
	    var buffer = '';
		req.on('data', function (c) { buffer += c.toString(); })
	       .on('end', function () {
	    	   var signature = req.headers["x-hub-signature"];
	    	   new Api().incoming(id, buffer, signature, function(err, result) {
	    		   if (err)  {
	    			   console.log("Incoming PuSH error: " + err.message);
	    			   return Http.response(res, err.message, err.code || 500, "text/plain");
	    		   }
	    		   console.log("Incoming PuSH delivered to inbox.");
	    		   return Http.response(res, challenge, 200, "text/plain");	    		   
	    	   });
	      });
    });
}

exports.routes  = routes;