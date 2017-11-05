
const commandly = require("../../main/javascript/commandly");


const USAGE = `A command to run stuff


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




`;

test("Usage", () => {
  let out = { text: "" };
  out.write = function(t) { this.text += t; }

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
  commandly.printHelp(out);

  const lines1 = out.text.split("\n");
  const lines2 = USAGE.split("\n");
  expect(lines1.length).toBe(lines2.length);
  for (let i=0; i<lines1.length; i++) {
    expect(lines1[i].trim()).toBe(lines2[i].trim());
  }
});

test('String option', () => {
  const options = commandly
    .reset()
    .option({ name: 'string', alias: 's', description: 'String option', type: 'string' })
    ._parse([ "--string", "string" ]);
  expect(options.string).toBe('string');
  expect(typeof options.string).toBe("string");
});
test('String alias option', () => {
  const options = commandly
    .reset()
    .option({ name: 'string', alias: 's', description: 'String option', type: 'string' })
    ._parse([ "-s", "string" ]);
  expect(options.string).toBe('string');
  expect(typeof options.string).toBe("string");
});
test('String single option', () => {
  const options = commandly
    .reset()
    .option({ name: 'string', alias: 's', description: 'String option', type: 'string' })
    ._parse([ "-stest" ]);
  expect(options.string).toBe('test');
});
test("Default string option", () => {
  commandly.option({ name: 'defaultString', description: 'Deafult String option', type: 'string', defaultValue: 'string' })
  const options = commandly._parse([]);
  expect(options.defaultString).toBe('string');
});


test('Int option', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    ._parse([ "--int", "20" ]);
  expect(options.int).toBe(20);
});

test('Invalid Int option', () => {
  const options = commandly
  .reset()
  .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
  expect(() => { commandly._parse([ "--int", "asdf" ]) }).toThrow();
});


test('Float option', () => {
  const options = commandly
    .reset()
    .option({ name: 'float', alias: 'f', description: 'Float Option', type: 'float' })
    ._parse([ "--float", "3.4" ]);
  expect(options.float).toBeCloseTo(3.4);
});

test('Invalid Float option', () => {
  const options = commandly
    .reset()
    .option({ name: 'float', alias: 'f', description: 'Float Option', type: 'float' })
  expect(() => { commandly._parse([ "--float", "4.a4" ]) }).toThrow();
});


test('Boolean option', () => {
  const options = commandly
    .reset()
    .option({ name: 'boolean', alias: 'b', description: 'Boolean Option', type: 'boolean' })
    ._parse([ "--boolean" ]);
  expect(options.boolean).toBe(true);
});


test('Flag option', () => {
  const options = commandly
    .reset()
    .option({ name: 'flag', alias: 'f', description: 'Flag Option', type: 'flag' })
    ._parse([ "--flag" ]);
  expect(options.flag).toBe(true);
});
test('Multiple flags', () => {
  const options = commandly
    .reset()
    .option({ name: 'flag', alias: 'f', description: 'Boolean Option', type: 'boolean' })
    .option({ name: 'flag2', alias: 'a', description: 'Flag Option', type: 'flag' })
    ._parse([ "-fa" ]);
  expect(options.flag).toBe(true);
  expect(options.flag2).toBe(true);
});


test('Options option', () => {
  const options = commandly
    .reset()
    .option({ name: 'options', alias: 'o', description: 'Options option', type: 'options', options: [ 'one', 'two', 'there' ] })
    ._parse([ "--options", "one" ]);
  expect(options.options).toBe("one");
});
test('Invalid Options option', () => {
  const options = commandly
    .reset()
    .option({ name: 'options', alias: 'o', description: 'Options option', type: 'options', options: [ 'one', 'two', 'there' ] })
  expect(() => { commandly._parse([ "--options", "five" ]) }).toThrow();
});

test('Key Value option', () => {
  const options = commandly
    .reset()
    .option({ name: 'keyvalue', description: 'Key Value option', type: 'keyValue' })
    ._parse([ "--keyvalue", "key=value" ]);
  expect(options.keyvalue).toEqual({ 'key': 'value' });
});


