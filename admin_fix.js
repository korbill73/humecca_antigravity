
// ==========================================
// FIXED FORM LOGIC (Appended v7.7)
// ==========================================

// Helper: Reset Form
window.resetForm = (type) => {
    console.log('[Fix] Resetting form for:', type);
    let p = 'h';
    if (type === 'vpn') p = 'v';
    if (type === 'colocation') p = 'c';
    if (type === 'security') p = 'sec';
    if (type === 'service') p = 's';
    if (type === 'solution') p = 'solution';

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };
    const setCheck = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
    };

    // Clear Hidden ID (Critical for switching from Edit to Add)
    setVal(`${p}-id-hidden`, '');

    // Clear Common Fields
    setVal(`${p}-name`, '');
    setVal(`${p}-id`, '');
    setVal(`${p}-price`, '');
    setVal(`${p}-period`, '');
    setVal(`${p}-summary`, '');
    setVal(`${p}-badge`, '');
    setVal(`${p}-order`, '1');
    setVal(`${p}-features`, '');
    setCheck(`${p}-active`, true);

    // Clear Solution Specifics
    if (type === 'solution') {
        setVal('solution-name', '');
        setVal('solution-price', '');
        setVal('solution-summary', '');
        setVal('solution-badge', '');
        setVal('solution-features', '');
        setVal('solution-sort', '1');
        setCheck('solution-active', true);

        // Reset Button Text
        const btn = document.querySelector('#solution-form-container button.btn-primary');
        if (btn) btn.innerText = "저장완료";
    }

    // Clear Others (Hosting/VPN/etc)
    if (type === 'hosting') {
        setVal('h-cpu', ''); setVal('h-ram', ''); setVal('h-storage', ''); setVal('h-traffic', '');
    } else if (type === 'vpn') {
        setVal('v-speed', ''); setVal('v-sites', ''); setVal('v-users', '');
    } else if (type === 'colocation') {
        setVal('c-cpu', ''); setVal('c-ram', '');
    }
};

// Helper: Toggle Product Form (Add New)
window.toggleProductForm = (type) => {
    console.log('[Fix] Toggling form for:', type);
    let formId = '';
    if (type === 'solution') formId = 'solution-form-container';

    const formEl = document.getElementById(formId);
    if (!formEl) {
        console.error('Form container not found:', formId);
        return;
    }

    // Always Open and Reset logic for "Add" button
    formEl.style.display = 'block';
    resetForm(type);
    formEl.scrollIntoView({ behavior: 'smooth' });

    // Ensure button says "Save Complete" (or Save)
    const btn = formEl.querySelector('button.btn-primary');
    if (btn) btn.innerText = "저장완료";
};

// Generic Product Form Handler (Upsert) - Redefined
window.saveProduct = async (e, type) => {
    if (e) e.preventDefault();
    console.log(`[Fix] Saving Product v7.8: ${type}`);

    let p = 'h';
    if (type === 'vpn') p = 'v';
    if (type === 'colocation') p = 'c';
    if (type === 'security') p = 'sec';
    if (type === 'security') p = 'sec';
    if (type === 'service') p = 's';
    if (type === 'solution') p = 'solution';

    const getVal = (id) => document.getElementById(id)?.value || '';
    const getCheck = (id) => document.getElementById(id)?.checked || false;

    // Determine Target Category/Subcategory
    let targetType = type;
    if (type === 'solution') {
        const solSelect = document.getElementById('solution-type-select');
        const solVal = solSelect ? solSelect.value : 'solution';
        if (solVal === 'solution') targetType = 'solution';
        else if (solVal === 'naverworks') targetType = 'solution-naver';
        else if (solVal === 'website') targetType = 'solution-website';
    } else if (type === 'service') {
        targetType = document.getElementById('service-type-select').value;
    } else if (type === 'security') {
        targetType = document.getElementById('security-type-select').value;
    }

    // Get Parent Product ID
    const prod = await getOrCreateProduct(targetType);
    if (!prod) return;

    // Prepare Payload
    const featuresInput = getVal(`${p}-features`);

    const commonData = {
        product_id: prod.id,
        plan_name: getVal(`${p}-name`),
        plan_id: getVal(`${p}-id`),
        price: getVal(`${p}-price`),
        period: getVal(`${p}-period`),
        summary: getVal(`${p}-summary`),
        badge: getVal(`${p}-badge`),
        active: getCheck(`${p}-active`),
        sort_order: parseInt(getVal(`${p}-order`)) || 1,
        features: featuresInput
    };

    // Custom Mapping for Solution
    if (type === 'solution') {
        commonData.plan_name = getVal('solution-name');
        commonData.price = getVal('solution-price').replace(/,/g, '');
        commonData.period = '월';
        if (targetType === 'solution-website') commonData.period = '건';

        commonData.summary = getVal('solution-summary');
        commonData.badge = getVal('solution-badge');

        const feetRaw = getVal('solution-features');
        commonData.features = feetRaw ? feetRaw.split('\n').filter(x => x.trim()).join('\n') : '';

        commonData.sort_order = parseInt(getVal('solution-sort')) || 1;
        commonData.active = getCheck('solution-active');
    }

    // Specific Specs
    if (type === 'hosting') {
        commonData.cpu = getVal('h-cpu'); commonData.ram = getVal('h-ram');
        commonData.storage = getVal('h-storage'); commonData.traffic = getVal('h-traffic');
    } else if (type === 'colocation') {
        commonData.cpu = getVal('c-cpu'); commonData.ram = getVal('c-ram');
    } else if (type === 'vpn') {
        commonData.speed = getVal('v-speed'); commonData.sites = getVal('v-sites'); commonData.users = getVal('v-users');
    }

    // Check for Update vs Insert
    const hiddenId = getVal(`${p}-id-hidden`);

    if (hiddenId) {
        // Update
        const { error } = await supabase.from('product_plans').update(commonData).eq('id', hiddenId);
        if (error) { alert('수정 실패: ' + error.message); return; }
        alert('상품 정보가 수정되었습니다.');
    } else {
        // Insert
        const { error } = await supabase.from('product_plans').insert([commonData]);
        if (error) { alert('등록 실패: ' + error.message); return; }
        alert('새로운 상품이 등록되었습니다.');
    }

    // Reset UI & Hide Form
    resetForm(type);
    if (type === 'solution') {
        const formEl = document.getElementById('solution-form-container');
        if (formEl) formEl.style.display = 'none';
        console.log('[Fix] Form hidden');
    }

    // Refresh List
    setTimeout(() => {
        renderProducts();
    }, 300);
};
