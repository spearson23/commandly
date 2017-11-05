const ParseError = require("./parse-error");
const Option = require("./option");
const path = require("path");
const fs = require("fs");
const Table = require("table-layout");


/**
 * Commandly
 * The ultimate command line parser
 */
class Commandly {
  constructor() {
    this.reset();
  }

  /**
   * Resets the command line parser to default state
   */
  reset() {
    this._options = [];
    this.option({ name: 'help', alias: 'h', type: 'boolean', description: 'Parints help message'});
    this._validators = [];
    this._arguments = [];
    this._commands = [];
    this._sections = [];
    this._config = {
      allowTrailingOptions: false,
      allowExtraArguments: false,
      commandVariableName: 'command',
      argumentsVariableName: 'arguments',
      commandRequired: true
    }
    return this;
  }

  /**
   * Sets config
   * allowTrailingOptions - Allow options after the first argument (default: false)
   * allowExtraArguments - Allow argumnets that were not defined by a call to argument() (default: false)
   * commandVariableName - Variable name to hold command name returned from parse() (default: 'command')
   * argumentsVariableName - Variable name to hold extra arguments returned from parse() (default: 'arguments')
   *
   * @param {object} config
   */
  config(config) {
    Object.assign(this._config, config);
    return this;
  }

  /**
   * Sets then name of the program
   *
   * @param {string} name The name
   */
  name(name) {
    this._name = name;
    return this;
  }
  /**
   * Sets the description of the program
   *
   * @param {string} description
   */
  description(description) {
    this._description = description;
    return this;
  }
  /**
   * Sets the version of the program and adds --version and -v options
   * which will dispaly version
   *
   * @param {string} version
   */
  version(version) {
    if (typeof version == "object") {
      this._version = version.version;
      version.type = version.type || 'boolean';
      version.description = version.description || "Prints version";
      this.option(version);
    } else {
      this._version = version;
      this.option({ name: 'version', alias: 'v', type: 'boolean', description: 'Prints version'});
    }
    return this;
  }

   /**
   * Adds a new argument
   * Members of argument
   * name: Name of argument
   * description: Argument description
   * required: Is this argument required?
   * multiple: Is argument allowed more than once?
   * defaultValue: Default value of argument if not given
   * validator: A validator function (returns false or throws an error)
   * command: Specifies that this argument is only valid with a specific command
   *
   * deliminator Deliminator to use with list
   *
   * @param {object} args
   *//**
   * Shortcut way to add an argument
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} required
   * @param {boolean} multiple
   */
  argument(name, description, required = false, multiple = false) {
    let argument;
    if (typeof name === 'object') {
      name.variableName = name.variableName || name.name;
      argument = name;
    } else {
      argument = { name: name, required: required, multiple: multiple, variableName: name };
    }
    if (this._arguments.length > 0) {
      const lastArgument = this._arguments[this._arguments.length-1];
      if (lastArgument.multiple)
        throw new ParseError(ParseError.INVALID_OPTION, "No arguments are allowed after a multiple argument");
      if (!lastArgument.required && argument.required) {
        throw new ParseError(ParseError.INVALID_OPTION, "No required arguments are allowed after a unrequired argument");
      }
    }
    this._arguments.push(argument);
    return this;
  }
  arg(name, multiple) {
    return this.argument(name, multiple);
  }

  /**
   * Adds a new Command
   * Members of command:
   * name: Command name
   * description: Command description
   *
   * @param {object} command The command
   *//**
   * Shortcut way to add a new command
   *
   * @param {string} name Command name
   * @param {string} description Command description
   */
  command(name, description) {
    let command;
    if (typeof name === 'object') {
      command = name;
    } else if (typeof args[0] === 'string') {
      command = { name: name, description: description };
    }
    this._commands.push(command);
    return this;
  }
  /**
   * Adds a new option
   * Members of option
   * name: Option name (used with --xxxx)
   * alias: Option alias (used as -X)
   * type: Option type (string, int, float, boolean, flag, options, keyValue)
   * description: Option description
   * group: Name of the group of options this option belongs to
   * variableName: Variable name to use with usage message
   * required: Is this option required?
   * multiple: Is option allowed more than once?
   * list: Can a list of values be passed to the option?
   * defaultValue: Default value of option
   * parse: Function to parse value (called before value has been set to correct type -- is still a string)
   * map: Function to map a value (called after value has been set to correct type)
   * validator: A validator function (returns false or throws an error)
   * command: Specifies that this option is only valid with a specific command
   *
   * deliminator Deliminator to use with list
   *
   * @param {object} args
   *//**
   * Shortcut way to add a new command
   *
   * @param {string} name Command name
   * @param {string} alias Command alias
   * @param {string} type Command description
   * @param {string} description Command description
   * @param {string} required Command description
   */
  option(name, alias, type, description, required) {
    let option;
    if (typeof name === 'object') {
      option = name;
    } else if (typeof args[0] === 'string') {
      option = {
        name: name,
        alias: alias,
        type: type,
        description, description,
        required: required
      };
      // TODO
    }
    this._options.push(Option.define(option));
    return this;
  }

