const hasSpace = /\s/;
const hasSeparator = /(_|-|\.|:)/;
const hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;

const separatorSplitter = /[\W_]+(.|$)/g;
const camelSplitter = /(.)([A-Z]+)/g;

const toNoCase = (str: string) => {
  if (hasSpace.test(str)) return str.toLowerCase();
  if (hasSeparator.test(str)) return (unseparate(str) || str).toLowerCase();
  if (hasCamel.test(str)) return uncamelize(str).toLowerCase();
  return str.toLowerCase();
};

const unseparate = (str: string) => {
  return str.replace(separatorSplitter, (_, next) => {
    return next ? ' ' + next : '';
  });
};

const uncamelize = (str: string) => {
  return str.replace(camelSplitter, (_, previous, uppers) => {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
};

const toSpaceCase = (str: string) => {
  return toNoCase(str).replace(/[\W_]+(.|$)/g, (_, match) => {
    return match ? ' ' + match : '';
  }).trim();
};

const toPascalCase = (str: string) => {
  return toSpaceCase(str).replace(/(?:^|\s)(\w)/g, (_, letter) => {
    return letter.toUpperCase();
  });
};

export default toPascalCase;
