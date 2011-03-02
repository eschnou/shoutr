var shoutrError = exports.shoutrError = function(message, code) {
  if (!(this instanceof shoutrError)) return new shoutrError(message, code);
  
  Error.apply(this);
  this.message = message;
  this.code = code || 500;
}

shoutrError.prototype = new Error();
shoutrError.prototype.constructor = shoutrError;
shoutrError.prototype.name = 'shoutrError';

module.exports = shoutrError;
