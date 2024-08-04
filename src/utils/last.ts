export default <T>(arr: T[]): T | null => {
  if (!Array.isArray(arr)) {
    throw new Error('expected the first argument to be an array');
  }

  const len = arr.length;
  if (len === 0) {
    return null;
  }

  return arr[len - 1];
};
