#!/usr/bin/env node
/**
 * 🔐 Manual JWT Secret Rotation Script
 * 
 * Usage:
 *   node scripts/rotate-jwt.js [environment]
 * 
 * Example:
 *   node scripts/rotate-jwt.js staging
 *   node scripts/rotate-jwt.js production
 */

import { execSync } from 'child_process';

const environment = process.argv[2] || 'staging';

if (!['local', 'staging', 'production'].includes(environment)) {
  console.error('❌ Invalid environment. Use: local, staging, or production');
  process.exit(1);
}

console.log(`🔄 Rotating JWT secret for: ${environment}`);

try {
  // Get the worker URL based on environment
  const urls = {
    local: 'http://localhost:8787',
    staging: 'https://filler-tracker-staging.your-subdomain.workers.dev',
    production: 'https://filler-tracker.your-domain.com'
  };

  console.log(`📡 Endpoint: ${urls[environment]}/api/admin/secrets/rotate-jwt`);
  console.log('');
  console.log('⚠️  This requires an admin JWT token.');
  console.log('Run this curl command with your admin token:');
  console.log('');
  console.log(`curl -X POST ${urls[environment]}/api/admin/secrets/rotate-jwt \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json"`);
  console.log('');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
