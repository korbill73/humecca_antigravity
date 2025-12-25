/**
 * HUMECCA Admin Analytics Logic
 * js/admin_analytics.js
 */

console.log('✅ Admin Analytics Script Loaded');

// Global Chart Instance
let analyticsChartInstance = null;

/**
 * Initialize Analytics
 */
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the analytics tab or if the user switches to it, we might want to load.
    // For now, let's expose the refresh function globally.
});

/**
 * Fetch and Render Analytics Data
 */
async function refreshAnalytics() {
    const btn = document.querySelector('button[onclick="refreshAnalytics()"]');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로딩 중...';

        try {
            await loadAnalyticsData();
        } catch (error) {
            console.error(error);
            alert('데이터 로드 실패: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } else {
        await loadAnalyticsData();
    }
}

async function loadAnalyticsData() {
    const res = await fetch('http://localhost:3000/api/analytics');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();

    renderChart(data.dailyVisits);
    renderTopPages(data.topPages);
    renderRecentLogs(data.recentLogs);
}

/**
 * 1. Render Chart (Chart.js)
 */
function renderChart(dailyVisits) {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    const labels = Object.keys(dailyVisits).sort();
    const values = labels.map(date => dailyVisits[date]);

    // Destroy old chart if exists
    if (analyticsChartInstance) {
        analyticsChartInstance.destroy();
    }

    analyticsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '일별 방문자 수',
                data: values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { stepSize: 1, color: '#94a3b8' }
                }
            }
        }
    });
}

/**
 * 2. Render Top Pages Table
 */
function renderTopPages(pages) {
    const tbody = document.getElementById('top-pages-table');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (pages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:#64748b;">데이터 없음</td></tr>';
        return;
    }

    pages.forEach(page => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color:#f8fafc; font-weight:500;">${page.path}</td>
            <td style="text-align:center;"><span class="badge-pill badge-green">${page.count}회</span></td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * 3. Render Recent Logs Table
 */
function renderRecentLogs(logs) {
    const tbody = document.getElementById('recent-logs-table');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748b;">로그 없음</td></tr>';
        return;
    }

    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="date-sub">${timeStr}</td>
            <td style="color:#e2e8f0; font-size:0.9rem;">${log.path}</td>
            <td style="color:#94a3b8; font-family:monospace; font-size:0.85rem;">${log.ip}</td>
        `;
        tbody.appendChild(row);
    });
}
