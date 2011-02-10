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

/* Data access logic for the users table. User objects are only used for authentication,
 * a user has a username and a password. The user 'profile' is stored in the profile
 * database. 
 * 
 * var user = {
 * 		"username": "johndoe",
 * 		"password": _md5("secret")
 * }
 * 
 */

var Dirty 	= require('dirty')
,	Http	= require('../support/http')
,	Data;

// Initialize the database, must be called before any read is performed.
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

// Authenticate a user against his password
function authenticate(username, password, successCallback, failureCallback){
	var user = Data.get(username);
	if (!user) return failureCallback();
	if (user.password != _md5(password)) return failureCallback();
	successCallback(user);
};

// Get a user based on his username
function get(username, callback) {
	var user = Data.get(username);
	if (!user) return callback(Http.error("Unknown user " + username, 404));
	callback(null, user);
}

// Add a user to the database (checking for conflict and validating the user input)
function add(user, callback) {
	// Validate the user input
	if (!_validate(user)) {
		return callback(Http.error("Something is wrong with this user", 400));
	}
	debugger;
	// Check that username is unique
	var other = Data.get(user.username); 
	if (other) {
		return callback(Http.error("A user with this username already exists.", 409));
	}
	// Insert in database and return
	Data.set(user.username, user);
	callback(null, user);
}

// Update a user details
function update(user, callback) {
	// Validate the user input
	if (!_validate(user)) {
		return callback(Http.error("Something is wrong with this user", 400));
	}
	// Insert in database and return
	Data.set(user.username, user);
	callback(null, user);
}

// Remove a user
// TODO Should we also delete all the content of this user in other tables
// or is this left to a higher level ?
function remove(username, callback) {
	Data.rm(username);
	callback(null, username);
}

// TODO Add proper validation of a user object
function _validate(user) {
	if (!user.username) return false;
	return true;
}

function _md5(string) {
	return require('crypto').createHash('md5').update(string).digest("hex");
}

exports.connect = connect;
exports.get  	= get;
exports.add  	= add;
exports.update 	= update;
exports.remove 	= remove;
exports.authenticate = authenticate;