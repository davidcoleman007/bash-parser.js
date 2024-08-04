import filter from './filter.ts';

const nonNull = (tk: any) => {
	return tk !== null;
};

export default filter(nonNull);
filter.predicate = nonNull;
