// Calculator Logic

// State
let currentStep = 1;
let selectedServer = null;
let selectedAddons = new Set();
let selectedTerm = 'term_0';
let currentCategory = 'server';

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    updateSummary(); // Init 0 values
});

function initCalculator() {
    // Render Step 1: Products
    renderProducts(currentCategory);

    // Render Step 2: Specs
    renderAddons('spec', 'addon-list-specs');

    // Render Step 3: Services
    renderAddons('service', 'addon-list-services');

    // Render Step 4: Terms
    renderTerms();
}

/* --- Render Functions --- */

function renderProducts(category) {
    const list = document.getElementById('product-list');
    list.innerHTML = '';

    const products = SERVER_PRODUCTS.filter(p => p.category === category);

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = `calc-item ${selectedServer && selectedServer.id === p.id ? 'selected' : ''}`;
        div.onclick = () => selectServer(p.id);

        let details = '';
        if (p.cpu !== '-') details += `<div style="font-size:13px; color:#94a3b8; margin-bottom:4px;"><i class="fas fa-microchip"></i> ${p.cpu} / ${p.ram}</div>`;
        if (p.hdd !== '-') details += `<div style="font-size:13px; color:#94a3b8; margin-bottom:10px;"><i class="fas fa-hdd"></i> ${p.hdd}</div>`;
        if (p.desc) details += `<div style="font-size:13px; color:#94a3b8; margin-top:5px;">${p.desc}</div>`;

        div.innerHTML = `
            <div class="item-name">${p.name}</div>
            <div class="item-price">₩${p.price.toLocaleString()}/월</div>
            ${details}
        `;
        list.appendChild(div);
    });
}

function renderAddons(type, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // Group by Category for better header
    const items = ADDONS.filter(a => a.type === type);
    // (Simplification: Just list them grid style)

    // Check if grid exists, if not create wrapper
    let grid = container.querySelector('.calc-grid');
    if (!grid) {
        grid = document.createElement('div');
        grid.className = 'calc-grid';
        container.appendChild(grid);
    } else {
        grid.innerHTML = '';
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `calc-item ${selectedAddons.has(item.id) ? 'selected' : ''}`;
        div.onclick = () => toggleAddon(item.id);

        div.innerHTML = `
            <div class="item-tag">${item.category.toUpperCase()}</div>
            <div class="item-name" style="font-size:16px;">${item.name}</div>
            <div class="item-price" style="font-size:14px; margin-bottom:0;">+₩${item.price.toLocaleString()}</div>
        `;
        grid.appendChild(div);
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
        div.onclick = () => selectTerm(term.id);

        div.innerHTML = `
            <div class="item-name">${term.name}</div>
            <div class="item-desc" style="color:#60a5fa;">할인율: ${term.rate * 100}%</div>
        `;
        grid.appendChild(div);
    });
}

/* --- Interaction Functions --- */

function setStep(step) {
    // Validate Step 1
    if (step > 1 && !selectedServer) {
        alert('먼저 서비스 상품을 선택해주세요.');
        return;
    }

    // UI Updates
    document.querySelectorAll('.calc-step-btn').forEach((btn, idx) => {
        if (idx + 1 === step) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('.calc-step-content').forEach((div, idx) => {
        if (idx + 1 === step) div.style.display = 'block';
        else div.style.display = 'none';
    });

    currentStep = step;
}

function filterCategory(cat) {
    currentCategory = cat;
    // Update Filter Tabs
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(t => t.classList.remove('active'));
    // Find clicked tab (simple loop match based on onclick text or index - passed arg is safe)
    // Actually finding by onclick attribute is hard, let's just use event target if possible.
    // For now, re-rendering is key.

    // Just simple visual update:
    event.target.classList.add('active'); // Assumes called from onclick

    renderProducts(cat);
}

function selectServer(id) {
    selectedServer = SERVER_PRODUCTS.find(p => p.id === id);
    renderProducts(currentCategory); // Re-render to show selection
    updateSummary();
    // Auto advance? Maybe not, allow user to decide.
}

function toggleAddon(id) {
    if (selectedAddons.has(id)) {
        selectedAddons.delete(id);
    } else {
        selectedAddons.add(id);
    }

    // Re-render both lists to update selection state
    renderAddons('spec', 'addon-list-specs');
    renderAddons('service', 'addon-list-services');
    updateSummary();
}

function selectTerm(id) {
    selectedTerm = id;
    renderTerms();
    updateSummary();
}

function resetCalculator() {
    selectedServer = null;
    selectedAddons.clear();
    selectedTerm = 'term_0';
    setStep(1);
    currentCategory = 'server';

    // Reset Filter UI
    // (Simplified: just reload page or manual reset)
    location.reload();
}

/* --- Calculation & Summary --- */

function updateSummary() {
    const container = document.getElementById('quote-items');
    container.innerHTML = '';

    let totalMonthly = 0;
    let totalSetup = 0; // Assuming 0 setup for now or add to data

    // 1. Server
    if (selectedServer) {
        totalMonthly += selectedServer.price;
        addQuoteItem(container, selectedServer.name, selectedServer.price, () => {
            selectedServer = null;
            renderProducts(currentCategory);
            updateSummary();
        });
    }

    // 2. Addons
    selectedAddons.forEach(id => {
        // Look in both specs and services. ADDONS list has all.
        const item = ADDONS.find(a => a.id === id);
        if (item) {
            totalMonthly += item.price;
            addQuoteItem(container, item.name, item.price, () => toggleAddon(id));
        }
    });

    // 3. Totals
    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(totalMonthly * discountRate);
    const finalMonthly = totalMonthly - discountAmount;

    // Update Text
    document.getElementById('total-setup').innerText = '0원'; // Fixed for now
    document.getElementById('total-monthly').innerText = `₩${totalMonthly.toLocaleString()}`;
    document.getElementById('total-discount').innerText = `-${discountAmount.toLocaleString()}`;
    document.getElementById('total-final').innerText = `₩${finalMonthly.toLocaleString()}`;

    // Update Term Dropdown/Text if needed? No, logic is in step 4.
}

function addQuoteItem(container, name, price, onRemove) {
    const div = document.createElement('div');
    div.className = 'quote-item';

    div.innerHTML = `
        <div class="quote-item-info">
            <div class="quote-item-name">${name}</div>
            <div class="quote-item-price">₩${price.toLocaleString()}</div>
        </div>
    `;

    const btn = document.createElement('button');
    btn.className = 'quote-remove';
    btn.innerHTML = '<i class="fas fa-times"></i>';
    btn.onclick = (e) => {
        e.stopPropagation();
        onRemove();
    };

    div.appendChild(btn);
    container.appendChild(div);
}
