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

var Dirty = require('dirty'),
	Data;

function connect(options, callback) {
	if (options.path) {
		Data = new Dirty(options.path);
		Data.on('load', function(records) {
			callback(null, records);
		});
	} else {
		Data = new Dirty();
		callback(null, 0);
	}
}

function get(username, callback) {
	var user = Data.get(username);
	if (!user) return callback(new Error("Unknown user " + username));
	callback(null, user);
}

function add(user, callback) {
	// Validate the user input
	if (!_validate(user)) {
		return callback(new Error("Something is wrong with this user"));
	}
	debugger;
	// Check that username is unique
	var other = Data.get(user.username); 
	if (other) {
		return callback(new Error("Username is taken"));
	}
	// Insert in database and return
	Data.set(user.username, user);
	callback(null, user);
}

function update(user, callback) {
	// Validate the user input
	if (!_validate(user)) {
		return callback(new Error("Something is wrong with this user"));
	}
	// Insert in database and return
	Data.set(user.username, user);
	callback(null, user);
}

function remove(username, callback) {
	Data.rm(username);
	callback(null, username);
}

// TODO Add proper validation of a user object
function _validate(user) {
	if (!user.username) return false;
	return true;
}

exports.connect = connect;
exports.get  	= get;
exports.add  	= add;
exports.update 	= update;
exports.remove 	= remove;