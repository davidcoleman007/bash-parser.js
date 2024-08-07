import { Lexer } from '~/lexer/mod.ts';
import posixMode from '~/modes/bash/index.ts';
import utils from './_utils.ts';

function tokenize(text: string, rawTokens?: boolean) {
  const lexer = new Lexer(posixMode.init(), {});
  lexer.setInput(text);
  const results = [];
  let token = lexer.lex();
  while (token !== 'EOF') {
    delete token.type;

    if (rawTokens) {
      const value = JSON.parse(JSON.stringify(lexer.yytext));
      delete value.type;
      delete value.maybeSimpleCommandName;

      results.push({ token, value });
    } else {
      const value = lexer.yytext.text || lexer.yytext;
      const expansion = lexer.expansion;
      delete value.type;
      delete value.maybeSimpleCommandName;

      if (expansion) {
        results.push({ token, value, expansion });
      } else {
        results.push({ token, value });
      }
    }

    token = lexer.lex();
  }
  return results;
}

Deno.test('lexer', async (t) => {
  await t.step('parses parameter substitution', () => {
    const result = tokenize('echo word${other}test', true);
    utils.checkResults(result, [{
      token: 'WORD',
      value: {
        text: 'echo',
      },
    }, {
      token: 'WORD',
      value: {
        text: 'word${other}test',
        expansion: [{
          type: 'ParameterExpansion',
          parameter: 'other',
          loc: {
            start: 4,
            end: 11,
          },
        }],
      },
    }]);

    utils.checkResults(
      result[1].value.text.slice(
        result[1].value.expansion[0].loc.start,
        result[1].value.expansion[0].loc.end + 1,
      ),
      '${other}',
    );
  });

  await t.step('parses unquoted parameter substitution', () => {
    const result = tokenize('echo word$test', true);
    // utils.logResults(result)
    utils.checkResults(result, [{ token: 'WORD', value: { text: 'echo' } }, {
      token: 'WORD',
      value: {
        text: 'word$test',
        expansion: [{
          type: 'ParameterExpansion',
          parameter: 'test',
          loc: { start: 4, end: 8 },
        }],
      },
    }]);

    utils.checkResults(
      result[1].value.text.slice(
        result[1].value.expansion[0].loc.start,
        result[1].value.expansion[0].loc.end + 1,
      ),
      '$test',
    );
  });

  await t.step('unquoted parameter delimited by symbol', () => {
    const result = tokenize('echo word$test,,', true);
    // utils.logResults(result);
    utils.checkResults(result, [{ token: 'WORD', value: { text: 'echo' } }, {
      token: 'WORD',
      value: {
        text: 'word$test,,',
        expansion: [{
          type: 'ParameterExpansion',
          parameter: 'test',
          loc: { start: 4, end: 8 },
        }],
      },
    }]);

    utils.checkResults(
      result[1].value.text.slice(
        result[1].value.expansion[0].loc.start,
        result[1].value.expansion[0].loc.end + 1,
      ),
      '$test',
    );
  });

  await t.step('parse single operator', () => {
    utils.checkResults(
      tokenize('<<'),
      [{ token: 'DLESS', value: '<<' }],
    );
  });

  await t.step('parse redirections', () => {
    utils.checkResults(
      tokenize('echo>ciao'),
      [{ token: 'WORD', value: 'echo' }, { token: 'GREAT', value: '>' }, { token: 'WORD', value: 'ciao' }],
    );
  });

  await t.step('parse io-number redirections', () => {
    utils.checkResults(
      tokenize('echo 2> ciao'),
      [{ token: 'WORD', value: 'echo' }, { token: 'IO_NUMBER', value: '2' }, { token: 'GREAT', value: '>' }, { token: 'WORD', value: 'ciao' }],
    );
  });

  await t.step('parse two operators on two lines', () => {
    utils.checkResults(
      tokenize('<<\n>>'),
      [{ token: 'DLESS', value: '<<' }, { token: 'NEWLINE_LIST', value: '\n' }, { token: 'DGREAT', value: '>>' }],
    );
  });

  await t.step('parse two words', () => {
    utils.checkResults(
      tokenize('echo 42'),
      [{ token: 'WORD', value: 'echo' }, { token: 'WORD', value: '42' }],
    );
  });

  await t.step('support character escaping', () => {
    utils.checkResults(
      tokenize('echo\\>23'),
      [{ token: 'WORD', value: 'echo>23' }],
    );
  });

  await t.step('support line continuations', () => { // not yet implemented
    // utils.logResults(tokenize('echo\\\n23'))
    utils.checkResults(
      tokenize('echo\\\n23'),
      [{ token: 'WORD', value: 'echo23' }],
    );
  });

  await t.step('support single quotes', () => {
    utils.checkResults(
      tokenize("echo 'CIAO 42'"),
      [{ token: 'WORD', value: 'echo' }, { token: 'WORD', value: 'CIAO 42' }],
    );
  });

  await t.step('support &&', () => {
    utils.checkResults(
      tokenize('run && stop'),
      [{ token: 'WORD', value: 'run' }, { token: 'AND_IF', value: '&&' }, { token: 'WORD', value: 'stop' }],
    );
  });

  await t.step('support &', () => {
    // utils.logResults(tokenize('run &'));
    utils.checkResults(
      tokenize('run &'),
      [{ token: 'WORD', value: 'run' }, { token: 'SEPARATOR_OP', value: '&' }],
    );
  });

  await t.step('support ||', () => {
    utils.checkResults(
      tokenize('run || stop'),
      [{ token: 'WORD', value: 'run' }, { token: 'OR_IF', value: '||' }, { token: 'WORD', value: 'stop' }],
    );
  });

  await t.step('support for', () => {
    utils.checkResults(
      tokenize('for x in a b c; do echo x; done'),
      [
        { token: 'For', value: 'for' },
        { token: 'NAME', value: 'x' },
        { token: 'In', value: 'in' },
        { token: 'WORD', value: 'a' },
        { token: 'WORD', value: 'b' },
        { token: 'WORD', value: 'c' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Do', value: 'do' },
        { token: 'WORD', value: 'echo' },
        { token: 'WORD', value: 'x' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Done', value: 'done' },
      ],
    );
  });

  await t.step('support for with default sequence', () => {
    utils.checkResults(
      tokenize('for x in; do echo x; done'),
      [
        { token: 'For', value: 'for' },
        { token: 'NAME', value: 'x' },
        { token: 'In', value: 'in' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Do', value: 'do' },
        { token: 'WORD', value: 'echo' },
        { token: 'WORD', value: 'x' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Done', value: 'done' },
      ],
    );
  });

  await t.step('support double quotes', () => {
    utils.checkResults(
      tokenize('echo "CIAO 42"'),
      [{ token: 'WORD', value: 'echo' }, { token: 'WORD', value: 'CIAO 42' }],
    );
  });

  await t.step('support multiple commands', () => {
    // utils.logResults(tokenize('echo; \nls;'));

    utils.checkResults(
      tokenize('echo; \nls;'),
      [{ token: 'WORD', value: 'echo' }, { token: 'SEPARATOR_OP', value: ';\n' }, { token: 'WORD', value: 'ls' }, { token: 'SEPARATOR_OP', value: ';' }],
    );
  });

  await t.step('support while', () => {
    utils.checkResults(
      tokenize('while [[ -e foo ]]; do sleep 1; done'),
      [
        { token: 'While', value: 'while' },
        { token: 'WORD', value: '[[' },
        { token: 'WORD', value: '-e' },
        { token: 'WORD', value: 'foo' },
        { token: 'WORD', value: ']]' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Do', value: 'do' },
        { token: 'WORD', value: 'sleep' },
        { token: 'WORD', value: '1' },
        { token: 'SEPARATOR_OP', value: ';' },
        { token: 'Done', value: 'done' },
      ],
    );
  });
  /*
await t.step('support function definition', () => {
  utils.checkResults(
    tokenize('foo () {command}'),
    [{token: 'WORD', value: 'foo'}, {token: 'OPEN_PAREN', value: '('},
    {token: 'CLOSE_PAREN', value: ')'}, {token: 'Lbrace', value: '{'},
    {token: 'WORD', value: 'command'}, {token: 'Rbrace', value: '}'}]
  );
});
  */
});
