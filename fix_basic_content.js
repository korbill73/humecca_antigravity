
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function fixBasic() {
    console.log("Fixing content for ID 288 (Basic)...");

    const cleanContent = `<ul>
<li>공용 용량: 인당 10GB 제공</li>
<li>구성원 수: 제한 없음</li>
<li><strong>Free 전체 기능 +</strong></li>
<li>메일 기능 제공</li>
<li>메일 용량 제공 (100GB/인)</li>
<li>드라이브 기능 제공</li>
<li>단일 파일 업로드 : 50GB</li>
<li>PC앱 탐색기</li>
<li>동영상 뷰어 (mov, mp4 등)</li>
</ul>`;

    const { error } = await supabase
        .from('product_plans')
        .update({ features: cleanContent })
        .eq('id', 288);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Successfully updated Basic plan (ID 288) with clean content.");
    }
}

fixBasic();
