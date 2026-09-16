const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 [SmartDom Git Push Assistant] Starting automated version bump & push...');

// 1. Run version generation
require('./generate-version.js');
const versionData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib', 'version.json'), 'utf8'));

// 2. Stage version files
try {
  execSync('git add lib/version.json package.json', { stdio: 'inherit' });
} catch (e) {}

// 3. Check for uncommitted changes
const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
const commitMsg = process.argv[2] || `release(${versionData.baseVersion}): update build #${versionData.buildNumber} (${versionData.shortDisplay})`;

if (status.length > 0) {
  console.log(`📝 Uncommitted changes detected. Committing with message: "${commitMsg}"...`);
  execSync('git add -A', { stdio: 'inherit' });
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  
  // Re-run version bump to capture the new commit hash and incremented count
  require('./generate-version.js');
  execSync('git add lib/version.json package.json', { stdio: 'inherit' });
  execSync('git commit --amend --no-edit', { stdio: 'inherit' });
}

// Re-read finalized version data
const finalVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib', 'version.json'), 'utf8'));
const currentHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

// 4. Create Git Tag if it doesn't already exist
const tagName = finalVersion.shortDisplay;
try {
  execSync(`git tag -a ${tagName} -m "Automated build release ${finalVersion.fullDisplay}"`, { stdio: 'inherit' });
  console.log(`🏷️ Created Git Tag: ${tagName}`);
} catch (e) {
  console.log(`ℹ️ Tag ${tagName} already exists or was already created.`);
}

// 5. Push to Git Remote (origin main and tags)
console.log(`📤 Pushing to Git remote (origin main --tags)...`);
execSync('git push origin main --tags', { stdio: 'inherit' });

console.log(`\n🎉 Successfully pushed to Git!`);
console.log(`📌 Version: ${finalVersion.fullDisplay}`);
console.log(`🏷️ Tag:     ${tagName}`);
console.log(`🔗 Commit:  ${currentHash}\n`);
