import type {
  AstIoNumber,
  AstNode,
  AstNodeAssignmentWord,
  AstNodeCase,
  AstNodeCaseItem,
  AstNodeCommand,
  AstNodeCompoundList,
  AstNodeFor,
  AstNodeFunction,
  AstNodeIf,
  AstNodeLogicalExpression,
  AstNodeName,
  AstNodePipeline,
  AstNodeRedirect,
  AstNodeScript,
  AstNodeSubshell,
  AstNodeTestExpression,
  AstNodeUntil,
  AstNodeWhile,
  AstNodeWord,
  AstSourceLocation,
} from '~/ast/types.ts';

export type ElseClaus = AstNode & {
  type: 'else';
  text: 'else';
};
export type Separator = {
  type: 'separator_op' | 'newline_list';
  text: string;
};

/**
 * An object containing methods to build the final AST. This object is mixed into the Jison grammar, and any of its methods can be called directly from the grammar EBNF source.
 */

export type AstBuilder = {
  caseItem: (
    pattern: AstNodeWord[],
    body: AstNodeCompoundList,
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeCaseItem;

  caseClause: (
    clause: AstNodeWord,
    cases: AstNodeCaseItem[],
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeCase;

  doGroup: (
    group: AstNodeCompoundList,
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeCompoundList;

  braceGroup: (
    group: AstNodeCompoundList,
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeCompoundList;

  list: (
    logicalExpression: AstNodeLogicalExpression,
  ) => AstNodeScript;

  checkAsync: (
    list: AstNodeScript,
    separator: Separator,
  ) => AstNodeScript;

  listAppend: (
    list: AstNodeScript,
    logicalExpression: AstNodeLogicalExpression,
    separator: Separator,
  ) => AstNodeScript;

  addRedirections: (
    compoundCommand: AstNodeCompoundList,
    redirectList: AstNodeRedirect[],
  ) => AstNodeCompoundList;

  term: (
    logicalExpression: AstNodeLogicalExpression,
  ) => AstNodeCompoundList;

  termAppend: (
    term: AstNodeCompoundList,
    logicalExpression: AstNodeLogicalExpression,
    separator: Separator,
  ) => AstNodeCompoundList;

  subshell: (
    list: AstNodeCompoundList,
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeSubshell;

  pipeSequence: (
    command: AstNodeCommand,
  ) => AstNodePipeline;

  pipeSequenceAppend: (
    pipe: AstNodePipeline,
    command: AstNodeCommand,
  ) => AstNodePipeline;

  bangPipeLine: (
    pipe: AstNodePipeline,
  ) => AstNode & { bang: boolean };

  pipeLine: (
    pipe: AstNodePipeline,
  ) => AstNodePipeline['commands'][0] | AstNodePipeline;

  logicalExpression: (
    left: AstNodeLogicalExpression['left'],
    op: AstNodeLogicalExpression['op'],
    right: AstNodeLogicalExpression['right'],
    invert: AstNodeLogicalExpression['inverted'],
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeLogicalExpression;

  testExpression: (
    op: AstNodeTestExpression['op'],
    target: AstNodeTestExpression['target'],
    invert: AstNodeTestExpression['inverted'],
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeTestExpression;

  andAndOr: (
    left: AstNodeLogicalExpression['left'],
    right: AstNodeLogicalExpression['right'],
  ) => AstNodeLogicalExpression;

  orAndOr: (
    left: AstNodeLogicalExpression['left'],
    right: AstNodeLogicalExpression['right'],
  ) => AstNodeLogicalExpression;

  forClause: (
    name: AstNodeName,
    wordlist: AstNodeWord[],
    doGroup: AstNodeCompoundList,
    locStart: AstSourceLocation,
  ) => AstNodeFor;

  forClauseDefault: (
    name: AstNodeName,
    doGroup: AstNodeCompoundList,
    locStart: AstSourceLocation,
  ) => AstNodeFor;

  functionDefinition: (
    name: AstNodeName,
    body: [AstNodeCompoundList, AstNodeRedirect[] | undefined],
  ) => AstNodeFunction;

  elseClause: (
    compoundList: AstNodeCompoundList,
    elseClaus: ElseClaus,
  ) => AstNodeCompoundList;

  ifClause: (
    clause: AstNodeCompoundList,
    then: AstNodeCompoundList,
    elseBranch: AstNodeCompoundList,
    locStart: AstSourceLocation,
    locEnd: AstSourceLocation,
  ) => AstNodeIf;

  while: (
    clause: AstNodeCompoundList,
    body: AstNodeCompoundList,
    whileWord: AstNodeWord,
  ) => AstNodeWhile;

  until: (
    clause: AstNodeCompoundList,
    body: AstNodeCompoundList,
    whileWord: AstNodeWord,
  ) => AstNodeUntil;

  commandName: (
    name: AstNodeName,
  ) => AstNodeName;

  commandAssignment: (
    prefix: NonNullable<AstNodeCommand['prefix']>,
  ) => AstNodeCommand;

  command: (
    prefix: NonNullable<AstNodeCommand['prefix']>,
    command?: AstNodeName,
    suffix?: NonNullable<AstNodeCommand['suffix']>,
  ) => AstNodeCommand;

  ioRedirect: (
    op: AstNodeWord,
    file: AstNodeWord,
  ) => AstNodeRedirect;

  numberIoRedirect: (
    ioRedirect: AstNodeRedirect,
    numberIo: AstIoNumber,
  ) => AstNodeRedirect;

  suffix: (
    item: AstNodeWord,
  ) => AstNodeWord[];

  suffixAppend: (
    list: AstNodeWord[],
    item: AstNodeWord,
  ) => AstNodeWord[];

  prefix: (
    item: AstNodeAssignmentWord | AstNodeRedirect,
  ) => Array<AstNodeAssignmentWord | AstNodeRedirect>;

  prefixAppend: (
    list: AstNode[],
    item: AstNodeAssignmentWord | AstNodeRedirect,
  ) => AstNode[];

  caseList: (
    item: AstNodeCaseItem,
  ) => AstNodeCaseItem[];

  caseListAppend: (
    list: AstNodeCaseItem[],
    item: AstNodeCaseItem,
  ) => AstNodeCaseItem[];

  pattern: (
    item: AstNodeWord,
  ) => AstNodeWord[];

  patternAppend: (
    list: AstNodeWord[],
    item: AstNodeWord,
  ) => AstNodeWord[];
};
