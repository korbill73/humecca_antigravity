
const { createClient } = require('@supabase/supabase-js');

const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

// --- LEGACY DATA ---
const h_products = [
    { "id": "eco_01", "name": "이코노미", "price": "89,000", "period": "월", "badge": "", "summary": "입문용 가성비 서버", "specs": { "cpu": "Xeon E-2224 (4 Core)", "ram": "16GB DDR4", "storage": "256GB NVMe SSD", "traffic": "1Gbps Shared" }, "features": ["CentOS / Ubuntu 지원", "기본 보안 방화벽 제공", "24/365 기술 지원"], "popular": true, "isActive": true, "sortOrder": 1 },
    { "id": "biz_01", "name": "비즈니스", "price": "199,000", "period": "월", "badge": "BEST", "summary": "중소규모 비즈니스 최적화", "specs": { "cpu": "Xeon Silver 4210 (10 Core)", "ram": "64GB DDR4", "storage": "1TB NVMe SSD", "traffic": "10Gbps Ready" }, "features": ["RAID 1 데이터 보호", "웹 방화벽(WAF) 무료", "초기 세팅비 무료"], "popular": true, "isActive": true, "sortOrder": 2 },
    { "id": "ent_01", "name": "엔터프라이즈", "price": "399,000", "period": "월", "badge": "POWER", "summary": "고성능 DB/웹 서버용", "specs": { "cpu": "AMD EPYC 7302 (16 Core)", "ram": "128GB DDR4", "storage": "2TB NVMe RAIDO", "traffic": "Dedicated Line" }, "features": ["전담 엔지니어 배정", "VIP 기술 지원", "네트워크 이중화"], "popular": true, "isActive": true, "sortOrder": 3 },
    { "id": "host-01", "name": "호스팅", "price": "99999", "period": "월", "badge": "", "summary": "", "specs": { "cpu": "4", "ram": "8", "storage": "1000", "traffic": "10" }, "features": ["기본 호스팅"], "popular": true, "isActive": true, "sortOrder": 4 }
];
const v_products = [
    { "id": "vpn-basic", "name": "베이직", "price": "200,000", "period": "월", "specs": { "speed": "10Mbps", "sites": "3개 거점", "users": "20 사용자" }, "features": ["10Mbps 보장 대역폭", "최대 3개 거점 연결", "동시 접속 20 사용자", "IPSec 기본 지원"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "vpn-standard", "name": "스탠다드", "price": "500,000", "period": "월", "badge": "BEST CHOICE", "summary": "중견기업을 위한 고성능 VPN", "specs": { "speed": "100Mbps", "sites": "5개 거점", "users": "50 사용자" }, "features": ["100Mbps 보장 대역폭", "최대 5개 거점 연결", "동시 접속 50 사용자", "IPSec/SSL VPN 지원"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "vpn-premium", "name": "프리미엄", "price": "1,000,000", "period": "월", "specs": { "speed": "1Gbps", "sites": "10개 거점", "users": "무제한" }, "features": ["1Gbps 보장 대역폭", "최대 10개 거점 연결", "무제한 사용자", "전담 엔지니어 기술지원"], "popular": false, "sortOrder": 3, "isActive": true }
];
const c_products = [
    { "id": "col-1u", "name": "1U 랙 마운트", "price": "80,000", "period": "월", "summary": "소규모 서버 운영에 적합", "specs": { "cpu": "1U 전용 공간", "ram": "1A 전력", "storage": "100Mbps", "traffic": "Shared" }, "features": ["1U 전용 공간", "1A 이하 전력 제공", "100Mbps Shared", "기본 관제 서비스"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "col-q", "name": "쿼터 랙 (10U)", "price": "450,000", "period": "월", "badge": "BEST CHOICE", "summary": "독립 공간이 필요한 비즈니스", "specs": { "cpu": "10U 독립 공간", "ram": "2.2kW (10A)", "storage": "1Gbps", "traffic": "Dedicated" }, "features": ["10U 독립 공간", "2.2kW (10A) 전력", "1Gbps Dedicated", "독립 잠금 장치"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "col-f", "name": "풀 랙 (42U)", "price": "1,500,000", "period": "월", "summary": "대규모 인프라 구축", "specs": { "cpu": "42U 전체 랙", "ram": "4.4kW (20A)", "storage": "10Gbps", "traffic": "Ready" }, "features": ["42U 전체 랙 제공", "4.4kW (20A) 전력", "10Gbps Ready", "CCTV 개별 설치 가능"], "popular": false, "sortOrder": 3, "isActive": true }
];
const s_products_license = [
    { "id": "win-std", "name": "Windows Server Standard", "price": "41,000", "period": "월", "badge": "추천", "summary": "정품 라이선스", "specs": { "cpu": "기본 8Core", "ram": "정품 라이선스", "storage": "-", "traffic": "추가 2Core당 10,250원" }, "features": ["기본 8Core", "추가 2Core당 10,250원/월", "정품 라이선스"], "popular": true, "sortOrder": 1, "isActive": true },
    { "id": "win-dc", "name": "Windows Server Datacenter", "price": "220,000", "period": "월", "summary": "무제한 VM", "specs": { "cpu": "기본 8Core", "ram": "무제한 VM", "storage": "-", "traffic": "추가 2Core당 55,000원" }, "features": ["기본 8Core", "추가 2Core당 55,000원/월", "무제한 VM"], "popular": false, "sortOrder": 2, "isActive": true },
    { "id": "sql-std", "name": "SQL Server Standard", "price": "440,000", "period": "월", "summary": "기술 지원 포함", "specs": { "cpu": "기본 4Core", "ram": "기술 지원 포함", "storage": "-", "traffic": "추가 2Core당 220,000원" }, "features": ["기본 4Core", "추가 2Core당 220,000원/월", "기술 지원 포함"], "popular": false, "sortOrder": 3, "isActive": true },
    { "id": "sql-ent", "name": "SQL Server Enterprise", "price": "1,680,000", "period": "월", "summary": "엔터프라이즈 기능", "specs": { "cpu": "기본 4Core", "ram": "엔터프라이즈 기능", "storage": "-", "traffic": "추가 2Core당 840,000원" }, "features": ["기본 4Core", "추가 2Core당 840,000원/월", "엔터프라이즈 기능"], "popular": false, "sortOrder": 4, "isActive": true }
];
const s_products_backup = [
    { "id": "bak-basic", "name": "베이직", "price": "30,000", "period": "월", "summary": "로컬 저장, 7일 보관", "features": ["일일 자동 백업", "7일 보관", "로컬 저장"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "bak-std", "name": "스탠다드", "price": "50,000", "period": "월", "badge": "인기", "summary": "원격지 저장, 14일 보관", "features": ["일일 자동 백업", "14일 보관", "원격지 저장"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "bak-pre", "name": "프리미엄", "price": "80,000", "period": "월", "summary": "이중화 저장, 30일 보관", "features": ["일일 자동 백업", "30일 보관", "이중화 저장", "복구 테스트"], "popular": false, "sortOrder": 3, "isActive": true },
    { "id": "bak-ent", "name": "엔터프라이즈", "price": "150,000", "period": "월", "summary": "실시간 백업, 1년 보관", "features": ["실시간 백업", "365일 보관", "지역 분산", "전담 매니저"], "popular": false, "sortOrder": 4, "isActive": true }
];
const s_products_ha = [
    { "id": "ha-as", "name": "Active-Standby", "price": "100,000", "period": "월", "summary": "자동 Failover", "features": ["2대 서버 이중화 구성", "장애 발생 시 자동 Failover", "데이터 실시간 동기화", "월 1회 정기점검"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "ha-aa", "name": "Active-Active", "price": "200,000", "period": "월", "badge": "추천", "summary": "부하 분산 + 고가용성", "features": ["부하 분산 및 이중화 동시 적용", "고트래픽 서비스에 최적화", "무중단 서비스 아키텍처", "24x365 긴급 기술지원"], "popular": true, "sortOrder": 2, "isActive": true }
];
const s_products_monitoring = [
    { "id": "mon-basic", "name": "Basic", "price": "0", "period": "서버", "badge": "기본", "summary": "Ping 체크", "features": ["서버 Ping 체크 (30분 주기)", "기본 리소스 상태표지판", "이메일 알림"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "mon-pro", "name": "Pro", "price": "30,000", "period": "월", "badge": "추천", "summary": "정밀 감시 & 알림", "features": ["5분 주기 정밀 체크", "SMS / 카카오톡 즉시 알림", "CPU/Memory/Disk 임계치 설정", "장애 원인 분석 리포트 제공"], "popular": true, "sortOrder": 2, "isActive": true }
];
const s_products_lb = [
    { "id": "lb-l4", "name": "L4 로드밸런싱", "price": "50,000", "period": "월", "summary": "IP/Port 기반 분산", "features": ["IP/Port 기반 부하 분산", "Connection/Throughput 보장", "헬스체크 및 Failover", "기본 리포트 제공"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "lb-l7", "name": "L7 로드밸런싱", "price": "100,000", "period": "월", "badge": "추천", "summary": "URL/Cookie 정교한 분산", "features": ["URL/Cookie 기반 정교한 분산", "SSL Termination (인증서 관리)", "보안 및 필터링 기능", "상세 트래픽 분석 리포트"], "popular": true, "sortOrder": 2, "isActive": true }
];
const s_products_cdn = [
    { "id": "cdn-start", "name": "Starter Plan", "price": "50,000", "period": "월", "summary": "기본 500GB", "features": ["초기 설치비 무료", "초과시 100원 / GB", "전 세계 엣지 사용 가능", "HTTPS 보안 전송 지원"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "cdn-biz", "name": "Business Plan", "price": "100,000", "period": "월", "badge": "추천", "summary": "대용량 1.5TB", "features": ["대용량 트래픽 할인 적용", "초과시 80원 / GB", "실시간 트래픽 분석 대시보드", "전담 엔지니어 기술지원"], "popular": true, "sortOrder": 2, "isActive": true }
];
const s_products_recovery = [
    { "id": "rec-logic", "name": "논리적 손상", "price": "200,000", "period": "건(최소)", "summary": "삭제, 포맷 등", "features": ["무료 정밀 진단", "복구 불가시 0원", "긴급 복구 지원"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "rec-phys", "name": "물리적 손상", "price": "300,000", "period": "건(최소)", "badge": "Best", "summary": "HDD 인식불가 등", "features": ["클린룸 정밀 작업", "부품 교체 비용 포함", "타사 실패 건 복구 가능"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "rec-srv", "name": "서버/랜섬웨어", "price": "문의", "period": "건", "summary": "RAID, 랜섬웨어", "features": ["RAID 재구성(Rebuild)", "랜섬웨어 복호화 분석", "긴급 출장 서비스 가능"], "popular": false, "sortOrder": 3, "isActive": true }
];
const s_products_waf = [
    { "id": "waf-std", "name": "Standard", "price": "300,000", "period": "월", "summary": "기본 방어 (350Mbps)", "features": ["350 Mbps 권장 트래픽", "OWASP Top 10 방어", "실시간 모니터링"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "waf-adv", "name": "Advanced", "price": "500,000", "period": "월", "badge": "추천", "summary": "중급 방어 (500Mbps)", "features": ["500 Mbps 권장 트래픽", "OWASP Top 10 방어", "실시간 모니터링", "사용자 정의 룰셋"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "waf-pre", "name": "Premium", "price": "750,000", "period": "월", "summary": "대용량 방어 (1Gbps)", "features": ["1,000 Mbps 권장 트래픽", "OWASP Top 10 방어", "실시간 모니터링", "전담 기술지원"], "popular": false, "sortOrder": 3, "isActive": true }
];
const s_products_waf_pro = [
    { "id": "wafpro-std", "name": "Standard", "price": "580,000", "period": "월", "summary": "관제 포함 (300Mbps)", "features": ["300 Mbps 권장 트래픽", "전문가 실시간 관제", "월간 보고서 제공", "침해 사고 대응"], "popular": true, "sortOrder": 1, "isActive": true },
    { "id": "wafpro-ent", "name": "Enterprise", "price": "문의", "period": "월", "summary": "대규모 관제", "features": ["트래픽/규모 별도 협의", "전담 매니저 배정", "맞춤형 정책 설정"], "popular": false, "sortOrder": 2, "isActive": true }
];
const s_products_cleanzone = [
    { "id": "clean-basic", "name": "기본형", "price": "1,000,000", "period": "월", "summary": "IP 1개 보호", "features": ["보호 대상 IP 1개", "대용량 공격 방어", "강력한 필터링"], "popular": true, "sortOrder": 1, "isActive": true },
    { "id": "clean-large", "name": "대용량 방어", "price": "문의", "period": "월", "summary": "40G 이상", "features": ["40Gbps 이상 방어", "별도 협의"], "popular": false, "sortOrder": 2, "isActive": true }
];
const s_products_private_ca = [
    { "id": "ca-ops", "name": "CA 운영비", "price": "400,000", "period": "월", "summary": "Root/Sub CA", "features": ["Root / Sub CA 운영", "안전한 키 관리", "CRL 발행"], "popular": false, "sortOrder": 1, "isActive": true },
    { "id": "ca-issue", "name": "인증서 발급", "price": "문의", "period": "건", "summary": "건당 비용", "features": ["사설 인증서 발급", "다양한 알고리즘 지원"], "popular": true, "sortOrder": 2, "isActive": true }
];
const s_products_ssl = [
    { "id": "ssl-sectigo", "name": "Sectigo Positive SSL", "price": "35,000", "period": "년", "summary": "싱글 도메인", "features": ["Single Domain", "빠른 발급", "저렴한 비용"], "popular": true, "sortOrder": 1, "isActive": true },
    { "id": "ssl-sectigo-wild", "name": "Sectigo Wildcard", "price": "150,000", "period": "년", "badge": "추천", "summary": "*.domain.com", "features": ["Sub Domain 무제한", "서버 대수 무제한"], "popular": true, "sortOrder": 2, "isActive": true },
    { "id": "ssl-digi", "name": "DigiCert Standard", "price": "280,000", "period": "년", "summary": "높은 신뢰도", "features": ["높은 브라우저 호환성", "안전 배상금 지원"], "popular": false, "sortOrder": 3, "isActive": true }
];
const s_products_v3 = [
    { "id": "v3-net", "name": "V3 Net Server", "price": "문의", "period": "월", "summary": "Windows/Linux 백신", "features": ["실시간 악성코드 진단", "최소 리소스 사용", "서버 전용 백신"], "popular": true, "sortOrder": 1, "isActive": true }
];
const s_products_dbsafer = [
    { "id": "dbsafer-db", "name": "DBSAFER DB", "price": "문의", "period": "Core", "summary": "DB 접근 제어", "features": ["DB 접근 통제", "권한 관리", "감사 로그"], "popular": true, "sortOrder": 1, "isActive": true },
    { "id": "dbsafer-am", "name": "DBSAFER AM", "price": "문의", "period": "OS", "summary": "시스템 접근 제어", "features": ["OS 계정 관리", "명령어 통제", "Telnet/SSH 제어"], "popular": false, "sortOrder": 2, "isActive": true }
];

const solution_products_ms365 = [
    { "id": "ms365-basic", "name": "Microsoft 365 Business Basic", "price": "7,500", "period": "월", "badge": "", "summary": "사용자/월 (연간 약정시)", "features": ["웹 및 모바일용 Office 앱", "1TB OneDrive 스토리지", "비즈니스용 이메일", "Teams 채팅 및 화상회의", "표준 보안"], "sortOrder": 1, "isActive": true, "popular": false },
    { "id": "ms365-standard", "name": "Microsoft 365 Business Standard", "price": "15,600", "period": "월", "badge": "인기 상품", "summary": "사용자/월 (연간 약정시)", "features": ["데스크톱용 Office 앱 포함", "Word, Excel, PPT, Outlook", "1TB OneDrive 스토리지", "웨비나 개최 기능", "고객 예약 관리"], "sortOrder": 2, "isActive": true, "popular": true },
    { "id": "ms365-premium", "name": "Microsoft 365 Business Premium", "price": "27,500", "period": "월", "badge": "", "summary": "사용자/월 (연간 약정시)", "features": ["모든 Standard 기능 포함", "고급 보안 및 사이버 위협 보호", "PC 및 모바일 장치 관리", "데이터 손실 방지 (DLP)", "Azure Virtual Desktop 지원"], "sortOrder": 3, "isActive": true, "popular": false }
];

const solution_products_naver = [
    { "id": "naver-lite", "name": "Lite", "price": "3,000", "period": "월", "badge": "", "summary": "사용자/월 (연간 약정시)", "features": ["메시지 (채팅/음성/영상 통화)", "게시판, 캘린더, 주소록", "설문, 할 일", "공용 용량 10GB/1인"], "sortOrder": 1, "isActive": true, "popular": false },
    { "id": "naver-basic", "name": "Basic", "price": "6,000", "period": "월", "badge": "추천", "summary": "사용자/월 (연간 약정시)", "features": ["Lite 기능 전체 포함", "메일 (30GB/1인)", "드라이브 (35GB/1인)", "화상회의 (최대 200명)"], "sortOrder": 2, "isActive": true, "popular": true },
    { "id": "naver-premium", "name": "Premium", "price": "10,000", "period": "월", "badge": "", "summary": "사용자/월 (연간 약정시)", "features": ["Basic 기능 전체 포함", "드라이브 용량 무제한", "아카이빙(보존)", "고급 보안 설정", "감사 로그"], "sortOrder": 3, "isActive": true, "popular": false }
];

const solution_products_web = [
    { "id": "web-basic", "name": "일반형 (반응형)", "price": "1,000,000", "period": "건", "badge": "", "summary": "기본 5페이지 내외", "features": ["반응형 웹 디자인 적용", "게시판/문의폼 기능", "기본 관리자 모드", "유지보수 1개월 무료"], "sortOrder": 1, "isActive": true, "popular": false },
    { "id": "web-business", "name": "비즈니스형", "price": "2,000,000", "period": "건", "badge": "추천", "summary": "페이지 수 제한 없음 (협의)", "features": ["고급 디자인 및 퍼블리싱", "회원관리 / SMS 연동", "접속 통계 프로그램", "유지보수 3개월 무료"], "sortOrder": 2, "isActive": true, "popular": true },
    { "id": "web-premium", "name": "프리미엄 쇼핑몰", "price": "문의", "period": "건", "badge": "", "summary": "독립형 쇼핑몰 구축", "features": ["전자결제(PG) 연동", "상품/주문/배송 관리 시스템", "마케팅 툴 연동", "맞춤 기능 개발 가능"], "sortOrder": 3, "isActive": true, "popular": false }
];


// --- MIGRATION LOGIC ---
const CATEGORIES = {
    'hosting': { category: 'idc', subcategory: 'hosting', name: '서버 호스팅' },
    'vpn': { category: 'vpn', subcategory: 'vpn-service', name: 'VPN 전용선' },
    'colocation': { category: 'idc', subcategory: 'colocation', name: '코로케이션' },

    'security-waf': { category: 'security', subcategory: 'sec-waf', name: '웹방화벽 (WAF)' },
    'security-waf-pro': { category: 'security', subcategory: 'sec-waf-pro', name: 'WAF Pro (Managed)' },
    'security-cleanzone': { category: 'security', subcategory: 'sec-cleanzone', name: '클린존 (Anti-DDoS)' },
    'security-private-ca': { category: 'security', subcategory: 'sec-private-ca', name: 'Private CA' },
    'security-ssl': { category: 'security', subcategory: 'sec-ssl', name: 'SSL 인증서' },
    'security-v3': { category: 'security', subcategory: 'sec-v3', name: 'V3 Net Server' },
    'security-dbsafer': { category: 'security', subcategory: 'sec-dbsafer', name: 'DBSAFER' },

    'solution': { category: 'solution', subcategory: 'solution', name: '기업 솔루션 (MS365)' },
    'solution-naver': { category: 'solution', subcategory: 'naverworks', name: '네이버웍스' },
    'solution-website': { category: 'solution', subcategory: 'website', name: '홈페이지 제작' },

    'addon-license': { category: 'addon', subcategory: 'addon-license', name: '소프트웨어 라이선스' },
    'addon-backup': { category: 'addon', subcategory: 'addon-backup', name: '백업 서비스' },
    'addon-ha': { category: 'addon', subcategory: 'addon-ha', name: 'HA (고가용성)' },
    'addon-monitoring': { category: 'addon', subcategory: 'addon-monitoring', name: '모니터링' },
    'addon-lb': { category: 'addon', subcategory: 'addon-lb', name: '로드밸런싱' },
    'addon-cdn': { category: 'addon', subcategory: 'addon-cdn', name: 'CDN' },
    'addon-recovery': { category: 'addon', subcategory: 'addon-recovery', name: '데이터 복구' },
    'addon-management': { category: 'addon', subcategory: 'addon-management', name: '운영 관리 / 기술지원' },
    'addon-etc': { category: 'addon', subcategory: 'addon-etc', name: '기타 부가서비스' }
};

async function getOrCreateProduct(type) {
    const config = CATEGORIES[type] || { category: 'etc', subcategory: 'etc', name: '기타' };
    console.log(`Checking product: ${config.name} (${config.category}/${config.subcategory})...`);
    let { data: product, error } = await supabase.from('products')
        .select('id')
        .eq('category', config.category)
        .eq('subcategory', config.subcategory)
        .maybeSingle();

    if (error) { console.error('Error checking product:', error.message); return null; }

    if (!product) {
        console.log('Product not found. Creating...');
        const { data: newProd, error: createError } = await supabase.from('products')
            .insert([{
                category: config.category,
                subcategory: config.subcategory,
                name: config.name,
                description: `${config.name} 상품 그룹`
            }])
            .select()
            .single();

        if (createError) { console.error('Error creating product:', createError.message); return null; }
        product = newProd;
        console.log('Product created with ID:', product.id);
    } else {
        console.log('Product found:', product.id);
    }
    return product;
}

async function addPlanToSupabase(type, p) {
    const prod = await getOrCreateProduct(type);
    if (!prod) return;

    // Check if plan exists
    // We'll trust the migration to just append if not exists, or we could delete first.
    // Let's check existence by name and product_id to avoid duplicates if re-run.
    const { data: exist } = await supabase.from('product_plans')
        .select('id')
        .eq('product_id', prod.id)
        .eq('plan_name', p.name)
        .maybeSingle();

    if (exist) {
        console.log(`Skipping existing plan: ${p.name}`);
        return;
    }

    console.log(`Inserting plan: ${p.name}`);
    await supabase.from('product_plans').insert([{
        product_id: prod.id,
        plan_name: p.name,
        price: p.price,
        period: p.period,
        badge: p.badge,
        summary: p.summary,
        // Hosting Specs
        cpu: p.specs?.cpu, ram: p.specs?.ram, storage: p.specs?.storage, traffic: p.specs?.traffic || p.specs?.bandwidth,
        // VPN Specs
        speed: p.specs?.speed, sites: p.specs?.sites, users: p.specs?.users,
        features: Array.isArray(p.features) ? p.features.join('\n') : p.features,
        active: p.isActive !== false,
        popular: p.popular === true,
        sort_order: p.sortOrder || 1
    }]);
}

async function run() {
    console.log('Starting Full Migration...');

    // Hosting
    for (const p of h_products) await addPlanToSupabase('hosting', p);
    // VPN
    for (const p of v_products) await addPlanToSupabase('vpn', p);
    // Colocation
    for (const p of c_products) await addPlanToSupabase('colocation', p);

    // Security
    for (const p of s_products_waf) await addPlanToSupabase('security-waf', p);
    for (const p of s_products_waf_pro) await addPlanToSupabase('security-waf-pro', p);
    for (const p of s_products_cleanzone) await addPlanToSupabase('security-cleanzone', p);
    for (const p of s_products_private_ca) await addPlanToSupabase('security-private-ca', p);
    for (const p of s_products_ssl) await addPlanToSupabase('security-ssl', p);
    for (const p of s_products_v3) await addPlanToSupabase('security-v3', p);
    for (const p of s_products_dbsafer) await addPlanToSupabase('security-dbsafer', p);

    // Solutions
    for (const p of solution_products_ms365) await addPlanToSupabase('solution', p);
    for (const p of solution_products_naver) await addPlanToSupabase('solution-naver', p);
    for (const p of solution_products_web) await addPlanToSupabase('solution-website', p);

    // Addons
    for (const p of s_products_license) await addPlanToSupabase('addon-license', p);
    for (const p of s_products_backup) await addPlanToSupabase('addon-backup', p);
    for (const p of s_products_ha) await addPlanToSupabase('addon-ha', p);
    for (const p of s_products_monitoring) await addPlanToSupabase('addon-monitoring', p);
    for (const p of s_products_lb) await addPlanToSupabase('addon-lb', p);
    for (const p of s_products_cdn) await addPlanToSupabase('addon-cdn', p);
    for (const p of s_products_recovery) await addPlanToSupabase('addon-recovery', p);

    console.log('Full Migration Complete.');
}

run();
