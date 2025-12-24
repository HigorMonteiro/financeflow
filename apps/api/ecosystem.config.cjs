/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 to manage the Finance Flow API process.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 * 
 * Paths are automatically detected:
 * - Uses current directory if running from apps/api/
 * - Uses absolute path if PM2_API_DIR environment variable is set
 */

const path = require('path');
const os = require('os');

// Detect API directory
const apiDir = process.env.PM2_API_DIR || __dirname;
const userHome = process.env.PM2_USER_HOME || os.homedir();
const logDir = process.env.PM2_LOG_DIR || path.join(userHome, '.pm2', 'logs');

module.exports = {
  apps: [{
    name: 'finance-flow-api',
    script: 'node',
    args: 'dist/server.js',
    cwd: apiDir,
    instances: parseInt(process.env.PM2_INSTANCES || '1', 10),
    exec_mode: process.env.PM2_MODE || 'fork',
    
    // Environment variables
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: parseInt(process.env.PORT || '3000', 10)
    },
    
    // Load environment variables from .env file
    env_file: path.join(apiDir, '.env'),
    
    // Logging configuration
    error_file: path.join(logDir, 'finance-flow-api-error.log'),
    out_file: path.join(logDir, 'finance-flow-api-out.log'),
    log_file: path.join(logDir, 'finance-flow-api-combined.log'),
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Auto-restart configuration
    autorestart: true,
    watch: process.env.PM2_WATCH === 'true',
    watch_delay: 1000,
    ignore_watch: ['node_modules', 'dist', 'logs', '.git', '*.log'],
    max_memory_restart: process.env.PM2_MAX_MEMORY || '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Process management
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    shutdown_with_message: true,
    
    // Health check
    health_check_grace_period: 3000,
    
    // Instance configuration
    instance_var: 'INSTANCE_ID',
    
    // Advanced options
    node_args: `--max-old-space-size=${process.env.PM2_NODE_MAX_MEMORY || '1024'}`,
    interpreter: 'node'
  }]
};

