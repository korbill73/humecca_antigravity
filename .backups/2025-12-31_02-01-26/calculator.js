// Calculator Logic (Dynamic Categories v2.1)

// State
let currentStep = 1;
let selectedMain = null;
let selectedSecurity = new Set();
let selectedAddons = new Set();
let selectedSolutions = new Set();
let selectedTerm = 'term_0';

// Cache for active filters
let activeFilters = {
    security: 'all',
    addon: 'all',
    solution: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
});

async function initCalculator() {
    // Show Loading
    const loaderHtml = '<div style="color:white; text-align:center; padding:50px;">데이터를 불러오는 중...</div>';
    ['product-list-main', 'product-list-security', 'product-list-addon', 'product-list-solution'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = loaderHtml;
    });

    // Fetch Data
    if (typeof fetchCalculatorData === 'function') {
        await fetchCalculatorData();
    }

    // Render Steps
    renderMainProducts('server'); // Default Tab for Step 1

    // Render Dynamic Tabs & Lists for Steps 2,3,4
    setupDynamicStep(SECURITY_PRODUCTS, 'security');
    setupDynamicStep(ADDON_PRODUCTS, 'addon');
    setupDynamicStep(SOLUTION_PRODUCTS, 'solution');

    renderTerms();
    updateSummary();
}

/**
 * Setup Tabs and Initial List for a Step
 */
function setupDynamicStep(products, stepType) {
    renderCategoryTabs(products, stepType);
    // Initial Render (All)
    filterBySubcategory(stepType, 'all');
}

/**
 * Render Tabs based on unique subcategories in the product list
 */
function renderCategoryTabs(products, stepType) {
    const container = document.getElementById(`tabs-${stepType}`);
    if (!container) return;
    container.innerHTML = '';

    // 1. Get Unique Subcategories
    const subcats = new Map(); // key: subcat_code, value: Display Name
    products.forEach(p => {
        if (!subcats.has(p.subcategory)) {
            // Use product_name as the display label for this category
            // e.g. subcategory='ddos' -> product_name='DDoS 방어'
            subcats.set(p.subcategory, p.product_name || p.subcategory.toUpperCase());
        }
    });

    // 2. Create "All" Tab
    const allBtn = document.createElement('div');
    allBtn.className = 'tab active';
    allBtn.innerText = '전체';
    allBtn.onclick = (e) => {
        updateTabs(e.target);
        filterBySubcategory(stepType, 'all');
    };
    container.appendChild(allBtn);

    // 3. Create Subcategory Tabs
    subcats.forEach((label, code) => {
        const btn = document.createElement('div');
        btn.className = 'tab';
        btn.innerText = label;
        btn.onclick = (e) => {
            updateTabs(e.target);
            filterBySubcategory(stepType, code);
        };
        container.appendChild(btn);
    });
}

function updateTabs(btn) {
    if (!btn) return;
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
}

/**
 * Filter and Render List
 */
function filterBySubcategory(stepType, subcatCode) {
    activeFilters[stepType] = subcatCode;

    // Select source list
    let sourceList = [];
    let targetContainer = '';
    let selectionSet = null;

    if (stepType === 'security') {
        sourceList = SECURITY_PRODUCTS;
        targetContainer = 'product-list-security';
        selectionSet = selectedSecurity;
    } else if (stepType === 'addon') {
        sourceList = ADDON_PRODUCTS;
        targetContainer = 'product-list-addon';
        selectionSet = selectedAddons;
    } else if (stepType === 'solution') {
        sourceList = SOLUTION_PRODUCTS;
        targetContainer = 'product-list-solution';
        selectionSet = selectedSolutions;
    }

    // Filter
    let filtered = sourceList;
    if (subcatCode !== 'all') {
        filtered = sourceList.filter(p => p.subcategory === subcatCode);
    }

    renderList(filtered, targetContainer, selectionSet, stepType);
}


/* --- Render Functions --- */

function renderMainProducts(subcategoryFilter) {
    const list = document.getElementById('product-list-main');
    if (!list) return;
    list.innerHTML = '';

    let filtered = [];
    if (subcategoryFilter === 'server') {
        filtered = MAIN_PRODUCTS.filter(p => p.subcategory === 'hosting');
    } else if (subcategoryFilter === 'colocation') {
        filtered = MAIN_PRODUCTS.filter(p => p.subcategory === 'colocation');
    } else if (subcategoryFilter === 'vpn') {
        filtered = MAIN_PRODUCTS.filter(p => p.category === 'vpn');
    } else {
        filtered = MAIN_PRODUCTS.filter(p => p.subcategory === 'hosting');
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div style="color:#64748b; padding:20px;">해당 카테고리 상품이 없습니다.</div>';
        return;
    }

    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = `calc-item ${selectedMain && selectedMain.id === p.id ? 'selected' : ''}`;
        div.onclick = () => selectMain(p);

        let details = '';
        if (p.cpu) details += `<div><i class="fas fa-microchip"></i> ${p.cpu}</div>`;
        if (p.ram) details += `<div><i class="fas fa-memory"></i> ${p.ram}</div>`;
        if (p.storage) details += `<div><i class="fas fa-hdd"></i> ${p.storage}</div>`;

        div.innerHTML = `
            <div class="item-name">${p.name}</div>
            <div class="item-price">₩${p.price.toLocaleString()}/월</div>
            <div style="font-size:13px; color:#94a3b8; margin-top:8px; line-height:1.5;">${details || p.desc}</div>
        `;
        list.appendChild(div);
    });
}

