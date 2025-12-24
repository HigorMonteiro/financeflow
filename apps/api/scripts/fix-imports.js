#!/usr/bin/env node

/**
 * Script para adicionar extensões .js nos imports relativos após compilação TypeScript
 * Necessário porque Node.js ES modules requer extensões explícitas
 * 
 * Este script também lida com imports de diretórios que têm index.js
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

async function resolveImportPath(importPath, fromFile) {
  // Se já tem extensão, não altera
  if (importPath.match(/\.(js|json)$/)) {
    return importPath;
  }
  
  const fileDir = dirname(fromFile);
  const resolvedPath = join(fileDir, importPath);
  
  // Verifica se é um diretório e se tem index.js
  const isDir = await isDirectory(resolvedPath);
  if (isDir) {
    const indexPath = join(resolvedPath, 'index.js');
    try {
      await stat(indexPath);
      // É um diretório com index.js, usa /index.js
      return `${importPath}/index.js`;
    } catch {
      // Diretório sem index.js, adiciona .js normalmente
      return `${importPath}.js`;
    }
  }
  
  // Verifica se existe como arquivo .js
  const jsPath = `${resolvedPath}.js`;
  try {
    await stat(jsPath);
    // Arquivo existe, adiciona .js
    return `${importPath}.js`;
  } catch {
    // Não encontrou, tenta como diretório com index.js
    const indexPath = `${resolvedPath}/index.js`;
    try {
      await stat(indexPath);
      return `${importPath}/index.js`;
    } catch {
      // Não encontrou nem como arquivo nem como diretório, adiciona .js mesmo assim
      return `${importPath}.js`;
    }
  }
}

async function fixImports(content, filePath) {
  // Regex para encontrar imports relativos sem extensão
  // Exemplos: from './config/database' ou from '../middlewares/error.middleware'
  const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  
  const matches = Array.from(content.matchAll(importRegex));
  
  if (matches.length === 0) {
    return content;
  }
  
  // Resolve todos os imports em paralelo
  const resolvedImports = await Promise.all(
    matches.map(async (match) => {
      const importPath = match[1];
      const resolved = await resolveImportPath(importPath, filePath);
      return {
        original: match[0],
        replacement: match[0].replace(importPath, resolved)
      };
    })
  );
  
  // Aplica as substituições
  let fixedContent = content;
  for (const { original, replacement } of resolvedImports) {
    fixedContent = fixedContent.replace(original, replacement);
  }
  
  return fixedContent;
}

async function fixFile(filePath, distDir) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const fixedContent = await fixImports(content, filePath);
    
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
      await fixFile(file, distDir);
    }
    
    console.log(`✅ Fixed ${files.length} files`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
