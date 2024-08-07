import { assert, assertEquals, assertThrows } from '@std/assert';
import isIterable from '~/utils/iterable/is.ts';
import map from '~/utils/iterable/map.ts';

const fixture = [1, 2, 3];
const expected = [2, 4, 6];
const expectedIdx = [0, 1, 2];
const double = (n: number) => n * 2;
const indexCb = (_: number, idx: number) => idx;

Deno.test('iterable-map', async (t) => {
  await t.step('return an iterable', () => {
    assertEquals(isIterable(map(() => null)), true);
  });

  await t.step('apply the callback to every item', () => {
    const mapper = map(double);
    const results = mapper(fixture);
    assertEquals(Array.from(results), expected);
  });

  await t.step('pass item index to the callback', () => {
    const mapper = map(indexCb);
    const results = mapper(fixture);
    assertEquals(Array.from(results), expectedIdx);
  });

  await t.step('can be curried', () => {
    const mapDouble = map(double);
    assertEquals(Array.from(mapDouble(fixture)), expected);
  });

  await t.step('throws if data is not iterable', () => {
    const mapDouble = map(double);
    // @ts-expect-error Sending in 42 as an invalid argument
    const err = assertThrows(() => mapDouble(42)) as Error;
    assertEquals(err.message, 'data argument must be an iterable.');
    assert(err instanceof TypeError);
  });

  await t.step('throws if callback is not a function nor an object', () => {
    // @ts-expect-error Sending in 42 as an invalid argument
    const err = assertThrows(() => map(42)) as Error;
    assertEquals(err.message, 'transform argument must be a function.');
    assert(err instanceof TypeError);
  });

  await t.step('work with generators', () => {
    const mapDouble = map(double);
    const generator = function* () {
      yield 1;
      yield 2;
      yield 3;
    };
    assertEquals([...mapDouble(generator())], expected);
  });
});
