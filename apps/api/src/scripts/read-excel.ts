import XLSX from 'xlsx';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Script para ler a planilha Excel e mostrar sua estrutura
 * Execute com: pnpm read-excel
 */
function readExcel() {
  const filePath = join(process.cwd(), '../../planilha_financeira_completa.xlsx');
  
  try {
    if (!existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      console.error('💡 Certifique-se de que o arquivo está na raiz do projeto.');
      process.exit(1);
    }

    console.log('📊 Lendo planilha:', filePath);
    console.log('');
    
    const workbook = XLSX.readFile(filePath);
    const result: any = {
      totalSheets: workbook.SheetNames.length,
      sheets: [],
      structure: {},
    };

    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`📄 Processando aba ${index + 1}/${workbook.SheetNames.length}: "${sheetName}"`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '',
        raw: false 
      }) as any[][];
      
      const rows = jsonData.slice(0, 20); // Limitar a 20 linhas para preview
      
      const sheetInfo = {
        name: sheetName,
        totalRows: jsonData.length,
        totalColumns: rows[0]?.length || 0,
        hasData: jsonData.length > 0,
      };
      
      result.sheets.push(sheetInfo);

      if (rows.length > 0) {
        result.structure[sheetName] = {
          headers: rows[0] || [],
          sampleData: rows.slice(1, 6) || [],
          totalRows: jsonData.length,
        };
        
        console.log(`   ✓ ${jsonData.length} linhas, ${rows[0]?.length || 0} colunas`);
        console.log(`   ✓ Cabeçalhos: ${(rows[0] || []).join(' | ')}`);
      } else {
        console.log(`   ⚠️  Aba vazia`);
      }
    });

    console.log('');
    console.log('📋 Estrutura Completa da Planilha:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('💡 Use essas informações para criar o script de importação customizado.');
    
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao ler planilha:', error.message);
    console.error('\n💡 Certifique-se de que:');
    console.error('   1. O arquivo existe na raiz do projeto');
    console.error('   2. A biblioteca xlsx está instalada: pnpm install');
    console.error('   3. O arquivo não está corrompido');
    process.exit(1);
  }
}

readExcel();

