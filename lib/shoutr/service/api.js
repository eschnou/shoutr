var Database = global.database
,	Date	 = require("../support/date")
,	Auth	 = require("./auth")
,	Flow	 = require("flow");


var Api = exports.Api = function(user) {
  if (!(this instanceof Api)) return new Api(user);
  this._user = user;
  this._auth = user ? true : false;
};

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

Api.prototype.addSubscription = function(subscription, callback) {
	var id = _md5(subscription["username"] + ":" + subscription["callback"]);
	subscription._id = id;
	subscription.timestamp = new Date().getTime();
	Database.addSubscription(id, subscription, callback);
};


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

Api.Api = Api;
module.exports = Api;