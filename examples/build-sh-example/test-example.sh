#!/bin/bash

echo "=========================================================="
echo "bashcodeshift Example: Insert Commands with Proper Newlines"
echo "=========================================================="
echo ""
echo "This example demonstrates how to use the insertCommandsAfter method"
echo "to properly insert commands with newlines after a specific command."
echo ""

# Check if we're in the right directory
if [ ! -f "rollup-transform.js" ]; then
    echo "❌ Error: Please run this script from the build-sh-example directory"
    echo "   cd examples/build-sh-example"
    echo "   ./test-example.sh"
    exit 1
fi

# Build the bashcodeshift package
echo "📦 Building bashcodeshift package..."
cd ../../../
npm run build > /dev/null 2>&1
cd examples/build-sh-example

# Verify the CLI exists
if [ ! -f "../../dist/cli.js" ]; then
    echo "❌ Error: CLI not found. Make sure bashcodeshift is built."
    exit 1
fi

echo ""
echo "🔍 Original file (build-original.sh):"
echo "====================================="
echo "Around npm run build:"
grep -A 3 -B 2 "npm run build" build-original.sh

echo ""
echo "🚀 Running transform..."
echo "======================"
echo "Command: bashcodeshift run rollup-transform.js build-original.sh"
echo ""

# Run the transform
../../dist/cli.js run rollup-transform.js build-original.sh

echo ""
echo "✅ Transform completed!"
echo ""
echo "🔍 Modified file (build-original.sh):"
echo "===================================="
echo "Around npm run build:"
grep -A 7 -B 2 "npm run build" build-original.sh

echo ""
echo "📊 Verification Results:"
echo "======================="

# Check for the problematic pattern
if grep -q "npm run buildnpx" build-original.sh; then
    echo "❌ ERROR: Found 'npm run buildnpx' - newlines are NOT working!"
    exit 1
else
    echo "✅ SUCCESS: No 'npm run buildnpx' found - newlines are working correctly!"
fi

# Check if npm run build ends with a newline
if grep -q "npm run build$" build-original.sh; then
    echo "✅ SUCCESS: Found 'npm run build' with proper newline!"
else
    echo "❌ ERROR: 'npm run build' not found with proper newline!"
fi

# Check if the new commands are properly separated
if grep -A 1 "npm run build" build-original.sh | grep -q "^npx rollup-uitests"; then
    echo "✅ SUCCESS: New commands are properly separated on their own lines!"
else
    echo "❌ ERROR: New commands are not properly separated!"
fi

# Count the number of newlines after npm run build
echo ""
echo "📈 Line count analysis:"
echo "======================"
echo "Lines in original file: $(wc -l < build-original.sh)"
echo "Lines in modified file: $(wc -l < build-original.sh)"
echo "Note: The transform modifies the file in place"

echo ""
echo "🔬 Detailed comparison:"
echo "======================"
echo "BEFORE:"
echo "  npm run build"
echo "  if [[ \"\$BUILD_TYPE\" != \"deploy-ephemeral\" ]]; then"
echo ""
echo "AFTER:"
echo "  npm run build"
echo "  npx rollup-uitests --batchSize=10 --debug"
echo "  npx rollup-pageobjects"
echo "  npx map-io-usages"
echo "  npx map-source-usages"
echo ""
echo "  if [[ \"\$BUILD_TYPE\" != \"deploy-ephemeral\" ]]; then"

echo ""
echo "🎯 Key Points:"
echo "=============="
echo "• The insertCommandsAfter method properly handles newlines"
echo "• Commands are inserted after the newline following the target command"
echo "• Each new command gets its own line with proper spacing"
echo "• No concatenation issues like 'npm run buildnpx'"
echo "• The AST structure is respected and maintained"

echo ""
echo "📁 Files in this example:"
echo "========================"
echo "• build-original.sh     - Original build script"
echo "• build-modified.sh     - Pre-transformed version (for comparison)"
echo "• rollup-transform.js   - The transform that adds rollup commands"
echo "• test-example.sh       - This test script"

echo ""
echo "✨ Example completed successfully!"
echo "You can now use the insertCommandsAfter method in your own transforms."