// Global exposure for Main Tabs (Step 1)
window.filterCategory = function (cat) {
    const tabs = document.querySelectorAll('#step-1 .tabs .tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderMainProducts(cat);
};


function renderList(products, containerId, selectionSet, setType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<div style="color:#64748b; padding:20px;">등록된 상품이 없습니다.</div>';
        return;
    }

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = `calc-item ${selectionSet.has(p.id) ? 'selected' : ''}`;
        div.onclick = () => toggleSelection(p.id, selectionSet, setType);

        div.innerHTML = `
            <div class="item-tag">${(p.subcategory || 'Service').toUpperCase()}</div>
            <div class="item-name">${p.name}</div>
            <div class="item-price">+₩${p.price.toLocaleString()}</div>
            <div style="font-size:13px; color:#94a3b8;">${p.desc || ''}</div>
        `;
        container.appendChild(div);
    });
}

function renderTerms() {
    const grid = document.getElementById('term-list');
    if (!grid) return;
    grid.innerHTML = '';

    DISCOUNTS.forEach(term => {
        const div = document.createElement('div');
        div.className = `calc-item ${selectedTerm === term.id ? 'selected' : ''}`;
        div.style.textAlign = 'center';
        div.onclick = () => {
            selectedTerm = term.id;
            renderTerms();
            updateSummary();
        };

        div.innerHTML = `
            <div class="item-name">${term.name}</div>
            <div class="item-desc" style="color:#60a5fa;">${term.rate > 0 ? (term.rate * 100) + '% 할인' : '정가'}</div>
        `;
        grid.appendChild(div);
    });
}

/* --- Interaction --- */

