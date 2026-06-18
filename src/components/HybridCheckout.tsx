import React, { useState } from 'react';
import { ShoppingCart, Store, Package, Download, Calendar, ArrowRight, RefreshCw, LogIn, AlertCircle, ShieldCheck, Check, Coins } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'physical' | 'digital' | 'service';
  storeId: string;
  storeName: string;
  weightG?: number;
  quantity: number;
}

export default function HybridCheckout() {
  // Mock store catalogue
  const catalogue: CartItem[] = [
    { id: 'prod-1', name: 'Mireng Instan Goreng (Fisik)', price: 15000, type: 'physical', storeId: 'store-a', storeName: 'Grosir Sinar Baru', weightG: 180, quantity: 1 },
    { id: 'prod-2', name: 'Mireng Source Code Next16 Boilerplate (Digital)', price: 249000, type: 'digital', storeId: 'store-b', storeName: 'Digital Aurora Tech', quantity: 1 },
    { id: 'prod-3', name: 'Jasa Set-Up Server NestJS & PostgreSQL (Jasa)', price: 499000, type: 'service', storeId: 'store-a', storeName: 'Grosir Sinar Baru', quantity: 1 }
  ];

  const [cart, setCart] = useState<CartItem[]>(catalogue);
  const [shippingMethod, setShippingMethod] = useState<Record<string, { name: string; cost: number }>>({});
  const [schedules, setSchedules] = useState<Record<string, string>>({});
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Gamification & loyalty coins system
  const [buyerCoins, setBuyerCoins] = useState(25000); // Start with 25,000 Coins (worth RP 25.000)
  const [useCoins, setUseCoins] = useState(false);

  // Checkout transaction states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [orderState, setOrderState] = useState<{
    id: string;
    total: number;
    finalDiscount: number;
    coinsRedeemed: number;
    shipping: number;
    grandTotal: number;
    paymentStatus: 'pending' | 'paid';
    shippingStatus: 'none' | 'delivered';
    escrowState: 'held' | 'released' | 'refunded';
    vendorBalances: Record<string, number>;
  } | null>(null);

  const getSubtotal = (): number => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const getShippingFee = (): number => (Object.values(shippingMethod) as any[]).reduce((acc: number, sh: any) => acc + sh.cost, 0);

  // Coins offset: 1 coin = Rp 1 deduction, max 25% of the post-voucher subtotal + shipping to protect margin
  const getCoinsDiscount = (): number => {
    if (!useCoins) return 0;
    const baseTotal = getSubtotal() + getShippingFee() - discount;
    const maxDiscountAllowed = Math.round(baseTotal * 0.25);
    return Math.min(buyerCoins, maxDiscountAllowed);
  };

  const getGrandTotal = (): number => {
    const baseTotal = getSubtotal() + getShippingFee() - discount;
    return baseTotal - getCoinsDiscount();
  };

  const addQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx > -1) {
        return prev.map((pr, pIdx) => pIdx === idx ? { ...pr, quantity: pr.quantity + 1 } : pr);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const applyVoucher = () => {
    if (voucherCode.toUpperCase() === 'MIRENGMERDEKA') {
      const sub = getSubtotal();
      setDiscount(Math.round(sub * 0.20)); // 20% Discount
      setVoucherApplied(true);
    } else {
      alert('Voucher tidak ditemukan. Coba masukkan: MIRENGMERDEKA');
    }
  };

  const triggerCheckout = () => {
    // Check constraints: shipping must be selected for stores with physical products
    const storePhysicalMap: Record<string, boolean> = {};
    cart.forEach(item => {
      if (item.type === 'physical') {
        storePhysicalMap[item.storeName] = true;
      }
    });

    for (const storeName of Object.keys(storePhysicalMap)) {
      if (!shippingMethod[storeName]) {
        alert(`Harap pilih opsi kurir pengiriman untuk Toko: ${storeName}`);
        return;
      }
    }

    // Check service products schedule
    const storeServiceMap: Record<string, boolean> = {};
    cart.forEach(item => {
      if (item.type === 'service') {
        storeServiceMap[item.storeName] = true;
      }
    });

    for (const storeName of Object.keys(storeServiceMap)) {
      if (!schedules[storeName]) {
        alert(`Harap atur tanggal booking layanan untuk Toko: ${storeName}`);
        return;
      }
    }

    if (cart.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }

    // Trigger simulator
    setPaymentPopup(true);
  };

  // Simulating payment completion via mock Midtrans
  const finalizePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sub = getSubtotal();
      const ship = getShippingFee();
      const disc = discount;
      const coinsRedeemTotal = getCoinsDiscount();
      const gt = getGrandTotal();

      // Deduct coins from user balance if used
      if (useCoins) {
        setBuyerCoins(prev => Math.max(0, prev - coinsRedeemTotal));
      }

      setOrderState({
        id: `ord-${Math.floor(Math.random() * 900000) + 100000}`,
        total: sub,
        finalDiscount: disc,
        coinsRedeemed: coinsRedeemTotal,
        shipping: ship,
        grandTotal: gt,
        paymentStatus: 'paid',
        shippingStatus: 'none',
        escrowState: 'held', // Funds locked in escrow
        vendorBalances: {
          'store-a': 0, // Held
          'store-b': 0  // Held
        }
      });
      setPaymentPopup(false);
      setIsProcessing(false);
    }, 1200);
  };

  // Releases escrow funds for digital items or physical confirm delivered
  const releaseEscrowFunds = (storeId: string, amount: number) => {
    if (!orderState) return;
    setOrderState(prev => {
      if (!prev) return null;
      const isBothReleased = prev.vendorBalances[storeId === 'store-a' ? 'store-b' : 'store-a'] > 0;
      return {
        ...prev,
        escrowState: isBothReleased ? 'released' : 'held',
        vendorBalances: {
          ...prev.vendorBalances,
          [storeId]: prev.vendorBalances[storeId] + amount
        }
      };
    });
  };

  const resetAll = () => {
    setCart(catalogue);
    setShippingMethod({});
    setSchedules({});
    setDiscount(0);
    setVoucherCode('');
    setVoucherApplied(false);
    setUseCoins(false);
    setOrderState(null);
  };

  // Grouping items in cart by vendor store
  const groupedCart: Record<string, CartItem[]> = {};
  cart.forEach(item => {
    if (!groupedCart[item.storeName]) {
      groupedCart[item.storeName] = [];
    }
    groupedCart[item.storeName].push(item);
  });

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header and top alerts */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" /> Simulator Alur Transaksi Hybrid (Fisik, Digital & Jasa)
          </h2>
          <p className="text-xs text-slate-500">Demo interaktif bagaimana sistem multvendor memotong ongkir RajaOngkir, mengikat dana di Escrow, dan membayar virtual account Midtrans.</p>
        </div>
        {(orderState || cart.length === 0) && (
          <button 
            onClick={resetAll}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mulai Ulang Demo</span>
          </button>
        )}
      </div>

      {!orderState ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CATALOGUE SECTION */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm font-display">📦 Pilih Produk Demonstrasi</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Klik salah satu variasi di bawah untuk memasukkannya ke dalam keranjang pengujian.</p>
              
              <div className="space-y-2.5">
                {catalogue.map(item => (
                  <div key={item.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <div className="space-y-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                          item.type === 'physical' ? 'bg-indigo-50 text-indigo-600' :
                          item.type === 'digital' ? 'bg-sky-50 text-sky-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.type === 'physical' ? 'Fisik' : item.type === 'digital' ? 'Digital' : 'Jasa'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 leading-normal line-clamp-2">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Store: {item.storeName}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold py-1.5 rounded text-[10px] transition-colors"
                    >
                      + Tambah ke Keranjang
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE CART & SETTING MULTI-TABS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-indigo-500" /> Detail Keranjang (Terbagi Per-Toko Penjual)
                </h3>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                  {cart.length} Jenis Produk
                </span>
              </div>

              {Object.keys(groupedCart).length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <p>Keranjang belanja kosong! Silakan tambahkan beberapa produk di modul kiri.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedCart).map(([storeName, items]) => (
                    <div key={storeName} className="border border-slate-150 rounded-xl p-4 space-y-3 bg-white/50">
                      {/* Store header label */}
                      <div className="flex items-center gap-1.5 pb-2 border-b border-dashed border-slate-150">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">{storeName}</span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2.5">
                        {items.map(item => (
                          <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 text-xs bg-white p-2.5 rounded-lg border border-slate-100/70">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-800 block leading-tight">{item.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="capitalize">{item.type}</span>
                                {item.weightG && <span>• {item.weightG}g</span>}
                                <span>• Rp {item.price.toLocaleString('id-ID')}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-0 border-slate-50 w-full sm:w-auto">
                              <div className="flex items-center gap-2 border border-slate-200 rounded bg-slate-50">
                                <button className="px-1.5 py-0.5 text-slate-400 hover:text-slate-800 text-xs font-bold" onClick={() => addQty(item.id, -1)}>-</button>
                                <span className="text-[11px] font-mono font-bold text-slate-800 min-w-[12px] text-center">{item.quantity}</span>
                                <button className="px-1.5 py-0.5 text-slate-400 hover:text-slate-800 text-xs font-bold" onClick={() => addQty(item.id, 1)}>+</button>
                              </div>
                              <span className="font-bold text-slate-900 font-mono min-w-[70px] text-right">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Store dynamic requirements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Physical Courier Selector (RajaOngkir Simulation) */}
                        {items.some(i => i.type === 'physical') && (
                          <div className="space-y-1 bg-indigo-50/40 p-2.5 border border-indigo-100/30 rounded-lg">
                            <label className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                              <Package className="w-3 h-3" /> Kurir Toko (Fisik)
                            </label>
                            <select
                              value={shippingMethod[storeName]?.name || ''}
                              onChange={(e) => {
                                const selected = e.target.value;
                                let cost = 0;
                                if (selected === 'jne') cost = 12000;
                                if (selected === 'jnt') cost = 15000;
                                if (selected === 'sameday') cost = 22000;
                                setShippingMethod(prev => ({
                                  ...prev,
                                  [storeName]: { name: selected, cost }
                                }));
                              }}
                              className="w-full text-[11px] border border-slate-200 p-1.5 rounded bg-white text-slate-700"
                            >
                              <option value="">-- Pilih Kurir Vendor --</option>
                              <option value="jne">JNE REG (2-3 Hari) - Rp 12.000</option>
                              <option value="jnt">J&T Express (1-2 Hari) - Rp 15.000</option>
                              <option value="sameday">GoSend Sameday - Rp 22.000</option>
                            </select>
                          </div>
                        )}

                        {/* Service DateTime Scheduler */}
                        {items.some(i => i.type === 'service') && (
                          <div className="space-y-1 bg-emerald-50/40 p-2.5 border border-emerald-100/30 rounded-lg">
                            <label className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Jadwalkan Pertemuan Jasa
                            </label>
                            <input
                              type="datetime-local"
                              value={schedules[storeName] || ''}
                              onChange={(e) => setSchedules(prev => ({
                                ...prev,
                                [storeName]: e.target.value
                              }))}
                              className="w-full text-[10px] border border-slate-200 p-1.5 rounded bg-white text-emerald-800 font-medium"
                            />
                          </div>
                        )}

                        {/* Digital Disclaimer */}
                        {items.every(i => i.type === 'digital') && (
                          <div className="col-span-2 bg-sky-50/40 p-2.5 border border-sky-100/30 rounded-lg flex items-center gap-2 text-[10px] text-sky-700">
                            <Download className="w-4 h-4 text-sky-500 flex-shrink-0" />
                            <span><strong>Item Digital Instan:</strong> Tidak membutuhkan kurir fisik. Berkas akan terkirim otomatis setalah konfirmasi bayar.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Pricing and Vouchers */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voucher Input & Loyalty Coins card */}
                    <div className="space-y-4">
                      {/* Brand Voucher */}
                      <div className="space-y-1.5 p-3.5 border border-slate-150 rounded-xl bg-slate-50/40">
                        <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Gunakan Kode Voucher</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: MIRENGMERDEKA"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="flex-1 text-xs border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-hidden bg-white"
                          />
                          <button
                            onClick={applyVoucher}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Terapkan
                          </button>
                        </div>
                        {voucherApplied && <p className="text-[10px] text-emerald-600 font-semibold">✓ Voucher MIRENGMERDEKA berhasil (Potongan 20%)</p>}
                      </div>

                      {/* Gamified Coins Loyalty Wallet Card */}
                      <div className="p-3.5 border border-amber-200/50 rounded-xl bg-amber-50/40 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-500 fill-amber-300" />
                            <span className="text-xs font-bold text-slate-800">Koin Loyalty Mireng</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-amber-100/60 text-amber-800 px-2 py-0.5 rounded-full">
                            Saldo: {buyerCoins.toLocaleString('id-ID')} Koin
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="relative flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={useCoins} 
                              onChange={(e) => setUseCoins(e.target.checked)}
                              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500" 
                            />
                            <span className="ml-2 text-[11px] font-bold text-slate-700">
                              Tukarkan Koin (Maks. Potongan 25%)
                            </span>
                          </label>
                        </div>

                        {/* Extra Claim Reward Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-amber-200/30">
                          <span className="text-[9px] text-slate-500">Koin kurang? Ambil bonus harian:</span>
                          <button
                            onClick={() => {
                              setBuyerCoins(prev => prev + 5000);
                              alert('Selamat! Anda mendapatkan bonus +5.000 Koin Loyalty Mireng!');
                            }}
                            className="text-[9px] font-mono font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                          >
                            +5.000 Koin Instan
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Calculation */}
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 font-mono text-[11px] space-y-1.5 h-fit">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal Belanja:</span>
                        <span className="text-slate-800">Rp {getSubtotal().toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Biaya Kirim:</span>
                        <span className="text-slate-800">Rp {getShippingFee().toLocaleString('id-ID')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Diskon Voucher (20%):</span>
                          <span>- Rp {discount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {useCoins && getCoinsDiscount() > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span>Redeem Koin Mireng (1:1):</span>
                          <span>- Rp {getCoinsDiscount().toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-200/50 pt-2 text-xs font-bold font-sans text-slate-900">
                        <span>Total Pembayaran:</span>
                        <span>Rp {getGrandTotal().toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary submit action button */}
                  <button
                    onClick={triggerCheckout}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-xs"
                  >
                    <span>Lanjutkan Checkout Multi-Vendor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ESCROW holds & Release visualization screen */
        <div className="rounded-xl border border-slate-150 bg-white p-5 space-y-6 shadow-xs animate-fade-in">
          {/* Header invoice and stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded">Invoice: {orderState.id}</span>
                <span className="text-xs font-bold font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Pembayaran PAID via Midtrans
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-base font-display mt-2">Pelepasan Dana Escrow Multi-Vendor</h3>
              <p className="text-[11px] text-slate-500 mt-1">Status: Dana ditahan sementara oleh platform (Escrow Held) demi perlindungan konsumen.</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono">GRAND TOTAL PAID</span>
              <p className="text-lg font-bold font-mono text-zinc-900">Rp {orderState.grandTotal.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ESCROW HOLDING VISUAL ENGINE */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide text-indigo-500 font-mono">Alur Pemicu Pelepasan Dana (Escrow)</h4>
              
              <div className="space-y-3">
                {cart.map(item => {
                  const itemTotal = item.price * item.quantity;
                  const isReleased = orderState.vendorBalances[item.storeId] > 0;

                  return (
                    <div key={item.id} className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tipe: {item.type}</span>
                          <h4 className="font-bold text-slate-800 text-xs mt-0.5">{item.name}</h4>
                          <p className="text-[10px] text-emerald-600 font-medium">Store: {item.storeName}</p>
                        </div>
                        <span className="font-bold font-mono text-xs text-slate-900">Rp {itemTotal.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-150/50">
                        {/* Status label */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${isReleased ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className="text-[11px] font-semibold text-slate-600">
                            {isReleased ? `Dana Cair ke Dompet Toko` : `Dana Tertahan di Escrow`}
                          </span>
                        </div>

                        {/* Interactive button to confirm */}
                        {!isReleased ? (
                          <button
                            onClick={() => releaseEscrowFunds(item.storeId, itemTotal)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs`}
                          >
                            {item.type === 'physical' && <span>Konfirmasi Kiriman Sampai</span>}
                            {item.type === 'digital' && <span>Konfirmasi File Downloaded</span>}
                            {item.type === 'service' && <span>Konfirmasi Jasa Selesai</span>}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold font-sans text-xs flex items-center gap-0.5 bg-emerald-50 px-2 py-1 rounded">
                            <Check className="w-3.5 h-3.5" /> SUKSES
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PLATFORM ESCROW INSIGHTS & BALANCES */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide text-indigo-500 font-mono">Platform Escrow State</h4>
              
              <div className="border border-slate-150 rounded-xl bg-slate-900 p-5 text-white/90 space-y-4 shadow-md relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-mono text-indigo-300 font-semibold tracking-wider">PLATFORM SYSTEM ESCROW VAULT</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold">
                      Rp {Math.max(0, orderState.grandTotal - (Object.values(orderState.vendorBalances) as number[]).reduce((s, b) => s + b, 0)).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-bold font-mono">TERKUNCI</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400 relative z-10">
                  <span className="font-bold text-slate-300 block">Saldo Toko Penjual (Escrow Release):</span>
                  
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded">
                      <span>🏪 Grosir Sinar Baru (Store A)</span>
                      <strong className="text-emerald-400">Rp {orderState.vendorBalances['store-a'].toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded">
                      <span>🏪 Digital Aurora Tech (Store B)</span>
                      <strong className="text-emerald-400">Rp {orderState.vendorBalances['store-b'].toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-indigo-200 leading-normal relative z-10">
                  Escrow menjamin keamanan dana konsumen. Toko A dan Toko B baru dapat mencairkan dana ke <code className="bg-slate-800 px-1 rounded">store.balance</code> masing-masing setelah pemesan mengonfirmasi pemenuhan transaksi di atas.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MIDTRANS SNAP MODAL SIMULATOR */}
      {paymentPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full space-y-5 shadow-2xl animate-scale-up text-center">
            {/* Snap Payment logo */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
              ⚡ Midtrans SNAP Simulator
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono">ID TRANSAKSI: MID-{Math.floor(Math.random() * 8999) + 1000}</span>
              <h3 className="font-bold text-slate-800 font-display text-lg">Konfirmasi Pembayaran Anda</h3>
              <p className="text-xs text-slate-500">Mireng menggunakan payment gateway Midtrans virtual account untuk mempercepat konfirmasi secara otomatis.</p>
            </div>

            {/* Pay Amount */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Jumlah Pembayaran</span>
              <p className="text-lg font-bold text-slate-900">
                Rp {(getSubtotal() + getShippingFee() - discount).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={finalizePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-xs flex justify-center items-center gap-2 shadow-xs"
              >
                <span>{isProcessing ? 'Verifikasi Virtual Account...' : 'Konfirmasi & Selesaikan Bayar (PAID)'}</span>
              </button>
              <button
                onClick={() => setPaymentPopup(false)}
                className="w-full text-slate-500 hover:text-slate-800 font-semibold py-2 text-xs transition"
              >
                Kembali ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
