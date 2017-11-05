"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * 
 */
var DUPLICATE_OPTION = exports.DUPLICATE_OPTION = "DuplicateOptionError";
var INVALID_OPTION = exports.INVALID_OPTION = "InvalidOptionError";
var UNKNOWN_OPTION = exports.UNKNOWN_OPTION = "InvalidOptionError";
var INVALID_VALUE = exports.INVALID_VALUE = "InvalidValueError";

var ParseError = function (_Error) {
  _inherits(ParseError, _Error);

  function ParseError(name, message) {
    _classCallCheck(this, ParseError);

    var _this = _possibleConstructorReturn(this, (ParseError.__proto__ || Object.getPrototypeOf(ParseError)).call(this, message));

    _this.name = name;
    return _this;
  }

  return ParseError;
}(Error);

var Option = function () {
  function Option(params) {
    _classCallCheck(this, Option);

    if (!params.name && !params.alias) {
      throw new ParseError(INVALID_OPTION, "name or alias is required for options");
    }
    if (!params.type) {
      throw new ParseError(INVALID_OPTION, "type is required for options");
    }
    this.name = params.name;
    this.alias = params.alias;
    this.type = params.type;
    this.required = params.required || false;
    this.description = params.description;
    this.multiple = params.multiple || false;
    this.list = params.list || false;
    this.deliminator = params.deliminator || ',';
    this.map = params.map;
    this.validate = params.validate;
    this.isSet = false;
    if (params.defaultValue) {
      this.hasDefault = true;
      this.value = params.defaultValue;
    }
    if (this.multiple || this.list) {
      this.value = [];
    }
  }

  _createClass(Option, [{
    key: "setValue",
    value: function setValue(text) {
      var _this2 = this;

      if (this.isSet && !(this.multiple || this.list)) {
        throw new ParseError(INVALID_VALUE, "Duplicate value for option " + this.name);
      }
      if (this.list) {
        text.split(this.deliminator).forEach(function (value) {
          return _this2._setValue(value);
        });
      } else {
        this._setValue(text);
      }
    }
  }, {
    key: "_setValue",
    value: function _setValue(value) {
      if (this.map) {
        value = this.map.call(value);
      }
      value = this.coerce(value);
      if (this.validate) {
        this.validate.call(value);
      }
      if (this.list || this.multiple) {
        this.value.push(value);
      } else {
        this.value = value;
      }
    }
  }, {
    key: "hasArg",
    value: function hasArg() {
      return true;
    }
  }, {
    key: "hasDefault",
    value: function hasDefault() {
      return true;
    }
  }, {
    key: "validate",
    value: function validate(value) {
      // No op
    }
  }, {
    key: "coerce",
    value: function coerce(value) {
      return value;
    }
  }], [{
    key: "define",
    value: function define(params) {
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
          return new BooleanOption(params);
        case 'options':
          return new OptionsOption(params);
        default:
          throw new ParseError(INVALID_OPTION, "Invalid type (" + params.type + ") for option + " + params.name);
      }
    }
  }]);

  return Option;
}();

var StringOption = function (_Option) {
  _inherits(StringOption, _Option);

  function StringOption() {
    _classCallCheck(this, StringOption);

    return _possibleConstructorReturn(this, (StringOption.__proto__ || Object.getPrototypeOf(StringOption)).apply(this, arguments));
  }

  return StringOption;
}(Option);

