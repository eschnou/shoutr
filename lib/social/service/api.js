var Ostatus	 = require("ostatus")
,	Date	 = require("../support/date")
,	Auth	 = require("./auth")
,	Error   = require("../support/error")
,	Flow	 = require("flow")
,   SocialJS   = require('social.js')
,   Database = SocialJS.database
,	Util	= require("util");


var Api = exports.Api = function(user) {
  if (!(this instanceof Api)) return new Api(user);
  this._user = user;
  this._auth = user ? true : false;
};

/*
 * Profiles
 */

Api.prototype.getProfile = function(first, second) {
	var callback = second || first;
	var username = second ? first : undefined;

	if (!username && !this._auth) callback(new Error("Which profile ?"));
	var username = username || this._user.username;
	Database.get("profile:" + username, callback);
};

Api.prototype.setProfile = function(profile, callback) {
	// TODO - Validate the profile object
	if (!this._auth) callback(new Error("Authentication required"));
	profile._key = "profile:" + this._user.username;
	profile._type = "profile";
	Database.update(profile, callback);
};

/*
 * Users
 */

Api.prototype.getUser = function(first, second) {
	var callback = second || first;
	var username = second ? first : undefined;

	if (!username && !this._auth) callback(new Error("Which user ?"));
	var username = username || this._user.username;
	Database.get("user:" + username, callback);
};

Api.prototype.addUser = function(username, password, email, callback) {
	var user = {
			"_key"	  : "user:" + username
,		    "_type"	  : "user"			
,			"username": username
,			"password": Auth.md5(password)
,			"created" : new Date().getTime()
	};
	
	var profile = {
			"_key"	  	: "profile:" + username
,		    "_type"	  	: "profile"				
,			"email"		: email
,			"fullname"	: username			
	};
	
	Flow.exec(
		function() {
			Database.add(user, this);
		},
		function(err, result) {
			if (err) return callback(err);
			Database.update(profile, callback);
		});
};

/*
 * Activities
 */

Api.prototype.getActivities = function(first, second) {
	var callback = second || first;
	var username = second ? first : undefined;

	if (!username && !this._auth) callback(new Error("Which user ?"));
	var username = username || this._user.username;
	Database.getActivities(username, callback);
};

Api.prototype.addActivity = function(activity, callback) {
	if (!this._auth) callback(new Error("Authentication is required"));
	var tag = this._generateTag();
	var timestamp = new Date().getTime();
	var host = SocialJS.config.host;
	var feed;
	activity._username = this._user.username;
	activity._key = "activity:" + tag;
	activity._type = "activity";
	activity.id =  tag;
	activity.timestamp = timestamp;
	activity.updated = new Date(timestamp).format("yyyy-mm-dd'T'HH:MM:ss");
	// TODO This is rough, we should decouple and queue the push jobs for later processing
	Flow.exec(
			// Store the activity
			function() {
				Database.add(activity, this);
			},
			// Fetch the user profile
			function(err, result) {
				if (err) return callback(err);
				Database.get("profile:" + activity._username, this);
			},
			// Render the feed
			function(err, profile) {
				if (err) return callback(err);
				var items = [];
				items.push(activity);
				Ostatus.atom.render(host, items, profile, this);
			},
			// Get the subscriptions
			function(err, result) {
				if (err) return callback(err);
				feed = result.trim() +"\r\n";
				Database.getSubscriptions(activity._username, this);
			},
			// Distribute the feed
			function(err, subs) {
				if (err) return callback(err);
				for (i=0; i< subs.length; i++) {
					var sub = subs[i];
					console.log("Distributing to " + sub.callback);
					Ostatus.push.distribute(feed, sub.callback, sub.secret, function(err, code, body) {
						if (err) console.log("Push to " + sub.callback + " error: " + err);
						console.log("Push result: " + code);
					});
				}
				callback(null, activity);
			}
	);
};


/* 
 * Outgoing subscriptions
 */

