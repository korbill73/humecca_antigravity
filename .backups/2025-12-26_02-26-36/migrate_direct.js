
const { createClient } = require('@supabase/supabase-js');

const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function getOrCreateProduct(category, subcategory, name, desc) {
    console.log(`Checking product: ${name} (${category}/${subcategory})...`);
    let { data: product, error } = await supabase.from('products')
        .select('id')
        .eq('category', category)
        .eq('subcategory', subcategory)
        .maybeSingle();

    if (error) { console.error('Error checking product:', error.message); return null; }

    if (!product) {
        console.log('Product not found. Creating...');
        const { data: newProd, error: createError } = await supabase.from('products')
            .insert([{
                category: category,
                subcategory: subcategory,
                name: name,
                description: desc
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

async function upsertPlans(product, plans) {
    if (!product) return;
    for (const p of plans) {
        p.product_id = product.id;
        // Check exist by plan_name (assuming name is unique enough here for migration)
        const { data: exist } = await supabase.from('product_plans')
            .select('id')
            .eq('product_id', product.id)
            .eq('plan_id', p.plan_id)
            .maybeSingle();

        if (exist) {
            console.log(`Plan ${p.plan_name} already exists. Skipping...`);
        } else {
            console.log(`Inserting ${p.plan_name}...`);
            const { error: insErr } = await supabase.from('product_plans').insert([p]);
            if (insErr) console.error(`Error inserting ${p.plan_name}:`, insErr.message);
            else console.log(`Inserted ${p.plan_name}`);
        }
    }
}

async function run() {
    console.log('Starting Direct Node Migration...');

    // 1. MS365
    // Ensure subcategory is 'solution' to match admin_logic_v7.js fix
    const pMS = await getOrCreateProduct('solution', 'solution', '기업 솔루션 (MS365)', '기업 업무 효율을 위한 다양한 솔루션');
    const plansMS = [
        {
            plan_name: "Microsoft 365 Business Basic",
            plan_id: "ms365-basic",
            price: "7500",
            period: "월",
            badge: "",
            summary: "사용자/월 (연간 약정시)",
            features: "웹 및 모바일용 Office 앱\n1TB OneDrive 스토리지\n비즈니스용 이메일 (Exchange)\nTeams 채팅 및 화상회의\n표준 보안",
            sort_order: 1,
            active: true
        },
        {
            plan_name: "Microsoft 365 Business Standard",
            plan_id: "ms365-standard",
            price: "15600",
            period: "월",
            badge: "인기 상품",
            summary: "사용자/월 (연간 약정시)",
            features: "데스크톱용 Office 앱 포함\nWord, Excel, PPT, Outlook 설치\n1TB OneDrive 스토리지\n웨비나 개최 기능\n고객 예약 관리 (Bookings)",
            sort_order: 2,
            active: true
        },
        {
            plan_name: "Microsoft 365 Business Premium",
            plan_id: "ms365-premium",
            price: "27500",
            period: "월",
            badge: "",
            summary: "사용자/월 (연간 약정시)",
            features: "모든 Standard 기능 포함\n고급 보안 및 사이버 위협 보호\nPC 및 모바일 장치 관리\n데이터 손실 방지 (DLP)\nAzure Virtual Desktop 지원",
            sort_order: 3,
            active: true
        }
    ];
    await upsertPlans(pMS, plansMS);


    // 2. Naver Works
    const pNaver = await getOrCreateProduct('solution', 'naverworks', '네이버웍스', '네이버가 만든 업무 협업 도구');
    const plansNaver = [
        {
            plan_name: "Lite",
            plan_id: "naver-lite",
            price: "3000",
            period: "월",
            badge: "",
            summary: "사용자/월 (연간 약정시)",
            features: "메시지 (채팅/음성/영상 통화)\n게시판, 캘린더, 주소록\n설문, 할 일\n공용 용량 10GB/1인",
            sort_order: 1,
            active: true
        },
        {
            plan_name: "Basic",
            plan_id: "naver-basic",
            price: "6000",
            period: "월",
            badge: "추천",
            summary: "사용자/월 (연간 약정시)",
            features: "Lite 기능 전체 포함\n메일 (30GB/1인)\n드라이브 (30GB/1인)\n화상회의 (최대 200명)",
            sort_order: 2,
            active: true
        },
        {
            plan_name: "Premium",
            plan_id: "naver-premium",
            price: "10000",
            period: "월",
            badge: "",
            summary: "사용자/월 (연간 약정시)",
            features: "Basic 기능 전체 포함\n드라이브 용량 무제한\n아카이빙(보존)\n고급 보안 설정\n감사 로그",
            sort_order: 3,
            active: true
        }
    ];
    await upsertPlans(pNaver, plansNaver);


    // 3. Homepage (Website)
    const pWeb = await getOrCreateProduct('solution', 'website', '홈페이지 제작', '맞춤형 웹사이트 제작 서비스');
    const plansWeb = [
        {
            plan_name: "일반형 (반응형)",
            plan_id: "web-basic",
            price: "1000000",
            period: "건",
            badge: "",
            summary: "기본 5페이지 내외",
            features: "반응형 웹 디자인 적용\n게시판/문의폼 기능\n기본 관리자 모드\n유지보수 1개월 무료",
            sort_order: 1,
            active: true
        },
        {
            plan_name: "비즈니스형",
            plan_id: "web-business",
            price: "2000000",
            period: "건",
            badge: "추천",
            summary: "페이지 수 제한 없음 (협의)",
            features: "고급 디자인 및 퍼블리싱\n회원관리 / SMS 연동\n접속 통계 프로그램\n유지보수 3개월 무료",
            sort_order: 2,
            active: true
        },
        {
            plan_name: "프리미엄 쇼핑몰",
            plan_id: "web-premium",
            price: "문의",
            period: "건",
            badge: "",
            summary: "독립형 쇼핑몰 구축",
            features: "전자결제(PG) 연동\n상품/주문/배송 관리 시스템\n마케팅 툴 연동\n맞춤 기능 개발 가능",
            sort_order: 3,
            active: true
        }
    ];
    await upsertPlans(pWeb, plansWeb);

    console.log('Done.');
}

run();
