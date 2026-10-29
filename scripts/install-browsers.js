/**
 * Alternative Playwright browser installer for Windows environments.
 * Note: This script is meant to be used locally, not on CI.
 *
 * Why this script exists:
 * On Windows (especially with Smart App Control / Defender enabled),
 * default `npx playwright install` can hang indefinitely at 100% while extracting
 * zip archives due to Node.js stream locks when writing DLL/binary files.
 *
 * What this script does:
 * 1. Checks playwright.config.ts to detect which browsers are actually enabled in `projects`.
 * 2. Reads the exact required browser revisions and download URLs directly from Playwright's internal registry.
 * 3. Downloads archives via Windows native `curl.exe`.
 * 4. Extracts them into `%LOCALAPPDATA%\ms-playwright` using Windows native `tar.exe`.
 *
 * This ensures clean, reliable, and unattended browser installation without security deadlocks.
 */

const path = require('path');
const corePath = require.resolve('playwright-core');
const { registry } = require(path.join(path.dirname(corePath), 'lib', 'server', 'registry', 'index.js'));
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

function getEnabledBrowserEngines() {
  try {
    // Query Playwright CLI for active projects in playwright.config.ts
    const output = execSync('npx playwright test --list --reporter=json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const jsonStart = output.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(output.slice(jsonStart));
      const projects = (parsed.config && parsed.config.projects) || [];
      const projectNames = projects.map(p => p.name.toLowerCase());

      const needed = new Set();
      for (const name of projectNames) {
        if (name.includes('chromium') || name.includes('chrome')) needed.add('chromium');
        if (name.includes('firefox')) needed.add('firefox');
        if (name.includes('webkit') || name.includes('safari')) needed.add('webkit');
      }

      // Always include supporting tools like ffmpeg if video recording is used
      needed.add('ffmpeg');

      if (needed.size > 1) { // more than just ffmpeg
        return needed;
      }
    }
  } catch (_) {
    // Fallback if config parsing fails
  }

  return null; // install all default executables if not determined
}

async function installBrowsers() {
  const activeEngines = getEnabledBrowserEngines();
  let executables = registry.defaultExecutables().filter(e => e.installType === 'download-by-default');

  if (activeEngines) {
    console.log(`Detected active projects in playwright.config.ts: [${Array.from(activeEngines).join(', ')}]`);
    executables = executables.filter(e => {
      const name = e.name.toLowerCase();
      const group = (e._dependencyGroup || '').toLowerCase();
      return activeEngines.has(name) || activeEngines.has(group) || name.includes('ffmpeg') || name.includes('winldd');
    });
  } else {
    console.log('No specific projects filtered, downloading all default Playwright browsers...');
  }

  const tempDir = os.tmpdir();
  console.log(`Installing ${executables.length} required dependency packages using native extraction...`);

  // Remove stale lock directory if left by interrupted playwright install
  const lockDir = path.join(process.env.LOCALAPPDATA, 'ms-playwright', '__dirlock');
  if (fs.existsSync(lockDir)) {
    try { fs.rmSync(lockDir, { recursive: true, force: true }); } catch (_) {}
  }

  for (const item of executables) {
    const targetDir = item.directory;
    const url = item.downloadURLs && item.downloadURLs[0];
    if (!url) continue;

    console.log(`\n-> Installing ${item.title || item.name} (${item.revision})...`);

    fs.mkdirSync(targetDir, { recursive: true });
    const zipFile = path.join(tempDir, `pw_${item.name}_${item.revision}.zip`);

    try {
      console.log(`   Downloading from ${url}...`);
      execSync(`curl.exe -L --fail "${url}" -o "${zipFile}"`, { stdio: 'inherit' });

      console.log(`   Extracting to ${targetDir}...`);
      execSync(`tar.exe -xf "${zipFile}" -C "${targetDir}"`, { stdio: 'inherit' });

      console.log(`   Done!`);
    } catch (err) {
      console.error(`   Failed to install ${item.name}:`, err.message);
    } finally {
      if (fs.existsSync(zipFile)) {
        try { fs.unlinkSync(zipFile); } catch (_) {}
      }
    }
  }

  console.log('\nAll required browser dependencies installed successfully!');
}

installBrowsers().catch(console.error);
