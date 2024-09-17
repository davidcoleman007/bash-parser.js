import operators from '~/modes/bash/enums/operators.ts';
import reducers from '~/modes/bash/reducers/mod.ts';
import { tokenize as delimiterTokanize } from '~/tokenizer/mod.ts';
import toArray from '~/utils/iterable/to-array.ts';
import utils from './_utils.ts';

const mkloc = ([startCol, startRow, startChar]: number[], [endCol, endRow, endChar]: number[]) => {
  return JSON.stringify({
    start: {
      col: startCol,
      row: startRow,
      char: startChar,
    },
    end: {
      col: endCol,
      row: endRow,
      char: endChar,
    },
  });
};

const tokenize = async (text: string, keepLoc?: boolean) => {
  const tokenizer = delimiterTokanize(reducers, operators);
  const tokens = await toArray(tokenizer(text));

  const results = tokens.map((t) => {
    const r: any = JSON.parse(JSON.stringify(t));
    r[r.type] = r.value;
    delete r.ctx;
    delete r.type;
    delete r.value;

    if (keepLoc && t.loc) {
      r.loc = JSON.stringify(t.loc);
    } else {
      delete r.loc;
    }

    return r;
  });

  return results;
};

describe('tokenize', async (t) => {
  it('parse single operator', async () => {
    const result = await tokenize('<<');
    utils.checkResults(
      result,
      [
        { DLESS: '<<' },
        { EOF: '' },
      ],
    );
  });

  it('parse word', async () => {
    const result = await tokenize('abc');
    utils.checkResults(
      result,
      [
        { TOKEN: 'abc' },
        { EOF: '' },
      ],
    );
  });

  it('parse word followed by newline', async () => {
    const result = await tokenize('abc\n');
    utils.checkResults(
      result,
      [
        { TOKEN: 'abc' },
        { NEWLINE: '\n' },
        { EOF: '' },
      ],
    );
  });

  it('parse invalid operator', async () => {
    const result = await tokenize('^');
    utils.checkResults(
      result,
      [
        { TOKEN: '^' },
        { EOF: '' },
      ],
    );
  });

  it('emit EOF at end', async () => {
    utils.checkResults(
      await tokenize(''),
      [{ EOF: '' }],
    );
  });

  it('parse new lines', async () => {
    utils.checkResults(
      await tokenize('\n'),
      [
        { NEWLINE: '\n' },
        { EOF: '' },
      ],
    );
  });

  it('operator breaks words', async () => {
    utils.checkResults(
      await tokenize('e<'),
      [
        { TOKEN: 'e' },
        { LESS: '<' },
        { EOF: '' },
      ],
    );
  });

  it('double breaks', async () => {
    utils.checkResults(
      await tokenize('echo>ciao'),
      [
        { TOKEN: 'echo' },
        { GREAT: '>' },
        { TOKEN: 'ciao' },
        { EOF: '' },
      ],
    );
  });

  it('word breaks operators', async () => {
    utils.checkResults(
      await tokenize('<e'),
      [
        { LESS: '<' },
        { TOKEN: 'e' },
        { EOF: '' },
      ],
    );
  });

  it('parse two operators on two lines', async () => {
    utils.checkResults(
      await tokenize('<<\n>>'),
      [
        { DLESS: '<<' },
        { NEWLINE: '\n' },
        { DGREAT: '>>' },
        { EOF: '' },
      ],
    );
  });

  it('parse two operators on one line', async () => {
    utils.checkResults(
      await tokenize('<< >>'),
      [
        { DLESS: '<<' },
        { DGREAT: '>>' },
        { EOF: '' },
      ],
    );
  });

  it('parse two tokens', async () => {
    utils.checkResults(
      await tokenize('echo 42'),
      [
        { TOKEN: 'echo' },
        { TOKEN: '42' },
        { EOF: '' },
      ],
    );
  });

  it('parse two tokens on two lines', async () => {
    utils.checkResults(
      await tokenize('echo\n42'),
      [
        { TOKEN: 'echo' },
        { NEWLINE: '\n' },
        { TOKEN: '42' },
        { EOF: '' },
      ],
    );
  });

  it('keep multiple newlines', async () => {
    const result = await tokenize('echo\n\n\n42');
    utils.checkResults(
      result,
      [
        { TOKEN: 'echo' },
        { NEWLINE: '\n' },
        { NEWLINE: '\n' },
        { NEWLINE: '\n' },
        { TOKEN: '42' },
        { EOF: '' },
      ],
    );
  });

  it('support escaping chars', async () => {
    utils.checkResults(
      await tokenize('echo\\<'),
      [
        { TOKEN: 'echo\\<' },
        { EOF: '' },
      ],
    );
  });

  it('character escaping is resetted on each char', async () => {
    utils.checkResults(
      await tokenize('echo\\<<'),
      [
        { TOKEN: 'echo\\<' },
        { LESS: '<' },
        { EOF: '' },
      ],
    );
  });

  it('support quoting with single', async () => {
    const result = await tokenize("echo '< world >' other");

    utils.checkResults(
      result,
      [
        { TOKEN: 'echo' },
        { TOKEN: "'< world >'" },
        { TOKEN: 'other' },
        { EOF: '' },
      ],
    );
  });

  it('in single quote escaping single quotes is not working', async () => {
    const result = await tokenize("'\\''");

    utils.checkResults(
      result,
      [
        { TOKEN: "'\\''" },
        { CONTINUE: "'" },
      ],
    );
  });

  it('single quote does not break words', async () => {
    const result = await tokenize("a'b'c");

    utils.checkResults(
      result,
      [
        { TOKEN: "a'b'c" },
        { EOF: '' },
      ],
    );
  });

  it('support quoting with double', async () => {
    utils.checkResults(
      await tokenize('echo "< world >" other'),
      [
        { TOKEN: 'echo' },
        { TOKEN: '"< world >"' },
        { TOKEN: 'other' },
        { EOF: '' },
      ],
    );
  });

  it('escaped double quotes within double quotes', async () => {
    const result = await tokenize('echo "TEST1 \\"TEST2" ucci ucci');
    utils.checkResults(
      result,
      [
        { TOKEN: 'echo' },
        { TOKEN: '"TEST1 \\"TEST2"' },
        { TOKEN: 'ucci' },
        { TOKEN: 'ucci' },
        { EOF: '' },
      ],
    );
  });

  it('escaped escape double quotes within double quotes', async () => {
    const result = await tokenize('echo "TEST1 \\\\" TEST2 " u i"');
    utils.checkResults(
      result,
      [
        { TOKEN: 'echo' },
        { TOKEN: '"TEST1 \\\\"' },
        { TOKEN: 'TEST2' },
        { TOKEN: '" u i"' },
        { EOF: '' },
      ],
    );
  });

  it('parse loc', async () => {
    const result = await tokenize('abc', true);
    utils.checkResults(
      result,
      [
        { TOKEN: 'abc', loc: mkloc([1, 1, 0], [3, 1, 2]) },
        { EOF: '' },
      ],
    );
  });

  it('reset start loc on each token', async () => {
    const result = await tokenize('abc def', true);
    utils.checkResults(
      result,
      [
        { TOKEN: 'abc', loc: mkloc([1, 1, 0], [3, 1, 2]) },
        { TOKEN: 'def', loc: mkloc([5, 1, 4], [7, 1, 6]) },
        { EOF: '' },
      ],
    );
  });

  it('loc on operators', async () => {
    const result = await tokenize('< <<', true);
    // console.log(JSON.stringify(result, null, 4))
    utils.checkResults(
      result,
      [
        { LESS: '<', loc: mkloc([1, 1, 0], [1, 1, 0]) },
        { DLESS: '<<', loc: mkloc([3, 1, 2], [4, 1, 3]) },
        { EOF: '' },
      ],
    );
  });

  it('loc on newlines', async () => {
    const result = await tokenize('<\n<<', true);
    utils.checkResults(
      result,
      [
        { LESS: '<', loc: mkloc([1, 1, 0], [1, 1, 0]) },
        { NEWLINE: '\n' },
        { DLESS: '<<', loc: mkloc([1, 2, 2], [2, 2, 3]) },
        { EOF: '' },
      ],
    );
  });

  it('loc on line continuations', async () => {
    const result = await tokenize('a\\\nbc', true);

    utils.checkResults(
      result,
      [
        { TOKEN: 'abc', loc: mkloc([1, 1, 0], [2, 2, 4]) },
        { EOF: '' },
      ],
    );
  });

  it('parse parameter expansion', async () => {
    const result = await tokenize('a$b-c');

    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 1, end: 2 },
      parameter: 'b',
    }];

    utils.checkResults(
      result,
      [
        { TOKEN: 'a$b-c', expansion },
        { EOF: '' },
      ],
    );
  });

  it('parse special parameter expansion', async () => {
    const result = await tokenize('a$@cd');
    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 1, end: 2 },
      parameter: '@',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: 'a$@cd', expansion },
        { EOF: '' },
      ],
    );
  });

  it('parse extended parameter expansion', async () => {
    const result = await tokenize('a${b}cd');
    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 1, end: 4 },
      parameter: 'b',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: 'a${b}cd', expansion },
        { EOF: '' },
      ],
    );
  });

  it('parse command expansion', async () => {
    const result = await tokenize('a$(b)cd');
    const expansion = [{
      type: 'command_expansion',
      loc: { start: 1, end: 4 },
      command: 'b',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: 'a$(b)cd', expansion },
        { EOF: '' },
      ],
    );
  });

  it('parse command with backticks', async () => {
    const result = await tokenize('a`b`cd');
    const expansion = [{
      type: 'command_expansion',
      loc: { start: 1, end: 3 },
      command: 'b',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: 'a`b`cd', expansion },
        { EOF: '' },
      ],
    );
  });

  it('parse arithmetic expansion', async () => {
    const result = await tokenize('a$((b))cd');
    const expansion = [{
      type: 'arithmetic_expansion',
      loc: { start: 1, end: 6 },
      expression: 'b',
    }];
    // console.log(JSON.stringify(result, null, 4));
    utils.checkResults(
      result,
      [
        { TOKEN: 'a$((b))cd', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse parameter expansion', async () => {
    const result = await tokenize('"a$b-c"');
    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 2, end: 3 },
      parameter: 'b',
    }];

    utils.checkResults(
      result,
      [
        { TOKEN: '"a$b-c"', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse special parameter expansion', async () => {
    const result = await tokenize('"a$@cd"');
    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 2, end: 3 },
      parameter: '@',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: '"a$@cd"', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse extended parameter expansion', async () => {
    const result = await tokenize('"a${b}cd"');
    const expansion = [{
      type: 'parameter_expansion',
      loc: { start: 2, end: 5 },
      parameter: 'b',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: '"a${b}cd"', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse command expansion', async () => {
    const result = await tokenize('"a$(b)cd"');
    const expansion = [{
      type: 'command_expansion',
      loc: { start: 2, end: 5 },
      command: 'b',
    }];
    // console.log(JSON.stringify(result, null, 4))
    utils.checkResults(
      result,
      [
        { TOKEN: '"a$(b)cd"', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse command with backticks', async () => {
    const result = await tokenize('"a`b`cd"');
    const expansion = [{
      type: 'command_expansion',
      loc: { start: 2, end: 4 },
      command: 'b',
    }];
    // console.log(JSON.stringify(result, null, 4));

    utils.checkResults(
      result,
      [
        { TOKEN: '"a`b`cd"', expansion },
        { EOF: '' },
      ],
    );
  });

  it('within double quotes parse arithmetic expansion', async () => {
    const result = await tokenize('"a$((b))cd"');
    const expansion = [{
      type: 'arithmetic_expansion',
      loc: { start: 2, end: 7 },
      expression: 'b',
    }];
    utils.checkResults(
      result,
      [
        { TOKEN: '"a$((b))cd"', expansion },
        { EOF: '' },
      ],
    );
  });
});
