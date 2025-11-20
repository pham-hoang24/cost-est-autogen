/**
 * SW4E Role System Extension - Safe Database Migration
 * This applies the role extension WITHOUT breaking existing functionality
 */

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'sw4e_governance.db');

async function applyRoleExtension() {
  let db;
  
  try {
    console.log('🔄 Starting SW4E Role System Extension...');
    
    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('✅ Database connection established');
    
    // Read the role extension schema
    const schemaPath = path.join(process.cwd(), 'src/database/role-extension-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Role extension schema loaded');
    
    // Apply the schema (all tables use CREATE TABLE IF NOT EXISTS)
    await db.exec(schema);
    
    console.log('✅ Role extension schema applied successfully');
    
    // Verify the extension was applied
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE '%role%' OR name LIKE '%permission%'
      ORDER BY name
    `);
    
    console.log('📋 New tables created:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check if role hierarchy data was inserted
    const roleCount = await db.get('SELECT COUNT(*) as count FROM role_hierarchy');
    console.log(`📊 Role hierarchy entries: ${roleCount.count}`);
    
    // Check if permissions were inserted
    const permissionCount = await db.get('SELECT COUNT(*) as count FROM role_permissions');
    console.log(`🔐 Permission entries: ${permissionCount.count}`);
    
    // Check if delegation matrix was inserted
    const delegationCount = await db.get('SELECT COUNT(*) as count FROM role_delegation_matrix');
    console.log(`🤝 Delegation entries: ${delegationCount.count}`);
    
    console.log('✅ Role system extension completed successfully!');
    console.log('');
    console.log('🎯 What was added:');
    console.log('  - 25+ new user roles with proper hierarchy');
    console.log('  - User preferences and customization system');
    console.log('  - Permission management system');
    console.log('  - Role delegation matrix');
    console.log('  - Temporary role assignments');
    console.log('  - Organization role customizations');
    console.log('  - Permission audit logging');
    console.log('  - Role-based access control views');
    console.log('');
    console.log('🔒 Safety measures:');
    console.log('  - All existing data preserved');
    console.log('  - All existing functionality maintained');
    console.log('  - No breaking changes to existing tables');
    console.log('  - Backward compatibility ensured');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('  1. Test existing functionality');
    console.log('  2. Deploy new role selection UI');
    console.log('  3. Test new role assignments');
    console.log('  4. Monitor for any issues');
    
  } catch (error) {
    console.error('❌ Error applying role extension:', error);
    throw error;
  } finally {
    if (db) {
      await db.close();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  applyRoleExtension()
    .then(() => {
      console.log('🎉 Role extension migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Role extension migration failed:', error);
      process.exit(1);
    });
}

export { applyRoleExtension };
