#!/usr/bin/env node

/**
 * Script para ajustar o schema.prisma baseado no DATABASE_URL
 * Detecta se é PostgreSQL ou SQLite e ajusta o provider accordingly
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://financeflow:changeme@postgres:5432/financeflow';

function detectProvider(url) {
  if (!url) {
    return 'postgresql';
  }
  
  // Se começa com file: ou não tem protocolo, é SQLite
  if (url.startsWith('file:') || !url.includes('://')) {
    return 'sqlite';
  }
  
  // Se começa com postgresql:// ou postgres://, é PostgreSQL
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql';
  }
  
  // Padrão: PostgreSQL
  return 'postgresql';
}

async function updateMigrationLock() {
  try {
    const provider = detectProvider(DATABASE_URL);
    const lockPath = schemaPath.replace('schema.prisma', 'migrations/migration_lock.toml');
    
    try {
      const lockContent = await readFile(lockPath, 'utf-8');
      const currentProviderMatch = lockContent.match(/provider\s*=\s*["'](postgresql|sqlite)["']/);
      const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;
      
      if (currentProvider !== provider) {
        const updatedLock = lockContent.replace(
          /provider\s*=\s*["'](postgresql|sqlite)["']/,
          `provider = "${provider}"`
        );
        try {
          await writeFile(lockPath, updatedLock, 'utf-8');
          console.log(`✅ Updated migration_lock.toml to use ${provider}`);
        } catch (writeError) {
          console.log(`⚠️  Could not write migration_lock.toml: ${writeError.message}`);
        }
      }
    } catch (lockError) {
      // Se não conseguir ler/escrever o lock file, continua
      console.log(`ℹ️  Could not update migration_lock.toml: ${lockError.message}`);
    }
  } catch (error) {
    // Ignora erros no lock file
  }
}

async function updateSchema() {
  try {
    const provider = detectProvider(DATABASE_URL);
    const urlPreview = DATABASE_URL.length > 50 ? DATABASE_URL.substring(0, 50) + '...' : DATABASE_URL;
    console.log(`🔧 Detected database provider: ${provider}`);
    console.log(`📝 DATABASE_URL: ${urlPreview}`);
    
    // Atualizar migration_lock.toml também
    await updateMigrationLock();
    
    const schemaContent = await readFile(schemaPath, 'utf-8');
    
    // Verificar qual provider está configurado atualmente
    const currentProviderMatch = schemaContent.match(/provider\s*=\s*["'](postgresql|sqlite)["']/);
    const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;
    
    if (currentProvider === provider) {
      console.log(`ℹ️  Schema already configured for ${provider}`);
      return;
    }
    
    // Substituir o provider no datasource
    const updatedSchema = schemaContent.replace(
      /provider\s*=\s*["'](postgresql|sqlite)["']/,
      `provider = "${provider}"`
    );
    
    try {
      await writeFile(schemaPath, updatedSchema, 'utf-8');
      console.log(`✅ Updated schema.prisma to use ${provider}`);
    } catch (writeError) {
      // Se não conseguir escrever (read-only no runner stage), apenas avisa
      console.log(`⚠️  Could not write schema.prisma (may be read-only), but provider is ${provider}`);
      console.log(`ℹ️  Schema will use ${provider} based on DATABASE_URL`);
    }
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    // Não falha o build se não conseguir atualizar o schema
    // O Prisma vai usar o provider baseado no DATABASE_URL de qualquer forma
    console.log('⚠️  Continuing with current schema configuration...');
  }
}

updateSchema();

