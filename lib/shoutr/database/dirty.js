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
,	Data;

exports.init = function(options, callback) {
	var path = Path.join(options.path || __dirname(), "data.db");
	console.log("Opening database " + path);
	Data = new Dirty(path);
	Data.on('load', function(records) {
		callback(null, records);
	});
};

exports.get = function(key, callback) {
	var result = Data.get(key);
	if (!result) return callback(new Error("Object not found " + key, 404));
	callback(null, result);
};

exports.add = function(object, callback) {
	var key = object._key;
	if (Data.get(key)) return callback(new Error("Duplicate key " + key, 409));
	Data.set(key, object);
	callback(null, object);
};

exports.update = function(object, callback) {
	var key = object._key;
	Data.set(key, object);
	callback(null, object);
};

exports.remove = function(key, callback) {
	Data.rm(key);
	callback(null, key);
};

exports.getActivities = function(username, callback) {
	var result = [];
	Data.forEach(function(key, value) {
		if (value._username == username && value._type == "activity") {
			result.push(value);
		}
	});
	callback(null, result);
};

exports.getSubscriptions = function(username, callback) {
	var result = [];
	Data.forEach(function(key, value) {
		if (value.username == username && value._type == "push:incoming") {
			result.push(value);
		}
	});
	callback(null, result);
};