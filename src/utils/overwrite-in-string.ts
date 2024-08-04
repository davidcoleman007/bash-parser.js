const overwriteInString = (str: string, start: number, end: number, replacement: string) => {
  return str.slice(0, start) + replacement + str.slice(end);
};

export default overwriteInString;
