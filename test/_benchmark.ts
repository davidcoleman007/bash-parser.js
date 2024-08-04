import bashParser from '~/parse.ts';

const source = `
  foo () {
    foo='hello';
    rm -rf .;
    dest=bar
    eval "dest=foo"
  }
  foo a b c $d
`;

console.profile('bashParser');

for (let i = 0; i < 1000; i++) {
  bashParser(source);
}

console.profileEnd('bashParser');
console.log('done');
