#!/usr/bin/env node

/**
 * Script para adicionar extensões .js nos imports relativos após compilação TypeScript
 * Necessário porque Node.js ES modules requer extensões explícitas
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

async function isDirectory(path) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function getAllJsFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const isDir = await isDirectory(filePath);
    
    if (isDir) {
      await getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function fixImports(content, filePath) {
  // Regex para encontrar imports relativos sem extensão
  // Exemplos: from './config/database' ou from '../middlewares/error.middleware'
  const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  
  return content.replace(importRegex, (match, importPath) => {
    // Se já tem extensão, não altera
    if (importPath.match(/\.(js|json)$/)) {
      return match;
    }
    
    // Adiciona extensão .js
    return match.replace(importPath, `${importPath}.js`);
  });
}

async function fixFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const fixedContent = fixImports(content, filePath);
    
    if (content !== fixedContent) {
      await writeFile(filePath, fixedContent, 'utf-8');
      const relativePath = relative(distDir, filePath);
      console.log(`✅ Fixed imports in: ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🔧 Fixing imports in compiled files...');
    const files = await getAllJsFiles(distDir);
    
    for (const file of files) {
      await fixFile(file);
    }
    
    console.log(`✅ Fixed ${files.length} files`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

