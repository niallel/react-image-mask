#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: node scripts/version-bump.js [patch|minor|major]');
  process.exit(1);
}

try {
  // Read current package.json
  const packagePath = './package.json';
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Bump version using npm
  console.log(`Bumping ${versionType} version from ${currentVersion}...`);
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  
  // Read the new version
  const updatedPackageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const newVersion = updatedPackageJson.version;
  
  console.log(`Version bumped to ${newVersion}`);
  
  // Stage the package.json change
  execSync('git add package.json', { stdio: 'inherit' });
  
  // Commit the version change
  execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
  
  // Create git tag
  execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });
  
  console.log(`✅ Version bumped to ${newVersion}`);
  console.log(`✅ Git commit and tag created`);
  console.log(`\nNext steps:`);
  console.log(`1. Push changes: git push origin main`);
  console.log(`2. Push tags: git push origin --tags`);
  console.log(`3. Create a GitHub release from the tag to trigger auto-publishing`);
  
} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
} 