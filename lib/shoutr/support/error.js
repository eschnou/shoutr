var ShoutrError = exports.ShoutrError = function(message, code) {
  if (!(this instanceof ShoutrError)) return new ShoutrError(message, code);
  
  Error.apply(this);
  this.message = message;
  this.code = code || 500;
}

ShoutrError.prototype = new Error();
ShoutrError.prototype.constructor = ShoutrError;
ShoutrError.prototype.name = 'ShoutrError';

module.exports = ShoutrError;