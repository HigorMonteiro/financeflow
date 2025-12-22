/**
 * Service para detectar qual banco/instituição financeira um CSV pertence
 */

export enum BankType {
  NUBANK = 'NUBANK',
  INTER = 'INTER',
  ITAU = 'ITAU',
  SANTANDER = 'SANTANDER',
  BRADESCO = 'BRADESCO',
  CAIXA = 'CAIXA',
  BB = 'BB', // Banco do Brasil
  UNKNOWN = 'UNKNOWN',
}

export interface BankDetectionResult {
  bank: BankType;
  confidence: number; // 0-1, quanto maior mais confiável
  indicators: string[];
}

export class CardDetectionService {
  /**
   * Detecta qual banco um CSV pertence baseado nos headers e formato
   */
  detectBankFromCSV(headers: string[], sampleLines: string[]): BankDetectionResult {
    const headerLower = headers.map((h) => h.toLowerCase().trim());
    const headerString = headerLower.join(' ');

    const indicators: string[] = [];
    let confidence = 0;

    // Nubank detection
    if (
      headerLower.includes('date') &&
      headerLower.includes('title') &&
      headerLower.includes('amount')
    ) {
      indicators.push('Headers: date, title, amount');
      confidence += 0.4;
    }
    if (headerString.includes('nubank')) {
      indicators.push('Menciona "Nubank"');
      confidence += 0.3;
    }
    if (sampleLines.length > 0) {
      const firstLine = sampleLines[0].toLowerCase();
      if (firstLine.includes('nubank')) {
        indicators.push('Primeira linha contém "Nubank"');
        confidence += 0.2;
      }
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.NUBANK,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Inter detection
    confidence = 0;
    indicators.length = 0;
    if (
      headerLower.includes('data') &&
      (headerLower.includes('descrição') || headerLower.includes('descricao')) &&
      headerLower.includes('valor')
    ) {
      indicators.push('Headers em português');
      confidence += 0.3;
    }
    if (headerString.includes('inter') || headerString.includes('banco inter')) {
      indicators.push('Menciona "Inter"');
      confidence += 0.4;
    }
    if (sampleLines.length > 0) {
      const firstLine = sampleLines[0].toLowerCase();
      if (firstLine.includes('inter')) {
        indicators.push('Primeira linha contém "Inter"');
        confidence += 0.2;
      }
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.INTER,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Itaú detection
    confidence = 0;
    indicators.length = 0;
    if (headerString.includes('itau') || headerString.includes('itaú')) {
      indicators.push('Menciona "Itaú"');
      confidence += 0.5;
    }
    if (
      headerLower.includes('data') &&
      headerLower.includes('descrição') &&
      headerLower.includes('valor') &&
      headerLower.includes('categoria')
    ) {
      indicators.push('Formato estruturado com categoria');
      confidence += 0.3;
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.ITAU,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Santander detection
    confidence = 0;
    indicators.length = 0;
    if (headerString.includes('santander')) {
      indicators.push('Menciona "Santander"');
      confidence += 0.5;
    }
    if (
      headerLower.includes('data') &&
      headerLower.includes('descrição') &&
      headerLower.includes('valor')
    ) {
      indicators.push('Formato padrão');
      confidence += 0.2;
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.SANTANDER,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Bradesco detection
    confidence = 0;
    indicators.length = 0;
    if (headerString.includes('bradesco')) {
      indicators.push('Menciona "Bradesco"');
      confidence += 0.5;
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.BRADESCO,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Banco do Brasil detection
    confidence = 0;
    indicators.length = 0;
    if (
      headerString.includes('banco do brasil') ||
      headerString.includes('bb ') ||
      headerString.includes(' banco do brasil')
    ) {
      indicators.push('Menciona "Banco do Brasil" ou "BB"');
      confidence += 0.5;
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.BB,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Caixa detection
    confidence = 0;
    indicators.length = 0;
    if (
      headerString.includes('caixa') ||
      headerString.includes('cef') ||
      headerString.includes('caixa econômica')
    ) {
      indicators.push('Menciona "Caixa" ou "CEF"');
      confidence += 0.5;
    }

    if (confidence >= 0.4) {
      return {
        bank: BankType.CAIXA,
        confidence: Math.min(confidence, 1),
        indicators,
      };
    }

    // Unknown
    return {
      bank: BankType.UNKNOWN,
      confidence: 0,
      indicators: ['Não foi possível identificar o banco'],
    };
  }

  /**
   * Retorna o nome amigável do banco
   */
  getBankDisplayName(bank: BankType): string {
    const names: Record<BankType, string> = {
      [BankType.NUBANK]: 'Nubank',
      [BankType.INTER]: 'Inter',
      [BankType.ITAU]: 'Itaú',
      [BankType.SANTANDER]: 'Santander',
      [BankType.BRADESCO]: 'Bradesco',
      [BankType.CAIXA]: 'Caixa Econômica',
      [BankType.BB]: 'Banco do Brasil',
      [BankType.UNKNOWN]: 'Desconhecido',
    };
    return names[bank];
  }
}

