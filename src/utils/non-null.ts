import filter from './iterable/filter.ts';

const nonNull = filter((tk: any) => {
  return tk !== null;
});

export default nonNull;
