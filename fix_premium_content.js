
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function fixPremium() {
    console.log("Fixing content for ID 289 (Premium)...");

    const cleanContent = `<ul>
<li>공용 용량: 인당 1TB 제공</li>
<li>구성원 수: 제한 없음</li>
<li><strong>Standard 전체 기능 +</strong></li>
<li>메일 용량 제공 (무제한)</li>
<li>드라이브 기능 제공</li>
<li>단일 파일 업로드 : 50GB → 100GB</li>
<li>아카이빙 (10년 보관)</li>
<li>동영상/파일 뷰어 포맷 확대</li>
<li>파일 OCR 검색</li>
<li>문서 공동 편집</li>
</ul>`;

    const { error } = await supabase
        .from('product_plans')
        .update({ features: cleanContent })
        .eq('id', 289);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Successfully updated Premium plan (ID 289) with clean content.");
    }
}

fixPremium();
