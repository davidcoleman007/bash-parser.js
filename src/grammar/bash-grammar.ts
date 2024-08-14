export default {
  start: 'complete_command',
  bnf: {
    complete_command: [
      [
        'list separator EOF',
        ' return yy.checkAsync($list, $separator)',
      ],
      [
        'list EOF',
        ' return $list ',
      ],
      [
        'separator list EOF',
        ' return $list ',
      ],
      [
        'separator list separator EOF',
        ' return yy.checkAsync($list, $separator)',
      ],
    ],
    list: [
      [
        'list separator and_or',
        '$$ = yy.listAppend($list, $and_or, $separator);',
      ],
      [
        'and_or',
        '$$ = yy.list($and_or);',
      ],
    ],
    and_or: [
      [
        'pipeline',
        '$$ = $pipeline;',
      ],
      [
        'and_or AND_IF linebreak pipeline',
        '$$ = yy.andAndOr($and_or, $pipeline);',
      ],
      [
        'and_or OR_IF linebreak pipeline',
        '$$ = yy.orAndOr($and_or, $pipeline);',
      ],
    ],
    pipeline: [
      [
        'pipe_sequence',
        '$$ = yy.pipeLine($pipe_sequence);',
      ],
      [
        'Bang pipe_sequence',
        '$$ = yy.bangPipeLine($pipe_sequence);',
      ],
    ],
    pipe_sequence: [
      [
        'command',
        '$$ = yy.pipeSequence($command);',
      ],
      [
        'pipe_sequence PIPE linebreak command',
        '$$ = yy.pipeSequenceAppend($pipe_sequence, $command);',
      ],
    ],
    command: [
      'simple_command',
      'compound_command',
      [
        'compound_command redirect_list',
        '$$ = yy.addRedirections($compound_command, $redirect_list)',
      ],
      'function_definition',
    ],
    compound_command: [
      'brace_group',
      'subshell',
      'for_clause',
      'case_clause',
      'if_clause',
      'while_clause',
      'until_clause',
    ],
    subshell: [
      [
        'OPEN_PAREN compound_list CLOSE_PAREN',
        '$$ = yy.subshell($compound_list, $OPEN_PAREN.loc, $CLOSE_PAREN.loc);',
      ],
    ],
    compound_list: [
      [
        'term',
        '$$ = $term;',
      ],
      [
        'NEWLINE_LIST term',
        '$$ = $term;',
      ],
      [
        'term separator',
        '$$ = yy.checkAsync($term, $separator);',
      ],
      [
        'NEWLINE_LIST term separator',
        '$$ = yy.checkAsync($term, $separator);',
      ],
    ],
    term: [
      [
        'term separator and_or',
        '$$ = yy.termAppend($term, $and_or, $separator);',
      ],
      [
        'and_or',
        '$$ = yy.term($and_or);',
      ],
    ],
    for_clause: [
      [
        'For name linebreak do_group',
        '$$ = yy.forClauseDefault($name, $do_group, $For.loc);',
      ],
      [
        'For name LINEBREAK_IN separator do_group',
        '$$ = yy.forClauseDefault($name, $do_group, $For.loc);',
      ],
      [
        'For name In separator do_group',
        '$$ = yy.forClauseDefault($name, $do_group, $For.loc);',
      ],
      [
        'For name in wordlist separator do_group',
        '$$ = yy.forClause($name, $wordlist, $do_group, $For.loc);',
        /* todo: here allow only ';' separator */
      ],
    ],
    name: [
      'NAME',
    ],
    in: [
      'In',
    ],
    wordlist: [
      'wordlist_repetition_plus0',
    ],
    case_clause: [
      [
        'Case WORD linebreak in linebreak case_list Esac',
        '$$ = yy.caseClause($WORD, $case_list, $Case.loc, $Esac.loc);',
      ],
      [
        'Case WORD linebreak in linebreak case_list_ns Esac',
        '$$ = yy.caseClause($WORD, $case_list_ns, $Case.loc, $Esac.loc);',
      ],
      [
        'Case WORD linebreak in linebreak Esac',
        '$$ = yy.caseClause($WORD, null, $Case.loc, $Esac.loc);',
      ],
    ],
    case_list_ns: [
      [
        'case_list case_item_ns',
        '$$ = yy.caseListAppend($case_list, $case_item_ns);',
      ],
      [
        'case_item_ns',
        '$$ = yy.caseList($case_item_ns);',
      ],
    ],
    case_list: [
      [
        'case_list case_item',
        '$$ = yy.caseListAppend($case_list, $case_item);',
      ],
      [
        'case_item',
        '$$ = yy.caseList($case_item);',
      ],
    ],
    case_item_ns: [
      [
        'pattern CLOSE_PAREN linebreak',
        '$$ = yy.caseItem($pattern, null, $pattern[0].loc, $CLOSE_PAREN.loc);',
      ],
      [
        'pattern CLOSE_PAREN compound_list linebreak',
        '$$ = yy.caseItem($pattern, $compound_list, $pattern[0].loc, $compound_list.loc);',
      ],
      [
        'OPEN_PAREN pattern CLOSE_PAREN linebreak',
        '$$ = yy.caseItem($pattern, null, $OPEN_PAREN.loc, $CLOSE_PAREN.loc );',
      ],
      [
        'OPEN_PAREN pattern CLOSE_PAREN compound_list linebreak',
        '$$ = yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $compound_list.loc);',
      ],
    ],
    case_item: [
      [
        'pattern CLOSE_PAREN linebreak DOUBLE_SEMICOLON linebreak',
        '$$ = yy.caseItem($pattern, null, $pattern[0].loc, $DOUBLE_SEMICOLON.loc);',
      ],
      [
        'pattern CLOSE_PAREN compound_list DOUBLE_SEMICOLON linebreak',
        '$$ = yy.caseItem($pattern, $compound_list, $pattern[0].loc, $DOUBLE_SEMICOLON.loc);',
      ],
      [
        'OPEN_PAREN pattern CLOSE_PAREN linebreak DOUBLE_SEMICOLON linebreak',
        '$$ = yy.caseItem($pattern, null, $OPEN_PAREN.loc, $DOUBLE_SEMICOLON.loc );',
      ],
      [
        'OPEN_PAREN pattern CLOSE_PAREN compound_list DOUBLE_SEMICOLON linebreak',
        '$$ = yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $DOUBLE_SEMICOLON.loc);',
      ],
    ],
    pattern: [
      [
        'WORD',
        '$$ = yy.pattern($WORD);',
      ],
      [
        'pattern PIPE WORD',
        '$$ = yy.patternAppend($pattern, $WORD);',
      ],
    ],
    condition: [
      [
        'OPEN_BRACKET Bang test_op WORD CLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.testExpression($3, $4, true, $OPEN_BRACKET.loc, $CLOSE_BRACKET.loc);',
      ],
      [
        'OPEN_BRACKET Bang WORD op WORD CLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.logicalExpression($3, $4, $5, true, $OPEN_BRACKET.loc, $CLOSE_BRACKET.loc);',
      ],
      [
        'OPEN_BRACKET test_op WORD CLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.testExpression($2, $3, false, $OPEN_BRACKET.loc, $CLOSE_BRACKET.loc);',
      ],
      [
        'OPEN_BRACKET WORD op WORD CLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.logicalExpression($2, $3, $4, false, $OPEN_BRACKET.loc, $CLOSE_BRACKET.loc);',
      ],
      [
        'DOPEN_BRACKET Bang test_op WORD DCLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.testExpression($3, $4, true, $DOPEN_BRACKET.loc, $DCLOSE_BRACKET.loc);',
      ],
      [
        'DOPEN_BRACKET Bang WORD op WORD DCLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.logicalExpression($3, $4, $5, true, $DOPEN_BRACKET.loc, $DCLOSE_BRACKET.loc);',
      ],
      [
        'DOPEN_BRACKET test_op WORD DCLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.testExpression($2, $3, false, $DOPEN_BRACKET.loc, $DCLOSE_BRACKET.loc);',
      ],
      [
        'DOPEN_BRACKET WORD op WORD DCLOSE_BRACKET SEPARATOR_OP',
        '$$ = yy.logicalExpression($2, $3, $4, false, $DOPEN_BRACKET.loc, $DCLOSE_BRACKET.loc);',
      ],
      'compound_list',
    ],
    op: [
      'Equal',
      'NotEqual',
      'LessThan',
      'LessThanOrEqual',
      'GreaterThan',
      'GreaterThanOrEqual',
      'And',
      'Or',
    ],
    test_op: [
      'IsStringNull',
      'IsStringNotNull',
      'IsDirectory',
      'FileExists',
      'IsFile',
      'IsFileNotEmpty',
      'IsReadable',
      'IsWritable',
      'IsExecutable',
    ],
    if_clause: [
      [
        'If condition Then compound_list else_part Fi',
        '$$ = yy.ifClause($2, $4, $else_part, $If.loc, $Fi.loc);',
      ],
      [
        'If condition Then compound_list Fi',
        '$$ = yy.ifClause($2, $4, null, $If.loc, $Fi.loc);',
      ],
    ],
    else_part: [
      [
        'Elif condition Then compound_list',
        '$$ = yy.ifClause($2, $4, null, $Elif.loc, $4.loc);',
      ],
      [
        'Elif condition Then compound_list else_part',
        '$$ = yy.ifClause($2, $4, $else_part, $Elif.loc, $else_part.loc);',
      ],
      [
        'Else compound_list',
        '$$ = yy.elseClause($compound_list, $Else);',
      ],
    ],
    while_clause: [
      [
        'While condition do_group',
        '$$ = yy.while($2, $3, $While);',
      ],
    ],
    until_clause: [
      [
        'Until condition do_group',
        '$$ = yy.until($2, $3, $Until);',
      ],
    ],
    function_definition: [
      [
        'fname OPEN_PAREN CLOSE_PAREN linebreak function_body',
        '$$ = yy.functionDefinition($fname, $function_body);',
      ],
    ],
    function_body: [
      [
        'compound_command',
        '$$ = [$compound_command, null];',
      ],
      [
        'compound_command redirect_list',
        '$$ = [$compound_command, $redirect_list];',
      ],
    ],
    fname: [
      'NAME',
    ],
    brace_group: [
      [
        'Lbrace compound_list Rbrace',
        '$$ = yy.braceGroup($compound_list, $Lbrace.loc, $Rbrace.loc);',
      ],
    ],
    do_group: [
      [
        'Do compound_list Done',
        '$$ = yy.doGroup($compound_list, $Do.loc, $Done.loc);',
      ],
    ],
    simple_command: [
      [
        'cmd_prefix cmd_word cmd_suffix',
        '$$ =yy.command($cmd_prefix, $cmd_word, $cmd_suffix);',
      ],
      [
        'cmd_prefix cmd_word',
        '$$ =yy.command($cmd_prefix, $cmd_word, null);',
      ],
      [
        'cmd_prefix',
        '$$ =yy.commandAssignment($cmd_prefix);',
      ],
      [
        'cmd_name cmd_suffix',
        '$$ =yy.command(null, $cmd_name, $cmd_suffix);',
      ],
      [
        'cmd_name',
        '$$ =yy.command(null, $cmd_name);',
      ],
    ],
    cmd_name: [
      [
        'WORD',
        '$$ =yy.commandName(yytext) /* Apply rule 7a */;',
      ],
    ],
    cmd_word: [
      [
        'WORD',
        '$$ = yytext	/* Apply rule 7B */;',
      ],
    ],
    cmd_prefix: [
      [
        'io_redirect',
        '$$ = yy.prefix($io_redirect);',
      ],
      [
        'cmd_prefix io_redirect',
        '$$ = yy.prefixAppend($1, $2);',
      ],
      [
        'ASSIGNMENT_WORD',
        '$$ = yy.prefix($1);',
      ],
      [
        'cmd_prefix ASSIGNMENT_WORD',
        '$$ = yy.prefixAppend($1, $2);',
      ],
    ],
    cmd_suffix: [
      [
        'io_redirect',
        '$$ = yy.suffix($io_redirect);',
      ],
      [
        'cmd_suffix io_redirect',
        '$$ = yy.suffixAppend($cmd_suffix, $io_redirect);',
      ],
      [
        'WORD',
        '$$ = yy.suffix($1);',
      ],
      [
        'cmd_suffix WORD',
        '$$ = yy.suffixAppend($cmd_suffix, $2);',
      ],
    ],
    redirect_list: [
      [
        'io_redirect',
        '$$ = [$io_redirect];',
      ],
      [
        'redirect_list io_redirect',
        '$$ = $redirect_list.concat($io_redirect);',
      ],
    ],
    io_redirect: [
      [
        'io_file',
        '$$ = $io_file;',
      ],
      [
        'IO_NUMBER io_file',
        '$$ = yy.numberIoRedirect($io_file, $1);',
      ],
      'io_here',
      'IO_NUMBER io_here',
    ],
    io_file: [
      [
        'LESS filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'LESS_AND filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'GREAT filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'GREAT_AND filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'DOUBLE_GREAT filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'LESS_GREAT filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
      [
        'CLOBBER filename',
        '$$ =yy.ioRedirect($1, $filename);',
      ],
    ],
    filename: [
      'WORD',
    ],
    io_here: [
      'DOUBLE_LESS here_end',
      'DOUBLE_LESS_DASH here_end',
    ],
    here_end: [
      'WORD',
    ],
    linebreak: [
      'NEWLINE_LIST',
      '',
    ],
    separator: [
      'SEPARATOR_OP',
      'NEWLINE_LIST',
    ],
    wordlist_repetition_plus0: [
      [
        'WORD',
        '$$ = [$1];',
      ],
      [
        'wordlist_repetition_plus0 WORD',
        '$1.push($2);',
      ],
    ],
  },
};
