import { TokenIf } from '~/types.ts';

const ioFileOperators = [
  'LESS',
  'DLESS',
  'DGREAT',
  'LESSAND',
  'GREATAND',
  'GREAT',
  'LESSGREAT',
  'CLOBBER',
];

export default ioFileOperators;

ioFileOperators.isOperator = (tk: TokenIf) => {
  for (const op of ioFileOperators) {
    if (tk.type === op) {
      return true;
    }
  }
  return false;
};
