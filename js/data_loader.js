// Data Loader - Supabase Integration
// This script fetches product data from Supabase and updates the DOM elements.

// Data Loader - Supabase Integration
// This script fetches product data from Supabase and updates the DOM elements.

const PRODUCT_CATEGORIES = {
    // Hosting
    'hosting': { category: 'idc', subcategory: 'hosting', renderType: 'hosting', containerId: 'pricing-container' },

    // VPN
    'vpn': { category: 'vpn', subcategory: 'vpn-service', renderType: 'vpn', containerId: 'vpn-list-container' },

    // Colocation
    'colocation': { category: 'idc', subcategory: 'colocation', renderType: 'colocation', containerId: 'pricing-grid-colocation' },

    // Security
    'security-waf': { category: 'security', subcategory: 'sec-waf', containerId: 'pricing-waf', renderType: 'security' },
    'security-waf-pro': { category: 'security', subcategory: 'sec-waf-pro', containerId: 'pricing-waf-pro', renderType: 'security' },
    'security-cleanzone': { category: 'security', subcategory: 'sec-cleanzone', containerId: 'pricing-cleanzone', renderType: 'security' },
    'security-private-ca': { category: 'security', subcategory: 'sec-private-ca', containerId: 'pricing-private-ca', renderType: 'security' },
    'security-ssl': { category: 'security', subcategory: 'sec-ssl', containerId: 'pricing-ssl', renderType: 'security' },
    'security-v3': { category: 'security', subcategory: 'sec-v3', containerId: 'pricing-v3', renderType: 'security' },
    'security-dbsafer': { category: 'security', subcategory: 'sec-dbsafer', containerId: 'pricing-dbsafer', renderType: 'security' },

    // Add-on Services
    'addon-software': { category: 'addon', subcategory: 'addon-license', containerId: 'pricing-grid-software' },
    'addon-backup': { category: 'addon', subcategory: 'addon-backup', containerId: 'pricing-grid-backup' },
    'addon-ha': { category: 'addon', subcategory: 'addon-ha', containerId: 'pricing-grid-ha' },
    'addon-monitoring': { category: 'addon', subcategory: 'addon-monitoring', containerId: 'pricing-grid-monitoring' },
    'addon-lb': { category: 'addon', subcategory: 'addon-lb', containerId: 'pricing-grid-lb' },
    'addon-cdn': { category: 'addon', subcategory: 'addon-cdn', containerId: 'pricing-grid-cdn' },
    'addon-recovery': { category: 'addon', subcategory: 'addon-recovery', containerId: 'pricing-grid-recovery' },
    'addon-management': { category: 'addon', subcategory: 'addon-management', containerId: 'pricing-grid-management' },
    'addon-etc': { category: 'addon', subcategory: 'addon-etc', containerId: 'pricing-grid-etc' },

    // Solutions
    'solution-ms365': { category: 'solution', subcategory: 'solution', containerId: 'pricing-grid-ms365', renderType: 'addon' },
    'solution-naver': { category: 'solution', subcategory: 'naverworks', containerId: 'pricing-grid-naver', renderType: 'addon' },
    'solution-website': { category: 'solution', subcategory: 'website', containerId: 'pricing-grid-website', renderType: 'addon' }
};

