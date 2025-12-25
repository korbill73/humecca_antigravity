/**
 * HUMECCA Admin Backup Logic (Restored)
 * js/admin_backup.js
 */

console.log('✅ Admin Backup Script Loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Only load if on admin page and backup tab exists
    if (document.getElementById('backup-list')) {
        loadBackups();
    }
});

// [Config] API Endpoint
const API_BASE = 'http://localhost:3000/api';

/**
 * 1. Load Backups
 */
async function loadBackups() {
    const listContainer = document.getElementById('backup-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;"><i class="fas fa-spinner fa-spin"></i> 백업 목록을 불러오는 중...</div>';

    try {
        const res = await fetch(`${API_BASE}/backups`);
        if (!res.ok) throw new Error('백업 목록 로드 실패');
        const backups = await res.json();

        renderBackupList(backups);
    } catch (error) {
        console.error('Load Error:', error);
        listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> 백업 목록을 불러오지 못했습니다.<br><small>${error.message}</small></div>`;
    }
}

/**
 * Render Backup List UI
 */
function renderBackupList(backups) {
    const listContainer = document.getElementById('backup-list');
    listContainer.innerHTML = '';

    if (backups.length === 0) {
        listContainer.innerHTML = `
            <div style="padding:40px; text-align:center; color:#64748b;">
                <i class="fas fa-archive" style="font-size:40px; margin-bottom:15px; opacity:0.5;"></i>
                <p>생성된 백업이 없습니다.</p>
            </div>
        `;
        return;
    }

    backups.forEach(backup => {
        const item = document.createElement('div');
        item.className = 'backup-item';
        item.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 15px 20px; 
            border-bottom: 1px solid #f1f5f9; 
            transition: background 0.2s;
        `;
        item.onmouseover = () => item.style.background = '#f8fafc';
        item.onmouseout = () => item.style.background = 'transparent';

        const date = new Date(backup.timestamp);
        const formattedDate = date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        item.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:4px;">
                <div style="font-weight:600; color:#334155; font-size:1.05rem;">
                    <i class="fas fa-clock" style="color:#3b82f6; margin-right:8px;"></i>${formattedDate}
                </div>
                <div style="font-size:0.9rem; color:#64748b; padding-left:24px;">
                    ${backup.memo ? `<span style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:0.8rem; margin-right:5px;">MEMO</span> ${backup.memo}` : '자동/수동 백업'}
                </div>
                <div style="font-size:0.8rem; color:#94a3b8; padding-left:24px; font-family:monospace;">
                    ID: ${backup.id}
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="restoreBackup('${backup.id}')" style="
                    padding: 8px 16px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 6px; 
                    color: #475569; 
                    cursor: pointer; 
                    font-weight: 600;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#3b82f6'; this.style.color='#3b82f6'" 
                  onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#475569'">
                    <i class="fas fa-undo"></i> 복구
                </button>
                <button onclick="deleteBackup('${backup.id}')" style="
                    padding: 8px 12px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 6px; 
                    color: #ef4444; 
                    cursor: pointer; 
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#ef4444'; this.style.background='#fef2f2'" 
                  onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='white'">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

/**
 * 2. Create Backup
 */
window.createBackup = async function () {
    const memo = prompt('백업에 대한 메모를 입력하세요 (선택사항):');
    if (memo === null) return; // Cancelled

    const btn = document.getElementById('btn-create-backup');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 백업 생성 중...';

    try {
        const res = await fetch(`${API_BASE}/backups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memo: memo })
        });

        if (!res.ok) throw new Error('백업 생성 실패');

        // alert('백업이 완료되었습니다.');
        loadBackups(); // Refresh list
    } catch (error) {
        alert(`백업 오류: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

/**
 * 3. Restore Backup
 */
window.restoreBackup = async function (id) {
    if (!confirm('⚠️ 정말로 이 시점으로 복구하시겠습니까?\n\n현재 파일들은 모두 덮어씌워집니다.\n(안전을 위해 복구 직전 상태가 자동으로 백업됩니다.)')) return;

    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:99999; display:flex; justify-content:center; align-items:center; color:white; flex-direction:column;';
    loadingOverlay.innerHTML = '<div style="font-size:40px; margin-bottom:20px;"><i class="fas fa-cog fa-spin"></i></div><div style="font-size:1.2rem;">시스템을 복구하고 있습니다...<br>잠시만 기다려주세요.</div>';
    document.body.appendChild(loadingOverlay);

    try {
        const res = await fetch(`${API_BASE}/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || '복구 실패');

        document.body.removeChild(loadingOverlay);

        let msg = '✅ 복구가 완료되었습니다!';
        if (data.safetyBackup) {
            msg += `\n(안전 백업 생성됨: ${data.safetyBackup})`;
        }
        alert(msg);
        location.reload(); // Refresh page to reflect changes (if any static assets changed)

    } catch (error) {
        document.body.removeChild(loadingOverlay);
        alert(`복구 오류: ${error.message}`);
    }
};

/**
 * 4. Delete Backup
 */
window.deleteBackup = async function (id) {
    if (!confirm('정말로 이 백업을 삭제하시겠습니까? 삭제된 백업은 되돌릴 수 없습니다.')) return;

    try {
        const res = await fetch(`${API_BASE}/backups/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('삭제 실패');

        loadBackups(); // Refresh list
    } catch (error) {
        alert(`삭제 오류: ${error.message}`);
    }
};
