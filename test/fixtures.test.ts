import fs from 'fs';
import { join, resolve } from 'path';
import bashParser from '~/parse.ts';
import type { Options } from '~/types.ts';
import utils from './_utils.ts';

// various example taken from http://www.etalabs.net/sh_tricks.html

type Fixture = {
  sourceCode: string;
  result: any;
  name: string;
  options?: Options;
};

const loadFixtures = async (): Promise<Fixture[]> => {
  const fixtures: Fixture[] = [];

  const path = resolve(import.meta.dirname!, 'fixtures');
  for await (const dirEntry of fs.readdirSync(path, {withFileTypes: true})) {
    if (dirEntry.isFile()) {
      const f = await import(join(path, dirEntry.name));
      const fix = f.default;

      fix.name = dirEntry.name.replace(/\.ts$/, '').replaceAll('-', ' ');

      fixtures.push(fix);
    }
  }

  return fixtures;
};

describe('fixtures', async (t) => {
  const fixtures = await loadFixtures();

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      const result = await bashParser(fixture.sourceCode, fixture.options);

      utils.checkResults(result, fixture.result);
    });
  }
});
