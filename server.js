const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;
const ROOT_DIR = __dirname;

// 로고 이미지를 Base64로 변환 (이메일 내장을 위해)
let logoDataUri = '';
try {
    const logoPath = path.join(ROOT_DIR, 'images', 'humecca_logo.gif');
    if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataUri = `data:image/gif;base64,${logoBuffer.toString('base64')}`;
    }
} catch (err) {
    console.error('Logo encoding error:', err);
}

// Configuration
const BACKUP_DIR = path.join(__dirname, '.backups');
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
    try {
        fs.ensureDirSync(BACKUP_DIR);
        fs.writeJsonSync(LOG_FILE, []);
    } catch (e) { console.error('Init Log Error:', e); }
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

// ==========================================
// [Email] Notification System (Nodemailer)
// ==========================================
// MS365 SMTP Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: 'tech@humecca.co.kr',
        pass: 'gbapzk!@4442'
    }
});

// [API] Send Email Notification
app.post('/api/send-notification', async (req, res) => {
    const data = req.body;
    console.log('[Debug] Server received email request:', JSON.stringify(data, null, 2));

    const now = new Date();
    const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    // Foot Details Sync with footer.html
    const companyInfo = {
        name: '(주)휴메카',
        ceo: '박제군',
        businessNo: '101-81-89952',
        teleSalesNo: '제 2024-서울강남-00000호',
        hqAddress: '서울특별시 강남구 언주로 517길 KT 강남IDC B2',
        techCenter: '서울특별시 강남구 언주로 517길 KT 강남IDC 10F',
        kinxIdc: '서울특별시 강남구 언주로 30길, 13 대림아크로텔',
        skIdc: '서울특별시 서초구 법원로 1길 6 SK브로드밴드',
        servicePhone: '02-418-7766',
        emergencyPhone: '02-418-4442',
        techEmail: 'tech@humecca.co.kr',
        salesEmail: 'sales@humecca.co.kr'
    };

    // --- Template: PRTG-Inspired Boxed Style (Refined with Humecca Identity) ---
    const getOfficialTemplate = (title, subtitle) => {
        // Use Data URI for logo to ensure visibility across all clients without external domain dependency
        const logoUrl = logoDataUri || 'https://www.humecca.co.kr/images/humecca_logo.gif';
        const fontStack = "'Malgun Gothic', '맑은 고딕', sans-serif";
        const themeColor = "#059669"; // Humecca Green

        return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>${title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <style type="text/css">
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f3f5; font-family: ${fontStack};">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f3f5">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        
                        <!-- Main Container Table -->
                        <table border="0" cellpadding="0" cellspacing="0" width="900" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                            
                            <!-- Rainbow Stripe -->
                            <tr>
                                <td height="5">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td width="25%" bgcolor="#059669" height="5"></td>
                                            <td width="25%" bgcolor="#1e293b" height="5"></td>
                                            <td width="25%" bgcolor="#f59e0b" height="5"></td>
                                            <td width="25%" bgcolor="#3b82f6" height="5"></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px 50px; background-color: #ffffff; border-bottom: 1px solid #f1f3f5;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="left">
                                                <a href="https://www.humecca.co.kr" target="_blank">
                                                    <img src="${logoUrl}" alt="HUMECCA" width="140" style="display: block; border: 0;" />
                                                </a>
                                            </td>
                                            <td align="right" valign="bottom" style="color: #94a3b8; font-size: 11px; font-weight: bold; letter-spacing: 1px; font-family: ${fontStack};">
                                                SERVICE NOTIFICATION
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Content Main -->
                            <tr>
                                <td style="padding: 60px 80px; text-align: center;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td bgcolor="#ecfdf5" style="border-radius: 30px; padding: 6px 20px; color: ${themeColor}; font-size: 12px; font-weight: 800; font-family: ${fontStack};">
                                                            RECEIPT SUCCESS
                                                        </td>
                                                    </tr>
                                                </table>
                                                <h1 style="color: #1a202c; font-size: 42px; font-weight: 800; margin: 25px 0 10px 0; letter-spacing: -1.5px; font-family: ${fontStack};">${title}</h1>
                                                <p style="color: #718096; font-size: 18px; margin: 0 0 40px 0; line-height: 1.6; font-family: ${fontStack};">${subtitle}</p>
                                            </td>
                                        </tr>

                                        <!-- The Information Grid -->
                                        <tr>
                                            <td align="center">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 2px solid #1a202c;">
                                                    <tr>
                                                        <td width="160" style="padding: 18px 20px; background-color: #f8fafc; color: #4a5568; font-size: 14px; font-weight: bold; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">신청 고객</td>
                                                        <td style="padding: 18px 20px; color: #1a202c; font-size: 16px; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">${data.company_name} / ${data.contact_person}님</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="160" style="padding: 18px 20px; background-color: #f8fafc; color: #4a5568; font-size: 14px; font-weight: bold; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">서비스 구분</td>
                                                        <td style="padding: 18px 20px; color: ${themeColor}; font-size: 16px; font-weight: 800; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">${data.product_name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="160" style="padding: 18px 20px; background-color: #f8fafc; color: #4a5568; font-size: 14px; font-weight: bold; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">연락처</td>
                                                        <td style="padding: 18px 20px; color: #1a202c; font-size: 16px; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">${data.phone}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="160" style="padding: 18px 20px; background-color: #f8fafc; color: #4a5568; font-size: 14px; font-weight: bold; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">이메일 주소</td>
                                                        <td style="padding: 18px 20px; color: #1a202c; font-size: 16px; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">${data.email}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="160" style="padding: 18px 20px; background-color: #f8fafc; color: #4a5568; font-size: 14px; font-weight: bold; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">접수 시간</td>
                                                        <td style="padding: 18px 20px; color: #718096; font-size: 16px; border-bottom: 1px solid #edf2f7; font-family: ${fontStack};">${dateStr}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Memo Area -->
                                        <tr>
                                            <td align="left" style="padding-top: 60px;">
                                                <h3 style="color: #1a202c; font-size: 18px; font-weight: 800; margin-bottom: 20px; font-family: ${fontStack};">고객 요청사항</h3>
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="border-radius: 8px; border: 1px solid #edf2f7;">
                                                    <tr>
                                                        <td style="padding: 30px; color: #4a5568; font-size: 15px; line-height: 1.8; font-family: ${fontStack};">
                                                            ${data.memo || '별도의 요청사항 없이 접수되었습니다.'}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Web Footer (Pure Table Structure Reverted to Previous Version) -->
                            <tr>
                                <td bgcolor="#111111" style="padding: 60px 50px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <!-- Col 1 -->
                                            <td width="300" valign="top" style="padding-right: 30px;">
                                                <h3 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3; font-family: ${fontStack};">전문가와의<br>부담 없는 상담</h3>
                                                <p style="color: #6b7280; font-size: 13px; font-family: ${fontStack}; margin-bottom: 24px;">궁금한 점이 있으신가요?<br>1:1 문의를 남겨주시면 전문 엔지니어가 상세히 답변해 드립니다.</p>
                                                <a href="https://www.humecca.co.kr/sub_support.html" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 10px 20px; border-radius: 4px; font-weight: 600; text-decoration: none; font-family: ${fontStack};">1:1 문의하기</a>
                                            </td>
                                            
                                            <!-- Col 2 -->
                                            <td width="250" valign="top" style="padding: 0 30px; border-left: 1px solid #222222;">
                                                <div style="color: #9ca3af; font-size: 13px; font-weight: bold; font-family: ${fontStack}; margin-bottom: 20px;">서비스 문의</div>
                                                <a href="tel:02-418-7766" style="color: #ffffff; font-size: 32px; font-weight: 700; text-decoration: none; font-family: ${fontStack};">02-418-7766</a>
                                                <p style="color: #6b7280; font-size: 12px; font-family: ${fontStack}; margin-top: 15px;">
                                                    평일: 09:00 ~ 18:00<br>점심: 12:00 ~ 13:00<br>*주말 및 공휴일 휴무
                                                </p>
                                            </td>

                                            <!-- Col 3 -->
                                            <td width="250" valign="top" style="padding-left: 30px; border-left: 1px solid #222222;">
                                                <div style="color: #9ca3af; font-size: 13px; font-weight: bold; font-family: ${fontStack}; margin-bottom: 20px;">긴급 장애 대응 센터</div>
                                                <div style="margin-bottom: 15px;">
                                                    <span style="color: #ef4444; font-weight: bold; font-family: ${fontStack}; margin-right: 10px;">KT-IDC</span>
                                                    <a href="tel:02-418-4442" style="color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; font-family: ${fontStack};">02-418-4442</a>
                                                </div>
                                                <p style="color: #9ca3af; font-size: 12px; font-family: ${fontStack}; margin-bottom: 20px;">365일 24시간 연중무휴 보안 관제 및 기술 지원</p>
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td width="112" style="padding-right: 10px;">
                                                            <a href="https://blog.naver.com/humecca_blog" style="display: block; background: #03C75A; color: #ffffff; padding: 10px; border-radius: 4px; text-align: center; text-decoration: none; font-weight: bold; font-size: 12px; font-family: ${fontStack};">N 블로그</a>
                                                        </td>
                                                        <td width="112">
                                                            <a href="https://pf.kakao.com/_ZAWBC/chat" style="display: block; background: #FAE100; color: #371c1d; padding: 10px; border-radius: 4px; text-align: center; text-decoration: none; font-weight: bold; font-size: 12px; font-family: ${fontStack};">카카오톡</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer Bottom -->
                                        <tr>
                                            <td colspan="3" style="padding-top: 40px; border-top: 1px solid #222222; margin-top: 40px;">
                                                <div style="margin-bottom: 25px; font-family: ${fontStack};">
                                                    <a href="#" style="color: #ffffff; text-decoration: none; font-weight: 600; margin-right: 25px;">개인정보처리방침</a>
                                                    <a href="#" style="color: #9ca3af; text-decoration: none; margin-right: 25px;">이용약관</a>
                                                    <a href="#" style="color: #9ca3af; text-decoration: none; margin-right: 25px;">회원약관</a>
                                                    <a href="https://www.humecca.co.kr/sub_company_intro.html#location" style="color: #9ca3af; text-decoration: none;">오시는 길</a>
                                                </div>
                                                
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td width="400" valign="top" style="color: #6b7280; font-size: 12px; font-family: ${fontStack}; line-height: 1.8;">
                                                            <strong style="color: #e5e7eb; display: block; margin-bottom: 8px;">(주) 휴메카</strong>
                                                            대표이사 : ${companyInfo.ceo} | 사업자등록번호 : ${companyInfo.businessNo}<br>
                                                            통신판매업신고 : ${companyInfo.teleSalesNo}<br><br>
                                                            Copyright © 2025 HUMECCA Inc. All Rights Reserved.
                                                        </td>
                                                        <td valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="color: #6b7280; font-size: 11px; line-height: 1.8; font-family: ${fontStack};">
                                                                <tr>
                                                                    <td width="50%" style="padding-bottom: 12px;">
                                                                        <span style="color: #9ca3af; font-weight: 600;">본사/기술센터</span><br>
                                                                        ${companyInfo.techCenter}
                                                                    </td>
                                                                    <td style="padding-bottom: 12px;">
                                                                        <span style="color: #9ca3af; font-weight: 600;">KINX-IDC</span><br>
                                                                        ${companyInfo.kinxIdc}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <span style="color: #9ca3af; font-weight: 600;">SK-IDC</span><br>
                                                                        ${companyInfo.skIdc}
                                                                    </td>
                                                                    <td>&nbsp;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Disclaimer -->
                        <table border="0" cellpadding="0" cellspacing="0" width="900">
                            <tr>
                                <td style="padding-top: 30px; text-align: center; color: #a0aec0; font-size: 11px; font-family: ${fontStack};">
                                    본 메일은 상담 신청 접수 확인을 위해 자동 발송되었습니다. 회신이 불가능한 주소입니다.
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    };

    const managerHtml = getOfficialTemplate(
        `NEW INQUIRY`,
        `새로운 서비스 상담 신청이 접수되었습니다.지금 상세 내역을 확인하고 대응해 주세요.`
    );

    const customerHtml = getOfficialTemplate(
        `THANK YOU`,
        `휴메카에 보내주신 관심에 깊이 감사드립니다.담당자가 신청 내용을 검토 중입니다.`
    );

    const mailOptionsManager = {
        from: '"HUMECCA System" <tech@humecca.co.kr>',
        to: 'tech@humecca.co.kr',
        subject: `[신규상담] ${data.company_name} - ${data.product_name} `,
        html: managerHtml
    };

    const mailOptionsCustomer = {
        from: '"HUMECCA Support" <tech@humecca.co.kr>',
        to: data.email,
        subject: `[HUMECCA] ${data.contact_person} 님, 신청하신 상담이 정상 접수되었습니다.`,
        html: customerHtml
    };

    try {
        await Promise.all([
            transporter.sendMail(mailOptionsManager),
            transporter.sendMail(mailOptionsCustomer)
        ]);
        console.log(`[Email] PRTG - style boxed notification sent.`);
        res.json({ success: true });
    } catch (error) {
        console.error('[Email] Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`============================================= `);
    console.log(`🚀 Smart Development Server Running!(With Analytics)`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Working Dir: ${ROOT_DIR}`);
    console.log(`=============================================`);
});
