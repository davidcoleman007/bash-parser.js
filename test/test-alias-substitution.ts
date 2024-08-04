import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('alias with no argument', () => {
  const result = bashParser('thisIsAlias world', {
    resolveAlias: (name) => name === 'thisIsAlias' ? 'test-value' : undefined,
  });
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'test-value' },
      suffix: [{ type: 'Word', text: 'world' }],
    }],
  });
});

Deno.test('alias with duplicating stream redirection', () => {
  const result = bashParser('2>&1 world', {
    resolveAlias: (name) => name === 'world' ? 'test-value' : undefined,
  });
  // utils.logResults(result);
  utils.checkResults(
    result.commands[0].name,
    { type: 'Word', text: 'test-value' },
  );
});

Deno.test('alias with arguments', () => {
  const result = bashParser('thisIsAlias world', {
    resolveAlias: (name) => name === 'thisIsAlias' ? 'test-value earth' : undefined,
  });
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'test-value' },
      suffix: [
        { type: 'Word', text: 'earth' },
        { type: 'Word', text: 'world' },
      ],
    }],
  });
});

Deno.test('alias with prefixes', () => {
  const result = bashParser('thisIsAlias world', {
    resolveAlias: (name) => name === 'thisIsAlias' ? 'a=42 test-value' : undefined,
  });
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      prefix: [{ type: 'AssignmentWord', text: 'a=42' }],
      type: 'Command',
      name: { type: 'Word', text: 'test-value' },
      suffix: [{ type: 'Word', text: 'world' }],
    }],
  });
});

Deno.test('recursive alias with prefixes', () => {
  const result = bashParser('thisIsAlias world', {
    resolveAlias: (name) => {
      if (name === 'thisIsAlias') {
        return 'a=42 recurse';
      }
      if (name === 'recurse') {
        return 'echo other';
      }
    },
  });
  // utils.logResults(result)

  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      prefix: [{ type: 'AssignmentWord', text: 'a=42' }],
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [
        { type: 'Word', text: 'other' },
        { type: 'Word', text: 'world' },
      ],
    }],
  });
});

Deno.test('guarded against infinite loops', () => {
  const result = bashParser('thisIsAlias world', {
    resolveAlias: (name) => {
      if (name === 'thisIsAlias') {
        return 'alias1';
      }
      if (name === 'alias1') {
        return 'alias2';
      }
      if (name === 'alias2') {
        return 'thisIsAlias ciao';
      }
    },
  });
  // utils.logResults(result)

  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'thisIsAlias' },
      suffix: [
        { type: 'Word', text: 'ciao' },
        { type: 'Word', text: 'world' },
      ],
    }],
  });
});
