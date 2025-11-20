#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sandbox/control-plane/sw4e_database.db');
const db = new Database(dbPath);

console.log('🧹 Cleaning up duplicate AI services...');

try {
  // Get all AI services
  const allServices = db.prepare('SELECT * FROM ai_services ORDER BY created_at DESC').all();
  console.log(`📊 Found ${allServices.length} total AI services`);

  // Group by name to find duplicates
  const serviceGroups = {};
  allServices.forEach(service => {
    if (!serviceGroups[service.name]) {
      serviceGroups[service.name] = [];
    }
    serviceGroups[service.name].push(service);
  });

  console.log(`📋 Found ${Object.keys(serviceGroups).length} unique service types`);

  // Keep only the most recent entry for each service name
  const servicesToKeep = [];
  const servicesToDelete = [];

  Object.keys(serviceGroups).forEach(serviceName => {
    const services = serviceGroups[serviceName];
    if (services.length > 1) {
      console.log(`🔄 ${serviceName}: ${services.length} duplicates found`);
      
      // Sort by created_at DESC and keep the first (most recent)
      const sortedServices = services.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      servicesToKeep.push(sortedServices[0]);
      servicesToDelete.push(...sortedServices.slice(1));
    } else {
      servicesToKeep.push(services[0]);
    }
  });

  console.log(`✅ Will keep ${servicesToKeep.length} services`);
  console.log(`🗑️  Will delete ${servicesToDelete.length} duplicates`);

  // Delete duplicates
  if (servicesToDelete.length > 0) {
    const deleteStmt = db.prepare('DELETE FROM ai_services WHERE id = ?');
    const deleteMany = db.transaction((ids) => {
      for (const id of ids) {
        deleteStmt.run(id);
      }
    });

    const idsToDelete = servicesToDelete.map(s => s.id);
    deleteMany(idsToDelete);
    console.log(`✅ Deleted ${idsToDelete.length} duplicate services`);
  }

  // Verify cleanup
  const remainingServices = db.prepare('SELECT * FROM ai_services ORDER BY name').all();
  console.log(`📊 Remaining services: ${remainingServices.length}`);
  
  remainingServices.forEach(service => {
    console.log(`  - ${service.name} (${service.category})`);
  });

  console.log('🎉 AI services cleanup completed successfully!');

} catch (error) {
  console.error('❌ Error during cleanup:', error);
} finally {
  db.close();
}
