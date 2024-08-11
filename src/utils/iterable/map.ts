import is from '~/utils/iterable/is.ts';

export type MapFunction<T> = (value: T, idx: number, iter: AsyncIterable<T>) => Promise<T | T[] | null>;
export type MapperFunction<T> = (it: AsyncIterable<T>) => AsyncIterable<T>;

const map = <T>(transform: MapFunction<T>): MapperFunction<T> => {
  if (typeof transform !== 'function') {
    throw new TypeError('transform argument must be a function');
  }

  return async function* (it) {
    if (!is(it)) {
      throw new TypeError('argument must be an iterable');
    }

    let idx = 0;
    for await (const item of it) {
      const result = await transform(item, idx++, it);

      if (result === null) {
        continue;
      }

      // TODO: Does this do flattening so we can remove that step when using map?
      if (Array.isArray(result)) {
        for (const res of result) {
          yield res;
        }

        continue;
      }

      yield result;
    }
  };
};

export default map;
