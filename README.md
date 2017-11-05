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
    // Use command
  }

## Details

### name(string)
The name of the command for usage

### version(string)
The version of the command for usage

### description(string)
The description of the command for usage
