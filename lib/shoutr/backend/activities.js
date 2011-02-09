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

var Data = require('dirty')('shoutr.db');

function profile(username, callback){
	var profile = Data.get("profile_" + username);
	if (!profile) return callback(new Error("Unknown user"));
	var host = global.config.host;
	var profile = {
		"username": username,
		"avatar": "http://a2.twimg.com/profile_images/55154871/eschnou-cartoon_bigger.jpg",
		"fullname": "Laurent Eschenauer",
		"location": "Liège, Belgium",
		"note": "Software hacker.",
		"profile": "http://" + host + "/users/" + username
	};
	callback(null, profile);
}

function updates(username, callback) {
	if (username != "laurent") return callback(new Error("Unknown user"));
	var updates = [
   		{
   		    "id": "tag:ustatus.org,2011:ustatus:z12pu123asdsdsyzsz",
   		    "updated": "2011-01-19T20:03:34.342Z",
   		    "type": "note",
   		    "verb": "post",
   		    "title": "Romeo loves Juliet",
   		    "content": "Romeo loves Juliet"
   		}, 
   		{
   		    "id": "tag:ustatus.org,2011:ustatus:z12puk22ajfydhr",
   		    "updated": "2011-01-08T11:03:34.342Z",
   		    "type": "note",
   		    "verb": "post",
   		    "title": "Hey, this is my first Shoutr Post!",
   		    "content": "Hey, this is my first Shoutr Post!"
   		}   		
	];
	callback(null, updates);
}


exports.profile  = profile;
exports.updates  = updates;