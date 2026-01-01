// Supabase Configuration
// 1. Supabase 가입 후 새 프로젝트를 생성하세요.
// 2. Project Settings -> API 에서 URL과 Anon Key를 복사해서 아래에 붙여넣으세요.

const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';

// Supabase 클라이언트 초기화
// Supabase v2는 전역 객체로 export 되므로 window.supabase에서 가져옵니다
// Supabase 클라이언트 초기화
// Supabase v2는 전역 객체로 export 되므로 window.supabase에서 가져옵니다
let supabaseLibrary = window.supabase;

try {
    // Supabase CDN에서 createClient 함수를 가져옵니다
    const { createClient } = supabaseLibrary;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Expose config for recovery usage
    window.SupabaseConfig = {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY
    };

    // Expose globally as window.sb for application logic
    window.sb = client;
    // Do NOT overwrite window.supabase to avoid conflicts with CDN library object

    console.log('✅ Supabase 연결 성공! (Client Initialized)');
} catch (error) {
    console.error('❌ Supabase 초기화 실패:', error);
    console.error('HTML에 CDN 스크립트가 포함되어 있는지 확인해주세요.');
}
// Helper: Wait for Supabase to be ready
window.waitForSupabase = async function (maxRetries = 20, delayMs = 200) {
    // 1. Check if already initialized
    if (window.sb && window.sb.from) return window.sb;

    // 2. Poll
    for (let i = 0; i < maxRetries; i++) {
        if (window.sb && window.sb.from) {
            return window.sb;
        }

        // Auto-fix: Try to find 'supabase' global if 'sb' is missing
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            // Re-init if needed or just alias
            if (!window.sb && window.SupabaseConfig) {
                try {
                    window.sb = window.supabase.createClient(window.SupabaseConfig.url, window.SupabaseConfig.key);
                    return window.sb;
                } catch (e) { console.warn('Auto-init failed', e); }
            }
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // 3. Final Attempt or Fail
    if (window.sb) return window.sb;

    console.error('Fatal: Supabase client could not be initialized.');
    return null;
};
