export default <T>(it: any): it is AsyncIterable<T> => {
  return it != null && typeof it[Symbol.asyncIterator] === 'function';
};
