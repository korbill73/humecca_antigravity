/**
 * application_modal.js
 * 간편 신청 모달 제어 및 스팸 방지 로직
 */

// 모달 DOM 요소
const appModal = {
    overlay: null,
    form: null,
    productTypeInput: null,
    productNameInput: null,
    productDetailsInput: null,
    productNameDisplay: null,
    productDetailsDisplay: null,
    honeypot: null,
    mathQ: null,
    mathA: null,
    mathReal: null,
    submitBtn: null
};

// 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // 이미 로드되었으면 즉시 실행 (동적 로딩 시 필수)
    init();
}

function init() {
    // 먼저 Event Delegation 등록 (footer 로드와 무관)
    setupEventDelegation();
    // 그 다음 Modal Elements 초기화 시도
    initAppModalElements();
}

// [Event Delegation] 전역 클릭 리스너 (항상 등록)
function setupEventDelegation() {
    // document.body가 없으면 잠시 후 재시도
    if (!document.body) {
        console.warn('document.body not ready, retrying...');
        setTimeout(setupEventDelegation, 100);
        return;
    }

    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-open-modal');
        if (btn) {
            e.preventDefault();
            const name = btn.dataset.name || '';
            const type = btn.dataset.type || '';
            const details = btn.dataset.details || '';
            console.log('Modal trigger clicked:', { name, type, details });
            openAppModal(name, type, details);
        }
    });
    console.log('✓ Event Delegation for Modal Triggers: Ready');
}

function initAppModalElements() {
    if (appModal.overlay) return; // 이미 초기화됨

    appModal.overlay = document.getElementById('app-modal');
    if (!appModal.overlay) {
        console.warn('Modal elements not found yet. Will retry on openAppModal call.');
        return;
    }

    appModal.form = document.getElementById('application-form');
    appModal.productTypeInput = document.getElementById('app-product-type');
    appModal.productNameInput = document.getElementById('app-product-name');
    appModal.productDetailsInput = document.getElementById('app-product-details');
    appModal.productNameDisplay = document.getElementById('app-product-name-display');
    appModal.productDetailsDisplay = document.getElementById('app-product-details-display');
    appModal.honeypot = document.getElementById('app-website-url');
    appModal.mathQ = document.getElementById('math-challenge-q');
    appModal.mathA = document.getElementById('math-challenge-a');
    appModal.mathReal = document.getElementById('math-challenge-real');
    appModal.submitBtn = document.getElementById('btn-app-submit');

    // 모달 배경 클릭 시 닫기
    appModal.overlay.addEventListener('click', (e) => {
        if (e.target === appModal.overlay) closeAppModal();
    });

    console.log('Application Modal Elements: Initialized');
}

/**
 * 모달 열기
 * @param {string} productName - 상품명 (예: "Standard VPN")
 * @param {string} productType - 상품 타입 (예: "vpn", "hosting", "security")
 * @param {string} [productDetails=''] - 상품 상세 스펙 (선택)
 */
function openAppModal(productName, productType, productDetails) {
    // 하위 호환: productDetails가 없으면 빈 문자열
    if (productDetails === undefined) productDetails = '';

    if (!appModal.overlay) initAppModalElements();

    // 혹시라도 요소가 아직 로드되지 않았으면 알림
    if (!appModal.overlay) {
        console.warn('App Modal elements not found (Footer not loaded yet).');
        alert('페이지 구성요소를 불러오는 중입니다.\n잠시만 기다려주세요.');
        return;
    }

    // 데이터 세팅 (null 체크 포함)
    if (appModal.productNameDisplay) appModal.productNameDisplay.textContent = productName;
    if (appModal.productNameInput) appModal.productNameInput.value = productName;
    if (appModal.productTypeInput) appModal.productTypeInput.value = productType || 'general';
    if (appModal.productDetailsInput) appModal.productDetailsInput.value = productDetails || '';

    // 상세 스펙 표시 (있으면 보이고, 없으면 숨김)
    if (appModal.productDetailsDisplay) {
        if (productDetails) {
            appModal.productDetailsDisplay.textContent = productDetails;
            if (appModal.productDetailsDisplay.parentElement && appModal.productDetailsDisplay.parentElement.parentElement) {
                appModal.productDetailsDisplay.parentElement.parentElement.style.display = 'flex';
            }
        } else {
            appModal.productDetailsDisplay.textContent = '기본 상담';
        }
    }

    // 폼 초기화 (null 체크)
    if (appModal.form) appModal.form.reset();
    if (appModal.honeypot) appModal.honeypot.value = ''; // Ensure honeypot is empty

    // 수학 문제 생성
    generateMathChallenge();

    // 모달 표시
    appModal.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 잠금

    // 애니메이션
    setTimeout(() => {
        appModal.overlay.style.opacity = '1';
        appModal.overlay.querySelector('.app-modal-content').style.transform = 'translateY(0)';
    }, 10);
}

