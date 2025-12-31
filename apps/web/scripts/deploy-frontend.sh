#!/bin/bash

# Script para fazer deploy completo do frontend
# Compacta dist/ localmente, envia e descompacta no servidor
# Uso: ./scripts/deploy-frontend.sh [user@host] [porta_ssh] [caminho_dist]

set -e

VPS_HOST="${1:-deploy@seorganize.pro}"
SSH_PORT="${2:-${VPS_PORT:-22}}"
DIST_PATH="${3:-./dist}"
FRONTEND_DIR="/var/www/seorganize/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"
ARCHIVE_NAME="frontend-dist-$(date +%Y%m%d-%H%M%S).tar.gz"
TEMP_DIR="/tmp"

echo "🚀 Deploy do Frontend (Compactado)"
echo "=================================="
echo "📡 Host: ${VPS_HOST}"
echo "🔌 Porta SSH: ${SSH_PORT}"
echo "📁 Caminho local: ${DIST_PATH}"
echo "📁 Caminho remoto: ${DIST_DIR}"
echo ""

# Verificar se dist/ existe
if [ ! -d "${DIST_PATH}" ]; then
    echo "❌ Erro: Diretório ${DIST_PATH} não encontrado!"
    echo "   Execute 'pnpm run build' primeiro."
    exit 1
fi

# Criar diretório temporário local
TEMP_LOCAL="/tmp"
ARCHIVE_PATH="${TEMP_LOCAL}/${ARCHIVE_NAME}"

# Compactar dist/ localmente
echo "📦 Compactando ${DIST_PATH}..."
# Compactar apenas o conteúdo de dist/ (sem incluir o nome da pasta)
cd "${DIST_PATH}"
tar -czf "${ARCHIVE_PATH}" .
ARCHIVE_SIZE=$(du -h "${ARCHIVE_PATH}" | cut -f1)
echo "✅ Compactado: ${ARCHIVE_NAME} (${ARCHIVE_SIZE})"
echo ""

# Criar diretório na VPS
echo "📁 Preparando diretório na VPS..."
if [ "${SSH_PORT}" != "22" ]; then
    ssh -p "${SSH_PORT}" ${VPS_HOST} "sudo mkdir -p ${DIST_DIR} && sudo mkdir -p ${TEMP_DIR} && sudo chown -R www-data:www-data ${FRONTEND_DIR} && sudo chmod -R 755 ${FRONTEND_DIR}"
else
    ssh ${VPS_HOST} "sudo mkdir -p ${DIST_DIR} && sudo mkdir -p ${TEMP_DIR} && sudo chown -R www-data:www-data ${FRONTEND_DIR} && sudo chmod -R 755 ${FRONTEND_DIR}"
fi

# Enviar arquivo compactado
echo "📤 Enviando arquivo compactado para o servidor..."
if [ "${SSH_PORT}" != "22" ]; then
    scp -P "${SSH_PORT}" "${ARCHIVE_PATH}" ${VPS_HOST}:${TEMP_DIR}/${ARCHIVE_NAME}
else
    scp "${ARCHIVE_PATH}" ${VPS_HOST}:${TEMP_DIR}/${ARCHIVE_NAME}
fi
echo "✅ Arquivo enviado!"
echo ""

# Descompactar no servidor
echo "📦 Descompactando no servidor..."
if [ "${SSH_PORT}" != "22" ]; then
    ssh -p "${SSH_PORT}" ${VPS_HOST} << EOF
set -e

# Criar pasta dist se não existir
sudo mkdir -p ${DIST_DIR}

# Remover conteúdo antigo da pasta dist (se existir)
sudo rm -rf ${DIST_DIR}/* ${DIST_DIR}/.[!.]* ${DIST_DIR}/..?* 2>/dev/null || true

# Descompactar diretamente na pasta dist/
# O arquivo foi compactado apenas com o conteúdo (sem nome da pasta)
sudo tar -xzf ${TEMP_DIR}/${ARCHIVE_NAME} -C ${DIST_DIR}

# Configurar permissões
sudo chown -R www-data:www-data ${DIST_DIR}
sudo chmod -R 755 ${DIST_DIR}

# Remover arquivo compactado
rm -f ${TEMP_DIR}/${ARCHIVE_NAME}

echo "✅ Descompactação concluída!"
EOF
else
    ssh ${VPS_HOST} << EOF
set -e

# Criar pasta dist se não existir
sudo mkdir -p ${DIST_DIR}

# Remover conteúdo antigo da pasta dist (se existir)
sudo rm -rf ${DIST_DIR}/* ${DIST_DIR}/.[!.]* ${DIST_DIR}/..?* 2>/dev/null || true

# Descompactar diretamente na pasta dist/
# O arquivo foi compactado apenas com o conteúdo (sem nome da pasta)
sudo tar -xzf ${TEMP_DIR}/${ARCHIVE_NAME} -C ${DIST_DIR}

# Configurar permissões
sudo chown -R www-data:www-data ${DIST_DIR}
sudo chmod -R 755 ${DIST_DIR}

# Remover arquivo compactado
rm -f ${TEMP_DIR}/${ARCHIVE_NAME}

echo "✅ Descompactação concluída!"
EOF
fi

# Remover arquivo local
echo "🧹 Removendo arquivo compactado local..."
rm -f "${ARCHIVE_PATH}"

# Verificar
echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🔍 Verificando arquivos na VPS..."
if [ "${SSH_PORT}" != "22" ]; then
    ssh -p "${SSH_PORT}" ${VPS_HOST} "ls -lah ${DIST_DIR}/ | head -10 && echo '' && echo '📊 Total de arquivos:' && find ${DIST_DIR} -type f | wc -l"
else
    ssh ${VPS_HOST} "ls -lah ${DIST_DIR}/ | head -10 && echo '' && echo '📊 Total de arquivos:' && find ${DIST_DIR} -type f | wc -l"
fi

echo ""
echo "🌐 Teste no navegador:"
echo "   http://seorganize.pro"
echo "   https://seorganize.pro"

