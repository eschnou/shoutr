var socialjsError = exports.socialjsError = function(message, code) {
  if (!(this instanceof socialjsError)) return new socialjsError(message, code);
  
  Error.apply(this);
  this.message = message;
  this.code = code || 500;
}

socialjsError.prototype = new Error();
socialjsError.prototype.constructor = socialjsError;
socialjsError.prototype.name = 'socialjsError';

module.exports = socialjsError;
