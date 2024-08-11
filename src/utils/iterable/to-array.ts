const toArray = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const arr: T[] = [];

  for await (const item of iterable) {
    arr.push(item);
  }

  return arr;
};

export default toArray;