  /**
   * Adds a validator function
   *
   * @param {function} validator Function which returns false or throws error if validation fails
   * @param {string} message Message to display on validator returning false
   */
  validate(validator, message) {
    const v = { func: validator, message: message || "Options are invalid." }
    this._validators.push(v);
    return this;
  }

  /**
   * Sets the usager text to be used instead of the auto generated one
   * @param {string} text
   */
  usage(text) {
    this._usage = text;
  }

  /**
   * Adds another section to the help printout
   */
  helpSection(sectionName, text) {
    this._sections.push({ name: sectionName, text: text });
    return this;
  }

  /**
   * Parses the arguments
   *
   * @param {array} args The arguments (defaults to arguments from process.argv)
   * @return {object} The options, command and arguments
   * @throws ParseError on error
   */
  parse(args) {
    let argv;
    if (Array.isArray(args)) {
      argv = args;
    } else {
      argv = process.argv.slice(0);
      argv.splice(0, 2);
      output = args;
    }
    return this._parse(argv);
  }

  /**
   * Parses the arguments and handle errors and standard options (version and help)
   *
   * @param {array} args The arguments (defaults to arguments from process.argv)
   * @return {object} The options, command and arguments
   */
  process(args) {
    try {
      const options = this.parse(args);

      if (options.version) {
        process.stdout.write(this._version);
        process.stdout.write("\n");
      } else if (options.help) {
        this.printHelp();
      } else {
        return options;
      }
    } catch (e) {
      process.stderr.write("Error:\n  ");
      process.stderr.write(e.message);
      process.stderr.write("\n\n");
      this.printHelp(process.stderr);
    }
  }

  _parse(argv, func) {
    // Reset if run previously (shouldn't really happen)
    this._options.forEach(option => { option.reset(); });

    // Options object
    let options = {};

    // Loop through all options
    let i;
    let iter = this._getOptions(argv);
    for (i=iter.next(); !i.done; i=iter.next()) {
      const option = i.value;
      options[option.name] = option.value;
    }

    this._options.forEach(option => {
    });

    // Set command if given
    let [command, args ] = i.value;
    if (command) {
      options[this._config.commandVariableName] = command.name;
    }

    // Check for options that don't match command
    // and  for required options
    this._options.forEach(option => {
      if (typeof option.value === 'undefined') {
        if ((option.required) && ((!option.command) || (option.command === command.name))) {
          throw new ParseError(ParseError.INVALID_VALUE, "Option " + option.name + " is required.");
        }
      } else {
        if ((option.command) && (option.command !== command.name)) {
          throw new ParseError(ParseError.INVALID_OPTION, "Option " + option.name + ' is only for the ' + option.command + ' command.');
        }
      }
    });

    // Check arguments
    for (let i=0; i<this._arguments.length; i++) {
      const argument = this._arguments[i];

      // If argument is for different command, skip it
      if ((argument.command) && (argument.command !== command.name)) {
        continue;
      }

      // If argument has default value, set it
      if ((typeof args[0] === 'undefined') && (argument.defaultValue)) {
        args.unshift(argument.defaultValue);
      }

      // If argument is required but has no value, throw error
      if ((typeof args[0] === 'undefined') && (argument.required)) {
        throw new ParseError(ParseError.INVALID_VALUE, "No argument given for argument " + argument.name);
      }

      // Validate argument
      const value = (argument.multiple) ? args.splice(0) : args.splice(0, 1)[0];
      if (argument.validator) {
        if (!argument.validator.call(argument, value)) {
          throw new ParseError(ParseError.INVALID_VALUE, "Invalid value (" + value + ") for argument " + argument.name);
        }
      }

      // Set argument
      options[argument.variableName] = value;
    }

    // If we have extra arguments (and they are allowed), set them
    if (args.length > 0) {
      if (!this._config.allowExtraArguments) {
        throw new ParseError(ParseError.INVALID_VALUE, "Extra arguments (" + args + ") found.");
      } else {
        options[this._config.argumentsVariableName] = args;
      }
    }

    // Run validators
    this._validators.forEach(validator => {
      if (!validator.func.call(this, options)) {
        throw new ParseError(ParseError.INVALID_VALUE, validator.message);
      }
    });

    return options;
  }

