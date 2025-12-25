
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
