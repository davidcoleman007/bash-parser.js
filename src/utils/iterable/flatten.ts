import is from './is.ts';

export default function* flatten<T>(iter: Iterable<T | Iterable<T>>): IterableIterator<T> {
  for (const it of iter) {
    if (is(it)) {
      yield* it;
    } else {
      yield it as T;
    }
  }
}
