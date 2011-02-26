function md5(string) {
	return require('crypto').createHash('md5').update(string).digest("hex");
}

function authenticate(username, password, successCallback, failureCallback){
	global.database.get("user:" + username, function(err, user) {
		if (!user) return failureCallback();
		if (user.password != md5(password)) return failureCallback();
		successCallback(user);
	});
};

exports.authenticate = authenticate;
exports.md5 = md5;