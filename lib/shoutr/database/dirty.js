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

var Dirty 	= require('dirty')
,	Flow	= require('flow')
,	Error   = require("../support/error")
,	Users, Profiles, Activities, Push;

function init(options, callback) {
	var path = options.path || __dirname();
	Flow.exec(
			function() {
				_load(Path.join(path, "/users.db"), this)
			},
			function(err, database) {
				Users = database;
				_load(Path.join(path, "/profiles.db"), this)
		    },
		    function(err, database) {
		    	Profiles = database;
		    	_load(Path.join(path, "/activities.db"), this)
		    },
		    function(err, database) {
		    	Activities = database;
		    	_load(Path.join(path, "/push.db"), this)
		    },
		    function(err, database) {
		    	Push = database;
		    	callback();
		    }
	);
};

/*
 * User profiles
 */

exports.getProfile = function(username, callback) {
	_read(Profiles, username, callback);
};

exports.setProfile = function(username, profile, callback) {
	_update(Profiles, username, profile, callback);
};

exports.deleteProfile = function(username, callback) {
	_remove(Profiles, username, callback);
};

/*
 * User accounts
 */

exports.getUser = function(username, callback) {
	_read(Users, username, callback);
};

exports.addUser = function(username, user, callback) {
	_create(Users, username, user, callback);
};

exports.updateUser = function(username, user, callback) {
	_update(Users, username, user, callback);
};

exports.deleteUser = function(username, callback) {
	_remove(Users, username, callback);
};

/*
 * Activities
 */

exports.getActivity = function(id, callback) {
	_read(Activities, id, callback);
};

exports.addActivity = function(id, activity, callback) {
	_create(Activities, id, activity, callback);
};

exports.updateActivity = function(id, activity, callback) {
	_update(Activities, id, activity, callback);
};

exports.deleteActivity = function(id, callback) {
	_remove(Activities, id, callback);
};

exports.getActivities = function(username, callback) {
	var result = [];
	Activities.forEach(function(key, value) {
		if (value._username == username) {
			result.push(value);
		}
	});
	callback(null, result);
};

/*
 * PubSubHubBub subscriptions
 */

exports.addSubscription = function(id, subscription, callback) {
	_update(Push, id, subscription, callback);
};


/*
 * Private helper methods
 */

function _load(path, callback) {
	if (path) {
		var data = new Dirty(path);
		data.on('load', function(records) {
			callback(null, data);
		});
	} else {
		var data = new Dirty();
		callback(null, data);
	}
}

function _create(db, key, value, callback) {
	if (db.get(key)) return callback(new Error("Duplicate key " + key, 409));
	db.set(key, value);
	callback(null, value);
}

function _read(db, key, callback) {
	var result = db.get(key);
	if (!result) return callback(new Error("Object not found " + key, 404));
	callback(null, result);
}

function _update(db, key, value, callback) {
	db.set(key, value);
	callback(null, value);
}

function _remove(db, key, callback) {
	db.rm(key);
	callback(null, key);
}

function _md5(string) {
	return require('crypto').createHash('md5').update(string).digest("hex");
}

exports.init = init;