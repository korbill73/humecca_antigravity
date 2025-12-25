const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Configuration
const BACKUP_DIR = path.join(__dirname, '.backups');
const ROOT_DIR = __dirname;
const IGNORE_LIST = ['.git', '.backups', 'node_modules', '.vscode', '.idea'];

// Middleware
app.use(cors());
app.use(express.json());
// [Debug] Request Logger
app.use((req, res, next) => {
    // Filter out distracting logs if needed, but logging all is good for now
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// ==========================================
// [Analytics] Traffic Logging System
// ==========================================
const LOG_FILE = path.join(BACKUP_DIR, 'traffic_logs.json');

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
    try { fs.writeJsonSync(LOG_FILE, []); } catch (e) { console.error('Init Log Error:', e); }
}

// Helper: Get Client IP
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
}

// [Middleware] Traffic Logger
app.use(async (req, res, next) => {
    // Ignore static assets to reduce noise (images, css, js)
    const ext = path.extname(req.url);
    const ignoredExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.svg', '.map'];
    const ignoredPaths = ['/api/', '/admin.html']; // Don't log API calls or Admin visits

    if (ignoredExts.includes(ext) || ignoredPaths.some(p => req.url.startsWith(p))) {
        return next();
    }

    // Log the visit
    const visit = {
        timestamp: new Date().toISOString(),
        path: req.url,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent']
    };

    try {
        // Read-Modify-Write (Simple implementation, not optimized for high load)
        let logs = [];
        try {
            logs = await fs.readJson(LOG_FILE);
            if (!Array.isArray(logs)) logs = [];
        } catch (e) { logs = []; }

        logs.push(visit);

        // Keep only last 10,000 logs to prevent infinite growth
        if (logs.length > 10000) {
            logs.splice(0, logs.length - 10000);
        }

        await fs.writeJson(LOG_FILE, logs);
    } catch (e) {
        console.error('[Analytics] Log Error:', e.message);
    }

    next();
});
// Serve static files with NO CACHE and AUTO EXTENSION (.html)
// This matches "http-server" behavior so your links work perfectly.
app.use(express.static(ROOT_DIR, {
    extensions: ['html'], // Auto-add .html if missing
    setHeaders: (res, path) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Expires', '0');
    }
}));

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_DIR);

/**
 * Format date for folder name: YYYY-MM-DD_HH-mm-ss
 */
function getTimestamp() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

// [API] Get List of Backups
app.get('/api/backups', async (req, res) => {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backups = [];

        for (const file of files) {
            const filePath = path.join(BACKUP_DIR, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                // Check if meta.json exists (optional, for comments)
                let memo = '';
                try {
                    const meta = await fs.readJson(path.join(filePath, 'meta.json'));
                    memo = meta.memo || '';
                } catch (e) { }

                backups.push({
                    id: file,
                    timestamp: stat.birthtime, // or parse filename
                    name: file,
                    memo: memo
                });
            }
        }
        // Sort by newest first
        backups.sort((a, b) => b.name.localeCompare(a.name));
        res.json(backups);
    } catch (error) {
        console.error('List Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// [API] Create Backup
app.post('/api/backups', async (req, res) => {
    const { memo } = req.body;
    const timestamp = getTimestamp();
    const targetDir = path.join(BACKUP_DIR, timestamp);

    try {
        console.log(`[Backup] Creating snapshot: ${timestamp}`);
        await fs.ensureDir(targetDir);

        // Copy all files excluding ignore list
        const files = await fs.readdir(ROOT_DIR);
        for (const file of files) {
            if (IGNORE_LIST.includes(file)) continue;

            // Only copy file/folder
            await fs.copy(path.join(ROOT_DIR, file), path.join(targetDir, file));
        }

        // Save metadata
        await fs.writeJson(path.join(targetDir, 'meta.json'), {
            id: timestamp,
            created_at: new Date().toISOString(),
            memo: memo || 'Manual Backup'
        });

        res.json({ success: true, id: timestamp });
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// [API] Restore Backup
app.post('/api/restore', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'No backup ID provided' });

    const sourceDir = path.join(BACKUP_DIR, id);
    if (!fs.existsSync(sourceDir)) {
        return res.status(404).json({ error: 'Backup not found' });
    }

    try {
        console.log(`[Restore] Restoring from: ${id}`);

        // 1. Safety Backup (Auto) before restore - ENABLED FOR SAFETY
        const safetyName = `AUTO_SAFETY_${getTimestamp()}`;
        await fs.copy(ROOT_DIR, path.join(BACKUP_DIR, safetyName), {
            filter: (src) => !src.includes('.backups') && !src.includes('node_modules') && !src.includes('.git')
        });
        console.log(`[Restore] Safety backup created: ${safetyName}`);

        // 2. Clear Root Dir (Partial)
        // We do NOT want to delete node_modules or .backups
        const currentFiles = await fs.readdir(ROOT_DIR);
        for (const file of currentFiles) {
            if (IGNORE_LIST.includes(file)) continue;
            if (file === 'server.js') continue; // Don't delete self!
            if (file === 'package.json') continue; // Keep dependencies safe
            if (file === 'package-lock.json') continue;

            await fs.remove(path.join(ROOT_DIR, file));
        }

        // 3. Copy from Backup to Root
        const backupFiles = await fs.readdir(sourceDir);
        for (const file of backupFiles) {
            if (file === 'meta.json') continue; // Don't verify meta

            await fs.copy(path.join(sourceDir, file), path.join(ROOT_DIR, file));
        }

        res.json({ success: true, safetyBackup: safetyName });
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// [API] Delete Backup
app.delete('/api/backups/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'No backup ID provided' });

    const targetDir = path.join(BACKUP_DIR, id);
    if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: 'Backup not found' });
    }

    try {
        console.log(`[Backup] Deleting: ${id}`);
        await fs.remove(targetDir);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// [Analytics] (Middleware moved to top)

// [API] Get Analytics Summary
app.get('/api/analytics', async (req, res) => {
    try {
        const logs = await fs.readJson(LOG_FILE);
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 6);
        oneWeekAgo.setHours(0, 0, 0, 0);

        // 1. Daily Visits (Last 7 Days)
        const dailyVisits = {};
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyVisits[key] = 0;
        }

        // Count visits
        logs.forEach(log => {
            const date = log.timestamp.split('T')[0];
            if (dailyVisits.hasOwnProperty(date)) {
                dailyVisits[date]++;
            }
        });

        // 2. Top Pages (All time in logs)
        const pageCounts = {};
        logs.forEach(log => {
            // Clean URL (remove query params)
            const cleanPath = log.path.split('?')[0] || '/';
            // Default alias
            const pageName = cleanPath === '/' ? '메인 (Home)' : cleanPath;
            pageCounts[pageName] = (pageCounts[pageName] || 0) + 1;
        });

        const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1]) // Sort desc
            .slice(0, 5) // Top 5
            .map(([path, count]) => ({ path, count }));

        // 3. Recent Logs (Last 20)
        const recentLogs = logs.slice().reverse().slice(0, 20);

        res.json({
            dailyVisits,
            topPages,
            recentLogs
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 Smart Development Server Running! (With Analytics)`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Working Dir: ${ROOT_DIR}`);
    console.log(`=============================================`);
});
