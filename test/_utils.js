import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

export const mkloc = function mkloc(startLine, startColumn, endLine, endColumn) {
    return {startLine, startColumn, endLine, endColumn};
};

// eslint-disable-next-line max-params
export const mkloc2 = function mkloc(startLine, startColumn, endLine, endColumn, startChar, endChar) {
    return {
        start: {row: startLine, col: startColumn, char: startChar},
        end: {row: endLine, col: endColumn, char: endChar}
    };
};

export const logResults = function logResults(results) {
    console.log(JSON.stringify(results, null, 4).replace(/"/g, '\''));
};

export const checkResults = function checkResults(actual, expected) {
    /* if (Array.isArray(actual)) {
        for (const item of actual) {
            console.log(item.constructor.name)
            if (item.constructor.name === 'Token') {
                console.log('tttt')
                Object.defineProperty(item, item.type, {
                    enumerable: true,
                    get() {
                        const s = stack()[1];

                        if (s.getFileName() !== '/Users/parroit/Desktop/repos/bash-parser/src/utils/tokens.js' &&
                            s.getFileName() !== '/Users/parroit/Desktop/repos/bash-parser/src/modes/posix/rules/default-node-type.js')
                                console.log(`${count++}: ${this.type} is deprectaed. Used ${s.getFileName()}:${s.getLineNumber()}`);
                        return item.value;
                    }
                });
            }

        }
    }*/
    // exports.logResults(actual);
    assertEquals(actual, expected);
};

export default {
    mkloc,
    mkloc2,
    logResults,
    checkResults
};