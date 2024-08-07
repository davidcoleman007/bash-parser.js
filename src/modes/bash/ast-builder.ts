import type {
  AstBuilder,
  Location,
  Node,
  NodeCase,
  NodeCaseItem,
  NodeCommand,
  NodeCompoundList,
  NodeFor,
  NodeFunction,
  NodeIf,
  NodeLogicalExpression,
  NodePipeline,
  NodeRedirect,
  NodeScript,
  NodeSubshell,
  NodeUntil,
  NodeWhile,
  Options,
  Separator,
} from '~/types.ts';
import last from '~/utils/last.ts';

const isAsyncSeparator = (separator: Separator) => {
  return separator.text.indexOf('&') !== -1;
};

const setLocStart = (target: Location, source?: Location) => {
  if (source) {
    target.start = source.start;
  }

  return target;
};

const setLocEnd = (target: Location, source?: Location) => {
  if (source) {
    target.end = source.end;
  }

  return target;
};

export default (options: Options) => {
  const builder: AstBuilder = {
    caseItem: (pattern, body, locStart, locEnd) => {
      const node: NodeCaseItem = { type: 'CaseItem', pattern, body };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), locEnd);
      }

      return node;
    },

    caseClause: (clause, cases, locStart, locEnd) => {
      const node: NodeCase = { type: 'Case', clause };

      if (cases) {
        Object.assign(node, { cases });
      }

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), locEnd);
      }

      return node;
    },

    doGroup: (group, locStart, locEnd) => {
      if (options.insertLOC) {
        setLocEnd(setLocStart(group.loc!, locStart), locEnd);
      }

      return group;
    },

    braceGroup: (group, locStart, locEnd) => {
      if (options.insertLOC) {
        setLocEnd(setLocStart(group.loc!, locStart), locEnd);
      }

      return group;
    },

    list: (logicalExpression) => {
      const node: NodeScript = { type: 'Script', commands: [logicalExpression] };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, logicalExpression.loc), logicalExpression.loc);
      }

      return node;
    },

    checkAsync: (list, separator) => {
      if (isAsyncSeparator(separator)) {
        last(list.commands!)!.async = true;
      }

      return list;
    },

    listAppend: (list, logicalExpression, separator) => {
      if (isAsyncSeparator(separator)) {
        last(list.commands!)!.async = true;
      }

      list.commands.push(logicalExpression);

      if (options.insertLOC) {
        setLocEnd(list.loc!, logicalExpression.loc);
      }

      return list;
    },

    addRedirections: (compoundCommand, redirectList) => {
      compoundCommand.redirections = redirectList;

      if (options.insertLOC) {
        const lastRedirect = redirectList[redirectList.length - 1];
        setLocEnd(compoundCommand.loc!, lastRedirect.loc);
      }

      return compoundCommand;
    },

    term: (logicalExpression) => {
      const node: NodeCompoundList = { type: 'CompoundList', commands: [logicalExpression] };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, logicalExpression.loc), logicalExpression.loc);
      }

      return node;
    },

    termAppend: (term, logicalExpression, separator) => {
      if (isAsyncSeparator(separator)) {
        last(term.commands)!.async = true;
      }

      term.commands.push(logicalExpression);
      setLocEnd(term.loc!, logicalExpression.loc);

      return term;
    },

    subshell: (list, locStart, locEnd) => {
      const node: NodeSubshell = { type: 'Subshell', list };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), locEnd);
      }

      return node;
    },

    pipeSequence: (command) => {
      const node: NodePipeline = { type: 'Pipeline', commands: [command] };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, command.loc), command.loc);
      }

      return node;
    },

    pipeSequenceAppend: (pipe, command) => {
      pipe.commands.push(command);

      if (options.insertLOC) {
        setLocEnd(pipe.loc!, command.loc);
      }

      return pipe;
    },

    bangPipeLine: (pipe) => {
      const bang = true;

      if (pipe.commands.length === 1) {
        return Object.assign(pipe.commands[0], { bang });
      }

      return Object.assign(pipe, { bang });
    },

    pipeLine: (pipe) => {
      if (pipe.commands.length === 1) {
        return pipe.commands[0];
      }

      return pipe;
    },

    andAndOr: (left, right) => {
      const node: NodeLogicalExpression = { type: 'LogicalExpression', op: 'and', left, right };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, left.loc), right.loc);
      }

      return node;
    },

    orAndOr: (left, right) => {
      const node: NodeLogicalExpression = { type: 'LogicalExpression', op: 'or', left, right };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, left.loc), right.loc);
      }

      return node;
    },

    forClause: (name, wordlist, doGroup, locStart) => {
      const node: NodeFor = { type: 'For', name, wordlist, do: doGroup };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), doGroup.loc);
      }

      return node;
    },

    forClauseDefault: (name, doGroup, locStart) => {
      const node: NodeFor = { type: 'For', name, do: doGroup };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), doGroup.loc);
      }

      return node;
    },

    functionDefinition: (name, body) => {
      const node: NodeFunction = { type: 'Function', name, body: body[0] };

      let endLoc: Node = body[0];

      if (body[1]) {
        node.redirections = body[1];
        endLoc = last(body[1])!;
      }

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, name.loc), endLoc.loc);
      }

      return node;
    },

    elseClause: (compoundList, elseClaus) => {
      if (options.insertLOC) {
        setLocStart(compoundList.loc!, elseClaus.loc);
      }

      return compoundList;
    },

    // eslint-disable-next-line max-params
    ifClause: (clause, then, elseBranch, locStart, locEnd) => {
      const node: NodeIf = { type: 'If', clause, then };

      if (elseBranch) {
        node.else = elseBranch;
      }

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, locStart), locEnd);
      }

      return node;
    },

    while: (clause, body, whileWord) => {
      const node: NodeWhile = { type: 'While', clause, do: body };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, whileWord.loc), body.loc);
      }

      return node;
    },

    until: (clause, body, whileWord) => {
      const node: NodeUntil = { type: 'Until', clause, do: body };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, whileWord.loc), body.loc);
      }

      return node;
    },

    commandName: (name) => name,

    commandAssignment: (prefix) => {
      return builder.command(prefix);
    },

    command: (prefix, command, suffix) => {
      const node: NodeCommand = { type: 'Command' };

      if (command) {
        node.name = command;
      }

      if (options.insertLOC) {
        node.loc = { start: {}, end: {} };
        if (prefix) {
          const firstPrefix = prefix[0];
          node.loc.start = firstPrefix.loc!.start;
        } else if (command) {
          node.loc.start = command.loc!.start;
        }

        if (suffix) {
          const lastSuffix = suffix[suffix.length - 1];
          node.loc.end = lastSuffix.loc!.end;
        } else if (command) {
          node.loc.end = command.loc!.end;
        } else if (prefix) {
          const lastPrefix = prefix[prefix.length - 1];
          node.loc.end = lastPrefix.loc!.end;
        }
      }

      if (prefix) {
        node.prefix = prefix;
      }

      if (suffix) {
        node.suffix = suffix;
      }

      return node;
    },

    ioRedirect: (op, file) => {
      const node: NodeRedirect = { type: 'Redirect', op: op, file: file };

      if (options.insertLOC) {
        node.loc = setLocEnd(setLocStart({ start: {}, end: {} }, op.loc), file.loc);
      }

      return node;
    },

    numberIoRedirect: (ioRedirect, numberIo) => {
      const node: NodeRedirect = Object.assign({}, ioRedirect, { numberIo });

      if (options.insertLOC) {
        setLocStart(node.loc!, numberIo.loc);
      }

      return node;
    },

    caseList: (item) => {
      return [item];
    },

    caseListAppend: (list, item) => {
      list.push(item);
      return list;
    },

    pattern: (item) => {
      return [item];
    },

    patternAppend: (list, item) => {
      list.push(item);
      return list;
    },

    prefix: (item) => {
      return [item];
    },

    prefixAppend: (list, item) => {
      list.push(item);
      return list;
    },

    suffix: (item) => {
      return [item];
    },

    suffixAppend: (list, item) => {
      list.push(item);
      return list;
    },
  };

  return builder;
};
