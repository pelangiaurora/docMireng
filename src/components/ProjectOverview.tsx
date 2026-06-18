import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  ShieldAlert, 
  CheckCircle2, 
  LayoutGrid, 
  Compass, 
  Database, 
  ArrowRight, 
  Search, 
  Cpu, 
  Info, 
  Layers, 
  Sparkles, 
  ChevronDown, 
  DollarSign, 
  Zap, 
  Clock, 
  User, 
  MessageSquare, 
  BadgeAlert, 
  Percent, 
  Sliders, 
  Settings, 
  Eye, 
  AlertTriangle, 
  Award, 
  Truck, 
  MapPin, 
  Heart, 
  Shield, 
  ShieldCheck, 
  Users, 
  FileText, 
  TrendingUp, 
  FolderPlus, 
  HelpCircle,
  Maximize2
} from 'lucide-react';

// Interfaces for our interactive blueprints and simulators
interface MenuDetail {
  route: string;
  title: string;
  description: string;
  features: string[];
  databaseTables: string[];
  analogTo: string;
}

interface LoyaltyTier {
  name: string;
  source: 'Blibli Style' | 'Shopee Style' | 'Shopee / Blibli Style';
  minSpent: number;
  benefits: string[];
  color: string;
  badge: string;
}

interface AddressLabel {
  id: string;
  label: 'Rumah' | 'Kantor' | 'Utama' | 'Alamat Pengembalian';
  recipient: string;
  address: string;
  cityId: string;
  isMain: boolean;
}

interface SimulatedSellerProduct {
  name: string;
  sku: string;
  basePrice: number;
  variants: { name: string; price: number; stock: number }[];
  wholesalePriceTiers: { minQty: number; pricePerUnit: number }[];
  sizeChartUrl?: string;
  codEnabled: boolean;
  status: 'active' | 'under_review' | 'needs_action';
  brandApproved: boolean;
}

