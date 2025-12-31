
/* --- V3.1 Quote Logic with Modal and Category Mapping --- */

let pendingQuoteAction = null;

function openQuoteModal(action) {
    pendingQuoteAction = action;
    const modal = document.getElementById('quote-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        // Auto-focus company input
        setTimeout(() => document.getElementById('input-company').focus(), 100);
    }
}

function closeQuoteModal() {
    pendingQuoteAction = null;
    const modal = document.getElementById('quote-modal-overlay');
    if (modal) modal.style.display = 'none';
}

function confirmQuoteInfo() {
    // 1. Capture Inputs
    const company = document.getElementById('input-company').value;
    const manager = document.getElementById('input-manager').value;
    const phone = document.getElementById('input-phone').value;
    const email = document.getElementById('input-email').value;

    if (!company) {
        alert('업체명을 입력해주세요.');
        return;
    }

    // 2. Update Quote Template
    const recipientEl = document.getElementById('quote-customer-name');
    const refEl = document.getElementById('quote-ref-name');

    if (recipientEl) recipientEl.innerText = company;

    // Format Reference: "Name TeamLeader (Phone / Email)"
    let refText = manager || '';
    const contactParts = [];
    if (phone) contactParts.push(phone);
    if (email) contactParts.push(email);

    if (contactParts.length > 0) {
        refText += ` (${contactParts.join(' / ')})`;
    }

    if (refEl) refEl.innerText = refText || '담당자 확인 요망';

    // 3. Populate Data & Execute
    populateQuote(); // Ensure data is fresh

    const action = pendingQuoteAction;
    closeQuoteModal();

    if (action === 'print') {
        setTimeout(window.print, 500); // Wait for modal to close fully
    } else if (action === 'pdf') {
        setTimeout(window.downloadPdf, 500);
    }
}

// Category Name Mapping Helper
function getCategoryDisplayName(item, type) {
    if (type === '보안 서비스') return '보안 서비스';
    if (type === '부가 서비스') return '부가 서비스';
    if (type === '기업 솔루션') return '기업 솔루션';

    // Main Product Logic: Use category or subcategory
    const map = {
        'server_hosting': '서버 호스팅',
        'colocation': '코로케이션',
        'security_control': '보안 관제',
        'vpn': 'VPN 전용회선',
        'switch': 'L2 스위치',
        'loadbalancer': '로드밸런서',
        'firewall': '방화벽'
    };

    // Prioritize subcategory if present
    if (item.subcategory && map[item.subcategory]) return map[item.subcategory];
    if (item.category && map[item.category]) return map[item.category];

    if (map[item.id]) return map[item.id];

    // Fallback: Return raw category or '기본 서비스'
    return item.category ? item.category.toUpperCase() : '기본 서비스';
}

// Redefine populateQuote to use mapping
window.populateQuote = function () {
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const dateEl = document.getElementById('quote-date');
    if (dateEl) dateEl.innerText = dateStr;

    const tbody = document.getElementById('quote-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let subTotal = 0;

    const addRow = (cat, name, detail, price, qty = 1) => {
        const tr = document.createElement('tr');
        const lineTotal = price * qty;
        tr.innerHTML = `
            <td style="text-align:center; border:1px solid #000;">${cat}</td>
            <td style="padding:5px; border:1px solid #000; text-align:left;">
                <div style="font-weight:bold;">${name}</div>
                <div style="font-size:11px; color:#666;">${detail}</div>
            </td>
            <td style="text-align:right; border:1px solid #000; padding-right:5px;">${price.toLocaleString()}</td>
            <td style="text-align:center; border:1px solid #000;">${qty}</td>
            <td style="text-align:right; border:1px solid #000; padding-right:5px;">${lineTotal.toLocaleString()}</td>
            <td style="border:1px solid #000;"></td>
        `;
        tbody.appendChild(tr);
        return lineTotal;
    };

    if (selectedMain) {
        let desc = selectedMain.desc || '';
        if (selectedMain.cpu) desc = `CPU: ${selectedMain.cpu}, RAM: ${selectedMain.ram}`;
        // Use mapping
        const catName = getCategoryDisplayName(selectedMain, 'main');
        subTotal += addRow(catName, selectedMain.name, desc, selectedMain.price, 1);
    }

    const allSets = [
        { set: selectedSecurity, list: SECURITY_PRODUCTS, type: '보안 서비스' },
        { set: selectedAddons, list: ADDON_PRODUCTS, type: '부가 서비스' },
        { set: selectedSolutions, list: SOLUTION_PRODUCTS, type: '기업 솔루션' }
    ];

    allSets.forEach(group => {
        group.set.forEach(id => {
            const item = group.list.find(p => p.id === id);
            if (item) {
                subTotal += addRow(group.type, item.name, item.desc || '', item.price, 1);
            }
        });
    });

    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(subTotal * discountRate);

    if (discountAmount > 0) {
        const tr = document.createElement('tr');
        tr.style.color = '#c0392b';
        tr.innerHTML = `
            <td style="text-align:center; border:1px solid #000;">할인</td>
            <td style="padding:5px; border:1px solid #000; text-align:left;">${term.name} 할인 적용</td>
            <td style="text-align:right; border:1px solid #000; padding-right:5px;">-${discountAmount.toLocaleString()}</td>
            <td style="text-align:center; border:1px solid #000;">1</td>
            <td style="text-align:right; border:1px solid #000; padding-right:5px;">-${discountAmount.toLocaleString()}</td>
            <td style="border:1px solid #000;"></td>
        `;
        tbody.appendChild(tr);
    }

    const finalSupplyPrice = subTotal - discountAmount;
    const vat = Math.floor(finalSupplyPrice * 0.1);
    const finalTotal = finalSupplyPrice + vat;

    const subEl = document.getElementById('print-subtotal');
    if (subEl) subEl.innerText = finalSupplyPrice.toLocaleString();

    const totEl = document.getElementById('print-total-final');
    if (totEl) totEl.innerText = finalTotal.toLocaleString();
};

// Override window functions
window.printQuote = function () { openQuoteModal('print'); };
window.downloadPdf = function () { openQuoteModal('pdf'); };
