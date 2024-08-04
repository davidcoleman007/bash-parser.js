import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';
import compose from '~/utils/compose.ts';
import isValidName from '~/utils/is-valid-name.ts';

const forNameVariable: LexerPhase = () => {
    return compose(
        map((tk, idx, iterable) => {
            let lastToken = iterable.behind(1) || { is: () => false };

            // if last token is For and current token form a valid name
            // type of token is changed from WORD to NAME

            if (lastToken.is('For') && tk.is('WORD') && isValidName(tk.value)) {
                return tk.changeTokenType('NAME', tk.value);
            }

            return tk;
        }),
        lookahead,
    );
};

export default forNameVariable;