window.setStep = function (step) {
    if (step > 1 && !selectedMain) {
        alert('먼저 1단계 주상품을 선택해주세요.');
        return;
    }

    document.querySelectorAll('.calc-step-btn').forEach((btn, idx) => {
        if (idx + 1 === step) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('.calc-step-content').forEach((div, idx) => {
        if (idx + 1 === step) div.style.display = 'block';
        else div.style.display = 'none';
    });

    // Refresh Dynamic Tabs UI if needed? (Not really, DOM persists)
    currentStep = step;
};

function selectMain(product) {
    selectedMain = product;
    renderMainProducts(document.querySelector('#step-1 .tab.active')?.getAttribute('onclick').match(/'([^']+)'/)[1] || 'server'); // Re-render to show selection
    updateSummary();
}

function toggleSelection(id, setObj, type) {
    if (setObj.has(id)) {
        setObj.delete(id);
    } else {
        setObj.add(id);
    }

    // Refresh Current List (using current active filter)
    filterBySubcategory(type, activeFilters[type]);
    updateSummary();
}

/* --- Summary & Calculation --- */

function updateSummary() {
    const container = document.getElementById('quote-items');
    container.innerHTML = '';

    let totalMonthly = 0;

    // 1. Main
    if (selectedMain) {
        totalMonthly += selectedMain.price;
        addQuoteItem(container, selectedMain.name, selectedMain.price, () => {
            selectedMain = null;
            selectMain(null); // visual deselect
            updateSummary();
        });
    }

    // 2. Others (Security, Addon, Solution)
    const allSets = [
        { set: selectedSecurity, list: SECURITY_PRODUCTS, type: 'security' },
        { set: selectedAddons, list: ADDON_PRODUCTS, type: 'addon' },
        { set: selectedSolutions, list: SOLUTION_PRODUCTS, type: 'solution' }
    ];

    allSets.forEach(group => {
        group.set.forEach(id => {
            const item = group.list.find(p => p.id === id);
            if (item) {
                totalMonthly += item.price;
                addQuoteItem(container, item.name, item.price, () => {
                    toggleSelection(id, group.set, group.type);
                });
            }
        });
    });

    // 3. Discount
    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(totalMonthly * discountRate);
    const finalMonthly = totalMonthly - discountAmount;

    // View
    document.getElementById('total-monthly').innerText = `₩${totalMonthly.toLocaleString()}`;
    document.getElementById('total-discount').innerText = `-${discountAmount.toLocaleString()}`;
    document.getElementById('total-final').innerText = `₩${finalMonthly.toLocaleString()}`;
}

function addQuoteItem(container, name, price, onRemove) {
    const div = document.createElement('div');
    div.className = 'quote-item';
    div.innerHTML = `
        <div class="quote-item-info">
            <div class="quote-item-name">${name}</div>
            <div class="quote-item-price">₩${price.toLocaleString()}</div>
        </div>
        <button class="quote-remove"><i class="fas fa-times"></i></button>
    `;
    div.querySelector('.quote-remove').onclick = (e) => {
        e.stopPropagation();
        onRemove();
    };
    container.appendChild(div);
}

/* --- Print & PDF Logic (Korean V2) --- */

function populateQuote() {
    // 1. Set Date
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    document.getElementById('quote-date').innerText = dateStr;

    // 2. Clear Table
    const tbody = document.getElementById('quote-table-body');
    tbody.innerHTML = '';

    let subTotal = 0;

    // Helper Row Creator
    const addRow = (cat, name, detail, price, qty = 1) => {
        const tr = document.createElement('tr');
        const lineTotal = price * qty;
        tr.innerHTML = `
            <td style="text-align:center;">${cat}</td>
            <td style="padding-left:10px;">
                <div style="font-weight:bold;">${name}</div>
                <div style="font-size:11px; color:#666; margin-top:2px;">${detail}</div>
            </td>
            <td style="text-align:right;">${price.toLocaleString()}</td>
            <td style="text-align:center;">${qty}</td>
            <td style="text-align:right;">${lineTotal.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
        return lineTotal;
    };

    // 3. Main Product
    if (selectedMain) {
        let desc = selectedMain.desc || '';
        // Add specs to desc if available
        if (selectedMain.cpu) desc = `CPU: ${selectedMain.cpu}, RAM: ${selectedMain.ram}`;
        subTotal += addRow('기본 서비스', selectedMain.name, desc, selectedMain.price, 1);
    }

    // 4. Others
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

    // 5. Term Discount Handling
    // User asked to exclude Term column, but we must account for price.
    // If discount exists, we should probably show it as a line item or subtraction in summary?
    // My template summary has: Subtotal, VAT, Total.
    // Let's deduct discount from Subtotal? Or show subtotal as Gross, then Discount?
    // The Template footer has:
    // Subtotal -> VAT -> Final.
    // I'll calculate FINAL subtotal (after discount) for the "Supply Price Total".

    // Calculate Discount
    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(subTotal * discountRate);

    // If discount exists, show a line for it?
    // User said "Term exclude".
    // I will add a row "약정 할인" if discount > 0
    if (discountAmount > 0) {
        const tr = document.createElement('tr');
        tr.style.color = '#ef4444';
        tr.innerHTML = `
            <td style="text-align:center;">할인 적용</td>
            <td style="padding-left:10px;">${term.name}</td>
            <td style="text-align:right;">-${discountAmount.toLocaleString()}</td>
            <td style="text-align:center;">1</td>
            <td style="text-align:right;">-${discountAmount.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    }

    const finalSupplyPrice = subTotal - discountAmount;
    const vat = Math.floor(finalSupplyPrice * 0.1);
    const finalTotal = finalSupplyPrice + vat;

    document.getElementById('print-subtotal').innerText = finalSupplyPrice.toLocaleString();
    document.getElementById('print-vat').innerText = vat.toLocaleString();
    document.getElementById('print-total-final').innerText = finalTotal.toLocaleString();
}

window.printQuote = function () {
    populateQuote();
    window.print();
};

window.downloadPdf = function () {
    populateQuote();

    const element = document.querySelector('.quote-paper');
    const container = document.getElementById('printable-quote');

    // Make visible for capture (temporary override)
    const originalDisplay = container.style.display;
    container.style.display = 'block';

    // HTML2PDF Options
    const opt = {
        margin: 0,
        filename: 'Humecca_Estimate.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Restore hidden state
        container.style.display = originalDisplay;
    });
};


/* --- V3 Premium Quote Logic (Override) --- */

window.populateQuote = function () {
    // 1. Set Date
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const dateEl = document.getElementById('quote-date');
    if (dateEl) dateEl.innerText = dateStr;

    // 2. Clear Table
    const tbody = document.getElementById('quote-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let subTotal = 0;

    // Helper Row Creator (6 Columns)
    // Cols: Cat, Name+Detail, Price, Qty, Total, Note
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

    // 3. Main Product
    if (selectedMain) {
        let desc = selectedMain.desc || '';
        if (selectedMain.cpu) desc = `CPU: ${selectedMain.cpu}, RAM: ${selectedMain.ram}`;
        subTotal += addRow('기본 서비스', selectedMain.name, desc, selectedMain.price, 1);
    }

    // 4. Others
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

    // 5. Term Discount Handling
    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(subTotal * discountRate);

    // Add discount row
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

    // Footer Update
    const subEl = document.getElementById('print-subtotal');
    if (subEl) subEl.innerText = finalSupplyPrice.toLocaleString();

    const totEl = document.getElementById('print-total-final');
    if (totEl) totEl.innerText = finalTotal.toLocaleString();
};





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

