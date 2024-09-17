import { describe, expect, it } from 'vitest';
import bashParser from '~/parse.ts';

describe('ast', async (t) => {
  it('command with one argument', async () => {
    const result = await bashParser('echo world')
    expect(result).toMatchSnapshot()
  });

  it('command with multiple new lines', async () => {
    expect(await bashParser('\n\n\necho world')).toMatchSnapshot()
  });

  it('command with multiple lines continuation', async () => {
    expect(await bashParser('echo \\\n\\\n\\\n\\\nthere')).toMatchSnapshot()
  });

  it('command with pre-assignment', async () => {
    expect(await bashParser('TEST=1 run')).toMatchSnapshot()
  });

  it('assignment alone', async () => {
    expect(await bashParser('TEST=1')).toMatchSnapshot();
  });

  it('commands with AND', async () => {
    expect(await bashParser('run && stop')).toMatchSnapshot();
  });

  it('commands with AND \\n', async () => {
    expect(await bashParser('run && \n stop')).toMatchSnapshot();
  });

  it('commands with OR', async () => {
    expect(await bashParser('run || cry')).toMatchSnapshot();
  });

  it('pipelines', async () => {
    expect(await bashParser('run | cry')).toMatchSnapshot();
  });

  it('bang pipelines', async () => {
    expect(await bashParser('! run | cry')).toMatchSnapshot();
  });

  it('no pre-assignment on suffix', async () => {
    expect(await bashParser('echo TEST=1')).toMatchSnapshot();
  });

  it('command with multiple prefixes', async () => {
    expect(await bashParser('TEST1=1 TEST2=2 echo world')).toMatchSnapshot();
  });

  it('multi line commands', async () => {
    expect(await bashParser('echo; \nls;\n')).toMatchSnapshot();
  });

  it('Compound list', async () => {
    expect(await bashParser('{ echo; ls; }')).toMatchSnapshot();
  });

  it('Compound list with redirections', async () => {
    expect(await bashParser('{ echo; ls; } > file.txt')).toMatchSnapshot();
  });

  it('command with multiple redirections', async () => {
    expect(await bashParser('echo world > file.txt < input.dat')).toMatchSnapshot();
  });

  it('Compound list with multiple redirections', async () => {
    expect(await bashParser('{ echo; ls; } > file.txt < input.dat')).toMatchSnapshot();
  });

  it('single line commands', async () => {
    expect(await bashParser('echo;ls')).toMatchSnapshot();
  });

  it('single line commands separated by &', async () => {
    expect(await bashParser('echo&ls')).toMatchSnapshot();
  });

  it('LogicalExpression separated by &', async () => {
    expect(await bashParser('echo && ls &')).toMatchSnapshot();
  });

  it('LogicalExpressions separated by &', async () => {
    expect(await bashParser('echo && ls & ciao')).toMatchSnapshot();
  });

  it('single line commands separated by &;', async () => {
    expect(await bashParser('echo&;ls')).toMatchSnapshot();
  });

  it('command with redirection to file', async () => {
    expect(await bashParser('ls > file.txt')).toMatchSnapshot();
  });

  it('parse multiple suffix', async () => {
    expect(await bashParser('command foo --lol')).toMatchSnapshot();
  });

  it('command with stderr redirection to file', async () => {
    expect(await bashParser('ls 2> file.txt')).toMatchSnapshot();
  });

  it('command with stdout redirection to file', async () => {
    expect(await bashParser('ls > file.txt')).toMatchSnapshot();
  });

  it('command with stdout append redirection to file', async () => {
    expect(await bashParser('ls >> file.txt')).toMatchSnapshot();
  });

  it('command with stderr redirection to file', async () => {
    expect(await bashParser('ls 2> file.txt')).toMatchSnapshot();
  });

  it('command with stderr append redirection to file', async () => {
    expect(await bashParser('ls 2>> file.txt')).toMatchSnapshot();
  });

  it('command with stdout and stderr redirection to file', async () => {
    expect(await bashParser('ls > file.txt 2>&1')).toMatchSnapshot();
  });

  it('command with stdout and stderr append redirection to file', async () => {
    expect(await bashParser('ls >> file.txt 2>&1')).toMatchSnapshot();
  });

  it('command with stdin redirection from file', async () => {
    expect(await bashParser('ls < file.txt')).toMatchSnapshot();
  });

  it('parse subshell', async () => {
    expect(await bashParser('( ls )')).toMatchSnapshot();
  });
});