Api.prototype.follow = function(target, callback) {
	var host = SocialJS.config.host;
	var sub = {
			id 		: _md5(this._user.username + ":" + target)
,			user 	: this._user.username
,			target 	: target
,			status 	: "subscribe"
,			secret 	: _randomString(32)
	};
	Flow.exec(
			function() {
				Ostatus.activities(sub.target, this);
			},
			function(err, activities) {
				if (err) return callback(err);
				var hub = _findHub(activities.links);
				var url = activities.url;
				var host = SocialJS.config.host;
				if (!hub || !url) return callback(new Error("Could not find PubSubHubBub hub for this user", 400));
				// Store the subscription in the database
				sub.topic = url;
				sub.hub = hub;
				sub._key = "push:outgoing:" + sub.id;
				sub._type = "push:outgoing";
				Database.add(sub, this);
			},
			function (err, result) {
				if (err) return callback(err);
				var push = {};
				push["hub.callback"] = "http://" + host + "/push/inbox/" + sub.id;
				push["hub.mode"] = "subscribe";
				push["hub.topic"] = sub.topic;
				push["hub.verify"] = ["sync", "async"];
				push["hub.lease_seconds"] = 600;
				push["hub.secret"] = sub.secret;
				Ostatus.push.subscribe(sub.hub, push, this);
			},
			function(err, status) {
				if (err) return callback(err);
				if (status == "accepted") {
					sub.status = "subscribed";
					Database.update(sub, this);
				} else {
					callback(null, sub);	
				}
			},
			function(err) {
				if (err) return callback(err);
				callback(null, sub);
			}
	);
};

Api.prototype.verify = function(id, options, callback) {
   	console.log("Got a verify request for id " + id); 	   
	Database.get("push:outgoing:" + id, function(err, sub) {
		if (err) { 
			return callback(new Error("No such subscription found.", 404));
		}
		if (sub.topic != options["hub.topic"]) {
			return callback(new Error("Topics do not match.", 400));	
		}
		// Ok, this is verified; we update the status
		sub.status = "subscribed";
		Database.update(sub, function(err, result) {
			if (err) return callback(err);
			callback(null, options["hub.challenge"]);
		});
	});
};

/*
 * Incoming subscription
 */

Api.prototype.subscribe = function(options, callback) {
   // Lookup the username in the topic
   var re = new RegExp("/updates/([a-z|A-Z]+?).atom");
   var match = re.exec(options["hub.topic"]);
   if (match == null || match.length < 2) {
	   callback(new Error("Invalid topic url or username", 404));
   }
   
   var username = match[1];
   
   Flow.exec(
	   function() {
		   // We verify that this user exists
		   new Api().getUser(username, this);
	   },
	   function(err, user) {
		   // We validate this is a legitimate request
		   if (err) return callback(err);
		   Ostatus.push.verify(query, this);
	   },
	   function(err, topic) {
		   // We add the subscription to the database
		   // if (err) return callback(err);
		   var subscription = {
				   "username": username,
				   "callback": options["hub.callback"]
		   };
		   subscription._key = "push:incoming:" + _md5(subscription["username"] + ":" + subscription["callback"]);
		   subscription._type = "push:incoming";
		   subscription.timestamp = new Date().getTime();
		   if (options["hub.lease_seconds"]) subscription["lease_seconds"] = options["hub.lease_seconds"];
		   if (options["hub.secret"]) subscription["secret"] = options["hub.secret"];
		   Database.add(subscription, this);
	   }, function(err, sub) {
		   if (err) return callback(err);
		   console.log("Added subscription " + sub._key);
		   callback(null, true);
	   });
};

Api.prototype.incoming = function(id, body, signature, callback) {
	Flow.exec(
			// We first get the matching subscription
			function() {
				Database.get("push:outgoing:" + id, this);
			},
			function(err, sub) {
				if (err) return callback(err);
				if (sub.secret) {
					var digest = "sha1="+  Ostatus.push.sign(body, sub.secret);
					console.log("Signature:" + signature);
					console.log("Digest:" + digest);
					console.log("Body: ===" + body + "===");
					if (!signature || signature != digest) {
						return callback(new Error("Signature do not match.", 400));
					}
				} 
				Ostatus.atom.parseFeed(body, this);
			},
			function(err, activities) {
				if (err) return callback(err);
				if (activities.items) {
					for (i=0;i<activities.items.length; i++) {
						var activity = activities.items[i];
						activity._type = "message";
						activity._key = "message:" + id + ":" + activity.id;
						Database.add(activity, this.MULTI());
					}
				}
			},
			function() {
				callback(null, true);
			}
	);
};

Api.prototype._generateTag = function() {
	var host = SocialJS.config.host;
	var date = new Date().format("yyyy-mm-dd");
	var suffix = _randomString(8);
	return "tag:" + this._user.username + "@" + host + "," + date + ":" + suffix;
};

function _randomString(count)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < count; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function _md5(string) {
	return require('crypto').createHash('md5').update(string).digest("hex");
}

function _findHub(links) {
	for(i=0; i<links.length; i++) {
		var link = links[i];
		if (link.rel == "hub") {
			return link.href;
		}
	}
	return false;
}

Api.Api = Api;
module.exports = Api;