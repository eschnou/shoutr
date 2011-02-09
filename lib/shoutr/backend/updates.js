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

function get(id, callback) {
	var entry = Data.get(id);
	if (!entry) return callback(new Error("Unknown activity " + id));
	callback(null, entry);
}

function add(entry, callback) {
	// Validate the entry
	if (!_validate(entry)) {
		return callback(new Error("Something is wrong with this entry"));
	}
	// Check that entry is unique
	var other = Data.get(entry.id); 
	if (other) {
		return callback(new Error("Entry is duplicate"));
	}
	// Insert in database and return
	Data.set(entry.id, entry);
	callback(null, entry);
}

function update(entry, callback) {
	// Validate the entry
	if (!_validate(entry)) {
		return callback(new Error("Something is wrong with this entry"));
	}
	// Insert in database and return
	Data.set(entry.id, entry);
	callback(null, entry);
}

function remove(id, callback) {
	Data.rm(id);
	callback(null, id);
}

// TODO Add proper validation of an entry
function _validate(entry) {
	if (!entry.id) return false;
	return true;
}

exports.connect = connect;
exports.get  	= get;
exports.add  	= add;
exports.update 	= update;
exports.remove 	= remove;