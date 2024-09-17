import { describe, expect, it } from 'vitest';
import bashParser from '~/parse.ts';

describe('loc-until', async (t) => {
  it('loc in until statement', async (t) => {
    expect(await bashParser('until true || 1; do sleep 1;echo ciao; done', { insertLOC: true })).toMatchSnapshot();
  });
});
