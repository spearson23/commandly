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
      .option({ name: 'required', alias: 'r', description: 'A required integer option', type: 'int', required: true, variableName: 'val' })
      .option({ name: 'multiple', alias: 'm', description: 'An option that is allow to return multple times', type: 'string', multiple: true })
      .option({ name: 'list', alias: 'l', description: 'An option that takes a list of values', type: 'string', list: true })
      .option({ name: 'validate', alias: 'V', description: 'An option which will be validated', type: 'int', validate: (x) => { return x>10; } })
      .option({ name: 'command', alias: 'c', description: 'An option that is only valid for the add command', type: 'string', command: "add" })
      .option({ name: 'group', alias: 'g', description: 'Grouping of options for display in help text', type: 'string', group: "Group 1" })
      .option({ name: 'parse', alias: 'p', description: 'Custom parsing', type: 'int', parse: (x) => { if (x === 'one') return 1; } })
      .command({ name: "add", description: "Description of the add command" })
      .command({ name: "remove", description: "Description of the remove command" })
      .command({ name: "save", description: "Description of the save command" })
      .argument({ name: "first", description: "A required argument", required: true })
      .argument({ name: "addArg", description: "An argument just for the add command", command: "add" })
      .argument({ name: "other", description: "The rest of the arguments", multiple: true })
      .helpSection('More Info', 'For more info see: http://www.github.com/spearson/commandly')
      .helpSection('Author', 'Steven Pearson')
      .process(argv);

    switch (options.command) {
      case 'add': {
        if ((options.string === 'string') && (options.boolean)) {
        }
      }
      case 'remove': {
        if ((options.int === 3) && (options.float === 5.4) && (options.multiple.findIndex('here') >= 0)) {
        }
      }
      case 'save': {
        if (options.option === 'two') {
        }
      }
    }
```

```
$ commmand --help

A command to run stuff


Usage:
  command (--int|-i) <val> --float <val> (--required|-r) <val> [options]
          <first> [<other>]...[<other>]
  command add (--int|-i) <val> --float <val> (--required|-r) <val> [options]
          <first> [<addArg>] [<other>]...[<other>]
  command remove (--int|-i) <val> --float <val> (--required|-r) <val> [options]
          <first> [<other>]...[<other>]
  command save (--int|-i) <val> --float <val> (--required|-r) <val> [options]
          <first> [<other>]...[<other>]


Options:
  -h, --help <boolean>      Parints help message
  -v, --version <boolean>   Prints version
  -s, --string <string>     A string option
  -b, --boolean <boolean>   A boolean (flag) option
  -f, --flag <boolean>      Another boolean (flag) option
  -i, --int <val>           An integer option
  --float <val>             A float option with no short form
  -o, --option <options>    An option which can only be one of several values
  -r, --required <val>      An integer option
  -m, --multiple <string>   An option that is allow to return multple times
  -l, --list <string>       An option that takes a list of values
  -V, --validate <int>      An option which will be validated

add Options:
  -c, --command <string>   An option that is only valid for the add command

Group 1 Options:
  -g, --group <string>   Grouping of options for display in help text


More Info:
  For more info see: http://www.github.com/spearson/commandly


Author:
  Steven Pearson
```


For more, see Examples below.


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


## Examples

### Basic types
Options can be either string, int, float, boolean/flag, option or key/value.
```js
  const options = commandly
    .option({ name: 'string', alias: 's', description: 'A string option', type: 'string' })
    .option({ name: 'boolean', alias: 'b', description: 'A boolean (flag) option', type: 'boolean' })
    .option({ name: 'flag', alias: 'f', description: 'Another boolean (flag) option', type: 'boolean' })
    .option({ name: 'int', alias: 'i', description: 'An integer option', type: 'int',  })
    .option({ name: 'float', description: 'A float option with no short form', type: 'int',  })
    .option({ name: 'option', alias: 'o', description: 'An option which can only be one of several values', type: 'options', options: [ 'one', 'two', 'three' ] })
    .option({ name: 'keyvalue', alias: 'k', description: 'An option which has a key and value', type: 'keyvalue' })
    .process([ '--string', 'text', '--boolean', '--flag', '--int', '3', '--float', '5.4', '--option', 'one', '-keyvalue', 'key=value' ]);
  options.string = 'text';
  options.boolean = true;
  options.flag = true;
  options.int = 3;
  options.float = 5.4';
  options.option = 'one';
  options.keyvalue.key = 'value';
```

### Aliases
Options can have short forms (-b).
Multiple boolean options can be combine together on command line (-bf)
```js
  const options = commandly
    .option({ name: 'boolean', alias: 'b', description: 'A boolean (flag) option', type: 'boolean' })
    .option({ name: 'flag', alias: 'f', description: 'Another boolean (flag) option', type: 'boolean' })
    .option({ name: 'int', alias: 'i', description: 'An integer option', type: 'int', required: true, variableName: 'val' })
    .process([ '-bf', '-i', '3' ]);
  options.boolean = true;
  options.flag = true;
  options.int = 3;
```

### Multiple and list options
Options with multiple values can be either specified multiple times or as lists or as key/values.
```js
  const options = commandly
    .option({ name: 'string', alias: 's', description: 'A string option', type: 'string', multiple: true })
    .option({ name: 'int', alias: 'i', description: 'An integer option', type: 'int', list: true })
    .option({ name: 'keyvalue', alias: 'k', description: 'An option which has a key and value', type: 'keyvalue', multiple: true })
    .process([ '--string', 'text', '--string', 'text2', '--int', '3,5,7', '--keyvalue', 'key=value', '--keyvalue', 'key2=value2' ]);
  options.string = [ 'text', 'test2' ];
  options.int = [ 3, 5, 7 ];
  options.keyvalue.key = 'value';
  options.keyvalue.key2 = 'value2';
```

### Required options
Options can be required
```js
  const options = commandly
    .option({ name: 'required', alias: 'r', description: 'An required integer option', type: 'int', required: true })
    .process([ ]);
  // Prints error message
```

### Default values options
Options can be required
```js
  const options = commandly
    .option({ name: 'default', alias: 'd', description: 'An option with a default value', type: 'int', defaultValue: 1 })
    .process([ ]);
  options.default === 1
```

### Options can have there own custom parser
Define a custom parser for an options value
```js
  const options = commandly
    .option({ name: 'date', alias: 'd', description: 'A date', type: 'int', parse: (x) => { return Date.parse(x).valueOf() } })
    .process([ ]);
  options.default === 1
```
