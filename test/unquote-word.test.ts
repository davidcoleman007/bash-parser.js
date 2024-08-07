import parse from '~/utils/unquote-word.ts';
import utils from './_utils.ts';

Deno.test('unquote-word', async (t) => {
  await t.step('comment', () => {
    utils.checkResults(parse('beep#boop'), { values: ['beep'], comment: 'boop' });
    utils.checkResults(parse('beep #boop'), { values: ['beep'], comment: 'boop' });
    utils.checkResults(parse('beep # boop'), { values: ['beep'], comment: 'boop' });
    utils.checkResults(parse('beep # "> boop"'), { values: ['beep'], comment: '"> boop"' });
    utils.checkResults(parse('beep "#"'), { values: ['beep', '#'] });
    utils.checkResults(parse('beep #"#"#'), { values: ['beep'], comment: '"#"#' });
    utils.checkResults(parse('echo "foo = \\"foo\\"" # boop'), { values: ['echo', 'foo = "foo"'], comment: 'boop' });
  });

  await t.step('parse shell commands', () => {
    utils.checkResults(parse('a \'b\' "c"'), { values: ['a', 'b', 'c'] });
    utils.checkResults(
      parse('beep "boop" \'foo bar baz\' "it\'s \\"so\\" groovy"'),
      { values: ['beep', 'boop', 'foo bar baz', 'it\'s "so" groovy'] },
    );
    utils.checkResults(parse('a b\\ c d'), { values: ['a', 'b c', 'd'] });
    utils.checkResults(parse('\\$beep bo\\`op'), { values: ['$beep', 'bo`op'] });
    utils.checkResults(parse('echo "foo = \\"foo\\""'), { values: ['echo', 'foo = "foo"'] });
    utils.checkResults(parse(''), { values: [] });
    utils.checkResults(parse(' '), { values: [] });
    utils.checkResults(parse('\t'), { values: [] });
    utils.checkResults(parse('a"b c d"e'), { values: ['ab c de'] });
    utils.checkResults(parse('a\\ b"c d"\\ e f'), { values: ['a bc d e', 'f'] });
    utils.checkResults(parse('a\\ b"c d"\\ e\'f g\' h'), { values: ['a bc d ef g', 'h'] });
    utils.checkResults(parse("x \"bl'a\"'h'"), { values: ['x', "bl'ah"] });
  });
});
