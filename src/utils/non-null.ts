import filter from './filter.ts';

const nonNull = filter((tk: any) => {
  return tk !== null;
});

export default nonNull;
