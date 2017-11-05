# commandly

The ultimate command line parser

## Overview

Parses command line options for JavaScript CLI commands.  Supports the following:
* Short (-o) and long (--option) options
* Options with and without values
* Option values of differnt types (string, int, float, key-value, etc.)
* Option specified multiple times (--option 1 --option 2 --option 3)
* Options with list values (--option 1,2,3)
* Custom parsing of option values
* Custom validation of option values
* Cross option validation
* Required options
* Named arguments
* Required arguments
* Custom validation of arguments
* Command support (git style)
* Automatic usage and help generation

## Usage
```js
    const commandly = require("commandly");
    const options = commandly
      .name("command")
      .version("1.0.0")
      .description("A command to run stuff")
      .option({ name: 'string', alias: 's', description: 'A string option', type: 'string' })
      .option({ name: 'boolean', alias: 'b', description: 'A boolean (flag) option', type: 'boolean' })
      .option({ name: 'flag', alias: 'f', description: 'Another boolean (flag) option', type: 'boolean' })
      .option({ name: 'int', alias: 'i', description: 'An integer option', type: 'int', required: true, variableName: 'val' })
      .option({ name: 'float', description: 'A float option with no short form', type: 'int', required: true, variableName: 'val' })
      .option({ name: 'option', alias: 'o', description: 'An option which can only be one of several values', type: 'options', options: [ 'one', 'two', 'three' ] })
      .option({ name: 'required', alias: 'r', description: 'An integer option', type: 'int', required: true, variableName: 'val' })
      .option({ name: 'multiple', alias: 'm', description: 'An option that is allow to return multple times', type: 'string', multiple: true })
      .option({ name: 'list', alias: 'l', description: 'An option that takes a list of values', type: 'string', list: true })
      .option({ name: 'validate', alias: 'V', description: 'An option which will be validated', type: 'int', validate: (x) => { return x>10; } })
      .option({ name: 'command', alias: 'c', description: 'An option that is only valid for the add command', type: 'string', command: "add" })
      .option({ name: 'group', alias: 'g', description: 'Grouping of options for display in help text', type: 'string', group: "Group 1" })
      .command({ name: "add", description: "Description of the add command" })
      .command({ name: "remove", description: "Description of the remove command" })
      .command({ name: "save", description: "Description of the save command" })
      .argument({ name: "first", description: "A required argument", required: true })
      .argument({ name: "addArg", description: "An argument just for the add command", command: "add" })
      .argument({ name: "other", description: "The rest of the arguments", multiple: true })
      .helpSection('More Info', 'For more info see: http://www.github.com/spearson/commandly')
      .helpSection('Author', 'Steven Pearson')
      .process();

    if (options.command === 'add') {
      if (opitons.boolean) && (opitons.flag) {
        const num = options.int + options.float + 10.0;

      }
    }
```


## API

### name(name)
The name of the command for usage


### version(version)
The version of the command for usage


### description(description)
The description of the command for usage


### argument(argument)
### argument(name, description, required = false, multiple = false) {
Defines an argument for the command. Members include:
   * name: Name of argument
   * description: Argument description
   * required: Is this argument required?
   * multiple: Is argument allowed more than once?
   * defaultValue: Default value of argument if not given
   * validator: A validator function (returns false or throws an error)
   * command: Specifies that this argument is only valid with a specific command


### command(command)
### command(name, description)
Defines a command for the command (github style)
   * name: Command name
   * description: Command description


### option(option)
### option(name, alias, type, description, required)
Defines an option for the command
   * name: Option name (used with --xxxx)
   * alias: Option alias (used as -X) (optional)
   * type: Option type (string, int, float, boolean, flag, options, keyValue)
   * description: Option description (optional)
   * group: Name of the group of options this option belongs to (optional)
   * variableName: Variable name to use with usage message (optional)
   * required: Is this option required? (optional)
   * multiple: Is option allowed more than once? (optional)
   * list: Can a list of values be passed to the option? (optional)
   * defaultValue: Default value of option (optional)
   * parse: Function to parse value (called before value has been set to correct type -- is still a string) (optional)
   * map: Function to map a value (called after value has been set to correct type) (optional)
   * validator: A validator function (returns false or throws an error) (optional)
   * command: Specifies that this option is only valid with a specific command (optional)


### validate(function, string)
Adds a cross option validator
   * validator: Function which returns false or throws error if validation fails
   * message: Message to display on validator returning false (optional)


### usage(text)
Sets the usage text to be used instead of the auto generated one
   * text: The usage text (overrides auto-generated usage)


### helpSection(name, text)
Adds another section to the help printout
   * name: Name of the section
   * text: Text of the section


### config(config)
Sets config for commandly
   * allowTrailingOptions: Allow options after the first argument (default: false)
   * allowExtraArguments: Allow argumnets that were not defined by a call to argument() (default: false)
   * commandVariableName: Variable name to hold command name returned from parse() (default: 'command')
   * argumentsVariableName: Variable name to hold extra arguments returned from parse() (default: 'arguments')


### parse(args)
Parses the arguments and returns options, command and arguments
Throws a ParseError on error
   * args: The arguments (defaults to arguments from process.argv)


### process(args)
Parses and processes the arguments and returns options, command and arguments
Prints usage on help argument
Prints version on version argument
Prints error and usage on error
   * args: The arguments (defaults to arguments from process.argv)


