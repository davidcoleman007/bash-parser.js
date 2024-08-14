import { join, resolve } from '@std/path';
import bashParser from '~/parse.ts';
import type { Options } from '~/types.ts';
import utils from './_utils.ts';

// various example taken from http://www.etalabs.net/sh_tricks.html
type Test = {
  sourceCode: string;
  result: any;
  options?: Options;
};

type Fixture = {
  name: string;
  tests: Test[];
};

const loadFixtures = async (): Promise<Fixture[]> => {
  const fixtures: Fixture[] = [];

  const path = resolve(import.meta.dirname!, 'fixtures');
  for await (const dirEntry of Deno.readDir(path)) {
    if (dirEntry.isFile) {
      const f = await import(join(path, dirEntry.name));
      const testOrTests = f.default;

      fixtures.push({
        name: dirEntry.name.replace(/\.ts$/, '').replaceAll('-', ' '),
        tests: Array.isArray(testOrTests) ? testOrTests : [testOrTests],
      });
    }
  }

  return fixtures;
};

Deno.test('fixtures', async (t) => {
  const fixtures = await loadFixtures();

  for (const fixture of fixtures) {
    await t.step(fixture.name, async (t) => {
      for (const test of fixture.tests) {
        await t.step(test.sourceCode, async () => {
          const result = await bashParser(test.sourceCode, test.options);

          utils.checkResults(result, test.result);
        });
      }
    });
  }
});
