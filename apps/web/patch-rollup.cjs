#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function patchRollupNative(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Find the rollup.js file in the same directory
    const rollupDir = path.dirname(filePath);
    const rollupJs = path.join(rollupDir, 'rollup.js');
    
    if (!fs.existsSync(rollupJs)) {
      console.log(`rollup.js not found in ${rollupDir}`);
      return false;
    }

    // Replace the entire requireWithFriendlyError function to always use JS fallback
    // Match everything from "const requireWithFriendlyError" until the next "const" or "function"
    const arrowFunctionPattern = /const requireWithFriendlyError = id => \{[\s\S]*?\};/;
    if (arrowFunctionPattern.test(content)) {
      const match = content.match(arrowFunctionPattern);
      if (match) {
        // Replace the entire function with a simpler version that always uses JS
        content = content.replace(
          arrowFunctionPattern,
          `const requireWithFriendlyError = id => {
  try {
    return require(id);
  } catch (error) {
    // Fallback to JavaScript implementation when native binary is not available
    return require('${rollupJs.replace(/\\/g, '/')}');
  }
};`
        );
      }
    }
    
    // Also replace any remaining throw statements as a safety measure
    content = content.replace(
      /throw new Error\([^)]+\);/g,
      `return require('${rollupJs.replace(/\\/g, '/')}');`
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Patched: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error patching ${filePath}:`, error.message);
    return false;
  }
}

// Find all native.js files
try {
  const files = execSync('find /app/node_modules -name "native.js" -path "*/rollup/dist/native.js"', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  if (files.length === 0) {
    console.log('⚠️  No rollup native.js files found');
    process.exit(1);
  }

  let patched = 0;
  files.forEach(file => {
    if (patchRollupNative(file)) {
      patched++;
    }
  });

  if (patched > 0) {
    console.log(`✅ Successfully patched ${patched} file(s)`);
    process.exit(0);
  } else {
    console.log('⚠️  No files were patched');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error finding files:', error.message);
  process.exit(1);
}