var IntOption = function (_Option2) {
  _inherits(IntOption, _Option2);

  function IntOption() {
    _classCallCheck(this, IntOption);

    return _possibleConstructorReturn(this, (IntOption.__proto__ || Object.getPrototypeOf(IntOption)).apply(this, arguments));
  }

  _createClass(IntOption, [{
    key: "coerce",
    value: function coerce(value) {
      if (isNaN(value)) {
        throw new ParseError(INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not an integer.");
        return;
      }
      var f = parseFloat(value);
      if (f % 1 != 0) {
        throw new ParseError(INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not an integer.");
      }
      return f;
    }
  }]);

  return IntOption;
}(Option);

var FloatOption = function (_Option3) {
  _inherits(FloatOption, _Option3);

  function FloatOption() {
    _classCallCheck(this, FloatOption);

    return _possibleConstructorReturn(this, (FloatOption.__proto__ || Object.getPrototypeOf(FloatOption)).apply(this, arguments));
  }

  _createClass(FloatOption, [{
    key: "coerce",
    value: function coerce(value) {
      if (isNaN(value)) {
        throw new ParseError(INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not a float.");
      }
      return parseFloat(value);
    }
  }]);

  return FloatOption;
}(Option);

var BooleanOption = function (_Option4) {
  _inherits(BooleanOption, _Option4);

  function BooleanOption(params) {
    _classCallCheck(this, BooleanOption);

    var _this6 = _possibleConstructorReturn(this, (BooleanOption.__proto__ || Object.getPrototypeOf(BooleanOption)).call(this, params));

    _this6.value = true;
    return _this6;
  }

  _createClass(BooleanOption, [{
    key: "hasArg",
    value: function hasArg() {
      return false;
    }
  }, {
    key: "coerce",
    value: function coerce(value) {
      throw new ParseError(INVALID_VALUE, "Option " + this.name + " does not take an argument.");
    }
  }]);

  return BooleanOption;
}(Option);

var OptionsOption = function (_Option5) {
  _inherits(OptionsOption, _Option5);

  function OptionsOption(params) {
    _classCallCheck(this, OptionsOption);

    var _this7 = _possibleConstructorReturn(this, (OptionsOption.__proto__ || Object.getPrototypeOf(OptionsOption)).call(this, params));

    _this7.options = options;
    return _this7;
  }

  _createClass(OptionsOption, [{
    key: "coerse",
    value: function coerse(value) {
      if (!this.options.contains(value)) {
        throw new ParseError(INVALID_VALUE, "Value (" + value + ") for option " + this.name + " is not one of the allow values.");
      }
      return value;
    }
  }]);

  return OptionsOption;
}(Option);

var CommandLineParser2 = function () {
  function CommandLineParser2() {
    _classCallCheck(this, CommandLineParser2);

    this._name = process.title;
    this.options = [];
    this.option({ name: 'help', alias: 'h', type: 'boolean', descritpion: 'Prints help message' });
  }

  _createClass(CommandLineParser2, [{
    key: "name",
    value: function name(_name) {
      this._name = _name;
      return this;
    }
  }, {
    key: "description",
    value: function description(_description) {
      this._description = _description;
      return this;
    }
  }, {
    key: "version",
    value: function version(_version) {
      if ((typeof _version === "undefined" ? "undefined" : _typeof(_version)) == "object") {
        this._version = _version.version;
        _version.type = _version.type || 'boolean';
        _version.description = _version.description || "Prints version";
        this.option(_version);
      } else {
        this._version = _version;
        this.option({ name: 'version', alias: 'v', type: 'boolean', descritpion: 'Prints version' });
      }
      return this;
    }
  }, {
    key: "option",
    value: function option() {
      var option = void 0;
      if (_typeof(arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
        option = Option.define(arguments.length <= 0 ? undefined : arguments[0]);
      } else if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string') {
        // TODO
      }
      this.options.push(option);
      return this;
    }
  }, {
    key: "parse",
    value: function parse() {
      var argv = process.argv;
      var func = arguments.length <= 0 ? undefined : arguments[0];
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'array') {
        argv = arguments.length <= 0 ? undefined : arguments[0];
        func = arguments.length <= 1 ? undefined : arguments[1];
      }
      try {
        var _options = {};
        var option = void 0,
            index = void 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.getOptions(argv)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _ref = _step.value;

            var _ref2 = _slicedToArray(_ref, 2),
                option = _ref2[0],
                index = _ref2[1];

            _options[option.name] = option.value;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        for (option in this.options) {
          if (option.required && typeof option.value == 'undefined') {
            throw new ParseError(INVALID_VALUE, "Option " + option.name + " is required.");
          }
        }
        var commandArgs = argv.splice(index);

        if (_options.version) {
          console.log(this._version);
        } else if (_options.help) {
          this.print();
        } else if (func) {
          var _func;

          (_func = func).call.apply(_func, [_options].concat(_toConsumableArray(commandArgs)));
        } else {
          return { options: _options, arguments: commandArgs };
        }
      } catch (e) {
        //console.error(e.stack);
        this._error = e.message;
        this.print(process.stderr);
      }
    }
  }, {
    key: "usage",
    value: function usage(text) {
      this._usage = text;
    }
  }, {
    key: "print",
    value: function print() {
      var out = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.stdout;

      out.write(this._name + '\n');
      if (this._error) {
        out.write(this._error + '\n');
      }
    }
  }, {
    key: "getOptions",
    value: /*#__PURE__*/regeneratorRuntime.mark(function getOptions(argv) {
      var _this8 = this;

      var i, _loop, _ret;

      return regeneratorRuntime.wrap(function getOptions$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              i = 1;

              if (argv[0] == 'node') {
                i = 2;
              }
              _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                var arg, value, option, _option, _loop2, j;

                return regeneratorRuntime.wrap(function _loop$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        arg = argv[i];
                        value = argv[i + 1];

                        // Long option

                        if (!arg.startsWith('--')) {
                          _context2.next = 21;
                          break;
                        }

                        // Find the option
                        arg = arg.substring(2);
                        option = _this8.options.find(function (option) {
                          return arg == option.name;
                        });

                        // If option doesn't exist, error

                        if (option) {
                          _context2.next = 7;
                          break;
                        }

                        throw new ParseError(UNKNOWN_OPTION, "Option " + arg + " not found.");

                      case 7:
                        if (!option.hasArg()) {
                          _context2.next = 17;
                          break;
                        }

                        _context2.prev = 8;

                        option.setValue(value);
                        i += 1;
                        _context2.next = 17;
                        break;

                      case 13:
                        _context2.prev = 13;
                        _context2.t0 = _context2["catch"](8);

                        if (!(!option.hasDefault() || !value.startsWith('-'))) {
                          _context2.next = 17;
                          break;
                        }

                        throw _context2.t0;

                      case 17:
                        _context2.next = 19;
                        return [option, i + 1];

                      case 19:
                        _context2.next = 56;
                        break;

                      case 21:
                        if (!arg.startsWith('-')) {
                          _context2.next = 55;
                          break;
                        }

                        _option = _this8.options.find(function (option) {
                          return arg[1] == option.alias[0];
                        });

                        if (_option) {
                          _context2.next = 25;
                          break;
                        }

                        throw new ParseError(UNKNOWN_OPTION, "Option -" + arg[1] + " not found.");

                      case 25:
                        if (!_option.hasArg()) {
                          _context2.next = 44;
                          break;
                        }

                        if (!(arg.length > 2)) {
                          _context2.next = 31;
                          break;
                        }

                        value = arg.substring(2);
                        _option.setValue(value);
                        _context2.next = 40;
                        break;

                      case 31:
                        _context2.prev = 31;

                        _option.setValue(value);
                        i += 1;
                        _context2.next = 40;
                        break;

                      case 36:
                        _context2.prev = 36;
                        _context2.t1 = _context2["catch"](31);

                        if (!(!_option.hasDefault() || !value.startsWith('-'))) {
                          _context2.next = 40;
                          break;
                        }

                        throw _context2.t1;

                      case 40:
                        _context2.next = 42;
                        return [_option, i + 1];

                      case 42:
                        _context2.next = 53;
                        break;

                      case 44:
                        _context2.next = 46;
                        return [_option, i + 1];

                      case 46:
                        _loop2 = /*#__PURE__*/regeneratorRuntime.mark(function _loop2(j) {
                          return regeneratorRuntime.wrap(function _loop2$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  _option = _this8.options.find(function (option) {
                                    arg[j] == option.alias[0];
                                  });

                                  if (_option) {
                                    _context.next = 3;
                                    break;
                                  }

                                  throw new ParseError(UNKNOWN_OPTION, "Option -" + arg[j] + " not found.");

                                case 3:
                                  if (!_option.hasArg()) {
                                    _context.next = 5;
                                    break;
                                  }

                                  throw new ParseError(INVALID_OPTION, "Option -" + arg[j] + " requires an argument.");

                                case 5:
                                  _context.next = 7;
                                  return [_option, i + 1];

                                case 7:
                                case "end":
                                  return _context.stop();
                              }
                            }
                          }, _loop2, _this8);
                        });
                        j = 2;

                      case 48:
                        if (!(j < arg.length)) {
                          _context2.next = 53;
                          break;
                        }

                        return _context2.delegateYield(_loop2(j), "t2", 50);

                      case 50:
                        j++;
                        _context2.next = 48;
                        break;

                      case 53:
                        _context2.next = 56;
                        break;

                      case 55:
                        return _context2.abrupt("return", {
                          v: [undefined, i]
                        });

                      case 56:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _loop, _this8, [[8, 13], [31, 36]]);
              });

            case 3:
              if (!(i < argv.length)) {
                _context3.next = 11;
                break;
              }

              return _context3.delegateYield(_loop(), "t0", 5);

            case 5:
              _ret = _context3.t0;

              if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
                _context3.next = 8;
                break;
              }

              return _context3.abrupt("return", _ret.v);

            case 8:
              i++;
              _context3.next = 3;
              break;

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, getOptions, this);
    })
  }]);

  return CommandLineParser2;
}();

var commandLineParser = new CommandLineParser2();
exports.default = commandLineParser;