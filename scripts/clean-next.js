const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const root = process.cwd();
const nextDir = path.join(root, '.next');
const traceFile = path.join(nextDir, 'trace');

async function rm(p) {
  try {
    if (fs.existsSync(p)) {
      await fs.promises.rm(p, { recursive: true, force: true });
      console.log('Removed:', p);
    } else {
      console.log('Not found:', p);
    }
  } catch (err) {
    console.warn('Could not remove', p, String(err));
  }
}

async function tryWinFix(p) {
  if (process.platform !== 'win32') return;
  try {
    console.log('Attempting Windows ownership/ACL fix for', p);
    // try takeown and icacls; ignore failures
    exec(`takeown /f "${p}" /a`, (e, out, err) => {
      if (e) console.warn('takeown failed:', e.message);
      exec(`icacls "${p}" /grant %USERNAME%:F /T /C`, (e2) => {
        if (e2) console.warn('icacls failed:', e2.message);
      });
    });
  } catch (err) {
    console.warn('Windows fix failed:', String(err));
  }
}

(async () => {
  try {
    await tryWinFix(traceFile);
    await rm(traceFile);
    await rm(nextDir);
    console.log('Cleanup complete. You can now run `npm run dev`');
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exitCode = 1;
  }
})();
