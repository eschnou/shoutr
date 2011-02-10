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
    Push = Ostatus.push,
	Http = require("../../support/http"),
	Url = require("url"),
	Qs = require("querystring"),
	Util = require('util');   
 
function hub(app){
	app.post('/', function(req, res){
		console.log("Incoming PuSH request");
	    var buffer = '';
		req.on('data', function (c) { buffer += c.toString(); })
	       .on('end', function () {
	    	   console.log("Received " + buffer);
	    	   console.log("Headers: " + Util.inspect(req.headers));
	    	   query = Qs.parse(buffer);
	    	   for (k in query) {
	    		   console.log(k + ": " + query[k]);
	    	   }
	    	   Push.verify(query, function(err, result) {
	    		   if (err) {
	    			   console.log("Subscription request returned error " + err.message);
	    			   return Http.response(res, err.message, 400, "text/plain");
	    		   } else {
	    			   console.log("Http response 204");
	    			   return Http.response(res, false, 204, "text/plain");
	    		   }
	    	   });
	      });
    });
}

function inbox(app){
    app.get('/:user/:id', function(req, res, next){
    	var user = req.params.user;
    	var id = req.params.id;
    	var url = Url.parse(req.url, true);
    	
    	console.log("Got a verify request for " + user + " with id " + id);
    	Http.response(res,url.query["hub.challenge"], 200);
    });  
	
	app.post('/:user/:subscription', function(req, res){
		console.log("Incoming PuSH inbox request");
	    var buffer = '';
		req.on('data', function (c) { buffer += c.toString(); })
	       .on('end', function () {
	    	   console.log("Received " + buffer);
	    	   console.log("Headers: " + Util.inspect(req.headers));
	      });
    });
}

exports.hub  = hub;
exports.inbox  = inbox;