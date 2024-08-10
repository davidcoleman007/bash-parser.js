import is from './is.ts';

type FlattenFn = <T>(iter: AsyncIterable<T | AsyncIterable<T>>) => AsyncIterable<T>;

const flatten: FlattenFn = async function* <T>(iter: AsyncIterable<T | AsyncIterable<T>>): AsyncIterable<T> {
  for await (const it of iter) {
    if (is(it)) {
      yield* it;
    } else {
      yield it as T;
    }
  }
};

export default flatten;
