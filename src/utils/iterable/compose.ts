type ComposableFunction<T> = (input: any) => AsyncIterable<T>;

const compose = <T>(...functions: ComposableFunction<T>[]): ComposableFunction<T> => (input: any) => functions.reduceRight((acc, fn) => fn(acc), input);

export default compose;
