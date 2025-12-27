-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container PostgreSQL é iniciado pela primeira vez
-- O database e usuário já são criados pelas variáveis de ambiente (POSTGRES_USER, POSTGRES_DB)
-- Este script garante permissões adicionais e configurações extras

-- Garantir que o usuário tenha todas as permissões necessárias no database
GRANT ALL PRIVILEGES ON DATABASE financeflow TO financeflow;

-- Tornar o usuário superuser (se necessário para operações administrativas)
ALTER USER financeflow WITH SUPERUSER;

-- Conectar ao database financeflow para configurar permissões no schema
\c financeflow

-- Garantir permissões no schema público
GRANT ALL ON SCHEMA public TO financeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO financeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO financeflow;
