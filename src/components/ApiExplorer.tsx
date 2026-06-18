import React, { useState } from 'react';
import { MIREENG_MODULES, ApiModule } from '../data';
import { Server, Code, Play, Check, Copy, ShieldAlert, Key, Zap, CheckCircle, User, Shield, AlertTriangle, Info, Coins, Landmark, Tv } from 'lucide-react';

type RolePersona = 'Free' | 'User' | 'Seller' | 'Admin';

interface Persona {
  role: RolePersona;
  name: string;
  avatar: string;
  description: string;
  token: string;
}

const PERSONAS: Persona[] = [
  { role: 'Free', name: 'Guest (Anonymous)', avatar: '👤', description: 'Pengunjung luar / belum login.', token: '' },
  { role: 'User', name: 'Tony (Retail Buyer)', avatar: '🛍️', description: 'Pelanggan setia dengan koin melimpah.', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user-tony-session-active' },
  { role: 'Seller', name: 'Sidoarjo Pedas (Merchant)', avatar: '🌶️', description: 'Pemilik Toko penjual Mireng instan.', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.seller-sidoarjo-session-active' },
  { role: 'Admin', name: 'Super Admin Siregar', avatar: '👑', description: 'Pengatur komisi & dewan arbitrase.', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin-siregar-session-active' },
];

export default function ApiExplorer() {
  const [selectedModule, setSelectedModule] = useState<ApiModule>(MIREENG_MODULES[0]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(selectedModule.endpoints[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestLogs, setRequestLogs] = useState<string[]>([]);
  const [simulatedResponse, setSimulatedResponse] = useState<any>(null);
  const [apiSuccess, setApiSuccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // Active testing Persona/Identity
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[1]); // Default Tony

  // Dynamic state for interactive demos
  const [buyerCoins, setBuyerCoins] = useState(25000);
  const [streakDays, setStreakDays] = useState(3);
  const [coinsHistory, setCoinsHistory] = useState<any[]>([
    { id: 'coin-txn-001', amount: 1000, transaction_type: 'check_in', description: 'Bonus harian berturut hari ke-3', created_at: new Date().toISOString() }
  ]);
  const [storeBalance, setStoreBalance] = useState(1450000);
  const [lockedEscrow, setLockedEscrow] = useState(249000);
  const [pinnedProduct, setPinnedProduct] = useState('prod-1');
  const [commentsList, setCommentsList] = useState<any[]>([
    { comment_id: 'cmt-001', username: 'Tony', text: 'Mirengnya gurih banget kak!' }
  ]);
  const [feeSettings, setFeeSettings] = useState<any[]>([
    { seller_tier: 'standard', commission_rate_percent: 1.00, vat_rate_percent: 11.00 },
    { seller_tier: 'pro', commission_rate_percent: 2.00, vat_rate_percent: 11.00 },
    { seller_tier: 'enterprise', commission_rate_percent: 3.50, vat_rate_percent: 11.00 }
  ]);

  // Temporary input states for Custom Payloads
  const [inputs, setInputs] = useState({
    product_name: 'Mireng Crispy Gurih Sidoarjo',
    product_price: '18500',
    product_type: 'physical',
    aff_product_id: 'prod-sidoarjo-1',
    withdraw_amount: '500000',
    withdraw_otp: '654321',
    live_stream_title: 'Unboxing Live Mireng Ekstra Pedas!',
    live_comment: 'Diskonnya keluarkan dong kakak!',
    fee_tier: 'pro',
    fee_rate: '2.50'
  });

  const handleInputChange = (key: keyof typeof inputs, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleModuleChange = (mod: ApiModule) => {
    setSelectedModule(mod);
    setSelectedEndpoint(mod.endpoints[0]);
    setSimulatedResponse(null);
    setApiSuccess(null);
    setRequestLogs([]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeMockRequest = () => {
    setIsLoading(true);
    setSimulatedResponse(null);
    setApiSuccess(null);

    const checkAuthStatus = (): { allowed: boolean; reason: string; code: number } => {
      const required = selectedEndpoint.auth;
      if (required === 'Free') return { allowed: true, reason: 'Akses Publik', code: 200 };
      
      const currentRole = activePersona.role;
      if (currentRole === 'Admin') return { allowed: true, reason: 'Hak Akses Super Admin', code: 200 };

      if (required === 'Admin' && currentRole !== 'Admin') {
        return { allowed: false, reason: 'Hanya diizinkan untuk Role Admin Utama.', code: 403 };
      }

      if (required === 'Seller') {
        if (currentRole === 'Seller') return { allowed: true, reason: 'Autentikasi Seller Toko Valid', code: 200 };
        return { allowed: false, reason: 'Hanya diizinkan untuk Merchant/Seller terdaftar.', code: 403 };
      }

      if (required === 'User') {
        if (currentRole === 'User' || currentRole === 'Seller') return { allowed: true, reason: 'Autentikasi User Valid', code: 200 };
        return { allowed: false, reason: 'Dibutuhkan login pemegang akun token JWT.', code: 401 };
      }

      return { allowed: false, reason: 'Token tidak terdaftar.', code: 401 };
    };

    const initialLogs = [
      `⚡ [CLIENT] Mengirim HTTP ${selectedEndpoint.method} ke /api${selectedEndpoint.path}`,
      activePersona.token 
        ? `🔑 [AUTH] Menyisipkan header: Authorization: Bearer ${activePersona.token.substring(0, 36)}...` 
        : `🔓 [AUTH] Tidak menyertakan token autentikasi (Anonymous)`
    ];
    setRequestLogs(initialLogs);

    setTimeout(() => {
      const auth = checkAuthStatus();

      if (!auth.allowed) {
        // Forbidden or Unauthorized logs
        setRequestLogs(prev => [
          ...prev,
          `🚀 [NESTJS INTERCEPTOR] Menerima request di router controller...`,
          `🛡️ [GUARD] Memverifikasi hak akses pengguna untuk role: [${selectedEndpoint.auth}]`,
          `❌ [GUARD] ${auth.code === 401 ? '401 Unauthorized' : '403 Forbidden'}: ${auth.reason}`,
          `🔴 [NESTJS] Mengembalikan response error ke client.`
        ]);
        setSimulatedResponse({
          statusCode: auth.code,
          message: auth.code === 401 ? 'Unauthorized' : 'Forbidden Resource',
          error: auth.reason,
          timestamp: new Date().toISOString(),
          requestedPath: selectedEndpoint.path
        });
        setApiSuccess(false);
        setIsLoading(false);
        return;
      }

      // If authorized, process with mock business logic
      setRequestLogs(prev => [
        ...prev,
        `🚀 [NESTJS INTERCEPTOR] Menerima request di router controller...`,
        `🛡️ [GUARD] Memverifikasi hak akses pengguna untuk role: [${selectedEndpoint.auth}]`,
        `✅ [GUARD] Otorisasi berhasil! Meneruskan request ke ${selectedModule.name} Service...`,
        `🗄️ [TYPEORM] Mengeksekusi query database relasional pada PostgreSQL...`
      ]);

      setTimeout(() => {
        let finalResponse: any = {};
        const path = selectedEndpoint.path;

        // AUTH MODULE LOGIC MATCHING
        if (path === '/auth/register') {
          finalResponse = {
            success: true,
            user: { id: 'usr-new-99b', name: 'User Baru', email: 'userbaru@gmail.com', role: 'user' },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-user-token',
            expires_in: '7d',
            role_assigned: 'user'
          };
        } else if (path === '/auth/login') {
          finalResponse = {
            success: true,
            user: { id: 'usr-ton-01a', name: 'Tony Eilyaz', email: 'tonyeilyaz@gmail.com', role: 'user' },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tony-auth-key-valid',
            avatar: '🛍️'
          };
        } else if (path === '/auth/me') {
          finalResponse = {
            id: activePersona.role === 'User' ? 'usr-ton-01a' : activePersona.role === 'Seller' ? 'sel-sidoarjo-02b' : 'usr-admin-siregar',
            name: activePersona.name,
            role: activePersona.role,
            email: activePersona.role === 'User' ? 'tonyeilyaz@gmail.com' : activePersona.role === 'Seller' ? 'sidoarjo_pedas@outlook.com' : 'admin_siregar@mireng.com',
            status: 'active_session'
          };
        } 
        // PRODUCT MODULE LOGIC MATCHING
        else if (path === '/products') {
          if (selectedEndpoint.method === 'GET') {
            finalResponse = [
              { id: 'prod-1', name: 'Mireng Instan Goreng Khas Sidoarjo', price: 15000, type: 'physical', weight_g: 120 },
              { id: 'prod-2', name: 'Jasa Desain 3D Banner Mireng', price: 500000, type: 'service', seller: 'Sinar Jaya Code' },
              { id: 'prod-3', name: 'E-Book 10 Resep Mireng Rahasia', price: 45000, type: 'digital', fileSize: '4.5MB' }
            ];
          } else {
            // POST Create product
            finalResponse = {
              success: true,
              message: 'Produk Mireng berhasil didaftarkan di katalog rujukan!',
              created_product: {
                id: `prod-${Math.floor(Math.random() * 90) + 10}`,
                name: inputs.product_name,
                price: parseFloat(inputs.product_price) || 15000,
                type: inputs.product_type,
                slug: inputs.product_name.toLowerCase().replace(/ /g, '-'),
                created_at: new Date().toISOString(),
                store_id: 'sel-sidoarjo-02b'
              }
            };
          }
        } else if (path.startsWith('/products/')) {
          finalResponse = {
            id: 'prod-1',
            slug: 'mireng-instan-goreng',
            name: inputs.product_name,
            price: parseFloat(inputs.product_price) || 15000,
            type: inputs.product_type,
            description: 'Mireng pedas spesial dengan bumbu kacang gurih khas nusantara.',
            stock: 450,
            store: { id: 'sel-sidoarjo-02b', name: 'Sidoarjo Pedas', rating: 4.9 }
          };
        } 
        // ORDER MODULE LOGIC MATCHING
        else if (path === '/orders') {
          finalResponse = {
            id: `ord-${Math.floor(Math.random() * 90000) + 10000}`,
            grand_total: 45000,
            payment_token: 'snap-token-midtrans-982da91a',
            payment_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-midtrans-982da91a',
            escrow_status: 'pending',
            created_at: new Date().toISOString()
          };
        } else if (path.includes('/verify-digital')) {
          finalResponse = {
            success: true,
            order_id: 'ord-89f33b1e',
            escrow_status: 'released',
            message: 'Order item digital terkonfirmasi diunduh konsumen. Escrow dilepas otomatis!',
            released_to_seller_id: 'sel-sidoarjo-02b',
            transferred_amount_idr: 45000
          };
        } else if (path.includes('/confirm-delivery')) {
          finalResponse = {
            success: true,
            order_id: 'ord-442a9b2',
            shipping_status: 'delivered',
            escrow_status: 'released',
            verified_by: 'Tony',
            balance_gained_idr: 15000
          };
        }
        // AFFILIATE MODULE LOGIC
        else if (path === '/affiliate/generate-link') {
          const promoCode = `mire-${activePersona.name.substring(0, 3).toLowerCase()}-${Math.floor(Math.random() * 900) + 100}`;
          finalResponse = {
            referral_code: promoCode,
            product_id: inputs.aff_product_id,
            affiliate_url: `https://mireng.com/products/${inputs.aff_product_id}?ref=${promoCode}`,
            commission_percent: '5% Flat',
            estimated_commission_per_sale: 925,
            referrer_id: 'usr-ton-01a'
          };
        } else if (path === '/affiliate/dashboard-stats') {
          finalResponse = {
            referrer_id: 'usr-ton-01a',
            total_clicks: 142,
            successful_orders: 8,
            conversion_rate: '5.63%',
            commission_earned_idr: 74000,
            streak_bonus_active: true
          };
        } else if (path === '/admin/affiliate/payout') {
          finalResponse = {
            payout_batch_id: 'pay-bat-990a',
            status: 'processed',
            total_users_paid: 12,
            total_payout_idr: 4500000,
            tax_withheld_idr: 45000,
            audited_by_admin: 'Super Admin Siregar'
          };
        }
        // COINS & LOYALTY MODULE LOGIC
        else if (path === '/coins/daily-check-in') {
          const reward = (streakDays + 1) * 100;
          setBuyerCoins(prev => prev + reward);
          setStreakDays(prev => prev + 1);
          const newTxn = {
            id: `coin-txn-${Math.floor(Math.random() * 9000) + 1000}`,
            amount: reward,
            transaction_type: 'check_in',
            description: `Check-in harian berturut hari ke-${streakDays + 1}`,
            created_at: new Date().toISOString()
          };
          setCoinsHistory(prev => [newTxn, ...prev]);

          finalResponse = {
            success: true,
            claimed_coins: reward,
            current_total_coins: buyerCoins + reward,
            streak_days: streakDays + 1,
            next_day_claimable_coins: Math.min((streakDays + 2) * 100, 1000)
          };
        } else if (path === '/coins/wallet-history') {
          finalResponse = coinsHistory.map(txn => ({
            id: txn.id,
            amount: txn.amount,
            transaction_type: txn.transaction_type,
            description: txn.description,
            created_at: txn.created_at
          }));
        } else if (path === '/coins/redeem-voucher') {
          if (buyerCoins < 10000) {
            finalResponse = {
              success: false,
              message: 'Koin tidak mencukupi untuk penukaran voucher hemat Rp 10.000 (Butuh 10.000 Koin).'
            };
          } else {
            setBuyerCoins(prev => prev - 10000);
            const newTxn = {
              id: `coin-txn-${Math.floor(Math.random() * 9000) + 1000}`,
              amount: -10000,
              transaction_type: 'checkout_redeem',
              description: 'Tukar 10.000 Koin dengan Voucher Potongan Hemat10K',
              created_at: new Date().toISOString()
            };
            setCoinsHistory(prev => [newTxn, ...prev]);
            finalResponse = {
              success: true,
              voucher_code: 'KOINHEMAT10K',
              deducted_coins: 10000,
              remaining_coins: buyerCoins - 10000,
              expiry_date: new Date(Date.now() + 86400000 * 7).toISOString()
            };
          }
        }
        // SELLER WALLET & FINANCE MODULE LOGIC
        else if (path === '/seller/wallet/balance') {
          finalResponse = {
            store_id: 'sel-sidoarjo-02b',
            active_balance: storeBalance,
            locked_escrow_balance: lockedEscrow,
            bank_registered: 'Bank Central Asia (BCA)',
            account_number: '812XXXX19'
          };
        } else if (path === '/seller/wallet/withdraw') {
          const amt = parseFloat(inputs.withdraw_amount) || 500000;
          if (amt > storeBalance) {
            finalResponse = {
              success: false,
              message: 'Saldo toko tersedia tidak mencukupi untuk melakukan penarikan sebesar Rp ' + amt.toLocaleString('id-ID')
            };
          } else {
            finalResponse = {
              withdrawal_id: 'wd-723a-f1',
              requested_amount: amt,
              service_fee_deducted: 6500,
              final_disbursement: amt - 6500,
              status: 'pending_otp',
              otp_sent_to: '0812****231',
              expiry_seconds: 120,
              message: 'OTP verifikasi keamanan dikirim ke SMS Anda. Selesaikan dalam 2 menit.'
            };
          }
        } else if (path === '/seller/wallet/confirm-otp') {
          const amt = parseFloat(inputs.withdraw_amount) || 500000;
          if (inputs.withdraw_otp !== '654321') {
            finalResponse = {
              success: false,
              message: 'Kode OTP yang Anda masukkan salah atau sudah kadaluwarsa (Coba gunakan OTP default: 654321)'
            };
          } else {
            setStoreBalance(prev => Math.max(0, prev - amt));
            finalResponse = {
              success: true,
              withdrawal_id: 'wd-723a-f1',
              status: 'completed',
              disbursed_to: 'BCA (Toko Sidoarjo)',
              amount_withdrawn: amt,
              remaining_store_balance: storeBalance - amt,
              transferred_at: new Date().toISOString()
            };
          }
        }
        // LIVE STREAMING MODULE LOGIC
        else if (path === '/seller/live/start') {
          finalResponse = {
            session_id: 'liv-sidoarjo-04b12',
            rtmp_url: 'rtmp://live.mireng.com/app',
            stream_key: 'stream_key_sidoarjo_enc_990a1b',
            title: inputs.live_stream_title,
            viewer_count_peak: 0,
            status: 'ready_broadcast'
          };
        } else if (path === '/seller/live/pin-product') {
          setPinnedProduct(inputs.aff_product_id);
          finalResponse = {
            success: true,
            broadcast_event: 'PINNED_PRODUCT_CHANGED',
            session_id: 'liv-sidoarjo-04b12',
            pinned_product: {
              id: inputs.aff_product_id,
              name: inputs.aff_product_id === 'prod-sidoarjo-1' ? 'Mireng Instan Sidoarjo' : 'Sajian Kreatif Lainnya',
              price: 15000,
              discount_flash_live: '10%'
            },
            timestamp: new Date().toISOString()
          };
        } else if (path === '/live/comment') {
          const newComment = {
            comment_id: `cmt-${Math.floor(Math.random() * 900) + 100}`,
            username: activePersona.name.split(' ')[0],
            text: inputs.live_comment
          };
          setCommentsList(prev => [...prev, newComment]);
          finalResponse = {
            success: true,
            comment_id: newComment.comment_id,
            total_active_chats: commentsList.length + 1,
            broadcasted: true
          };
        }
        // ADMIN PLATFORM settings MODULE LOGIC
        else if (path === '/admin/settings/fees') {
          if (selectedEndpoint.method === 'GET') {
            finalResponse = feeSettings;
          } else {
            // PUT update fees
            const rate = parseFloat(inputs.fee_rate) || 2.00;
            setFeeSettings(prev => prev.map(f => {
              if (f.seller_tier === inputs.fee_tier) {
                return { ...f, commission_rate_percent: rate };
              }
              return f;
            }));
            finalResponse = {
              success: true,
              message: `Fee platform komisi berhasil diubah oleh admin !`,
              updated_setting: {
                seller_tier: inputs.fee_tier,
                new_commission_rate: `${rate}%`,
                vat_rate: '11.00%',
                effective_from: new Date().toISOString()
              }
            };
          }
        } else if (path === '/admin/audit/escrow') {
          finalResponse = {
            total_held_escrow_tokens: 12,
            held_amount_idr: lockedEscrow,
            audit_status: 'HEALTHY',
            dispute_sessions_active: 0,
            audited_by: 'Super Admin Siregar',
            timestamp: new Date().toISOString()
          };
        } else {
          // Standard fallback
          finalResponse = JSON.parse(selectedEndpoint.response);
        }

        setRequestLogs(prev => [
          ...prev,
          `📦 [SERVICE] Memroses logika bisnis, mengemas DTO, dan mengembalikan model...`,
          `✨ [NESTJS RESPONSE] Menyaring response dengan serializer standar...`,
          `🟢 [NESTJS] Mengembalikan HTTP status 200 OK ke client.`
        ]);
        setSimulatedResponse(finalResponse);
        setApiSuccess(true);
        setIsLoading(false);
      }, 700);

    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in p-1">
      {/* Sidebar - Modules list & Session identities */}
      <div className="lg:col-span-4 space-y-4">
        {/* Session Persona Switcher */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-xs md:text-sm font-display">
              Pilih Identitas Sesi Akun
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Peta jalan Mireng menguji proteksi rute di bawah. Ganti role untuk menguji validasi Guard &amp; Otorisasi.
          </p>

          <div className="grid grid-cols-1 gap-1.5">
            {PERSONAS.map(p => (
              <button
                key={p.role}
                onClick={() => {
                  setActivePersona(p);
                  setSimulatedResponse(null);
                  setApiSuccess(null);
                  setRequestLogs([]);
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition border ${
                  activePersona.role === p.role 
                    ? 'bg-indigo-600/5 border-indigo-400 font-bold text-indigo-900 shadow-3xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-base">{p.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-display truncate text-[11px]">{p.name}</span>
                    <span className="text-[8px] uppercase font-mono px-1 bg-slate-100 rounded text-slate-500 font-bold">{p.role}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-normal truncate">{p.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Balance Indicators */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-amber-50/50 p-1.5 rounded border border-amber-200/50 flex flex-col">
              <span className="text-amber-700 text-[8px] font-sans font-bold uppercase">Koin Tony</span>
              <span className="font-bold text-amber-900">{buyerCoins.toLocaleString('id-ID')} Koin</span>
            </div>
            <div className="bg-emerald-50/50 p-1.5 rounded border border-emerald-200/50 flex flex-col">
              <span className="text-emerald-700 text-[8px] font-sans font-bold uppercase">Saldo Seller</span>
              <span className="font-bold text-emerald-900">Rp {storeBalance.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Modules Navigation */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 shadow-2xs">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-emerald-500" /> Modular NestJS Controller
          </h3>

          <div className="space-y-1.5">
            {MIREENG_MODULES.map((mod) => (
              <button
                key={mod.name}
                onClick={() => handleModuleChange(mod)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition border flex flex-col gap-1 ${
                  selectedModule.name === mod.name
                    ? 'bg-slate-50 border-indigo-500 text-slate-900 font-semibold shadow-4xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50/80 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedModule.name === mod.name ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="font-display text-[11px]">{mod.name}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-normal line-clamp-1 truncate">{mod.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container - Endpoint specifications & Live Playground */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Router specs */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wide bg-indigo-50 px-2 py-0.5 rounded-full">Katalog API Swagger</span>
            <h3 className="font-bold text-slate-800 text-base font-display mt-1">
              Rute API: {selectedModule.name}
            </h3>
            <p className="text-xs text-slate-500">{selectedModule.description}</p>
          </div>

          <div className="space-y-2">
            {selectedModule.endpoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setSimulatedResponse(null);
                  setApiSuccess(null);
                  setRequestLogs([]);
                }}
                className={`w-full flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl border text-left transition ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-indigo-50/30 border-indigo-400 shadow-3xs'
                    : 'bg-white border-slate-150 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase min-w-[62px] text-center ${
                    ep.method === 'GET' ? 'bg-sky-50 text-sky-600 border border-sky-200' :
                    ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {ep.method}
                  </span>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800">{ep.path}</span>
                    <p className="text-[11px] text-slate-500 font-sans">{ep.description}</p>
                  </div>
                </div>

                <div className="mt-2 md:mt-0 flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    ep.auth === 'Free' ? 'bg-slate-100 text-slate-600 border border-slate-200/50' :
                    ep.auth === 'User' ? 'bg-blue-100 text-blue-700 border border-blue-200/50' :
                    ep.auth === 'Seller' ? 'bg-purple-100 text-purple-700 border border-purple-200/50' :
                    'bg-rose-100 text-rose-700 border border-rose-200/50'
                  }`}>
                    Guard: {ep.auth}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Card (Editable payload fields) */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 shadow-2xs">
          <h4 className="font-bold text-slate-800 text-xs font-display flex items-center gap-1">
            <Code className="w-3.5 h-3.5 text-indigo-500" /> Sesuaikan Payload Request (Body/Params)
          </h4>
          <p className="text-[10px] text-slate-500">Sesuaikan parameter di bawah agar demo Swagger menyesuaikan input Anda secara dinamis.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-150">
            {/* Products Inputs */}
            {selectedModule.name === 'Product Module' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Nama Produk</label>
                  <input
                    type="text"
                    value={inputs.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Harga (IDR)</label>
                  <input
                    type="number"
                    value={inputs.product_price}
                    onChange={(e) => handleInputChange('product_price', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {/* Affiliate Inputs */}
            {selectedModule.name === 'Affiliate & Referrals Module' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Product UUID Referal</label>
                  <select
                    value={inputs.aff_product_id}
                    onChange={(e) => handleInputChange('aff_product_id', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded focus:outline-hidden"
                  >
                    <option value="prod-sidoarjo-1">Mireng Crispy Gurih Sidoarjo</option>
                    <option value="prod-service-3d">Desain 3D Promosi Mireng</option>
                    <option value="prod-digital-book">E-book Resep Saus Mireng</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Nama Afiliator</label>
                  <input
                    type="text"
                    disabled
                    value={activePersona.name}
                    className="w-full bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden text-slate-500 font-semibold"
                  />
                </div>
              </>
            )}

            {/* Seller Finance Inputs */}
            {selectedModule.name === 'Seller Wallet & Finance Module' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Jumlah Tarik Saldo (Max {storeBalance.toLocaleString('id-ID')})</label>
                  <input
                    type="number"
                    value={inputs.withdraw_amount}
                    onChange={(e) => handleInputChange('withdraw_amount', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Kode OTP Verifikasi (Default SMS: 654321)</label>
                  <input
                    type="text"
                    placeholder="Minta OTP dahulu, lalu isi 654321"
                    value={inputs.withdraw_otp}
                    onChange={(e) => handleInputChange('withdraw_otp', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden font-mono"
                  />
                </div>
              </>
            )}

            {/* Live Streaming Inputs */}
            {selectedModule.name === 'Live Streaming & Video Shopping Module' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Judul Siaran Langsung Seller</label>
                  <input
                    type="text"
                    value={inputs.live_stream_title}
                    onChange={(e) => handleInputChange('live_stream_title', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Isi Chat Live Demo</label>
                  <input
                    type="text"
                    value={inputs.live_comment}
                    onChange={(e) => handleInputChange('live_comment', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {/* Admin Commission Inputs */}
            {selectedModule.name === 'Admin Platform settings & Commission Module' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">Tier Merchant Target</label>
                  <select
                    value={inputs.fee_tier}
                    onChange={(e) => handleInputChange('fee_tier', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded"
                  >
                    <option value="standard">Standard (Awal)</option>
                    <option value="pro">Pro Merchant</option>
                    <option value="enterprise">Enterprise Mitra</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-bold text-slate-600">% Biaya Layanan Baru</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.fee_rate}
                    onChange={(e) => handleInputChange('fee_rate', e.target.value)}
                    className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded"
                  />
                </div>
              </>
            )}

            {/* Auth / default fallback */}
            {['Auth Module', 'Order & Escrow System'].includes(selectedModule.name) && (
              <div className="col-span-2 text-center text-slate-400 font-sans text-[11px] py-1">
                💡 Rute dari module ini menangani sesi JWT dan otentikasi escrow belanja Mireng secara internal.
              </div>
            )}
          </div>
        </div>

        {/* API Playground Simulator Console */}
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-xs md:text-sm font-display flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-350" /> Playground Konsol Swagger &amp; NestJS Guard Gate
              </h3>
              <p className="text-[10px] text-slate-400">Tekan Kirim Request untuk mensimulasikan alur verifikasi interceptor NestJS dan query real-time.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-semibold font-mono bg-slate-100 px-2 py-1 rounded">Sesi: {activePersona.role}</span>
              <button
                onClick={executeMockRequest}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isLoading ? 'Memproses...' : 'Kirim Request'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logs Console */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wide">Terminal Logs (NestJS Backend Pipeline)</span>
                {apiSuccess !== null && (
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${apiSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {apiSuccess ? 'SUCCESS 200' : 'GUARD REJECTED'}
                  </span>
                )}
              </div>
              
              <div className="bg-slate-950 p-3.5 rounded-xl h-[200px] overflow-y-auto font-mono text-[9px] text-zinc-300 space-y-1.5 border border-slate-800/20 leading-relaxed shadow-inner">
                {requestLogs.map((log, lIdx) => (
                  <div key={lIdx} className="transition-all">
                    <span className="text-zinc-500 select-none">❯ </span>
                    <span className={
                      log.includes('🛡️') ? 'text-amber-400' :
                      log.includes('❌') ? 'text-rose-400 font-bold' :
                      log.includes('✅') ? 'text-emerald-400' :
                      log.includes('🔑') ? 'text-indigo-400' :
                      'text-zinc-300'
                    }>{log}</span>
                  </div>
                ))}
                {requestLogs.length === 0 && (
                  <div className="text-zinc-500 flex flex-col items-center justify-center h-full text-center gap-1 p-2">
                    <Info className="w-4 h-4 text-indigo-400/60" />
                    <span>Konsol log kosong. Pilih identitas sesi akun di sidebar kiri, sesuaikan parameter, lalu klik &quot;Kirim Request&quot;!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated JSON response */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wide">Swagger JSON Response Standard</span>
              <div className="bg-slate-950 p-3.5 rounded-xl h-[200px] overflow-y-auto font-mono text-[10px] text-emerald-400 border border-slate-800/20 shadow-inner">
                {simulatedResponse ? (
                  <pre className={apiSuccess ? 'text-emerald-400' : 'text-rose-400/90'}>{JSON.stringify(simulatedResponse, null, 2)}</pre>
                ) : (
                  <div className="text-indigo-400/50 flex flex-col items-center justify-center h-full gap-1 text-center bg-indigo-950/5 rounded-lg border border-indigo-900/10 p-2">
                    <span>{isLoading ? '⏳ Memproses response...' : '📦 Response standard JSON akan tampil di sini.'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controller Code overview section */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-xs font-display flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-indigo-500" /> Contoh Source Code Controller (NestJS Framework)
            </h4>
            <button
              onClick={() => handleCopy(selectedModule.nestjsBoilerplate)}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? 'Tersalin!' : 'Copy Controller'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Boilerplate sesungguhnya dari berkas NestJS yang mengontrol endpoint di atas. Controller ini dilengkapi Guard Role untuk perlindungan berlapis.
          </p>
          <pre className="p-3 bg-slate-950 text-slate-350 text-[9px] rounded-lg font-mono overflow-x-auto max-h-[160px] leading-relaxed border border-slate-800">
            <code>{selectedModule.nestjsBoilerplate}</code>
          </pre>
        </div>

      </div>
    </div>
  );
}