export default function ProjectOverview() {
  const [activePortal, setActivePortal] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  // Rebranding State Workspace
  const [webAppName, setWebAppName] = useState<string>(() => {
    return localStorage.getItem('mireng_brand_name') || 'Mireng Marketplace';
  });
  const [webAppThemeColor, setWebAppThemeColor] = useState<string>(() => {
    return localStorage.getItem('mireng_theme_color') || 'indigo';
  });
  const [editBrand, setEditBrand] = useState<boolean>(false);

  // Saving brand name to local storage
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mireng_brand_name', webAppName);
    localStorage.setItem('mireng_theme_color', webAppThemeColor);
    setEditBrand(false);
    // Reload components that use it if necessary, or let active state handle it
  };

  // 1. Buyer: Username Customizable state & 30-day Cooldown
  const [buyerUsername, setBuyerUsername] = useState<string>('tony_eilyaz_99');
  const [tempUsername, setTempUsername] = useState<string>('');
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [sellerStoreSyncedUsername, setSellerStoreSyncedUsername] = useState<string>('tony-store-official');

  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;
    
    // Simple 30 day validation simulation
    const now = new Date();
    if (lastUsernameChange && (now.getTime() - lastUsernameChange.getTime() < 30 * 24 * 60 * 60 * 1000)) {
      setUsernameMessage('⚠ Error: Anda hanya dapat mengganti username sekali dalam 30 hari.');
      return;
    }

    setBuyerUsername(tempUsername);
    setSellerStoreSyncedUsername(tempUsername.toLowerCase().replace(/_/g, '-'));
    setLastUsernameChange(now);
    setUsernameMessage('✔ Sukses! Username Anda & domain slug Toko Seller Anda berhasil disinkronkan secara otomatis.');
    setTimeout(() => setUsernameMessage(null), 5000);
  };

  // 2. Buyer: Multi-address selector simulator
  const [addresses, setAddresses] = useState<AddressLabel[]>([
    { id: 'addr-1', label: 'Utama', recipient: 'Tony Eilyaz (Rumah)', address: 'Jl. Raya Sidoarjo No. 88, Sidoarjo, Jawa Timur', cityId: '444', isMain: true },
    { id: 'addr-2', label: 'Kantor', recipient: 'Tony Eilyaz (Hub Mireng)', address: 'Silicon Valley Sidoarjo, Kec. Gedangan, Jawa Timur', cityId: '115', isMain: false },
    { id: 'addr-3', label: 'Alamat Pengembalian', recipient: 'Tony Warehouse', address: 'Kawasan Pergudangan Margomulyo Indah Blok C-5, Surabaya', cityId: '444', isMain: false }
  ]);

  const setMainAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isMain: addr.id === id
    })));
  };

  // 3. Buyer: Loyalty Tiers / Member System
  const loyaltyTiers: LoyaltyTier[] = [
    { name: 'Classic / Silver', source: 'Shopee Style', minSpent: 0, benefits: ['Voucher Gratis Ongkir Potongan Rp10.000', '1x Koin Cashback Mingguan', 'Kupon Spesial Ulang Tahun'], color: 'from-slate-400 to-slate-500', badge: '🥈 Classic Silver' },
    { name: 'Gold', source: 'Shopee / Blibli Style', minSpent: 1200000, benefits: ['Free Ongkir Tanpa Minimum Belanja', 'Cashback Ekstra 5% Koin Loyalty', 'Customer Service VIP Prioritas Jalur Cepat', 'Promo Eksklusif Gold Member Day'], color: 'from-amber-500 to-amber-600', badge: '👑 Gold Member' },
    { name: 'Platinum', source: 'Shopee / Blibli Style', minSpent: 5000000, benefits: ['Gratis Ongkir Cargo s.d 40kg', 'Diskon Spesial Mitra Merchant Pilihan', 'Bebas Biaya Layanan Jasa Escrow Platform', 'CS Response < 3 menit'], color: 'from-indigo-400 to-slate-600', badge: '💎 Platinum Executive' },
    { name: 'Diamond', source: 'Blibli Style', minSpent: 15000000, benefits: ['Garansi Layanan Asuransi Produk Gratis Terbuka', 'Tiket Undian Flash Sale Prioritas Tanpa Rebutan', 'Asisten Belanja Personal Dedicated', 'Undangan Gathering Tahunan Founder Mireng'], color: 'from-sky-400 via-indigo-500 to-purple-600', badge: '🛡️ Diamond Elite' }
  ];
  const [selectedLoyaltyTier, setSelectedLoyaltyTier] = useState<LoyaltyTier>(loyaltyTiers[1]);

  // 4. Seller: Simulator SKU, wholesale-prices, custom size chart, COD toggle
  const [sellerProducts, setSellerProducts] = useState<SimulatedSellerProduct[]>([
    {
      name: 'Mireng Crispy Daun Jeruk (Kemasan Kaleng)',
      sku: 'MRG-CRSP-KLG',
      basePrice: 42000,
      variants: [
        { name: 'Pedas Standard', price: 42000, stock: 15 },
        { name: 'Super Ekstrem Pedas', price: 45500, stock: 8 }
      ],
      wholesalePriceTiers: [
        { minQty: 10, pricePerUnit: 39000 },
        { minQty: 50, pricePerUnit: 37000 }
      ],
      sizeChartUrl: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600',
      codEnabled: true,
      status: 'active',
      brandApproved: true
    },
    {
      name: 'Mireng Gourmet Keripik Singkong Caramel',
      sku: 'MRG-GOUR-CRM',
      basePrice: 55000,
      variants: [
        { name: 'Original Caramel', price: 55000, stock: 40 }
      ],
      wholesalePriceTiers: [],
      codEnabled: false,
      status: 'active',
      brandApproved: false
    }
  ]);
  const [newSizeChartName, setNewSizeChartName] = useState<string>('Standard 250gram Packaging Guide');
  const [autoSizeChartResult, setAutoSizeChartResult] = useState<string | null>(null);

  const triggerAddSizeChart = () => {
    setAutoSizeChartResult(`✔ Sukses! Panduan ukuran "${newSizeChartName}" telah digenerasi otomatis dan akan disematkan di modal produk saat upload katalog.`);
    setTimeout(() => setAutoSizeChartResult(null), 4000);
  };

  // 5. Seller: Dispute Appeal (Pusat Banding Retur Toko)
  const [disputes, setDisputes] = useState([
    { id: 'disp-1', orderId: 'MRG-309482', buyer: 'M. Tonny', reason: 'Produk hancur di jalan', type: 'Sistem/Kurir', status: 'pending_appeal', amount: 125000 }
  ]);
  const [disputeLogs, setDisputeLogs] = useState<string[]>([]);

  const handleDisputeAction = (id: string, decision: 'accept' | 'appeal') => {
    setDisputes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: decision === 'accept' ? 'refunded' : 'admin_review' };
      }
      return d;
    }));
    const logMsg = decision === 'accept' 
      ? `✔ Anda menyetujui refund ${id}. Dana dikembalikan ke saldo pembeli.`
      : `🛡️ Ajuan banding terdaftar! Tim mediator Admin Mireng akan memeriksa foto paket dalam waktu 24 jam.`;
    setDisputeLogs(prev => [logMsg, ...prev]);
  };

  // 1. Buyer Complete Menu with accurate parameters
  const buyerMenus: MenuDetail[] = [
    {
      route: '/',
      title: 'Halaman Beranda & Pilihan Rekomendasi Pintar',
      description: 'Landing page estetik bergaya Shopee Mall / Blibli dengan dynamic banners, kategori terpilah, dan flash sale countdown terintegrasi.',
      features: [
        'Klaim Voucher Toko & Voucher Subsidi Platform terpusat.',
        'Pencarian Autocomplete cerdas yang memilah Produk Fisik, Produk Digital, dan Jasa.',
        'Widget Live Flash Sale multi-level (Admin & Seller) yang terus berputar.'
      ],
      databaseTables: ['banners', 'categories', 'vouchers', 'products', 'flash_sale_sessions'],
      analogTo: 'Beranda Shopee (Rekomendasi Utama, Banner Promo, & Mini Games)'
    },
    {
      route: '/wishlist',
      title: 'Daftar Keinginan (Wishlist) dengan Multi-Kategori Kustom',
      description: 'Ruang simpan produk favorit pembeli. Berbeda dengan marketplace standar, pembeli dapat membuat folder kustom (e.g. "Camilan Lebaran", "Resep PDF Terfavorit").',
      features: [
        'Pembuatan Folder Wishlist kustom tak terbatas oleh pembeli.',
        'Live Stock Alert: Mengirim notifikasi otomatis jika barang dalam folder kustom mengalami diskon atau stok tinggal sedikit.',
        'Shareable Wishlist: Bagikan daftar folder kustom melalui link sosial media.'
      ],
      databaseTables: ['wishlists', 'wishlist_folders', 'wishlist_items', 'products'],
      analogTo: 'Blibli Wishlist (Kombinasi Folder Favorit & Notification Alert)'
    },
    {
      route: '/user/profile',
      title: 'Username Kustom (Cooldown 30 Hari) & Sinkron Domain',
      description: 'Pengaturan identitas pembeli terpadu dengan proteksi cooldown perubahan nama dan sinkronisasi otomatis ke nama domain toko apabila beralih fungsi menjadi penjual.',
      features: [
        'Random Username Generator otomatis saat pertama mendaftar (e.g., user_abc938).',
        'Kebijakan Cooldown Ganti Nama: Pengunci 30 hari dijamin aman oleh database constraints.',
        'Sinkronisasi 1-Click: URL toko langsung sejalan dengan username terpilih.'
      ],
      databaseTables: ['users', 'user_credentials', 'stores'],
      analogTo: 'Shopee Account Profile (Batasan Ganti Username & Integrasi Toko)'
    },
    {
      route: '/user/tier-benefits',
      title: 'Sistem Tingkatan Loyalitas Tier (Classic, Gold, Platinum, Diamond)',
      description: 'Modul kalkulasi tingkat keaktifan belanja yang memberikan insentif voucher ongkir dan cashback bertahap menyesuaikan nominal transaksi.',
      features: [
        'Blibli Loyalty Style: Urutan tingkat Silver, Gold, Platinum, Diamond kualifikasi akumulatif belanja.',
        'Benefit Terhitung Otomatis: Diskon asuransi kargo gratis dan tiket jalur kilat flash sale.',
        'Live Tracker: Bar progres kemajuan menuju tingkatan level tier berikutnya.'
      ],
      databaseTables: ['loyalty_levels', 'user_loyalty_transactions', 'vouchers'],
      analogTo: 'Blibli Member Level (Silver s.d Diamond) & Shopee Member (Classic s.d Platinum)'
    },
    {
      route: '/user/addresses',
      title: 'Buku Alamat Multi-Label & Penentu Alamat Utama',
      description: 'Manajemen lokasi pembeli yang kaya label peruntukan (Rumah, Kantor, Alamat Pengembalian) untuk integrasi estimasi tarif cargo.',
      features: [
        'Satu Alamat Utama Terpilih: Mengubah alamat utama otomatis memindahkan status alamat lain jadi reguler.',
        'Koneksi RajaOngkir Kota ID: Menjamin ketepatan hitungan ongkir split kurir.',
        'Label Pengembalian Toko: Digunakan otomatis bila berstatus sebagai gudang retur.'
      ],
      databaseTables: ['user_addresses', 'rajaongkir_cities'],
      analogTo: 'Shopee Kelola Alamat (Tag Rumah/Kantor & Atur Sebagai Utama)'
    },
    {
      route: '/cart',
      title: 'Zustand Multi-Vendor Split Cart & Opsi Asuransi',
      description: 'Keranjang belanja yang otomatis mengelompokkan barang belanja bermacam-macam toko menjadi kelompok subtotal terpisah.',
      features: [
        'Split by Store UI: Integrasi subtotal harga per vendor pengirim barang.',
        'Checkbox Asuransi Kargo Opsional: Perlindungan proteksi risiko pecah/hilang di jalan.',
        'Dukungan Promo Voucher Toko terikat langsung per baris toko.'
      ],
      databaseTables: ['Zustand Client State (cart_items)', 'vouchers', 'products'],
      analogTo: 'Blibli Bag (Split Grouping per Merchant Seller & Checkout Terpisah)'
    },
    {
      route: '/checkout',
      title: 'Gerbang Transaksi Hybrid & Opsi Bayar COD',
      description: 'Form pemilihan metode kirim terpadu, asuransi produk, dan metode pembayaran aman termasuk COD (Bayar di Tempat).',
      features: [
        'Toggle COD: Hanya muncul jika produk dan filter seller mengaktifkan kurir bertipe COD.',
        'Asuransi Kehilangan: Flat biaya mitigasi dari sistem escrow platform.',
        'Satu Klik Snap Midtrans: Untuk instan payment via Qris, ShopeePay atau Gopay.'
      ],
      databaseTables: ['orders', 'order_items', 'shipping_details', 'payment_options'],
      analogTo: 'Shopee Checkout (Alamat Kirim, Kurir COD, & Pilihan Proteksi Barang)'
    },
    {
      route: '/order/history',
      title: 'Portal Riwayat Orderan, Pengunduhan File Digital & Ulasan',
      description: 'Status pemantauan status belanja, tombol unduh untuk lisensi digital R2, serta form penilaian pengulas produk komprehensif.',
      features: [
        'Secure Digital File Link: Tombol generator download token yang kedaluwarsa setelah diunduh pembeli.',
        'Daftar Ulasan Bintang: Penilaian bertajuk ulasan bintang 1-5 dilengkapi unggah multi-foto.',
        'Follow Button: Hubungkan pembeli langsung mem-follow toko penjual terfavorit.'
      ],
      databaseTables: ['orders', 'product_reviews', 'user_followed_stores'],
      analogTo: 'Shopee Pesanan Saya (Dikirim, Menunggu Pembayaran, Selesai)'
    },
    {
      route: '/user/affiliate',
      title: 'Program Kemitraan Mireng Affiliate & Rujukan Belanja',
      description: 'Program bagi-bagi komisi dari pembeli yang menyebarkan tautan rujuk ke media sosial. Pembeli mendapatkan persentase komisi jika ada rekan belanja lewat tautan khusus.',
      features: [
        'Generator Tautan Kustom otomatis dari detail produk di aplikasi.',
        'Sistem Pembagian Komisi Flat (e.g. 5% dari total harga barang).',
        'Dasbor Monitor Klik & Pendapatan hasil promosi langsung.'
      ],
      databaseTables: ['user_affiliate_logs', 'affiliate_referrals', 'affiliate_commissions'],
      analogTo: 'Shopee Affiliate Card (Klaim Pendapatan Link & Monitor Cuan)'
    },
    {
      route: '/user/coin-wallet',
      title: 'Buku Tabungan Koin & Token Gamifikasi Hub',
      description: 'Sistem koin loyalty atau gamifikasi cerdas untuk menjaga retensi harian pembeli. Pengguna dapat mengklaim koin gratis setiap hari, yang nantinya dipotong langsung saat checkout.',
      features: [
        'Klaim Koin Harian (Check-In Daily Login) dengan skema kelipatan beruntun.',
        'Tukar Koin untuk kupon voucher diskon kustom dari platform.',
        'Pencatatan Sejarah Koin Masuk/Keluar yang akurat menghindari penipuan.'
      ],
      databaseTables: ['user_coin_ledger', 'gac_check_ins', 'coin_vouchers'],
      analogTo: 'Shopee Games & Koin Shopee (Pemberi Insentif Gamifikasi Pembeli)'
    }
  ];

  // 2. Seller Complete Menu with accurate parameters
  const sellerMenus: MenuDetail[] = [
    {
      route: '/seller/dashboard',
      title: 'Beranda Seller Center, Performa Toko & Kesehatan Toko',
      description: 'Papan kendali utama untuk melacak performa toko, tingkat kecepatan membalas chat pembeli, serta statistik kepatuhan standar hukum.',
      features: [
        'Sistem Kesehatan Toko (Shop Health Metric): Menghitung persentase penalti, keterlambatan pengiriman, dan review negatif.',
        'Saldo Dompet Toko & Rekening Penarikan (Wallet Balance): Menampilkan total tabungan dana cair.',
        'Widget Perlu Tindakan: Notifikasi instan pesanan masuk yang harus dikirim atau ditolak.'
      ],
      databaseTables: ['stores', 'store_balances', 'store_financial_logs', 'withdrawals_ledger'],
      analogTo: 'Shopee Seller Center Dashboard (Analitik Penjualan & Saldo Toko)'
    },
    {
      route: '/seller/product/manage',
      title: 'Manajer Katalog Hybrid: Multi-Varian, Harga Grosir & Size Chart',
      description: 'Form komprehensif mengunggah katalog dengan dukungan variasi harga, diskon grosir bertingkat, serta penyisipan panduan ukuran otomatis.',
      features: [
        'Multi-Varian SKU: Kombinasi harga dan stok yang berbeda (misal: warna Merah, Hitam, Ukuran S, L).',
        'Harga Grosir Multi-Tier: Mengatur diskon harga jika membeli dalam jumlah kuantitas tertentu (e.g., Beli >10 diskon 5%).',
        'Size Chart Selector: Menyematkan panduan ukuran otomatis dari basis kustom template.'
      ],
      databaseTables: ['products', 'product_variants', 'product_wholesales', 'size_charts'],
      analogTo: 'Shopee Tambah Produk (Variasi Harga Baru & Atur Harga Grosir)'
    },
    {
      route: '/seller/product/bulk-upload',
      title: 'Alat Unggah Produk Massal (Bulk Exporter/Importer)',
      description: 'Fasilitas memproses ratusan stok inventaris produk toko sekaligus dalam hitungan detik menggunakan format template spreadsheet.',
      features: [
        'Import File Excel/CSV: Validasi orisinalitas kolom harga dan sisa kuantitas stok.',
        'Bulk Size Chart Assignment: Menerapkan satu panduan ukuran yang sama ke banyak SKU sekaligus.',
        'History Log Upload: Meneliti baris file excel mana saja yang gagal terproses akibat salah format.'
      ],
      databaseTables: ['bulk_upload_jobs', 'products', 'product_variants'],
      analogTo: 'Shopee Bulk Upload (Unggah Massal via Atribut Template Excel)'
    },
    {
      route: '/seller/brand-requests',
      title: 'Pengajuan Otorisasi Brand / Merk Resmi',
      description: 'Modul merchant untuk mengirimkan bukti sertifikat hak kekayaan intelektual (HAKI) merek agar mendapat label "Official Brand" tervalidasi.',
      features: [
        'Unggah Sertifikat HAKI: Format berkas orisinalitas sertifikat merek.',
        'Sistem Persetujuan Admin: Produk yang telah disetujui merknya berhak atas prioritas filter pencarian.',
        'Daftar Merk Terverifikasi: Dropdown dinamis saat mendaftarkan produk baru.'
      ],
      databaseTables: ['brand_authorizations', 'brands'],
      analogTo: 'Blibli Brand Authorization (Pengajuan Sertifikat Distribusi Resmi)'
    },
    {
      route: '/seller/orders',
      title: 'Pesanan Masuk, Pengiriman Massal, COD Toggle & Retur',
      description: 'Pengendali operasional logistik: atur jenis pickup drop-off, kelola nomor resi pesanan massal, asuransi, dan dispute banding retur.',
      features: [
        'Toggle COD Toko: Matikan atau hidupkan COD untuk semua produk atau SKU terpilih saja.',
        'Dukungan Dispute Banding: Form banding jika paket retur yang dikembalikan pembeli ternyata rusak sengaja.',
        'Handover Status: Menandai serah terima kurir pickup atau drop-off counter agen.'
      ],
      databaseTables: ['orders', 'order_items', 'dispute_appeals', 'shipping_details'],
      analogTo: 'Shopee Kelola Pengiriman Massal (Cetak Label Resi Cetak Massal)'
    },
    {
      route: '/seller/marketing',
      title: 'Pusat Promosi Toko, Broadcast Chat & Iklan Produk',
      description: 'Alat pemasaran mandiri merchant untuk mendongkrak trafik pengunjung dan volume penjualan.',
      features: [
        'Pembuat Voucher Toko: Tentukan minimal belanja pembeli sendiri.',
        'Broadcast Chat Interaktif: Kirim promo serempak ke ratusan pembeli yang mem-follow toko.',
        'Iklan Toko (Mireng Ads): Kredit iklan prabayar demi mempromosikan SKU paling atas di pencarian.'
      ],
      databaseTables: ['vouchers', 'marketing_campaigns', 'broadcast_jobs', 'store_ad_credits'],
      analogTo: 'Shopee Promosi Saya & Fitur Broadcast Chat Seller'
    },
    {
      route: '/seller/wallet',
      title: 'Dompet Saldo Penjual & Riwayat Tarik Saldo Penjual',
      description: 'Fasilitas keuangan penjual untuk melacak pelepasan dana escrow pasca pembeli menekan tombol selesaikan pesanan, disatukan dengan riwayat penarikan ke bank lokal.',
      features: [
        'Instant Settlement: Dilepas otomatis dari penampung escrow setelah waktu proteksi 2x24 jam berakhir.',
        'Sistem Penarikan Aman (Withdrawall Authorization): Melalui proses verifikasi OTP SMS sebelum pengiriman berkas bank.',
        'Potongan Biaya Admin Layanan otomatis per kategori produk.'
      ],
      databaseTables: ['store_wallet_ledger', 'withdrawals_ledger', 'escrow_order_releases'],
      analogTo: 'Shopee Saldo Penjual (Monitor Tabungan Toko & Transfer ke Bank)'
    },
    {
      route: '/seller/live-shopping',
      title: 'Penjualan Langsung Video Mandiri (Mireng Live Stream)',
      description: 'Portal live streaming terintegrasi di mana penjual dapat mempromosikan produk secara interaktif melalui video dan menyematkan keranjang kuning pembelian instan.',
      features: [
        'Pin Keranjang Kuning: Penjual dapat menyorot salah satu varian SKU agar pembeli bisa langsung checkout tanpa keluar live.',
        'Sistem Voucher Eksklusif Live Streaming: Diskon tambahan yang hanya bisa diklaim saat sedang siaran berlangsung.',
        'Widget Komentar Real-Time & Like counter.'
      ],
      databaseTables: ['store_live_sessions', 'live_stream_comments', 'pinned_live_products'],
      analogTo: 'Shopee Live / Tokopedia Play (Siaran Video Live & Flash Voucher Toko)'
    }
  ];

  // 3. Admin Complete Menu with accurate parameters
  const adminMenus: MenuDetail[] = [
    {
      route: '/admin/kyc-verification',
      title: 'Sistem Onboarding KYC & Verifikasi Staff',
      description: 'Portal pemantauan berkas identitas calon penjual baru. Diiringi pembagian tugas audit berkas per akun staf admin terpilih.',
      features: [
        'Sistem Review KTP Kualifikasi Tinggi: Deteksi plagiasi file gambar.',
        'Persetujuan Legalitas Rekening: Menjamin nama pendaftar selaras dengan pemilik rekening bank.',
        'Auditor Assignment: Menandai akun tim staf admin yang memvalidasi operasional KYC.'
      ],
      databaseTables: ['users', 'stores', 'admin_staffs', 'admin_audit_logs'],
      analogTo: 'Blibli Seller Center Onboarding Auditor Dashboard'
    },
    {
      route: '/admin/flash-sale/manage',
      title: 'Manajer Flash Sale Global (Pusat Kontrol & Subsidi)',
      description: 'Alat kontrol mutlak kampanye promo kilat berskala internasional. Gabung produk lintas vendor menjadi satu timeline jam promo sibuk.',
      features: [
        'Sistem Jadwal Slot Jam (e.g. 10:00 - 13:00, 19:00 - 22:00): Membuka dan mengunci partisipasi seller.',
        'Penyuntik Subsidi Diskon: Tombol admin menyumbangkan diskon platform gratis agar harga jatuh super murah.',
        'Pemberi Auto-Approval: Menyetujui produk milih seller berdiskon fantastis.'
      ],
      databaseTables: ['flash_sale_sessions', 'flash_sale_products', 'products'],
      analogTo: 'Shopee Campaign Planner (Approval Promosi Kilat & Alokasi Kuota Subsidi)'
    },
    {
      route: '/admin/moderation',
      title: 'Pusat Risk Mitigation, Deteksi Spam & Pembekuan Saldo',
      description: 'Layanan keandalan platform untuk membekukan akun spammer, mencopot katalog produk palsu, dan menindaklanjuti banding escrow.',
      features: [
        'Instant SKU Freeze: Blokir produk dilarang seketika dari beranda pembeli.',
        'Pusat Dispute Banding (Intervensi Escrow): Admin berperan sebagai hakim penentu nasib dana.',
        'Banned Merchant Wallet Switch: Membekukan saldo rekening toko demi tujuan preventif.'
      ],
      databaseTables: ['products', 'stores', 'users', 'dispute_appeals', 'escrow_ledger'],
      analogTo: 'Shopee Keamanan Akun & Solusi Pusat Resolusi Dispute'
    },
    {
      route: '/admin/rbac-staff',
      title: 'Manajemen Hak Akses Staff (Role-Based Access Control)',
      description: 'Pengaturan otorisasi staf admin Mireng per divisi spesifik (contoh: Staff Finance hanya boleh akses saldo, Staff KYC hanya boleh verifikasi berkas).',
      features: [
        'Role Builder: Divisi Akuntansi, Divisi Legal KYC, Divisi Moderasi Produk.',
        'Sistem Logs Auditor Komprehensif: Rekaman jejak audit mencatat seluruh tindakan staff admin.',
        'Easy Rebranding System: Ubah nama website global, logo utama, dan warna dasar platform kapan saja.'
      ],
      databaseTables: ['admin_staffs', 'admin_permissions', 'admin_audit_logs', 'platform_settings'],
      analogTo: 'Blibli Staff Member Roles Manager (Keamanan Operasional Internal)'
    },
    {
      route: '/admin/commission-vault',
      title: 'Pengaturan Biaya Administrasi, Layanan & PPN platform',
      description: 'Alat pengubah biaya komisi yang dipotong dari tiap transaksi selesai dari para penjual, serta memisahkan potongan pajak pertambahan nilai (PPN) sesuai aturan hukum RI.',
      features: [
        'Formula Potongan Tier Penjual: Perbedaan persentase Admin Fee antara Standard (1%), Pro (2%), dan Enterprise (3.5%).',
        'Penyetelan Minimum Ambang Batas Biaya Penanganan Flat untuk jenis pembayaran COD.',
        'Kalkulasi PPN 11% Otomatis yang langsung dicatat di ledger keuangan admin.'
      ],
      databaseTables: ['platform_fee_settings', 'collected_fees_ledger', 'tax_reconciliation_logs'],
      analogTo: 'Shopee Admin Fee Configuration (Pusat Potongan Margin Merchant)'
    },
    {
      route: '/admin/affiliate-payouts',
      title: 'Manajemen Pembayaran Komisi Affiliate Kontributor',
      description: 'Konsol persetujuan pembayaran komisi untuk seluruh kontributor Mireng Affiliate. Menyaring klaim tak valid dari rujukan self-referral (beli lewat link sendiri).',
      features: [
        'Penyaring Deteksi Self-Referral: Mencegah fraud di mana pengguna mengeksploitasi sistem komisi menggunakan akun cadangan.',
        'Batch Payout Builder: Generator file transfer massal CSV siap upload ke bank partner.',
        'Log Persetujuan Kasir Keuangan Admin untuk mencatat pembayaran sukses.'
      ],
      databaseTables: ['affiliate_payout_batches', 'affiliate_commissions', 'admin_audit_logs'],
      analogTo: 'Shopee Affiliate Payout Center (Rekap Gaji Kontributor Bulanan)'
    }
  ];

  const currentMenus = 
    activePortal === 'buyer' ? buyerMenus : 
    activePortal === 'seller' ? sellerMenus : adminMenus;

  // Render Theme classes based on premium options
  const getThemeGradient = () => {
    switch (webAppThemeColor) {
      case 'emerald': return 'from-teal-950 via-emerald-900 to-slate-950';
      case 'rose': return 'from-rose-950 via-red-900 to-slate-950';
      case 'amber': return 'from-amber-950 via-amber-900 to-slate-950';
      default: return 'from-slate-900 via-indigo-950 to-slate-900';
    }
  };

  const getThemeText = () => {
    switch (webAppThemeColor) {
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      default: return 'text-indigo-400';
    }
  };

  const getThemeBg = () => {
    switch (webAppThemeColor) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-slate-950';
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getThemeBorder = () => {
    switch (webAppThemeColor) {
      case 'emerald': return 'border-emerald-500/30';
      case 'rose': return 'border-rose-500/30';
      case 'amber': return 'border-amber-500/30';
      default: return 'border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1 text-slate-800">
      
      {/* Visual Identity Hero with Dynamic Web Application Name Rebranding */}
      <div className={`rounded-2xl bg-gradient-to-r ${getThemeGradient()} border border-slate-800 p-6 md:p-8 text-white relative overflow-hidden shadow-lg transition-all duration-500`}>
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider font-bold text-teal-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> CETAK BIRU FITUR UTUH (SHOPEE & BLIBLI STYLE)
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {editBrand ? (
                <form onSubmit={handleSaveBrand} className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                  <input 
                    type="text" 
                    value={webAppName}
                    onChange={(e) => setWebAppName(e.target.value)}
                    className="p-1.5 px-3 bg-slate-950 border border-slate-700 text-white text-sm rounded font-bold outline-none focus:border-indigo-500"
                    placeholder="Nama Webaplikasi Utama..."
                  />
                  <select 
                    value={webAppThemeColor}
                    onChange={(e) => setWebAppThemeColor(e.target.value)}
                    className="p-1.5 bg-slate-950 border border-slate-700 text-xs rounded text-white outline-none font-sans"
                  >
                    <option value="indigo">Slate Indigo (Def)</option>
                    <option value="emerald">Shopee Green (Emerald)</option>
                    <option value="rose">Blibli Red/Rose Color</option>
                    <option value="amber">Orange Gold Vintage</option>
                  </select>
                  <button type="submit" className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition">
                    Simpan
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-amber-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
                    {webAppName} System Blueprint
                  </h1>
                  <button 
                    onClick={() => setEditBrand(true)}
                    className="p-1 px-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-[10px] font-mono font-bold transition text-slate-300"
                  >
                    ⚙ Rebrand Name
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
            Sesuai instruksi detail penambahan modul Anda untuk menyelaraskan platform dengan fitur kelas kakap <strong>Shopee</strong> dan <strong>Blibli</strong>. Kami telah merestrukturisasi sistem secara mendalam: menyusun bagan rute navigasi buyer/seller/admin, pemisahan rute pemulihan escrow dispute, multi-alamat kustom, fungsionalitas loyalti member, asuransi, multi-varian SKU grosir, hingga model pengunggahan massal yang terpadu!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-mono">
            <div className="flex items-center gap-1 bg-white/5 border border-white/15 px-2.5 py-1 rounded-md">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full-Stack Multi-Vendor Architecture</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/15 px-2.5 py-1 rounded-md">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shopee Classic/Platinum Loyalty Level</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/15 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>COD & Dispute Appeal Engine</span>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Visual Workspace Subdomains & Domain Future-Proofing Note */}
      <div className="border border-slate-150 rounded-xl bg-slate-50/50 p-4 font-sans text-xs space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <h4 className="font-bold font-display text-slate-800 text-[11px] uppercase tracking-wider">Future-Proof Subdomain / Domain Architecture Separation Node</h4>
        </div>
        <p className="text-slate-500 leading-relaxed leading-normal text-[10.5px]">
          Meskipun saat ini seluruh repositori disatukan di dalam folder utama pelesapan Mireng (<code className="bg-slate-100 p-0.5 px-1 rounded text-red-600 font-mono text-[9px]">/frontend</code>, <code className="bg-slate-100 p-0.5 px-1 rounded text-red-600 font-mono text-[9px]">/backend</code>, <code className="bg-slate-100 p-0.5 px-1 rounded text-red-600 font-mono text-[9px]">/database</code>), seluruh data entity dan arsitektur pengenalan token sesi JWT dibuat independen. Ketika Anda memutuskan untuk memisahkan domain (misal: <code className="text-indigo-600 font-mono text-[9px]">seller.mireng.com</code> atau <code className="text-indigo-600 font-mono text-[9px]">admin.mireng.com</code>), server backend NestJS siap menangani CORS routing dan cross-origin cookies tanpa perombakan database.
        </p>
      </div>

      {/* Interactive Buyer Loyalti Member & Cooldown Username Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Loyalty & Username Cooldown (Buyer) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Award className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-bold text-xs font-display text-slate-800 uppercase tracking-widest">
                1. Simulasi Loyalty Member & Benefit Tier Pembeli
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Sistem loyalitas member mengumpulkan poin aktivitas transaksi belanja dari pengguna secara real-time. Pilih tier di bawah untuk mengukur keuntungan benefit yang didapatkan pembeli:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {loyaltyTiers.map((tier) => (
                <button
                  key={tier.name}
                  onClick={() => setSelectedLoyaltyTier(tier)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedLoyaltyTier.name === tier.name
                      ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                      : 'bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold block opacity-60 uppercase">{tier.source}</span>
                  <span className="font-bold block mt-0.5">{tier.badge}</span>
                </button>
              ))}
            </div>

            {/* Selected Tier Benefit box */}
            <div className={`rounded-xl bg-gradient-to-r ${selectedLoyaltyTier.color} p-4 text-white space-y-2.5 shadow-2xs`}>
              <div className="flex justify-between items-center">
                <span className="font-bold font-display text-xs">Benefit {selectedLoyaltyTier.badge}:</span>
                <span className="text-[10px] font-mono bg-white/10 p-0.5 px-2 rounded-full uppercase">min. Belanja Rp {selectedLoyaltyTier.minSpent.toLocaleString()}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-white/90">
                {selectedLoyaltyTier.benefits.map((ben, bIdx) => (
                  <li key={bIdx} className="flex gap-1.5 items-start">
                    <span className="text-yellow-300 font-extrabold flex-shrink-0">✦</span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Username Cooldown & Store Sync Simulator */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-bold text-xs font-display text-slate-800 uppercase tracking-widest">
                2. Ganti Username Pembeli & Auto-Sinkron Domain Toko
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Username Pembeli Sekarang:</span>
                <span className="bg-slate-100 p-0.5 px-2 rounded font-bold text-slate-800">@{buyerUsername}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Slug URL Toko (Otomatis Sinkron):</span>
                <span className="bg-indigo-50 p-0.5 px-2 rounded font-bold text-indigo-700">mireng.com/shop/{sellerStoreSyncedUsername}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateUsername} className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Ketik Username Baru:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="e.g. tony_eilyaz_99"
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-semibold"
                />
                <button 
                  type="submit"
                  className="whitespace-nowrap px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                >
                  Ubah Username
                </button>
              </div>
              <p className="text-[9px] text-slate-400">Sesuai kebijakan Shopee/Blibli: Anda hanya dapat mengganti nama 1 kali dalam 30 hari.</p>
            </form>

            {usernameMessage && (
              <div className={`p-2.5 rounded-lg text-[10px] font-mono font-semibold ${
                usernameMessage.startsWith('⚠') 
                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {usernameMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-address Selector & Cash-on-Delivery (COD) toggling */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-bold text-xs font-display text-slate-800 uppercase tracking-widest">
                3. Buku Alamat Multi-Label & Penentu Alamat Utama
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Kelola alamat pengiriman kargo dalam satu tempat. Tentukan salah satu alamat sebagai alamat utama untuk default ongkos kirim saat checkout:
            </p>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`p-3 rounded-lg border flex justify-between items-start gap-3 transition-all ${
                    addr.isMain
                      ? 'border-indigo-500 bg-indigo-50/20 shadow-2xs'
                      : 'border-slate-150 bg-white hover:border-slate-250'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold uppercase p-0.5 px-1.5 rounded leading-none ${
                        addr.label === 'Utama' ? 'bg-indigo-600 text-white' :
                        addr.label === 'Kantor' ? 'bg-amber-600 text-slate-950' :
                        'bg-red-600 text-white'
                      }`}>
                        {addr.label}
                      </span>
                      {addr.isMain && (
                        <span className="text-[9px] font-mono bg-emerald-100 text-emerald-700 font-extrabold px-1.5 rounded-full uppercase">UTAMA</span>
                      )}
                    </div>
                    <strong className="block text-xs text-slate-800">{addr.recipient}</strong>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed">{addr.address}</p>
                  </div>

                  {!addr.isMain && (
                    <button
                      onClick={() => setMainAddress(addr.id)}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 p-1 px-2.5 rounded border border-slate-250 font-bold text-slate-700"
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cash on Delivery System Toggle (COD) */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-3xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Truck className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-bold text-xs font-display text-slate-800 uppercase tracking-widest">
                4. Opsi COD (Bayar di Tempat) - Otorisasi Penjual
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Penjual memiliki wewenang penuh atas pembayaran COD. Toko dapat mengaktifkan sistem COD global untuk semua produk atau mematikan di SKU-SKU kargo bernilai tinggi:
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span>Daftar Produk Terikat Toko Sidoarjo:</span>
                <span className="text-[10px] text-slate-400 font-mono">2 SKU Terdaftar</span>
              </div>
              
              <div className="space-y-2">
                {sellerProducts.map((p, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <strong className="text-xs text-slate-800 block">{p.name}</strong>
                      <span className="text-[9px] font-mono text-slate-400 block bg-slate-100 p-0.5 px-1.5 rounded w-max">SKU: {p.sku}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        p.codEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {p.codEnabled ? 'SUPPORT COD' : 'NON-COD ONLY'}
                      </span>
                      <button
                        onClick={() => {
                          setSellerProducts(prev => prev.map((item, pIdx) => {
                            if (pIdx === idx) {
                              return { ...item, codEnabled: !item.codEnabled };
                            }
                            return item;
                          }));
                        }}
                        className="text-[10px] p-1 px-2.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                      >
                        Toggle COD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Varian SKU & Bulk Upload Spreadsheet Logic (Seller Center) */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-6 space-y-5 shadow-3xs text-xs">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block tracking-wider">SELLER CENTER PLATFORM</span>
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5 mt-0.5">
              <Sliders className="w-4.5 h-4.5 text-indigo-600" /> Multi-Varian SKU, Grosir, & Upload Massal
            </h3>
          </div>

          <div className="flex gap-2">
            <span className="p-1 px-2 rounded bg-indigo-50 border border-indigo-150 text-[10px] font-bold text-indigo-700 font-mono">
              BULK ENGINE v2 Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Size Chart Generator */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono">1</span>
              <strong className="font-bold text-slate-800 font-display">Panduan Ukuran (Size Chart) Otomatis</strong>
            </div>
            
            <p className="text-slate-500 leading-normal leading-relaxed text-[11px]">
              Sistem akan memunculkan popup modal Panduan Ukuran saat pembeli meneliti deskripsi produk pakaian / wadah camilan. Tentukan nama template panduan ukuran penjual untuk digenerasi massal:
            </p>

            <div className="space-y-2">
              <input 
                type="text" 
                value={newSizeChartName}
                onChange={(e) => setNewSizeChartName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-semibold"
                placeholder="Nama size chart..."
              />
              <button 
                onClick={triggerAddSizeChart}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-lg text-xs transition"
              >
                Generasikan & Sematkan Size Chart
              </button>
            </div>

            {autoSizeChartResult && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2.5 rounded-lg text-[10.5px] font-mono">
                {autoSizeChartResult}
              </div>
            )}
          </div>

          {/* Dispute Appeals Resolution */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono">2</span>
              <strong className="font-bold text-slate-800 font-display">Pusat Banding Komplain Retur (Refunding Appeals)</strong>
            </div>

            <p className="text-slate-500 leading-relaxed text-[11px]">
              Refund dana di escrow tidak melulu memihak satu pihak. Alur banding menyajikan audit seimbang jika pembeli / penjual berkelahi menuntut hak dana:
            </p>

            <div className="space-y-2">
              {disputes.map((d) => (
                <div key={d.id} className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded font-bold">{d.id}</span>
                      <strong className="text-xs text-slate-800 ml-1.5 block mt-1">{d.reason}</strong>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Order ID: {d.orderId} • Buyer: {d.buyer}</span>
                    </div>
                    <span className="font-bold font-mono text-rose-600">Rp {d.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-200/60 pt-2 bg-white/50 p-1.5 rounded">
                    <span>Kasus: <strong className="font-semibold text-slate-600">{d.type}</strong></span>
                    <span>Status: <strong className="font-semibold text-orange-600 uppercase">{d.status}</strong></span>
                  </div>

                  {d.status === 'pending_appeal' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDisputeAction(d.id, 'accept')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10.5px] transition"
                      >
                        Terima Refund (Kembalikan Saldo)
                      </button>
                      <button 
                        onClick={() => handleDisputeAction(d.id, 'appeal')}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10.5px] transition"
                      >
                        Ajukan Banding ke Mediator Admin
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {disputeLogs.length > 0 && (
              <div className="bg-slate-900 text-slate-350 p-2.5 rounded-lg text-[9.5px] font-mono space-y-1 h-[60px] overflow-y-auto">
                {disputeLogs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Admin Panel: Access list / RBAC / Modul Staff Roles */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-6 space-y-4 shadow-3xs text-xs">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h4 className="font-bold text-slate-800 text-sm font-display uppercase tracking-widest">
            PANEL INTERNAL ADMIN & ROLE HAK AKSES OPERASIONAL STAFF
          </h4>
        </div>

        <p className="text-slate-500 leading-relaxed text-[11.5px]">
          Webaplikasi utama Mireng menggunakan pembagian divisi (Role-Based Access Control) bertaraf profesional agar staff hanya dapat menjamah modul menu yang benar-benar menjadi tanggung jawab fungsionalnya:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-bold uppercase block w-max">
              Staff Finance (Akuntansi)
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex gap-1.5 items-center">
                <span className="text-blue-500 font-bold">✔</span>
                <span>Audit Saldo Wallet Escrow</span>
              </li>
              <li className="flex gap-1.5 items-center">
                <span className="text-blue-500 font-bold">✔</span>
                <span>Otorisasi Penarikan Dana Toko</span>
              </li>
              <li className="flex gap-1.5 items-center opacity-40">
                <span className="text-red-500 font-bold">✖</span>
                <span>Block Akun Spammer (Forbidden)</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded font-bold uppercase block w-max">
              Staff KYC & Onboarding Legal
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex gap-1.5 items-center">
                <span className="text-rose-500 font-bold">✔</span>
                <span>Validasi Berkas KTP Pendaftar</span>
              </li>
              <li className="flex gap-1.5 items-center">
                <span className="text-rose-500 font-bold">✔</span>
                <span>Sertifikasi Syarat Brand/Merek</span>
              </li>
              <li className="flex gap-1.5 items-center opacity-40">
                <span className="text-red-500 font-bold">✖</span>
                <span>Settlement Saldo/Withdraw (Forbidden)</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-550 border border-slate-150 rounded-xl bg-slate-100/30 p-4 space-y-3">
            <span className="text-[10px] font-mono bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold uppercase block w-max">
              Staff Risk & Moderasi Produk
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex gap-1.5 items-center">
                <span className="text-amber-500 font-bold">✔</span>
                <span>Dispute Mediator Banding Escrow</span>
              </li>
              <li className="flex gap-1.5 items-center">
                <span className="text-amber-500 font-bold">✔</span>
                <span>Hapus / Freeze Produk Pelanggaran</span>
              </li>
              <li className="flex gap-1.5 items-center opacity-40">
                <span className="text-red-500 font-bold">✖</span>
                <span>Manipulasi Pengaturan Biaya App</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Interactive Portal Switcher & Route List Directory */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-3xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block tracking-wider">DIREKTORI RUTE URL & MENU</span>
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5 mt-0.5">
              <LayoutGrid className="w-4.5 h-4.5 text-indigo-600" /> Katalog Peta Rute & Rantai Fitur Utuh
            </h3>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              onClick={() => { setActivePortal('buyer'); setExpandedRoute(null); }}
              className={`flex items-center gap-1.5 p-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activePortal === 'buyer' 
                  ? 'bg-white shadow-2xs text-indigo-950 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Situs Pembeli ({buyerMenus.length})</span>
            </button>
            <button
              onClick={() => { setActivePortal('seller'); setExpandedRoute(null); }}
              className={`flex items-center gap-1.5 p-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activePortal === 'seller' 
                  ? 'bg-white shadow-2xs text-indigo-950 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>Seller Center ({sellerMenus.length})</span>
            </button>
            <button
              onClick={() => { setActivePortal('admin'); setExpandedRoute(null); }}
              className={`flex items-center gap-1.5 p-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activePortal === 'admin' 
                  ? 'bg-white shadow-2xs text-indigo-950 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Mireng ({adminMenus.length})</span>
            </button>
          </div>
        </div>

        {/* Directory Listing Grid */}
        <div className="space-y-3.5">
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Berikut detail peta navigasi lengkap menu, parameter API, penempatan tabel PostgreSQL, dan analogi persis dengan sistem marketplace andalan:
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            {currentMenus.map((menu, idx) => {
              const isExpanded = expandedRoute === menu.route;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'border-indigo-400 bg-indigo-50/10 shadow-3xs' 
                      : 'border-slate-150 bg-white hover:border-slate-250 hover:bg-slate-50/40'
                  }`}
                >
                  {/* Item Header */}
                  <button
                    onClick={() => setExpandedRoute(isExpanded ? null : menu.route)}
                    className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 selection:bg-transparent"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-[10px] font-mono font-bold bg-slate-900 text-teal-400 p-1 px-2.5 rounded border border-slate-800">
                          {menu.route}
                        </code>
                        <span className="text-slate-400 text-xs font-semibold">•</span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display truncate">{menu.title}</h4>
                      </div>
                      <p className="text-[11.5px] text-slate-500 font-sans leading-relaxed mt-1 line-clamp-2 md:line-clamp-none">
                        {menu.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                      <span className="text-[9px] font-mono font-bold uppercase bg-stone-100 border border-stone-200 text-slate-600 px-2 py-0.5 rounded">
                        {menu.analogTo.split(' ')[0]} Type
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-indigo-500' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Expanded Content Detail */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-150 space-y-4 animate-fade-in text-xs leading-relaxed">
                      
                      {/* Analog label banner */}
                      <div className="flex items-center gap-1.5 p-2 px-3 bg-indigo-50 border border-indigo-150 text-indigo-900 rounded-lg text-[11px]">
                        <Compass className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span>Inspirasi Mekanisme Sistem: <strong className="font-bold">{menu.analogTo}</strong></span>
                      </div>

                      {/* Mini Grid specifications */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Features List */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
                            🎯 Rencana Fitur Utama Lengkap :
                          </span>
                          <ul className="space-y-1.5">
                            {menu.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex gap-2 items-start text-[11px] text-slate-650 leading-relaxed font-sans">
                                <span className="text-emerald-500 font-bold flex-shrink-0">✔</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Database mapping */}
                        <div className="space-y-3.5 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-indigo-500" /> Tabel Database Terikat (PostgreSQL)
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {menu.databaseTables.map((tbl, tIdx) => (
                                <code key={tIdx} className="bg-white border border-slate-200 text-indigo-600 rounded-md p-0.5 px-2 text-[10px] font-mono leading-none">
                                  {tbl}
                                </code>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-150 space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
                              🔗 Ketergantungan Keandalan
                            </span>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
                              Seluruh rute mengandalkan verifikasi middleware keamanan di level backend demi mencegah kebocoran parameter ID pembeli maupun token merchant.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Step Action Plan Guideline */}
      <div className="bg-indigo-50/30 border border-indigo-150 rounded-2xl p-5 md:p-6 space-y-4 text-xs font-sans">
        <h3 className="font-bold text-slate-800 text-sm md:text-base font-display flex items-center gap-2">
          <span>⚙</span> Langkah Tindak Lanjut Konkrit (Rekomendasi Arsitektur Database)
        </h3>
        <p className="text-slate-600 leading-normal leading-relaxed">
          Berikut struktur visualisasi prioritas pengerjaan kode yang menjamin fungsionalitas di atas dapat terintegrasi mulus tanpa resiko tabrakan logika:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-2xs">
            <span className="text-2xl font-bold font-display text-indigo-600">01</span>
            <h5 className="font-bold text-xs text-slate-800 font-display">Tabel & Entity Core</h5>
            <p className="text-[9px] text-slate-450 leading-relaxed font-mono">Wishlists, Multi-Address, SKU Price, Brand Reg</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-2xs">
            <span className="text-2xl font-bold font-display text-indigo-400">02</span>
            <h5 className="font-bold text-xs text-slate-800 font-display">Loyalty & Username</h5>
            <p className="text-[9px] text-slate-450 leading-relaxed font-mono">30-day Cooldown, Member Level Tier Perks, Auto Sync</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-2xs">
            <span className="text-2xl font-bold font-display text-slate-300">03</span>
            <h5 className="font-bold text-xs text-slate-800 font-display">COD & Bulk Upload</h5>
            <p className="text-[9px] text-slate-450 leading-relaxed font-mono">Excel Import, Seller COD Toggles, Custom Size Charts</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-2xs">
            <span className="text-2xl font-bold font-display text-slate-300">04</span>
            <h5 className="font-bold text-xs text-slate-800 font-display">RBAC Staff Audit</h5>
            <p className="text-[9px] text-slate-450 leading-relaxed font-mono">Internal Multi-Role, Disputes Mediator, Ledger</p>
          </div>
        </div>

        <div className="flex bg-white/70 border border-slate-200/65 p-3.5 rounded-xl gap-3 text-xs leading-relaxed text-slate-600 items-start">
          <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Rancangan Struktur Menu Mireng:</strong>
            <p className="text-[11px] text-slate-500 leading-normal">
              Kami telah menyertakan detail-detail komprehensif ini ke dalam ringkasan sistem sebagai referensi implementasi nyata. Anda dapat menggunakan kustomisasi di bagian banner atas untuk mengubah nama dan warna tema website secara interaktif di browser lokal!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