async function loadProductData(pageKey) {
    const config = PRODUCT_CATEGORIES[pageKey];
    if (!config) {
        console.warn(`No configuration found for page key: ${pageKey}`);
        return;
    }

    const container = document.getElementById(config.containerId);

    // 1. Centralized DB Init
    let db = null;
    if (window.waitForSupabase) {
        db = await window.waitForSupabase();
    } else {
        // Fallback for extreme cases where config is missing
        db = window.sb || window.supabase;
    }

    // 2. Final Error Check (Show UI Message)
    if (!db || !db.from) {
        console.error('Supabase client fully unavailable.');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:30px; color:#f59e0b; margin-bottom:15px;"></i>
                    <h3 style="color:#333; margin-bottom:10px;">데이터를 불러올 수 없습니다</h3>
                    <p style="color:#666; font-size:14px;">서버 연결(CDN)에 실패했습니다. 새로고침 해주세요.</p>
                </div>`;
        }
        return;
    }

    // 3. Get Product ID
    const { data: product, error: prodError } = await db.from('products')
        .select('id')
        .eq('category', config.category)
        .eq('subcategory', config.subcategory)
        .maybeSingle();

    if (prodError || !product) {
        console.warn('Product group not found in DB.', prodError);
        if (container) container.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">상품 정보가 없습니다.</div>';
        return;
    }

    // 4. Get Plans
    const { data: plans, error: planError } = await db.from('product_plans')
        .select('*')
        .eq('product_id', product.id)
        .eq('active', true) // Only active plans
        .order('sort_order', { ascending: true });

    if (planError) {
        console.error('Error fetching plans:', planError);
        if (container) container.innerHTML = '<div style="text-align:center; padding:40px; color:#dc2626;">데이터 로드 오류</div>';
        return;
    }

    if (!plans || plans.length === 0) {
        console.log('No active plans found.');
        if (container) container.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">등록된 요금제가 없습니다.</div>';
        return;
    }

    renderPlans(pageKey, plans, config);
}

function renderPlans(pageKey, plans, config) {
    const container = document.getElementById(config.containerId) || document.querySelector('.pricing-grid-custom') || document.querySelector('.pricing-grid');
    if (!container) {
        console.warn('Container not found for rendering plans.');
        return;
    }

    container.innerHTML = ''; // Clear existing content

    const type = config.renderType || 'addon';

    if (type === 'hosting') {
        renderHosting(container, plans);
    } else if (type === 'vpn') {
        renderVpn(container, plans);
    } else if (type === 'colocation') {
        renderColocation(container, plans);
    } else if (type === 'security') {
        renderSecurity(container, plans);
    } else {
        renderAddon(container, plans, pageKey);
    }
}

// Security Specialized Renderer (Matches Hosting Style)
function renderSecurity(container, plans) {
    plans.forEach(p => {
        // Map Security Specs directly to Hosting-style spec list
        // Prioritize relevant fields
        const specs = {};
        if (p.traffic || p.bandwidth) specs['트래픽/대역폭'] = p.traffic || p.bandwidth;
        if (p.speed) specs['속도'] = p.speed;
        if (p.cpu) specs['CPU'] = p.cpu;
        if (p.ram) specs['RAM'] = p.ram;
        if (p.storage) specs['Storage'] = p.storage;

        // Fallback: If specs are empty (e.g. WAF Standard), try to extract from features
        const features = parseFeatures(p.features);

        // Helper to extract numeric values from strings
        const extractSpec = (list, key, regex) => {
            if (!specs[key]) { // Only if not already set
                const found = list.find(f => regex.test(f));
                if (found) {
                    // Extract just the relevant part if possible, or use the whole line
                    // For '350 Mbps 권장 트래픽', we want '350 Mbps'
                    const match = found.match(regex);
                    if (match && match[1]) specs[key] = match[1];
                    else specs[key] = found;
                }
            }
        };

        extractSpec(features, '권장 트래픽', /(\d+\s*Mbps)/i);

        // --- HARD FIX FOR STANDARD PLAN (Empty DB Data Issue) ---
        // ONLY applies to Basic WAF (ID: 13), NOT WAF Pro (ID: 14) which has valid data
        if (p.plan_name === 'Standard' && p.product_id === 13) {
            if (!specs['권장 트래픽']) specs['권장 트래픽'] = '350 Mbps';
            // User requested to remove 'Defense' (OWASP) as it was duplicate/unwanted
        }
        // -----------------------------------------------------

        // Generate Specs HTML (uses same classes as Hosting)
        // Ensure the box is rendered even if empty? No, Hosting renders it only if non-empty.
        // But to fix "Empty Look", we WANT it to render if we found something or force it?
        // With extraction, it should find something.
        const specHtml = Object.entries(specs).map(([k, v]) => `
            <div class="spec-item">
                <span class="spec-label">${k}</span>
                <span class="spec-value">${v}</span>
            </div>
        `).join('');

        const featureHtml = features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');

        const displayPrice = formatPrice(p.price, p.period || '월');
        const escName = escapeHtml(p.plan_name);

        // Build the card exactly like Hosting
        const html = `
            <div class="plan-card popular">
                ${p.badge ? `<span class="plan-badge">${p.badge}</span>` : ''}
                <div class="plan-title">${p.plan_name}</div>
                <div class="plan-summary">${p.summary || ''}</div>
                <div class="plan-price">${displayPrice}</div>
                
                ${specHtml ? `<div class="specs-list">${specHtml}</div>` : ''}

                <ul class="plan-features">${featureHtml}</ul>

                <button class="plan-btn solid js-open-modal" 
                    data-name="${escName}" data-type="security" data-details="${p.summary || ''}" data-price="${p.price}"
                    style="width:100%; border:none; cursor:pointer; margin-top: auto;">신청하기</button>
            </div>
        `;
        container.innerHTML += html;
    });
}

// --- Specific Render Functions ---

function renderAddon(container, plans, pageKey) {
    plans.forEach(plan => {
        const features = parseFeatures(plan.features);
        let featureListHtml = '';
        features.forEach(f => {
            const trimF = f.trim();
            if (trimF) {
                // Heuristic: If content contains an image tag, don't add the checkmark icon
                if (trimF.includes('<img')) {
                    featureListHtml += `<li class="no-icon" style="list-style:none; padding-left:0;">${trimF}</li>`;
                } else {
                    featureListHtml += `<li><i class="fas fa-check"></i> ${trimF}</li>`;
                }
            }
        });

        // Fallback/Supplemental: Add DB columns (traffic, speed, etc.) if features didn't cover them
        // This ensures plans with only 'traffic' column data (like WAF Standard) show up.
        if (plan.traffic) featureListHtml += `<li><i class="fas fa-check"></i> ${plan.traffic}</li>`;
        if (plan.bandwidth) featureListHtml += `<li><i class="fas fa-check"></i> ${plan.bandwidth}</li>`;
        if (plan.speed) featureListHtml += `<li><i class="fas fa-check"></i> ${plan.speed}</li>`;
        if (plan.cpu) featureListHtml += `<li><i class="fas fa-check"></i> CPU ${plan.cpu}</li>`;
        if (plan.ram) featureListHtml += `<li><i class="fas fa-check"></i> RAM ${plan.ram}</li>`;
        if (plan.storage) featureListHtml += `<li><i class="fas fa-check"></i> ${plan.storage}</li>`;

        // Determine Badge
        let badgeHtml = '';
        if (plan.badge) badgeHtml = `<div class="plan-badge">${plan.badge}</div>`;
        else if (plan.popular) badgeHtml = `<div class="plan-badge">인기</div>`;

        const priceDisplay = formatPrice(plan.price, plan.period);

        // --- Custom Logic for Website Production Page ---
        let extraInfoHtml = '';
        // Use pageKey as data-type (e.g. solution-ms365, solution-naver)
        // Fallback to 'addon' if pageKey is undefined (shouldn't happen via renderPlans)
        const typeVal = pageKey || 'addon';
        let btnText = '무료체험 신청';
        if (pageKey && pageKey.startsWith('security-')) {
            btnText = '신청하기';
        }

        let buttonHtml = `<button class="plan-btn solid js-open-modal" 
                    data-name="${escapeHtml(plan.plan_name)}" data-type="${typeVal}" data-details="${plan.summary || ''}" data-price="${plan.price}"
                    style="width:100%; border:none; cursor:pointer; margin-bottom: 20px;">${btnText}</button>`;

        if (container.id === 'pricing-grid-website') {
            // 1. Starter / Free
            if (plan.price === 0 || plan.plan_name.includes('Starter')) {
                // Use summary for color
                buttonHtml = `<a href="#" class="plan-btn btn-outline" style="text-decoration:none;" onclick="alert('무료 제작 신청이 접수되었습니다.\\n담당자가 연락드리겠습니다.')">무료 제작 신청</a>`;
            }
            // 2. Business / Enterprise
            else {
                // Default: Request Production
                buttonHtml = `<a href="#" class="plan-btn btn-primary" style="text-decoration:none;" onclick="alert('제작 의뢰가 접수되었습니다.\\n담당자가 빠르게 연락드리겠습니다.')">제작 의뢰하기</a>`;

                // If Price is '별도 문의' (string) or name has Enterprise -> Expert Consultation
                // The issue was 500k was falling into a logic that made it 'Expert Consultation' or similar?
                // Previously: if (plan.plan_name.includes('Enterprise') || plan.price >= 200000) -> Expert Consultant.
                // User wants Middle (500k) to be "Request Production".
                // So we change the threshold.

                // Logic: 
                // 100k -> Request
                // 500k -> Request
                // Enterprise (Separate Quote) -> Expert Consultation (or Request)

                // Let's check plan price type. String means "Separate Quote".
                if (typeof plan.price === 'string' || plan.plan_name.includes('주문') || plan.plan_name.includes('Enterprise')) {
                    // Keep as Request Production per User's screenshot (Right card is "제작 의뢰하기" too in their screenshot!)
                    // Wait, looking at screenshot Image 3:
                    // Left: 제작 의뢰하기
                    // Middle: 전문가 상담 (User wants this CHANGED to 제작 의뢰하기)
                    // Right: 제작 의뢰하기

                    // So ALL buttons should be "제작 의뢰하기" except maybe the first one?
                    // First one (100k) is also "제작 의뢰하기".
                    // So let's just make ALL > 0 plans "제작 의뢰하기".

                    // Updated to open Application Modal instead of Alert
                    // Updated to open Application Modal with Rich Details
                    // Helper to strip HTML
                    const stripHtml = (html) => {
                        if (!html) return '';
                        let tmp = document.createElement("DIV");
                        tmp.innerHTML = html;
                        return (tmp.textContent || tmp.innerText || "").trim();
                    };

                    let detailList = '';
                    if (plan.features) {
                        if (Array.isArray(plan.features)) {
                            detailList = plan.features.map(f => stripHtml(f)).join('\\n');
                        } else {
                            // Replace <p> with \n for readability before stripping
                            let processed = plan.features.replace(/<\/p>/gi, '\\n').replace(/<br\s*\/?>/gi, '\\n');
                            detailList = stripHtml(processed);
                        }
                    }

                    const fullDetails = `[요약] ${plan.summary || ''}\\n\\n[상세]\\n${detailList}`;
                    const priceFormatted = (typeof plan.price === 'number') ? '₩' + plan.price.toLocaleString() : plan.price;
                    const nameWithPrice = `${plan.plan_name} (${priceFormatted})`;

                    buttonHtml = `<a href="#" class="plan-btn btn-primary" style="text-decoration:none;" onclick="openAppModal('${nameWithPrice}', '홈페이지 제작', \`${fullDetails}\`)">제작 의뢰하기</a>`;
                }
            }

            // Apply styling to summary based on keywords or plan type
            // User requested: Gray summary (like Microsoft image)
            // So we REMOVE the red/color logic for specific keywords.
            // We just render the summary normally in gray.

            // Just ensure it is inside the summary div. 
            // We don't need extraInfoHtml manipulation unless we want to move it to top?
            // User's image shows usage of extraInfoHtml slot (above button, or separate).

            // Let's set color to gray explicitly if we use extraInfoHtml.
            if (plan.summary && plan.summary.includes('*')) {
                // FORCE GRAY (#666) no matter what the keyword is
                let color = '#666666';

                // Keep the layout logic (move to extraInfoHtml position)
                extraInfoHtml = `<div style="color:${color}; font-size:0.9rem; margin-bottom:15px; font-weight:bold;">${escapeHtml(plan.summary)}</div>`;
                plan.summary = ''; // Clear original so it doesn't duplicate
            }
        }

        const cardHtml = `
            <div class="plan-card popular ${(plan.badge || plan.popular) ? 'recommended' : ''}">
                ${badgeHtml}
                <div class="plan-title">${plan.plan_name}</div>
                <div class="plan-price">${priceDisplay}</div>
                ${extraInfoHtml}
                <div class="plan-summary" style="font-size:0.9em; margin-bottom:15px; min-height:24px;">${plan.summary || ''}</div>
                
                <ul class="plan-features">
                    ${featureListHtml}
                </ul>
                
                ${buttonHtml}
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

function renderHosting(container, plans) {
    plans.forEach(p => {
        const specs = {
            CPU: p.cpu || '-',
            RAM: p.ram || '-',
            Storage: p.storage || '-',
            Traffic: p.traffic || p.bandwidth || '-'
        };

        const specHtml = Object.entries(specs).map(([k, v]) => `
            <div class="spec-item">
                <span class="spec-label">${k}</span>
                <span class="spec-value">${v}</span>
            </div>
        `).join('');

        const features = parseFeatures(p.features);
        const featureHtml = features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');

        const displayPrice = formatPrice(p.price, p.period || '월');

        // Spec string construction
        let specStr = '';
        if (p.cpu) specStr += `CPU: ${p.cpu} / `;
        if (p.ram) specStr += `RAM: ${p.ram} / `;
        if (p.storage) specStr += `SSD: ${p.storage} / `;
        if (p.traffic) specStr += `Traffic: ${p.traffic}`;
        specStr = specStr.replace(/ \/ $/, ''); // Trim trailing slash

        const escName = escapeHtml(p.plan_name);
        const escSpec = escapeHtml(specStr);

        const html = `
            <div class="plan-card popular">
                ${p.badge ? `<span class="plan-badge">${p.badge}</span>` : ''}
                <h3 class="plan-title">${p.plan_name}</h3>
                <div class="plan-summary">${p.summary || ''}</div>
                <div class="plan-price">${displayPrice}</div>
                
                <div class="specs-list">${specHtml}</div>

                <ul class="plan-features">${featureHtml}</ul>

                <button class="plan-btn solid js-open-modal" 
                    data-name="${escName}" data-type="hosting" data-details="${escSpec}" data-price="${p.price}"
                    style="width:100%; border:none; cursor:pointer;">신청하기</button>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderVpn(container, plans) {
    plans.forEach(p => {
        const displayPrice = formatPrice(p.price, p.period);
        const features = parseFeatures(p.features);
        const featureHtml = features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');


        const escName = escapeHtml(p.plan_name);
        const escSummary = escapeHtml(p.summary || p.speed || 'VPN Service');

        const html = `
            <div class="plan-card popular">
                ${p.badge ? `<span class="plan-badge">${p.badge}</span>` : ''}
                <h3 class="plan-title">${p.plan_name}</h3>
                <div class="plan-summary" style="font-size:0.9em; color:#666; margin-bottom:15px; min-height:24px;">${p.summary || ''}</div>
                <div class="plan-price">${displayPrice}</div>
                <ul class="plan-features">${featureHtml}</ul>
                <button class="plan-btn solid js-open-modal"
                    data-name="${escName}" data-type="vpn" data-details="${escSummary}" data-price="${p.price}"
                    style="width:100%; border:none; cursor:pointer;">신청하기</button>
            </div>
        `;
        container.innerHTML += html;
    });
}

function renderColocation(container, plans) {
    plans.forEach(p => {
        const displayPrice = formatPrice(p.price, p.period);
        const features = parseFeatures(p.features);
        const featureHtml = features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');


        const escName = escapeHtml(p.plan_name);
        const escSummary = escapeHtml(p.summary || '상면 임대 서비스');

        const html = `
            <div class="plan-card popular">
                ${p.badge ? `<span class="plan-badge">${p.badge}</span>` : ''}
                <h3 class="plan-title">${p.plan_name}</h3>
                <div class="plan-price">${displayPrice}</div>
                <ul class="plan-features">${featureHtml}</ul>
                <button class="plan-btn solid js-open-modal"
                    data-name="${escName}" data-type="colocation" data-details="${escSummary}" data-price="${p.price}"
                    style="width:100%; border:none; cursor:pointer;">신청하기</button>
            </div>
        `;
        container.innerHTML += html;
    });
}

// Helpers
// Simple HTML Attribute Escaping (for data-attributes)
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseFeatures(features) {
    if (!features) return [];

    // If it's an array, return as is
    if (Array.isArray(features)) return features;

    // Use String
    if (typeof features === 'string') {
        const trimmed = features.trim();

        // Detect HTML (starts with <)
        if (trimmed.startsWith('<')) {
            try {
                const div = document.createElement('div');
                div.innerHTML = trimmed;

                let items = [];

                // Iterate child nodes to capture mixed content (p, ul, ol) in order
                div.childNodes.forEach(node => {
                    const tagName = node.tagName ? node.tagName.toLowerCase() : '';

                    if (tagName === 'p' || tagName === 'div') {
                        const content = node.innerHTML.trim();
                        // Skip empty lines or just <br> unless you want spacers
                        if (content && content !== '<br>' && content !== '&nbsp;') {
                            items.push(content);
                        }
                    } else if (tagName === 'ul' || tagName === 'ol') {
                        node.querySelectorAll('li').forEach(li => {
                            const content = li.innerHTML.trim();
                            if (content && content !== '<br>') {
                                items.push(content);
                            }
                        });
                    }
                });

                if (items.length > 0) return items;

                // Fallback if structure is weird (e.g. just text nodes at root)
                const paragraphs = div.querySelectorAll('p');
                if (paragraphs.length > 0) {
                    let pItems = [];
                    paragraphs.forEach(p => pItems.push(p.innerHTML.trim()));
                    return pItems;
                }

                // 3. Fallback: Inner Text split
                return div.innerText.split('\n').map(x => x.trim()).filter(x => x);
            } catch (e) {
                console.warn('Error parsing HTML features:', e);
                return trimmed.split('\n');
            }
        }

        // Legacy: Newline separated
        return features.split('\n');
    }

    return [];
}

const formatPrice = (price, period) => {
    if (typeof price === 'string' && isNaN(price.toString().replace(/,/g, ''))) return price; // Return strings like '별도 문의'
    if (price === 0) return '0원';
    if (!price || price === '문의') return '<span class="amount">문의</span>';
    // If number
    const num = Number(price.toString().replace(/,/g, ''));
    if (isNaN(num)) return `<span class="amount">${price}</span>`;
    return `<span class="amount">₩${num.toLocaleString()}</span> <span class="period">/${period || '월'}</span>`;
}
