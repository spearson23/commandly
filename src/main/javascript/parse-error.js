
const DUPLICATE_OPTION = "DuplicateOptionError";
const INVALID_OPTION = "InvalidOptionError";
const UNKNOWN_OPTION = "InvalidOptionError";
const INVALID_VALUE = "InvalidValueError";

/**
 * Error class for options
 */
class ParseError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}


module.exports = ParseError;

module.exports.DUPLICATE_OPTION = DUPLICATE_OPTION;
module.exports.INVALID_OPTION = INVALID_OPTION;
module.exports.UNKNOWN_OPTION = UNKNOWN_OPTION;
module.exports.INVALID_VALUE = INVALID_VALUE;