  _printDescription(out) {
    if (this._description) {
      const table = new Table({ column: this._description }, {
        padding: { left: '', right: ' ' },
        maxWidth: 80
      })
      out.write(table.toString());
      out.write("\n\n");
    }
  }
  _getCommandUsage(command) {
    let usage = "";
    if (typeof command !== 'undefined') {
      usage += ' ' + command;
    } else if (this._commands.length > 0) {
      usage += " <command>";
    }

    let more = false;
    this._options.forEach(option => {
      if ((option.required) && ((typeof command === 'undefined') || (!option.command) || (option.command === command))) {
        if (option.alias) {
          usage += " (--" + option.name + "|-" + option.alias + ")";
        } else {
          usage += " --" + option.name;
        }
        if (option.hasArg()) {
          usage += " <" + option.variableName + ">";
        }
      } else {
        more = true;
      }
    });
    if (more) {
      usage += " [options]";
    }

    this._arguments.forEach(argument => {
      if ((typeof command === 'undefined') || (!argument.command) || (argument.command === command)) {
        if (argument.required) {
          usage += " <" + argument.variableName + ">";
        } else {
          usage += " [<" + argument.variableName + ">]";
        }
        if (argument.multiple) {
          usage += "...[<" + argument.variableName + ">]";
        }
      }
    });
    return usage.substring(1);
  }


  _printUsage(out) {
    out.write("Usage:\n");
    if (!this._usage) {
      const columns = [];

      let commandSpecific = this._options.find(option => { return option.command && option.required}) || this._arguments.find(arg => { return arg.command })
      if (commandSpecific) {
        let usage = this._getCommandUsage('');
        if (usage) {
          columns.push({ name: this._name, usage: usage });
        }
        this._commands.forEach(command => {
          columns.push({ name: this._name, usage: this._getCommandUsage(command.name) });
        });
      } else {
        const column = {};
        column.name = this._name;
        column.usage = this._getCommandUsage();
        columns.push(column);
      }

      const table = new Table(columns, {
        padding: { left: '', right: '' },
        columns: [ { name: 'name', padding: { left: '  ', right: '' } }, { name: 'usage', padding: { left: ' ', right: ' ' } } ],
        maxWidth: 80
      });
      out.write(table.toString());
      out.write("\n\n");

    } else {
      const table = new Table({ column: column.usage }, {
        padding: { left: '  ', right: ' ' },
        maxWidth: 80
      });
      out.write(table.toString());
      out.write("\n\n");
    }
  }
  _printCommands(out) {
    if (this._options._commands > 0) {
      out.write("Commands:\n");
      const table = new Table(this._commands, {
        padding: { left: '  ', right: ' ' },
        maxWidth: 80
      })
      out.write(table.toString());
      out.write("\n\n");
    }
  }
  _printOptions(out) {
    if (this._options.length > 0) {
      let optionGroups = this._options.reduce((optionGroups, option) => {
        let groupName = option.group || option.command || '';
        let index = optionGroups.findIndex((group) => { return group.name == groupName; } );
        if (index < 0) {
          optionGroups.push({ name: groupName, options: [ option ] });
        } else {
          optionGroups[index].options.push(option);
        }
        return optionGroups;
      }, []);
      optionGroups.forEach(group => {
        if (group.name) {
          out.write(group.name);
          out.write(" Options:\n");
        } else {
          out.write("Options:\n");
        }
        const columns = group.options.map(option => { return { name: option._getOptionText(), description: option.description }; });
        const table = new Table(columns, {
          padding: { left: '  ', right: ' ' },
          maxWidth: 80
        })
        out.write(table.toString());
        out.write("\n");
      });
      out.write("\n");
    }
  }
  _printSections(out) {
    this._sections.forEach(section => {
      out.write(section.name);
      out.write(":\n");
      const table = new Table({ column: section.text }, {
        padding: { left: '  ', right: ' ' },
        maxWidth: 80
      })
      out.write(table.toString());
      out.write("\n\n");
    });

  }

