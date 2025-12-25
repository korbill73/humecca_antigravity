
/* --- Print & PDF Logic (Appended v2.2) --- */

function populateQuote() {
    // 1. Set Date
    const today = new Date();
    document.getElementById('quote-date').innerText = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    // 2. Clear Table
    const tbody = document.getElementById('quote-table-body');
    tbody.innerHTML = '';

    let subTotal = 0;

    // Helper Row Creator
    const addRow = (cat, name, term, price) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat}</td>
            <td>${name}</td>
            <td style="text-align:center;">${term}</td>
            <td style="text-align:right;">₩${price.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
        return price;
    };

    // 3. Main Product
    if (selectedMain) {
        subTotal += addRow('Main', selectedMain.name, '월', selectedMain.price);
    }

    // 4. Others
    const allSets = [
        { set: selectedSecurity, list: SECURITY_PRODUCTS, type: 'Security' },
        { set: selectedAddons, list: ADDON_PRODUCTS, type: 'Addon' },
        { set: selectedSolutions, list: SOLUTION_PRODUCTS, type: 'Solution' }
    ];

    allSets.forEach(group => {
        group.set.forEach(id => {
            const item = group.list.find(p => p.id === id);
            if (item) {
                subTotal += addRow(group.type, item.name, '월', item.price);
            }
        });
    });

    // 5. Totals
    const term = DISCOUNTS.find(d => d.id === selectedTerm);
    const discountRate = term ? term.rate : 0;
    const discountAmount = Math.floor(subTotal * discountRate);
    const total = subTotal - discountAmount;

    document.getElementById('print-subtotal').innerText = '₩' + subTotal.toLocaleString();
    document.getElementById('print-term-name').innerText = term ? term.name : '';
    document.getElementById('print-discount').innerText = '-₩' + discountAmount.toLocaleString();
    document.getElementById('print-total').innerText = '₩' + total.toLocaleString();
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
