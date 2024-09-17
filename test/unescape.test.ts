import unescape from '~/utils/unescape.ts';
import utils from './_utils.ts';

describe('unescape', async (t) => {
  it('usual escape sequences', () => {
    utils.checkResults(unescape('---\\0---'), '---\0---');
    utils.checkResults(unescape('---\\b---'), '---\b---');
    utils.checkResults(unescape('---\\f---'), '---\f---');
    utils.checkResults(unescape('---\\n---'), '---\n---');
    utils.checkResults(unescape('---\\r---'), '---\r---');
    utils.checkResults(unescape('---\\t---'), '---\t---');
    utils.checkResults(unescape('---\\v---'), '---\v---');
    utils.checkResults(unescape("---\\'---"), "---'---");
    utils.checkResults(unescape('---\\"---'), '---"---');
    utils.checkResults(unescape('---\\\\---'), '---\\---');
  });

  it('octal escape sequences', () => {
    // '---S---' instead of '---\123---' because octal literals are prohibited in strict mode
    utils.checkResults(unescape('---\\123---'), '---S---');
    utils.checkResults(unescape('---\\040---'), '--- ---');
    utils.checkResults(unescape('---\\54---'), '---,---');
    utils.checkResults(unescape('---\\4---'), '---\u{4}---');
  });

  it('short hex escape sequences', () => {
    utils.checkResults(unescape('---\\xAC---'), '---\xAC---');
  });

  it('long hex escape sequences', () => {
    utils.checkResults(unescape('---\\u00A9---'), '---\u00A9---');
  });

  it('variable hex escape sequences', () => {
    utils.checkResults(unescape('---\\u{A9}---'), '---\u{A9}---');
    utils.checkResults(unescape('---\\u{2F804}---'), '---\u{2F804}---');
  });

  it('avoids double unescape cascade', () => {
    utils.checkResults(unescape('---\\\\x41---'), '---\\x41---');
    utils.checkResults(unescape('---\\x5cx41---'), '---\\x41---');
  });

  it('python hex escape sequences', () => {
    utils.checkResults(unescape('---\\U000000A9---'), '---\u00A9---');
    utils.checkResults(unescape('---\\U0001F3B5---'), '---\uD83C\uDFB5---');
  });
});
