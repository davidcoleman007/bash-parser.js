

import filter from './filter.js';

const nonNull = tk => {
	return tk !== null;
};

export default filter(nonNull);
filter.predicate = nonNull;
