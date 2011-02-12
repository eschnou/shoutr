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

var Shoutr  = require("shoutr")
,   Path	= require("path")
,	argv 	= require('optimist').argv;

process.on( "uncaughtException", function( err ) {
	console.log("Error: " + err.message);
});


function main() {
	_init();	
}

function _init() {
	Shoutr.database.init(global.config.database, function(err) {
		_dispatch();
	});
};

function _dispatch() {
	if(argv._ == "add_user") {
		_add_user();
	} else {
		throw new Error("Invalid command");
	}
}

function _add_user() {	
	if (!argv.username || !argv.password || !argv.email) {
		throw new Error("Missing arguments");
	}
	new Shoutr.api().addUser(argv.username, argv.password, argv.email, function(err, result) {
		if (err) throw err;
		console.log("User " + argv.username + " has been added.");
	});
}

main();