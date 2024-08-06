import is from '~/utils/iterable/is.ts';

export type MapFunction<T> = (value: T, idx: number, iter: Iterable<T>) => T;
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
              item.value = callback(item.value, idx++, it);
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
