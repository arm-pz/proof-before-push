#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkProof() {
  const repoRoot = process.cwd();
  const evidencePath = path.join(repoRoot, '.claude', 'evidence', 'latest.md');

  // Check 1: Evidence file existence
  if (!fs.existsSync(evidencePath)) {
    console.error('Run your tests and save proof to .claude/evidence/latest.md before calling finish.');
    process.exit(1);
  }

  // Check 2: Evidence file content (must be non-empty)
  const evidenceContent = fs.readFileSync(evidencePath, 'utf8').trim();
  if (!evidenceContent) {
    console.error('Run your tests and save proof to .claude/evidence/latest.md before calling finish.');
    process.exit(1);
  }

  const evidenceStat = fs.statSync(evidencePath);
  const evidenceMtime = evidenceStat.mtimeMs;

  // Check 3: Git working tree cleanliness
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (gitStatus.length > 0) {
      const lines = gitStatus.split('\n');
      const relevantChanges = lines.filter(line => !line.includes('.claude/evidence/latest.md'));
      if (relevantChanges.length > 0) {
        console.error('Git shows uncommitted or unstaged changes.');
        console.error('Run your tests and save proof to .claude/evidence/latest.md before calling finish.');
        process.exit(1);
      }
    }
  } catch (err) {}

  // Check 4: Evidence freshness compared to modified files
  try {
    const changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    for (const file of changedFiles) {
      if (file.includes('.claude/evidence/latest.md')) continue;
      const fullPath = path.join(repoRoot, file);
      if (fs.existsSync(fullPath)) {
        const fileMtime = fs.statSync(fullPath).mtimeMs;
        if (fileMtime > evidenceMtime) {
          console.error(`Evidence file is older than modified file: ${file}`);
          console.error('Run your tests and save proof to .claude/evidence/latest.md before calling finish.');
          process.exit(1);
        }
      }
    }
  } catch (err) {}

  console.log('Proof check passed.');
  process.exit(0);
}

checkProof();
