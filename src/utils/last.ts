import { assert } from '@std/assert';

const last = <T>(list: T[]): T | null => {
  assert(Array.isArray(list), 'argument must be be an array');

  if (list.length === 0) {
    return null;
  }

  return list[list.length - 1];
};

export default last;
