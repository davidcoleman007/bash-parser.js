/**
 * Transform: Convert echo commands to printf commands
 *
 * This transform demonstrates how to use the bashcodeshift API
 * to find and replace echo commands with printf equivalents.
 */

module.exports = async function(fileInfo, api, options) {
  const source = fileInfo.source;

  // Parse the source and get the transformer API
  const transformer = await api.b(source);

  // Find all echo commands
  const echoCommands = transformer.findCommands('echo');

  console.log(`Found ${echoCommands.length} echo commands to transform`);

  // Transform each echo command to printf
  echoCommands.forEach((cmd, index) => {
    const args = cmd.value.arguments;
    console.log(`Transforming echo command ${index + 1}: echo ${args.join(' ')}`);

    // Replace echo with printf
    cmd.replace({
      ...cmd.value,
      name: 'printf',
      arguments: args.map(arg => `"%s\\n" ${arg}`)
    });
  });

  // Get the transformed AST
  const transformedAst = transformer.getAST();

  // Generate the new source code
  const newSource = api.toSource(transformedAst);

  // Return the transformed source
  return newSource;
};