/**
 * 모달 닫기
 */
function closeAppModal() {
    if (!appModal.overlay) return;

    appModal.overlay.style.opacity = '0';
    appModal.overlay.querySelector('.app-modal-content').style.transform = 'translateY(20px)';

    setTimeout(() => {
        appModal.overlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

/**
 * 수학 문제 생성 (스팸 방지)
 */
function generateMathChallenge() {
    const n1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const n2 = Math.floor(Math.random() * 9) + 1; // 1-9
    appModal.mathQ.textContent = `${n1} + ${n2} = ?`;
    appModal.mathReal.value = n1 + n2;
    appModal.mathA.value = '';
}

/**
 * 신청 제출 핸들러
 */
async function submitApplication(e) {
    e.preventDefault();

    // 1. Honeypot 체크 (봇이 이 필드를 채웠으면 차단)
    if (appModal.honeypot.value !== '') {
        console.warn('Spam detected (honeypot).');
        alert('잘못된 접근입니다.');
        return;
    }

    // 2. Math Challenge 체크
    const userAnswer = parseInt(appModal.mathA.value);
    const realAnswer = parseInt(appModal.mathReal.value);

    if (isNaN(userAnswer) || userAnswer !== realAnswer) {
        alert('자동입력 방지 정답이 틀렸습니다. 다시 계산해주세요.');
        generateMathChallenge(); // 문제 재생성
        appModal.mathA.focus();
        return;
    }

    // 3. 연락처 유효성 검사 (010 시작 등)
    const phone = document.getElementById('app-phone').value.trim();
    if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone)) {
        alert('올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)');
        return;
    }

    // 4. Supabase 전송
    if (typeof supabase === 'undefined') {
        alert('시스템 오류: 데이터베이스에 연결할 수 없습니다.');
        return;
    }

    const btn = appModal.submitBtn;
    const originalBtnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '처리 중...';

    // 상세 스펙을 관리자에게 보여주기 위해 product_name이나 memo에 추가
    let finalProductName = appModal.productNameInput.value;
    const details = appModal.productDetailsInput.value;

    // 중요한 상세 정보는 상품명 뒤에 붙여서 관리자가 목록에서 바로 볼 수 있게 함
    if (details) {
        finalProductName += ` (${details})`;
    }

    const formData = {
        product_type: appModal.productTypeInput.value,
        product_name: finalProductName,
        company_name: document.getElementById('app-company').value,
        contact_person: document.getElementById('app-name').value,
        phone: phone,
        email: document.getElementById('app-email').value,
        memo: document.getElementById('app-memo').value,
        status: 'pending' // 접수 대기
    };

    try {
        const { data, error } = await supabase
            .from('applications')
            .insert([formData]);

        if (error) throw error;

        // 성공
        alert('상담 신청이 정상적으로 접수되었습니다.\n담당자가 확인 후 빠르게 연락드리겠습니다.');
        closeAppModal();

    } catch (err) {
        console.error('Application submit error:', err);
        // 사용자에게 구체적인 에러 메시지 표시 (디버깅용)
        const errMsg = err.message || JSON.stringify(err);
        alert(`신청 접수 중 오류가 발생했습니다.\n(Error: ${errMsg})\n\n잠시 후 다시 시도해주시거나 고객센터(02-418-7766)로 문의 바랍니다.`);
    } finally {
        btn.disabled = false;
        btn.textContent = originalBtnText;
    }
}

// Global expose
// Global expose
window.openAppModal = openAppModal;
window.closeAppModal = closeAppModal;
window.submitApplication = submitApplication;

console.log('Application Modal Script Loaded & Ready');