test('List option', () => {
  const options = commandly
    .reset()
    .option({ name: 'list', description: 'List option', type: 'int', list: true })
    ._parse([ "--list", "1,2,3" ]);
  expect(options.list).toEqual([ 1, 2, 3 ]);
});
test('List option deliminator', () => {
  const options = commandly
    .reset()
    .option({ name: 'list', description: 'List option', type: 'int', list: true, deliminator: '|' })
    ._parse([ "--list", "10|11|12" ]);
  expect(options.list).toEqual([ 10, 11, 12 ]);
});
test('List option space', () => {
  const options = commandly
    .reset()
    .option({ name: 'list', description: 'List option', type: 'int', list: true })
    ._parse([ "--list", "4, 5, 6" ]);
  expect(options.list).toEqual([ 4, 5, 6 ]);
});


test('Default list option', () => {
  const options = commandly
    .reset()
    .option({ name: 'defaultList', description: 'List option', type: 'int', list: true, defaultValue: [ 1, 2, 3 ] })
    ._parse([ ]);
  expect(options.defaultList).toEqual([ 1, 2, 3 ]);
});


test('Multiple option', () => {
  const options = commandly
    .reset()
    .option({ name: 'multiple', alias: 'u', description: 'Multiple option', type: 'string', multiple: true })
    ._parse([ "--multiple", "first", "--multiple", "second", "--multiple", "third" ]);
  expect(options.multiple).toEqual([ "first", "second", "third" ]);
});


test('Map option', () => {
  const options = commandly
    .reset()
    .option({ name: 'map', alias: 'm', description: 'Map option', type: 'int', map: (x) => { return x + 10; } })
    ._parse([ "--map", "5" ]);
  expect(options.map).toBe(15);
});


test('Parse option', () => {
  const options = commandly
    .reset()
    .option({ name: 'parse', alias: 'p', description: 'Parse option', type: 'int', parse: (x) => { return parseInt(x, 10); } })
    ._parse([ "--parse", "3.asdf" ]);
  expect(options.parse).toBe(3);
});


test('Validate option', () => {
  const options = commandly
    .reset()
    .option({ name: 'validate', alias: 'a', description: 'Validate option', type: 'int', validate: (x) => {return (x < 10); } })
    ._parse([ "--validate", "5" ]);
  expect(options.validate).toBe(5);
});
test('Fail Validate option', () => {
  const options = commandly
    .reset()
    .option({ name: 'validate', alias: 'a', description: 'Validate option', type: 'int', validate: (x) => {return (x < 10); } })
  expect(() => { commandly._parse([ "--validate", "15" ]) }).toThrow();
});


test('Validator', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .option({ name: 'int2', description: 'Int Option', type: 'int' })
    .validate(options => { if ((!options.int) || (!options.int2)) return true; return (options.int == options.int2); }, "Option long and int must be the same")
    ._parse([ "--int", "15", "--int2", "15" ]);
  expect(options.int).toBe(15);
  expect(options.int2).toBe(15);
});

test('Fail Validator', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .option({ name: 'int2', description: 'Int Option', type: 'int' })
    .validate(options => { if ((!options.int) || (!options.int2)) return true; return (options.int == options.int2); }, "Option long and int must be the same")
  expect(() => { commandly._parse([ "--int", "15", "--int2", "25" ]) }).toThrow();
});


test('Command', () => {
  const options = commandly
    .reset()
    .command({ name: "test", description: "This command" })
    .command({ name: "test2", description: "This command" })
    ._parse([ "test" ]);
  expect(options.command).toBe("test");
});
test('Command with args', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .command({ name: "test", description: "This command" })
    .command({ name: "test2", description: "This command" })
    ._parse([ "--int", "4", "test" ]);
    expect(options.command).toBe("test");
    expect(options.int).toBe(4);
});
test('Command with tailing args', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .command({ name: "test", description: "This command" })
    .command({ name: "test2", description: "This command" })
    ._parse([ "test", "--int", "4" ]);
    expect(options.command).toBe("test");
    expect(options.int).toBe(4);
});




