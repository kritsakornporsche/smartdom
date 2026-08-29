const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFilePath = path.join(__dirname, '..', 'lib', 'version.json');

// Base semantic version
const BASE_VERSION = 'v2.4.0';

let previousData = {
  baseVersion: BASE_VERSION,
  buildNumber: 119,
  gitHash: 'ylxlwz',
  timestamp: '',
  updatedAt: '',
  fullDisplay: '',
  shortDisplay: ''
};

if (fs.existsSync(versionFilePath)) {
  try {
    const raw = fs.readFileSync(versionFilePath, 'utf8');
    previousData = JSON.parse(raw);
  } catch (e) {}
}

// 1. Get Git commit short hash (or fallback)
let gitHash = '';
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
} catch (e) {
  // If git is not installed on remote server, generate 6-char hash
  gitHash = Math.random().toString(36).substring(2, 8);
}

// 2. Format Date and Time
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
const timestampId = `${dateStr}.${timeStr}`;

const thaiDateStr = now.toLocaleDateString('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

// 3. Auto-increment build number EVERY build
const newBuildNumber = (previousData.buildNumber || 119) + 1;
const fullDisplay = `${BASE_VERSION}.${newBuildNumber} (${gitHash})`;
const shortDisplay = `${BASE_VERSION}-b${newBuildNumber}`;

const versionData = {
  baseVersion: BASE_VERSION,
  buildNumber: newBuildNumber,
  gitHash: gitHash,
  timestamp: timestampId,
  updatedAt: thaiDateStr,
  fullDisplay: fullDisplay,
  shortDisplay: shortDisplay
};

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
console.log(`🏷️ [Version Updated] -> ${shortDisplay} (${gitHash}) [${thaiDateStr}]`);

module.exports = versionData;
