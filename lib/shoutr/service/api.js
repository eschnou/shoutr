var Database = global.database
,   Ostatus	 = require("ostatus")
,	Date	 = require("../support/date")
,	Auth	 = require("./auth")
,	Error   = require("../support/error")
,	Flow	 = require("flow");


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
	Database.getProfile(username, callback);
};

Api.prototype.setProfile = function(profile, callback) {
	if (!this._auth) callback(new Error("Authentication required"));
	Database.setProfile(this._user.username, profile, callback);
};

/*
 * Users
 */

Api.prototype.getUser = function(first, second) {
	var callback = second || first;
	var username = second ? first : undefined;

	if (!username && !this._auth) callback(new Error("Which user ?"));
	var username = username || this._user.username;
	Database.getUser(username, callback);
};

Api.prototype.addUser = function(username, password, email, callback) {
	var user = {
			"username": username
,			"password": Auth.md5(password)
,			"created" : new Date().getTime()
	};
	
	var profile = {
			"email": email
,			"fullname": username			
	};
	
	Flow.exec(
		function() {
			Database.addUser(username, user, this);
		},
		function(err, result) {
			if (err) return callback(err);
			Database.setProfile(username, profile, callback);
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
	activity._username = this._user.username;
	activity.id =  this._generateTag();
	activity.timestamp = new Date().getTime();
	Database.addActivity(activity.id, activity, callback);
};


/* 
 * Outgoing subscriptions
 */

Api.prototype.follow = function(target, callback) {
	var host = global.config.host;
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
				var host = global.config.host;
				if (!hub || !url) return callback(new Error("Could not find PubSubHubBub hub for this user", 400));
				// Store the subscription in the database
				sub.topic = url;
				sub.hub = hub;
				sub._key = "push:outgoing:" + sub.id;
				Database.addSubscription(sub, this);
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
					Database.updateSubscription(sub, this);
				} else {
					callback(null, sub);	
				}
			},
			function() {
				if (err) return callback(err);
				callback(null, sub);
			}
	);
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
			   subscription.timestamp = new Date().getTime();
			   if (options["hub.lease_seconds"]) subscription["lease_seconds"] = options["hub.lease_seconds"];
			   if (options["hub.secret"]) subscription["secret"] = options["hub.secret"];
			   Database.addSubscription(subscription, this);
		   }, function(err, sub) {
			   if (err) return callback(err);
			   console.log("Added subscription " + sub._key);
			   callback(null, true);
		   });
};

Api.prototype.verify = function(id, options, callback) {
   	console.log("Got a verify request for id " + id); 	   
	Database.getSubscription("push:outgoing:" + id, function(err, sub) {
		if (err) { 
			return callback(new Error("No such subscription found.", 404));
		}
		if (sub.topic != options["hub.topic"]) {
			return callback(new Error("Topics do not match.", 400));	
		}
		// Ok, this is verified; we update the status
		sub.status = "subscribed";
		Database.updateSubscription(sub, function(err, result) {
			if (err) return callback(err);
			callback(null, options["hub.challenge"]);
		});
	});
}

Api.prototype._generateTag = function() {
	var host = global.config.host;
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