  printHelp(out = process.stdout) {
    this._printDescription(out);
    this._printUsage(out);
    this._printCommands(out);
    this._printOptions(out);
    this._printSections(out);
    out.write("\n\n");
  }

  *_getOptions(argv) {
    let args = [];
    let command;

    // Loop through command line arguments
    for (let i=0; i<argv.length; i++) {
      // Argument and it's value (if given)
      let arg = argv[i];
      let value = argv[i+1];

      // Long option
      if (arg.startsWith('--')) {
        // Find the option
        arg = arg.substring(2);
        let option = this._options.find(option => { return arg == option.name; });

        // If option doesn't exist, error
        if (!option) {
          throw new ParseError(ParseError.UNKNOWN_OPTION, "Option " + arg + " not found.");
        }
        // If option takes a value, set it
        if (option.hasArg()) {
          option.setValue(value);
          i += 1;
        } else {
          option.setValue();
        }

        // Yield back
        yield option;

      // Short option
      } else if (arg.startsWith('-')) {
        // Find the opiton or error out
        let option = this._options.find(option => { return option.alias && arg[1] == option.alias[0]; });
        if (!option) {
          throw new ParseError(ParseError.UNKNOWN_OPTION, "Option -" + arg[1] + " not found.");
        }

        // If option takes and arugment,
        if (option.hasArg()) {
          // ... either get from this arg (-Dtest)
          // or get from next arg (-D test) form
          if (arg.length > 2) {
            value = arg.substring(2);
            option.setValue(value);
          } else {
            option.setValue(value);
            i += 1;
          }

          // Yield back
          yield option;
        } else {
          // If option doesn't take and arg, set Value to nothing
          // And yield it back
          option.setValue();
          yield option;

          // Now look form more aliased options (-abc)
          // Loop though all other letters
          for (let j=2; j<arg.length; j++) {
            // Find and option or error out
            option = this._options.find(option => {  return option.alias && arg[j] == option.alias[0] });
            if (!option) {
              throw new ParseError(ParseError.UNKNOWN_OPTION, "Option -" + arg[j] + " not found.");
            }
            // Can't take a value in this form...
            if (option.hasArg()) {
              throw new ParseError(ParseError.INVALID_OPTION, "Option -" + arg[j] + " requires an argument.");
            } else {
              option.setValue();
            }

            // Yield back
            yield option;
          }
        }
      } else {
        // Not an option so either a command or an argument
        // First look for a command (must come before any arguments)
        if ((!command) && (this._commands.length > 0)) {
          command = this._commands.find(command => { return arg == command.name; });
          if (!command) {
            throw new ParseError(ParseError.INVALID_OPTION, "Unknown command " + arg);
          }
        } else {
          // This is an arugment, if we ally options after arguments,
          // add this to args and keep processing
          // Otherwise, all remaining command line args are aguments
          // so break out
          if (this._config.allowTrailingOptions) {
            args.push(argv[i]);
          } else {
            args = argv.splice(i);
            break;
          }
        }
      }
    }
    // Loop through options looking for options with defaults which haven't been
    // set from command line
    for (let j in this._options) {
      const option = this._options[j];
      if ((typeof option.value === 'undefined') && (option.defaultValue)) {
        option.value = option.defaultValue;

        // Yield back
        yield option;
      }
    }

    return [ command, args ];
  }
}



module.exports = new Commandly();

module.exports.DUPLICATE_OPTION = ParseError.DUPLICATE_OPTION;
module.exports.INVALID_OPTION = ParseError.INVALID_OPTION;
module.exports.UNKNOWN_OPTION = ParseError.UNKNOWN_OPTION;
module.exports.INVALID_VALUE = ParseError.INVALID_VALUE;