test('Argument', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1" })
    ._parse([ "test" ]);
  expect(options.arg1).toBe("test");
});
test('Extra Arguments', () => {
  const options = commandly
    .reset()
    .config({ allowExtraArguments: true })
    .argument({ name: "arg1" })
    ._parse([ "test", "more", "args" ]);
  expect(options.arg1).toBe("test");
  expect(options.arguments).toEqual([ "more", "args" ]);
});
test('Fail Extra Arguments', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1" })
  expect(() => { commandly._parse([ "test", "more", "args" ]); }).toThrow();
});
test('Argument With Options', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .argument({ name: "arg1" })
    ._parse([ "--int", "4", "test" ]);
  expect(options.arg1).toBe("test");
});
test('Failed Argument with tailing options', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .argument({ name: "arg1", multiple: true })
    ._parse([ "test", "--int", "4" ]);
    expect(options.arg1).toEqual([ "test", "--int", "4" ]);
});
test('Fail Argument with tailing options', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .argument({ name: "arg1" })
  expect(() => { commandly._parse([ "test", "--int", "4" ]); }).toThrow();
});
test('Parse Argument with tailing options', () => {
  const options = commandly
    .reset()
    .config( { allowTrailingOptions: true } )
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .argument({ name: "arg1" })
    ._parse([ "test", "--int", "4" ]);
  expect(options.arg1).toBe("test");
  expect(options.int).toBe(4);
});
test('Argument With Command and Args', () => {
  const options = commandly
    .reset()
    .option({ name: 'int', alias: 'i', description: 'Int Option', type: 'int' })
    .command({ name: "command1", description: "This command" })
    .command({ name: "command2", description: "This command" })
    .argument({ name: "arg1" })
    ._parse([ "--int", "4", "command1", "test" ]);
  expect(options.command).toBe("command1");
  expect(options.arg1).toBe("test");
  expect(options.int).toBe(4);
});
test('Argument Variable', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1", variableName: "firstArg" })
    ._parse([ "test" ]);
  expect(options.firstArg).toBe("test");
});
test('Required Argument', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1", required: true })
  expect(() => { commandly._parse([ ]) }).toThrow();
});
test('Two Arguments', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1", required: true })
    .argument({ name: "arg2" })
    ._parse([ "test1", "test2" ]);
  expect(options.arg1).toBe("test1");
  expect(options.arg2).toBe("test2");
});
test('Mulitple Argument', () => {
  const options = commandly
    .reset()
    .argument({ name: "arg1", multiple: true })
    ._parse([ "test1", "test2" ]);
  expect(options.arg1).toEqual([ "test1", "test2" ]);
});

test('Command Argument', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .argument({ name: "arg1", command: "command1" })
    ._parse([ "command1", "test1" ]);
  expect(options.arg1).toEqual("test1");
});
test('Required Command Argument', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .argument({ name: "arg1", command: "command1", required: true })
    expect(() => { commandly._parse([ "command1" ]) }).toThrow();
});
test('Wrong Command Argument', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .argument({ name: "arg1", command: "command1" })
    expect(() => { commandly._parse([ "command2", "test1" ]) }).toThrow();
});


test('Command Option', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .option({ name: "option", type: 'string', command: "command1" })
    ._parse([ "command1", "--option", "test1" ]);
  expect(options.option).toEqual("test1");
});
test('Required Command Option', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .option({ name: "option", type: 'string', command: "command1", required: true })
    expect(() => { commandly._parse([ "command1" ]) }).toThrow();
});
test('Wrong Command Option', () => {
  const options = commandly
    .reset()
    .command({ name: "command1", description: "Description command1" })
    .command({ name: "command2", description: "Description command2" })
    .option({ name: "option", type: 'string', command: "command1" })
    expect(() => { commandly._parse([ "command2", "--option", "test1" ]) }).toThrow();
});
