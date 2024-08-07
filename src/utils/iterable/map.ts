import is from '~/utils/iterable/is.ts';

export type MapFunction<T> = (value: T, idx: number, iter: Iterable<T>) => T | T[] | null;
export type MapperFunction<T> = (it: Iterable<T>) => Iterable<T>;

const map = <T>(callback: MapFunction<T>): MapperFunction<T> => {
  return (it) => {
    if (!is(it)) {
      throw new TypeError('argument must be an iterable');
    }

    let idx = 0;
    const dataIterator = it[Symbol.iterator]();

    const resultIterable: Iterable<T> = {
      [Symbol.iterator]() {
        return {
          next(): IteratorResult<T> {
            const item = dataIterator.next();

            if (!item.done) {
              // TODO: As T, when is it T[] or null?
              item.value = callback(item.value, idx++, it) as T;
            }
            return item;
          },
        };
      },
    };

    return resultIterable;
  };
};

export default map;
