#!/usr/bin/env node

/**
 * Script para ajustar o migration_lock.toml baseado no DATABASE_URL
 * Detecta se é PostgreSQL ou SQLite e ajusta o provider accordingly
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const lockPath = join(__dirname, '..', 'prisma', 'migrations', 'migration_lock.toml');

const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

function detectProvider(url) {
  if (!url) {
    return 'sqlite';
  }
  
  // Se começa com file: ou não tem protocolo, é SQLite
  if (url.startsWith('file:') || !url.includes('://')) {
    return 'sqlite';
  }
  
  // Se começa com postgresql:// ou postgres://, é PostgreSQL
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql';
  }
  
  // Padrão: SQLite
  return 'sqlite';
}

async function updateLockFile() {
  try {
    const provider = detectProvider(DATABASE_URL);
    const urlPreview = DATABASE_URL.length > 50 ? DATABASE_URL.substring(0, 50) + '...' : DATABASE_URL;
    console.log(`🔧 Detected database provider: ${provider}`);
    console.log(`📝 DATABASE_URL: ${urlPreview}`);
    
    const lockContent = await readFile(lockPath, 'utf-8');
    
    // Verificar qual provider está configurado atualmente
    const currentProviderMatch = lockContent.match(/provider\s*=\s*["'](postgresql|sqlite)["']/);
    const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;
    
    if (currentProvider === provider) {
      console.log(`ℹ️  Migration lock already configured for ${provider}`);
      return;
    }
    
    // Substituir o provider no lock file
    const updatedLock = lockContent.replace(
      /provider\s*=\s*["'](postgresql|sqlite)["']/,
      `provider = "${provider}"`
    );
    
    try {
      await writeFile(lockPath, updatedLock, 'utf-8');
      console.log(`✅ Updated migration_lock.toml to use ${provider}`);
    } catch (writeError) {
      console.log(`⚠️  Could not write migration_lock.toml: ${writeError.message}`);
      console.log(`ℹ️  Please update manually: provider = "${provider}"`);
    }
  } catch (error) {
    console.error('❌ Error updating migration lock:', error.message);
    // Não falha o processo se não conseguir atualizar
    console.log('⚠️  Continuing...');
  }
}

updateLockFile();

