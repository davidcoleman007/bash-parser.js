import { TokenIf } from '~/types.ts';

const logger = (name: string) => () => (function* (tokens: TokenIf[]) {
  for (const tk of tokens) {
    if (!tk) {
      console.log(`In ${name} token null.`);
    }
    console.log(
      name,
      '<<<',
      tk,
      '>>>',
    );
    yield tk;
  }
});

export default logger;
