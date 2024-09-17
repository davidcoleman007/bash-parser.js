import { describe, expect, it } from 'vitest';
import bashParser from '~/parse.ts';

describe('loc-while', async (t) => {
  it('loc in while statement', async (t) => {
    expect(await bashParser('while true && 1; do sleep 1;echo ciao; done', { insertLOC: true })).toMatchSnapshot();
  });
});
