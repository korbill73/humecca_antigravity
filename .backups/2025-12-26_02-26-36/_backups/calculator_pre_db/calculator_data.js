// Calculator Data - Pricing & Products

const SERVER_PRODUCTS = [
    { id: 'svr_basic', name: 'Basic Server', cpu: '4 Core', ram: '8GB', hdd: '1TB SATA', price: 150000, category: 'server' },
    { id: 'svr_standard', name: 'Standard Server', cpu: '8 Core', ram: '16GB', hdd: '500GB SSD', price: 250000, category: 'server' },
    { id: 'svr_adv', name: 'Advanced Server', cpu: '16 Core', ram: '32GB', hdd: '1TB SSD', price: 450000, category: 'server' },
    { id: 'svr_high', name: 'High-End Server', cpu: '24 Core', ram: '64GB', hdd: '2TB NVMe', price: 700000, category: 'server' },
    { id: 'col_1u', name: 'Colocation 1U', cpu: '-', ram: '-', hdd: '-', price: 50000, category: 'colocation', desc: '1U 공간 / 100Mbps Shared' },
    { id: 'col_full', name: 'Colocation Full Rack', cpu: '-', ram: '-', hdd: '-', price: 800000, category: 'colocation', desc: 'Full Rack (42U) / 1Gbps Dedicated' },
    { id: 'man_basic', name: 'Basic Management', cpu: '-', ram: '-', hdd: '-', price: 30000, category: 'management', desc: '기본 모니터링 및 월 1회 리포트' },
    { id: 'man_pro', name: 'Pro Management', cpu: '-', ram: '-', hdd: '-', price: 100000, category: 'management', desc: '24/7 장애대응 및 보안관제' }
];

const ADDONS = [
    // Spec Upgrades (Step 2)
    { id: 'cpu_up', name: 'CPU Upgrade (+4 Core)', price: 50000, type: 'spec', category: 'cpu' },
    { id: 'ram_16g', name: 'RAM 16GB 추가', price: 30000, type: 'spec', category: 'ram' },
    { id: 'ram_32g', name: 'RAM 32GB 추가', price: 55000, type: 'spec', category: 'ram' },
    { id: 'ssd_500', name: 'SSD 500GB 추가', price: 40000, type: 'spec', category: 'storage' },
    { id: 'ssd_1tb', name: 'SSD 1TB 추가', price: 70000, type: 'spec', category: 'storage' },

    // Services (Step 3)
    { id: 'win_svr', name: 'Windows Server License', price: 30000, type: 'service', category: 'os' },
    { id: 'ms_sql', name: 'MS-SQL Standard', price: 250000, type: 'service', category: 'sw' },
    { id: 'firewall', name: 'Hardware Firewall', price: 100000, type: 'service', category: 'security' },
    { id: 'backup_1t', name: 'Backup 1TB', price: 50000, type: 'service', category: 'backup' },
    { id: '1g_pub', name: '1G Public Network', price: 150000, type: 'service', category: 'net' }
];

const DISCOUNTS = [
    { id: 'term_1', name: '1년 약정 (-5%)', rate: 0.05, months: 12 },
    { id: 'term_2', name: '2년 약정 (-10%)', rate: 0.10, months: 24 },
    { id: 'term_3', name: '3년 약정 (-15%)', rate: 0.15, months: 36 },
    { id: 'term_0', name: '무약정', rate: 0, months: 1 }
];
