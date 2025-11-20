#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read translations file
const translationsPath = path.join(__dirname, 'csc-deployment/ui/src/lib/i18n/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf-8');

// Extract all English keys
const enKeysMatch = translationsContent.match(/en:\s*{([^}]+(?:}[^}]+)*?)}/s);
if (!enKeysMatch) {
  console.error('❌ Could not find English translations');
  process.exit(1);
}

const enSection = enKeysMatch[1];
const enKeys = [];
const keyMatches = enSection.matchAll(/'([^']+)':/g);
for (const match of keyMatches) {
  enKeys.push(match[1]);
}

console.log(`✅ Found ${enKeys.length} English translation keys`);

// Extract keys for other languages
const languages = ['zh', 'ar', 'es', 'fr'];
const missingKeys = {};

for (const lang of languages) {
  const langMatch = translationsContent.match(new RegExp(`${lang}:\\s*{([^}]+(?:}[^}]+)*?)}`, 's'));
  if (!langMatch) {
    console.log(`❌ Could not find ${lang} translations`);
    continue;
  }
  
  const langSection = langMatch[1];
  const langKeys = [];
  const langKeyMatches = langSection.matchAll(/'([^']+)':/g);
  for (const match of langKeyMatches) {
    langKeys.push(match[1]);
  }
  
  console.log(`✅ Found ${langKeys.length} ${lang.toUpperCase()} translation keys`);
  
  // Find missing keys
  const missing = enKeys.filter(key => !langKeys.includes(key));
  if (missing.length > 0) {
    missingKeys[lang] = missing;
  }
}

// Report missing keys
if (Object.keys(missingKeys).length > 0) {
  console.log('\n⚠️  MISSING TRANSLATION KEYS:');
  for (const [lang, keys] of Object.entries(missingKeys)) {
    console.log(`\n${lang.toUpperCase()} is missing ${keys.length} keys:`);
    keys.forEach(key => console.log(`  - ${key}`));
  }
  process.exit(1);
} else {
  console.log('\n✅ All languages have complete translations!');
}

// Check for keys used in files but not defined
const usedKeys = new Set();
const filesToCheck = [
  'csc-deployment/ui/src/app/page.tsx',
  'csc-deployment/ui/src/app/faq/page.tsx',
  'csc-deployment/ui/src/app/(routes)/features/page.tsx',
  'csc-deployment/ui/src/app/(routes)/pricing/page.tsx',
  'csc-deployment/ui/src/app/(routes)/academic/page.tsx',
  'csc-deployment/ui/src/app/(routes)/company-onboarding/page.tsx',
  'csc-deployment/ui/src/app/(routes)/collaborations/discovery/page.tsx',
  'csc-deployment/ui/src/app/(routes)/dashboard/page.tsx',
  'csc-deployment/ui/src/app/(routes)/login/page.tsx',
  'csc-deployment/ui/src/app/(routes)/register/page.tsx',
  'csc-deployment/ui/src/app/(routes)/ai-services/page.tsx',
  'csc-deployment/ui/src/app/(routes)/data-management/page.tsx',
  'csc-deployment/ui/src/app/(routes)/hardware-requests/page.tsx',
  'csc-deployment/ui/src/app/(routes)/projects/page.tsx',
  'csc-deployment/ui/src/lib/ui/Layout.tsx',
];

for (const file of filesToCheck) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(/t\(['\"]([^'\"]+)['\"]\)/g);
  for (const match of matches) {
    usedKeys.add(match[1]);
  }
}

console.log(`\n✅ Found ${usedKeys.size} unique translation keys used in files`);

// Check for undefined keys
const undefinedKeys = Array.from(usedKeys).filter(key => !enKeys.includes(key));
if (undefinedKeys.length > 0) {
  console.log('\n⚠️  UNDEFINED TRANSLATION KEYS (used but not defined):');
  undefinedKeys.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('✅ All used translation keys are defined!');
}

console.log('\n✅ Translation validation complete!');

