const ParseError = require("./parse-error");
const moment = require('moment');

/**
 * An option
 */
class Option {
  constructor(params) {
    if (!params.name && !params.alias) {
      throw new ParseError(ParseError.INVALID_OPTION, "name or alias is required for options")
    }
    if (!params.type) {
      throw new ParseError(ParseError.INVALID_OPTION, "type is required for options")
    }
    this.name = params.name;
    this.alias = params.alias;
    this.type = params.type;
    this.command = params.command;
    this.group = params.group;
    this.variableName = params.variableName || this.type;
    this.required = params.required || false;
    this.description = params.description;
    this.multiple = params.multiple || false;
    this.list = params.list || false;
    this.deliminator = params.deliminator || ',';
    this.parse = params.parse;
    this.map = params.map;
    this.validate = params.validate;
    this.validateMessage = params.validateMessage;
    this.isSet = false;
    this.defaultValue = params.defaultValue;
    if (this.multiple || this.list) {
      this.value = [];
    }
  }
  static define(params) {
    switch (params.type) {
      case 'string':
        return new StringOption(params);
      case 'int':
        return new IntOption(params);
      case 'float':
      case 'number':
        return new FloatOption(params);
      case 'boolean':
      case 'bool':
      case 'flag':
        return new BooleanOption(params);
      case 'date':
        return new DateOption(params);
      case 'moment':
        return new MomentOption(params);
      case 'options':
        return new OptionsOption(params);
      case 'keyValue':
        return new KeyValueOption(params);
      default:
        throw new ParseError(ParseError.INVALID_OPTION, "Invalid type (" + params.type + ") for option " + params.name);
    }
  }
  setValue(text) {
    if (this.isSet && !(this.multiple || this.list)) {
      throw new ParseError(ParseError.INVALID_VALUE, "Duplicate value for option " + this.name);
    }
    if (this.list) {
      text.split(this.deliminator).forEach(value => this._setValue(value));
    } else {
      this._setValue(text);
    }
  }
  _setValue(value) {
    if (this.parse) {
      value = this.parse.call(this, value);
    }
    value = this.coerce(value);
    if (this.map) {
      value = this.map.call(this, value);
    }
    if (this.validate) {
      try {
        if (!this.validate.call(this, value)) {
          if (this.validateMessage) {
            throw new ParseError(ParseError.INVALID_VALUE, this.validateMessage);
          } else {
            throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") is invalid for option " + this.name);
          }
        }
      } catch (e) {
        throw e;
      }
    }
    this.set(value);
    this.isSet = true;
  }
  set(value) {
    if (this.list || this.multiple) {
      this.value = this.value || [];
      this.value.push(value);
    } else {
      this.value = value;
    }
  }
  reset() {
    this.isSet = false;
    delete this.value;
  }
  hasArg() {
    return true;
  }
  validate(value) {
    // No op
  }
  coerce(value) {
    return value;
  }
  _getOptionText() {
    if (!this.text) {
      this.text = '';
      if (this.alias) {
        this.text += "-" + this.alias + ", ";
      }
      this.text += "--" + this.name;
      if (this.hasArg) {
        this.text += " <" + this.variableName + ">";
      }
    }
    return this.text;
  }
}

class StringOption extends Option {
}
class IntOption extends Option {
  coerce(value) {
    if (isNaN(value)) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not an integer.");
    }
    const f = parseFloat(value);
    if (f % 1 != 0) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not an integer.");
    }
    return f;
  }
}
class FloatOption extends Option {
  coerce(value) {
    if (isNaN(value)) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not a float.");
    }
    return parseFloat(value);
  }
}
class BooleanOption extends Option {
  constructor(params) {
    super(params);
    this.value = true;
  }
  hasArg() {
    return false;
  }
  coerce(value) {
    return true;
  }
}
class DateOption extends Option {
  constructor(params) {
    super(params);
    this.format = params.format;
    this.strict = params.strict;
  }
  coerce(value) {
    var m = moment(value, this.format, this.strict);
    if (!m.isValid()) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") is not a valid date.");
    }
    return m.toDate();
  }
}
class MomentOption extends Option {
  constructor(params) {
    super(params);
    this.format = params.format;
    this.strict = params.strict;
  }
  coerce(value) {
    var m = moment(value, this.format, this.strict);
    if (!m.isValid()) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") is not a valid date.");
    }
    return m;
  }
}
class OptionsOption extends Option {
  constructor(params) {
    super(params);
    this.options = params.options;
  }
  coerce(value) {
    if (!this.options.includes(value)) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not one of the allowed values [" + this.options.join(', ') + '].');
    }
    return value;
  }
}

class KeyValueOption extends Option {
  coerce(value) {
    const kv = value.split(/ *= */);
    if (kv.length != 2) {
      throw new ParseError(ParseError.INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not a key value");
    }
    const res = {};
    res[kv[0]] = kv[1];
    return res;
  }
  set(value) {
    this.value = this.value || {};
    this.value = Object.assign(this.value, value);
  }
}


module.exports = Option;
