export interface DatabaseTable {
  name: string;
  description: string;
  fields: {
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }[];
  entityCode: string;
  migrationCode: string;
}

export interface ApiModule {
  name: string;
  description: string;
  endpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    auth: 'Free' | 'User' | 'Seller' | 'Admin';
    response: string;
  }[];
  nestjsBoilerplate: string;
}

export interface RoadmapTask {
  id: string;
  phase: number;
  phaseTitle: string;
  title: string;
  description: string;
  status: 'done' | 'partial' | 'planned';
  affectedFiles: string[];
  implementationGuide: string;
  templateCode: string;
  templateLabel: string;
}

export const MIRENG_TABLES: DatabaseTable[] = [
  {
    name: 'users',
    description: 'Menyimpan data pengguna (pembeli, penjual, admin) beserta status KYC dan verifikasi.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID unik pengguna' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'Alamat email pengguna untuk login' },
      { name: 'password', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Hash password (bcrypt/argon2)' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Nama lengkap pengguna' },
      { name: 'phone', type: 'VARCHAR(20)', constraints: 'NULLABLE', description: 'Nomor telepon aktif' },
      { name: 'role', type: 'VARCHAR(20)', constraints: 'DEFAULT \'user\'', description: 'Role pengguna: user, seller, admin' },
      { name: 'kyc_status', type: 'VARCHAR(20)', constraints: 'DEFAULT \'unverified\'', description: 'Status verifikasi identitas: unverified, pending, verified, rejected' },
      { name: 'kyc_data', type: 'JSONB', constraints: 'NULLABLE', description: 'Menyimpan URL foto KTP, selfie, nik, dll.' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT now()', description: 'Waktu registrasi' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Store } from './store.entity';
import { Address } from './address.entity';
import { CartItem } from './cart-item.entity';
import { Order } from './order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'user' })
  role: string; // 'user' | 'seller' | 'admin'

  @Column({ default: 'unverified' })
  kyc_status: string; // 'unverified' | 'pending' | 'verified' | 'rejected'

  @Column({ type: 'jsonb', nullable: true })
  kyc_data: any; // { nik, ktp_image_url, selfie_image_url }

  @OneToOne(() => Store, (store) => store.user)
  store: Store;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}`,
    migrationCode: `CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20),
  "role" VARCHAR(20) DEFAULT 'user',
  "kyc_status" VARCHAR(20) DEFAULT 'unverified',
  "kyc_data" JSONB,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'stores',
    description: 'Menyimpan data toko/merchant multi-vendor. Setiap penjual memiliki satu toko.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID unik toko' },
      { name: 'user_id', type: 'UUID', constraints: 'UNIQUE, FOREIGNEY KEY REFERENCES users(id)', description: 'ID pemilik toko' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'UNIQUE, NOT NULL', description: 'Nama unik toko' },
      { name: 'description', type: 'TEXT', constraints: 'NULLABLE', description: 'Deskripsi singkat toko' },
      { name: 'logo_url', type: 'VARCHAR(255)', constraints: 'NULLABLE', description: 'URL logo toko' },
      { name: 'banner_url', type: 'VARCHAR(255)', constraints: 'NULLABLE', description: 'URL banner dekorasi toko' },
      { name: 'is_verified', type: 'BOOLEAN', constraints: 'DEFAULT false', description: 'Toko terverifikasi admin' },
      { name: 'tier', type: 'VARCHAR(20)', constraints: 'DEFAULT \'standard\'', description: 'Tingkat penjual: standard, pro, enterprise' },
      { name: 'balance', type: 'DECIMAL(12,2)', constraints: 'DEFAULT 0.00', description: 'Dana yang siap ditarik (escrow fund release)' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, (user) => user.store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 'standard' })
  tier: string; // 'standard' | 'pro' | 'enterprise'

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}`,
    migrationCode: `CREATE TABLE "stores" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "logo_url" VARCHAR(255),
  "banner_url" VARCHAR(255),
  "is_verified" BOOLEAN DEFAULT false,
  "tier" VARCHAR(20) DEFAULT 'standard',
  "balance" DECIMAL(12,2) DEFAULT 0.00,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'products',
    description: 'Menyimpan katalog produk mencakup produk fisik (membutuhkan dimensi & berat), digital (berkas download otomatis), dan jasa (booking manual).',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID unik produk' },
      { name: 'store_id', type: 'UUID', constraints: 'REFERENCES stores(id) ON DELETE CASCADE', description: 'ID toko pemilik produk' },
      { name: 'category_id', type: 'UUID', constraints: 'REFERENCES categories(id) ON DELETE SET NULL', description: 'Kategori produk' },
      { name: 'name', type: 'VARCHAR(200)', constraints: 'NOT NULL', description: 'Nama produk' },
      { name: 'slug', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'URL-friendly identifier' },
      { name: 'description', type: 'TEXT', constraints: 'NOT NULL', description: 'Deskripsi lengkap spesifikasi produk' },
      { name: 'price', type: 'DECIMAL(12,2)', constraints: 'NOT NULL', description: 'Harga satuan produk (IDR)' },
      { name: 'sku', type: 'VARCHAR(100)', constraints: 'NULLABLE', description: 'Stock Keeping Unit merchant' },
      { name: 'stock', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Sisa stok produk' },
      { name: 'type', type: 'VARCHAR(20)', constraints: 'DEFAULT \'physical\'', description: 'Tipe produk: physical, digital, service' },
      { name: 'digital_file_url', type: 'VARCHAR(255)', constraints: 'NULLABLE', description: 'Link Cloudflare R2 untuk file digital otomatis' },
      { name: 'weight_g', type: 'INTEGER', constraints: 'NULLABLE', description: 'Berat produk dalam gram (untuk RajaOngkir)' },
      { name: 'dimensions', type: 'JSONB', constraints: 'NULLABLE', description: 'Dimensi fisik: { length_cm, width_cm, height_cm }' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Store } from './store.entity';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  store_id: string;

  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 'physical' })
  type: string; // 'physical' | 'digital' | 'service'

  @Column({ nullable: true })
  digital_file_url: string; // URL for R2 digital delivery

  @Column({ nullable: true })
  weight_g: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length_cm: number; width_cm: number; height_cm: number };

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}`,
    migrationCode: `CREATE TABLE "products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "category_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "sku" VARCHAR(100),
  "stock" INTEGER DEFAULT 0,
  "type" VARCHAR(20) DEFAULT 'physical',
  "digital_file_url" VARCHAR(255),
  "weight_g" INTEGER,
  "dimensions" JSONB,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'orders',
    description: 'Data pesanan hybrid. Menyimpan detail biaya pengiriman RajaOngkir, status pembayaran Midtrans, dan status pelepasan dana (Escrow).',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID transaksi' },
      { name: 'buyer_id', type: 'UUID', constraints: 'REFERENCES users(id)', description: 'ID pembeli' },
      { name: 'store_id', type: 'UUID', constraints: 'REFERENCES stores(id)', description: 'Toko asal pesanan' },
      { name: 'original_total', type: 'DECIMAL(12,2)', constraints: 'NOT NULL', description: 'Total belanja sebelum diskon' },
      { name: 'discount', type: 'DECIMAL(12,2)', constraints: 'DEFAULT 0.00', description: 'Potongan harga voucher' },
      { name: 'shipping_fee', type: 'DECIMAL(12,2)', constraints: 'DEFAULT 0.00', description: 'Ongkir dari RajaOngkir' },
      { name: 'grand_total', type: 'DECIMAL(12,2)', constraints: 'NOT NULL', description: 'Total akhir yang wajib dibayar' },
      { name: 'payment_status', type: 'VARCHAR(20)', constraints: 'DEFAULT \'pending\'', description: 'Status bayar: pending, paid, expired, failed' },
      { name: 'shipping_status', type: 'VARCHAR(20)', constraints: 'DEFAULT \'none\'', description: 'Status kirim: none, packing, shipped, delivered' },
      { name: 'escrow_status', type: 'VARCHAR(20)', constraints: 'DEFAULT \'held\'', description: 'Dana escrow: held, released, refunded' },
      { name: 'courier', type: 'VARCHAR(50)', constraints: 'NULLABLE', description: 'Kurir pengiriman (jne, pos, tiki, digital, dll)' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyer_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column()
  store_id: string;

  @ManyToOne(() => Store, (store) => store.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  original_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipping_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grand_total: number;

  @Column({ default: 'pending' })
  payment_status: string; // 'pending' | 'paid' | 'expired' | 'failed'

  @Column({ default: 'none' })
  shipping_status: string; // 'none' | 'packing' | 'shipped' | 'delivered' | 'cancelled'

  @Column({ default: 'held' })
  escrow_status: string; // 'held' | 'released' | 'refunded'

  @Column({ nullable: true })
  courier: string; // e.g., 'jne_reg', 'digital_automated', 'service_appointment'

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}`,
    migrationCode: `CREATE TABLE "orders" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "buyer_id" UUID NOT NULL REFERENCES "users"("id"),
  "store_id" UUID NOT NULL REFERENCES "stores"("id"),
  "original_total" DECIMAL(12,2) NOT NULL,
  "discount" DECIMAL(12,2) DEFAULT 0.00,
  "shipping_fee" DECIMAL(12,2) DEFAULT 0.00,
  "grand_total" DECIMAL(12,2) NOT NULL,
  "payment_status" VARCHAR(20) DEFAULT 'pending',
  "shipping_status" VARCHAR(20) DEFAULT 'none',
  "escrow_status" VARCHAR(20) DEFAULT 'held',
  "courier" VARCHAR(50),
  "tracking_number" VARCHAR(50),
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'user_affiliate_logs',
    description: 'Menyimpan tautan promosi kustom miring dan riwayat klik rujukan affiliate beserta rincian browser pengunjung.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID unik tautan log' },
      { name: 'referrer_id', type: 'UUID', constraints: 'REFERENCES users(id) ON DELETE CASCADE', description: 'ID pengguna yang menyebarkan tautan' },
      { name: 'product_id', type: 'UUID', constraints: 'REFERENCES products(id) ON DELETE CASCADE', description: 'Produk Mireng yang dipromosikan' },
      { name: 'referral_code', type: 'VARCHAR(50)', constraints: 'UNIQUE, NOT NULL', description: 'Kode tautan referral kustom unik' },
      { name: 'total_clicks', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Jumlah total klik pengunjung luar' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT now()', description: 'Waktu pembuatan tautan' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('user_affiliate_logs')
export class UserAffiliateLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrer_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @Column()
  product_id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  referral_code: string;

  @Column({ default: 0 })
  total_clicks: number;

  @CreateDateColumn()
  created_at: Date;
}`,
    migrationCode: `CREATE TABLE "user_affiliate_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referrer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "referral_code" VARCHAR(50) UNIQUE NOT NULL,
  "total_clicks" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'user_coin_ledger',
    description: 'Buku besar log transaksi koin loyalti (Coin Shopee / Blibli Style) melacak check-in harian dan diskon checkout.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID log koin' },
      { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(id) ON DELETE CASCADE', description: 'ID pemilik koin' },
      { name: 'amount', type: 'INTEGER', constraints: 'NOT NULL', description: 'Jumlah koin masuk (+) atau keluar (-)' },
      { name: 'transaction_type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Tipe: check_in, checkout_redeem, refund, reward' },
      { name: 'description', type: 'VARCHAR(255)', constraints: 'NULLABLE', description: 'Keterangan transaksi koin' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT now()', description: 'Waktu transaksi koin terjadi' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_coin_ledger')
export class UserCoinLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  amount: number; // Positif untuk tambah koin, negatif untuk penggunaan

  @Column()
  transaction_type: string; // 'check_in' | 'checkout_redeem' | 'refund' | 'reward'

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}`,
    migrationCode: `CREATE TABLE "user_coin_ledger" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" INTEGER NOT NULL,
  "transaction_type" VARCHAR(50) NOT NULL,
  "description" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'store_wallet_ledger',
    description: 'Riwayat terperinci aliran dana keuangan toko penjual dari pelepasan dana escrow order selesai dan penarikan bank lokal.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID log keuangan' },
      { name: 'store_id', type: 'UUID', constraints: 'REFERENCES stores(id) ON DELETE CASCADE', description: 'ID toko terkait' },
      { name: 'amount', type: 'DECIMAL(12,2)', constraints: 'NOT NULL', description: 'Jumlah uang masuk (+) atau ditarik (-)' },
      { name: 'type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Tipe mutasi: escrow_release, withdrawal, admin_fee_deduction' },
      { name: 'reference_id', type: 'VARCHAR(100)', constraints: 'NULLABLE', description: 'Nomor Order_ID / Withdrawal_ID referensi' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT now()', description: 'Waktu mutasi saldo terjadi' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('store_wallet_ledger')
export class StoreWalletLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  store_id: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  type: string; // 'escrow_release' | 'withdrawal' | 'admin_fee_deduction'

  @Column({ nullable: true })
  reference_id: string;

  @CreateDateColumn()
  created_at: Date;
}`,
    migrationCode: `CREATE TABLE "store_wallet_ledger" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "amount" DECIMAL(12,2) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "reference_id" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'store_live_sessions',
    description: 'Sesi siaran langsung video interaktif (Mireng Live Shopping) yang menghubungkan penonton real-time ke varian SKU terpilih.',
    fields: [
      { name: 'id', type: 'UUID / PRIMARY KEY', constraints: 'DEFAULT uuid_generate_v4()', description: 'ID unik live streaming' },
      { name: 'store_id', type: 'UUID', constraints: 'REFERENCES stores(id) ON DELETE CASCADE', description: 'ID toko penyelenggara' },
      { name: 'title', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Judul display siaran langsung' },
      { name: 'status', type: 'VARCHAR(20)', constraints: 'DEFAULT \'live\'', description: 'Status siaran: live, ended, planned' },
      { name: 'viewer_count', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Estimasi jumlah penonton real-time' },
      { name: 'pinned_product_id', type: 'UUID', constraints: 'NULLABLE, REFERENCES products(id) ON DELETE SET NULL', description: 'ID produk yang sedang ditandai di keranjang kuning' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';
import { Product } from './product.entity';

@Entity('store_live_sessions')
export class StoreLiveSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  store_id: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  title: string;

  @Column({ default: 'live' })
  status: string; // 'live' | 'ended' | 'planned'

  @Column({ default: 0 })
  viewer_count: number;

  @Column({ nullable: true })
  pinned_product_id: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pinned_product_id' })
  pinnedProduct: Product;

  @CreateDateColumn()
  created_at: Date;
}`,
    migrationCode: `CREATE TABLE "store_live_sessions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "title" VARCHAR(150) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'live',
  "viewer_count" INTEGER DEFAULT 0,
  "pinned_product_id" UUID REFERENCES "products"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP DEFAULT now()
);`
  },
  {
    name: 'platform_fee_settings',
    description: 'Konfigurasi global administrasi fee platform marketplace Mireng per tingkatan level merchant kustom PRO, Standard, & Enterprise.',
    fields: [
      { name: 'id', type: 'INTEGER / PRIMARY KEY', constraints: 'SERIAL', description: 'ID unik setelan' },
      { name: 'seller_tier', type: 'VARCHAR(50)', constraints: 'UNIQUE, NOT NULL', description: 'Tier merchant: standard, pro, enterprise' },
      { name: 'commission_rate_percent', type: 'DECIMAL(4,2)', constraints: 'NOT NULL', description: 'Persentase potongan flat per transaksi belanja' },
      { name: 'vat_rate_percent', type: 'DECIMAL(4,2)', constraints: 'DEFAULT 11.00', description: 'Persentase Pajak Pertambahan Nilai (PPN)' },
      { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT now()', description: 'Perubahan terakhir oleh admin super' }
    ],
    entityCode: `import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('platform_fee_settings')
export class PlatformFeeSetting {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  seller_tier: string; // 'standard' | 'pro' | 'enterprise'

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  commission_rate_percent: number; // e.g., 2.50 untuk 2.5%

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 11.00 })
  vat_rate_percent: number; // PPN 11%

  @UpdateDateColumn()
  updated_at: Date;
}`,
    migrationCode: `CREATE TABLE "platform_fee_settings" (
  "id" SERIAL PRIMARY KEY,
  "seller_tier" VARCHAR(50) UNIQUE NOT NULL,
  "commission_rate_percent" DECIMAL(4,2) NOT NULL,
  "vat_rate_percent" DECIMAL(4,2) DEFAULT 11.00,
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Seed awal setelan admin
INSERT INTO "platform_fee_settings" ("seller_tier", "commission_rate_percent") VALUES
('standard', 1.00),
('pro', 2.00),
('enterprise', 3.50)
ON CONFLICT DO NOTHING;`
  }
];

export const MIREENG_MODULES: ApiModule[] = [
  {
    name: 'Auth Module',
    description: 'Menangani registrasi, login, generate JWT, validasi session, dan role guard.',
    endpoints: [
      { method: 'POST', path: '/auth/register', description: 'Registrasi akun baru (Customer default)', auth: 'Free', response: '{"user": {"id": "...", "email": "..."}, "token": "jwt_token_here"}' },
      { method: 'POST', path: '/auth/login', description: 'Autentikasi akun, menerima JWT Bearer Token', auth: 'Free', response: '{"user": {"id": "...", "role": "seller"}, "token": "jwt_token_here"}' },
      { method: 'GET', path: '/auth/me', description: 'Mengambil profil pengguna yang sedang login', auth: 'User', response: '{"id": "...", "name": "Tony", "email": "...", "role": "user"}' }
    ],
    nestjsBoilerplate: `// auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    return req.user;
  }
}`
  },
  {
    name: 'Product Module',
    description: 'Menangani listing catalog, filter multidimensi (grup fisik/digital/jasa), deskripsi, dan harga.',
    endpoints: [
      { method: 'GET', path: '/products', description: 'Filter & list produk (search, category, min/max price, type)', auth: 'Free', response: '[{"id": "...", "name": "Mireng Goreng Instan", "price": 15000, "type": "physical"}]' },
      { method: 'GET', path: '/products/:slug', description: 'Detail lengkap produk berdasarkan slug', auth: 'Free', response: '{"id": "...", "name": "Design Jasa 3D", "price": 500000, "type": "service", "store": {"name": "Sinar Jaya Code"}}' },
      { method: 'POST', path: '/products', description: 'Membuat produk baru (Memerlukan otorisasi Toko)', auth: 'Seller', response: '{"id": "...", "name": "E-Book NextJS Multi", "type": "digital"}' }
    ],
    nestjsBoilerplate: `// products.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SellerGuard } from '../auth/guards/seller.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(SellerGuard)
  @Post()
  async create(@Body() dto: CreateProductDto, @Req() req) {
    return this.productsService.create(req.user.storeId, dto);
  }
}`
  },
  {
    name: 'Order & Escrow System',
    description: 'Modul krusial untuk transaksi hybrid. Menahan dana di sistem escrow (held) sampai pembeli menerima kiriman fisik / mengunggah file / konfirmasi booking.',
    endpoints: [
      { method: 'POST', path: '/orders', description: 'Membuat pembayaran baru, mendaftarkan pesanan di escrow (Status: pending)', auth: 'User', response: '{"id": "order_uuid", "grand_total": 45000, "payment_token": "midtrans_snap_token"}' },
      { method: 'POST', path: '/orders/:id/verify-digital', description: 'Pelepasan dana instant ke seller otomatis saat item digital di-download', auth: 'User', response: '{"success": true, "escrow_status": "released"}' },
      { method: 'POST', path: '/orders/:id/confirm-delivery', description: 'Pembeli mengonfirmasi kiriman fisik sampai. Melepaskan saldo ke dompet toko penjual.', auth: 'User', response: '{"order_id": "...", "escrow_status": "released"}' }
    ],
    nestjsBoilerplate: `// orders.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
  ) {}

  async releaseEscrow(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, buyer_id: userId },
      relations: ['store']
    });

    if (!order) throw new BadRequestException('Order tidak ditemukan');
    if (order.escrow_status === 'released') {
      throw new BadRequestException('Dana telah dilepaskan sebelumnya');
    }

    // Set escrow status ke released
    order.escrow_status = 'released';
    order.shipping_status = 'delivered';
    await this.orderRepo.save(order);

    // Saldo masuk ke Vendor Store
    const store = order.store;
    store.balance = Number(store.balance) + Number(order.original_total);
    await this.storeRepo.save(store);

    return { success: true, escrow_status: 'released', store_balance: store.balance };
  }
}`
  },
  {
    name: 'Affiliate & Referrals Module',
    description: 'Menangani pembuatan link rujukan marketing afiliasi, klik pelacakan pengunjung, serta perhitungan komisi bulanan kontributor.',
    endpoints: [
      { method: 'POST', path: '/affiliate/generate-link', description: 'Membuat kode rujukan affiliate unik dari katalog produk', auth: 'User', response: '{"referral_code": "mire-ton-192a", "affiliate_url": "https://mireng.com/products/goreng-enak?ref=mire-ton-192a"}' },
      { method: 'GET', path: '/affiliate/dashboard-stats', description: 'Mengambil statistik konversi klik, pesanan sukses, dan estimasi cuan', auth: 'User', response: '{"total_clicks": 341, "successful_orders": 12, "estimated_commission": 95000}' },
      { method: 'POST', path: '/admin/affiliate/payout', description: 'Memproses penarikan gaji / pembayaran komisi massal ke bank kontributor', auth: 'Admin', response: '{"payout_batch_id": "pay-bat-990a", "status": "processed", "total_payout_idr": 4500000}' }
    ],
    nestjsBoilerplate: `// affiliate.controller.ts
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('affiliate')
export class AffiliateController {
  @UseGuards(JwtAuthGuard)
  @Post('generate-link')
  async createLink(@Body() body: { productId: string }, @Req() req) {
    const code = 'mire-' + req.user.name.substring(0, 3).toLowerCase() + '-' + Math.random().toString(36).substring(2, 6);
    return { referral_code: code, url: 'https://mireng.com/products/' + body.productId + '?ref=' + code };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard-stats')
  async getStats(@Req() req) {
    return { referrer_id: req.user.id, total_clicks: 142, successful_referrals: 8, commission_balance: 35000 };
  }
}`
  },
  {
    name: 'Koin & Loyalty Gamification Module',
    description: 'Menangani tabungan koin loyalitas pembeli, klaim check-in daily login, dan penukaran voucher potongan belanja.',
    endpoints: [
      { method: 'POST', path: '/coins/daily-check-in', description: 'Klaim insentif bonus koin harian (beruntun bertingkat)', auth: 'User', response: '{"success": true, "claimed_coins": 1000, "current_total_coins": 5000, "streak_days": 3}' },
      { method: 'GET', path: '/coins/wallet-history', description: 'Mengambil audit log lalu lintas koin keluar masuk akun', auth: 'User', response: '[{"id": "...", "amount": 1000, "transaction_type": "check_in", "description": "Bonus Check-in harian"}]' },
      { method: 'POST', path: '/coins/redeem-voucher', description: 'Tukar koin loyalty akumulatif dengan lembaran kupon promo platform', auth: 'User', response: '{"success": true, "voucher_code": "KOINHEMAT10K", "deducted_coins": 10000}' }
    ],
    nestjsBoilerplate: `// coins.controller.ts
import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('coins')
export class CoinsController {
  @UseGuards(JwtAuthGuard)
  @Post('daily-check-in')
  async claimDaily(@Req() req) {
    // Logic menambah koin pembeli & catat ke ledger
    return {
      success: true,
      claimed: 1000,
      total_now: 4500,
      streak: 2,
      message: 'Berhasil mengklaim 1.000 Koin harian!'
    };
  }
}`
  },
  {
    name: 'Seller Wallet & Finance Module',
    description: 'Fasilitas pelacakan pelepasan saldo escrow pesanan serta gerbang otorisasi penarikan saldo toko ke bank lokal.',
    endpoints: [
      { method: 'GET', path: '/seller/wallet/balance', description: 'Mengecek saldo toko aktif dan nilai transaksi yang masih terkunci', auth: 'Seller', response: '{"active_balance": 1450000, "locked_escrow_balance": 249000}' },
      { method: 'POST', path: '/seller/wallet/withdraw', description: 'Mengajukan transfer penarikan dana ke rekening bank terdaftar', auth: 'Seller', response: '{"withdrawal_id": "wd-723a-f1", "amount": 500000, "status": "pending_verification"}' },
      { method: 'POST', path: '/seller/wallet/confirm-otp', description: 'Verifikasi keamanan OTP sebelum pengiriman massal kliring bank', auth: 'Seller', response: '{"success": true, "status": "completed", "transferred_at": "2026-06-18T13:58:00.000Z"}' }
    ],
    nestjsBoilerplate: `// seller-wallet.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SellerGuard } from '../auth/guards/seller.guard';

@Controller('seller/wallet')
@UseGuards(JwtAuthGuard, SellerGuard)
export class SellerWalletController {
  @Get('balance')
  async getBalance(@Req() req) {
    return { active_balance: 750000, locked_escrow_balance: 249000 };
  }

  @Post('withdraw')
  async withdraw(@Body() body: { amount: number }, @Req() req) {
    if (body.amount > 750000) throw new BadRequestException('Saldo teredia tidak mencukupi');
    return { withdrawal_id: 'wd-910a', amount: body.amount, status: 'otp_sent' };
  }
}`
  },
  {
    name: 'Live Streaming & Video Shopping Module',
    description: 'Menangani interaksi penonton video, pinning varian SKU ke keranjang kuning, dan promo flash disiaran streaming.',
    endpoints: [
      { method: 'POST', path: '/seller/live/start', description: 'Membuat & menginisialisasi sesi video live shopping baru', auth: 'Seller', response: '{"session_id": "liv-sidoarjo-04b12", "rtmp_url": "rtmp://live.mireng.com/app/stream-key"}' },
      { method: 'POST', path: '/seller/live/pin-product', description: 'Dinamis menyematkan barang ke keranjang kuning agar pembeli live bisa checkout instan', auth: 'Seller', response: '{"success": true, "pinned_product": {"id": "prod-1", "name": "Mireng Gurih Sidoarjo"}}' },
      { method: 'POST', path: '/live/comment', description: 'Mengirimkan pesan obrolan interaktif langsung ke panel display streamer', auth: 'User', response: '{"comment_id": "cmt-99a", "username": "Tony", "text": "Diskonnya kaka!"}' }
    ],
    nestjsBoilerplate: `// live-shopping.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SellerGuard } from '../auth/guards/seller.guard';

@Controller('seller/live')
@UseGuards(JwtAuthGuard, SellerGuard)
export class LiveShoppingController {
  @Post('pin-product')
  async pinProduct(@Body() body: { productId: string }) {
    return {
      success: true,
      pinned_product_id: body.productId,
      message: 'Varian SKU berhasil disematkan ke keranjang kuning pemirsa live!'
    };
  }
}`
  },
  {
    name: 'Admin Platform settings & Commission Module',
    description: 'Konsol keuangan pusat admin untuk menyetel persentase potongan jasa platform, PPN, dan mengaudit performa escrow.',
    endpoints: [
      { method: 'GET', path: '/admin/settings/fees', description: 'Melihat konfigurasi administrasi fee dan pemungutan PPN', auth: 'Admin', response: '[{"seller_tier": "standard", "commission_rate_percent": 1.00}, {"seller_tier": "pro", "commission_rate_percent": 2.00}]' },
      { method: 'PUT', path: '/admin/settings/fees', description: 'Mengubah rate komisi admin penanganan platform berkala', auth: 'Admin', response: '{"success": true, "updated_tier": "standard", "new_percent": 1.50}' },
      { method: 'GET', path: '/admin/audit/escrow', description: 'Audit kepatuhan transfer dana escrow agar tidak terjadi perselisihan', auth: 'Admin', response: '{"held_escrow_tokens": 12, "held_amount_idr": 4830000, "alert_failures": 0}' }
    ],
    nestjsBoilerplate: `// admin-fees.controller.ts
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminFeesController {
  @Get('fees')
  async getFees() {
    return [
      { tier: 'standard', rate: 1.00, tax: 11.00 },
      { tier: 'pro', rate: 2.00, tax: 11.00 },
      { tier: 'enterprise', rate: 3.50, tax: 11.00 }
    ];
  }

  @Put('fees')
  async updateFee(@Body() body: { tier: string, newRate: number }) {
    return { success: true, updated: body.tier, rate: body.newRate };
  }
}`
  }
];

export const ROADMAP_DATA: RoadmapTask[] = [
  {
    id: 'cart-system',
    phase: 3,
    phaseTitle: 'Fase 3: Frontend Completion',
    title: 'Shared Cart Multi-Store',
    description: 'Sistem keranjang belanja yang mendukung multi-vendor, di mana item dari toko yang berbeda dikelompokkan secara terpisah, namun checkout bisa dikoordinasikan secara bertahap.',
    status: 'partial',
    affectedFiles: ['frontend/src/store/cartStore.ts', 'frontend/src/app/cart/page.tsx'],
    implementationGuide: 'Gunakan Zustand untuk state management keranjang lokal yang diskor ke database sewaktu user login. Kelompokkan array `cartItems` berdasarkan `product.store.name`.',
    templateLabel: 'Zustand Cart Store',
    templateCode: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: 'physical' | 'digital' | 'service';
  weight_g?: number;
  store: {
    id: string;
    name: string;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getGroupedItems: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existIdx = state.items.findIndex(i => i.productId === item.productId);
        if (existIdx > -1) {
          const newItems = [...state.items];
          newItems[existIdx].quantity += item.quantity;
          return { items: newItems };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.productId !== id)
      })),
      updateQuantity: (id, qty) => set((state) => ({
        items: state.items.map(i => i.productId === id ? { ...i, quantity: qty } : i)
      })),
      clearCart: () => set({ items: [] }),
      getGroupedItems: () => {
        const grouped: Record<string, CartItem[]> = {};
        get().items.forEach(item => {
          const sName = item.store.name;
          if (!grouped[sName]) grouped[sName] = [];
          grouped[sName].push(item);
        });
        return grouped;
      }
    }),
    { name: 'mireng-cart-storage' }
  )
);`
  },
  {
    id: 'checkout-flow',
    phase: 3,
    phaseTitle: 'Fase 3: Frontend Completion',
    title: 'Hybrid Checkout Flow UI',
    description: 'Memisahkan detail checkout berdasarkan tipe produk: RajaOngkir untuk produk fisik, pengunduhan file digital otomatis saat transaksi sukses, dan penjadwalan waktu untuk booking produk jasa.',
    status: 'partial',
    affectedFiles: ['frontend/src/app/checkout/page.tsx', 'frontend/src/components/CheckoutItem.tsx'],
    implementationGuide: 'Tampilkan selector kurir jika ada produk fisik, input link / info jika ada produk digital, dan widget datepicker calendar jika ada produk jasa dalam pesanan.',
    templateLabel: 'Next.js 16 Checkout Screen Component',
    templateCode: `import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';

export default function CheckoutPage() {
  const { items, getGroupedItems } = useCartStore();
  const grouped = getGroupedItems();
  const [shippingMethod, setShippingMethod] = useState<Record<string, string>>({});
  const [bookingSchedules, setBookingSchedules] = useState<Record<string, string>>({});

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 font-display">Hybrid Shipping/Booking Checkout</h2>
      {Object.entries(grouped).map(([storeName, items]) => (
        <div key={storeName} className="border border-gray-100 rounded-xl p-5 mb-5 shadow-xs bg-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Toko</span>
            <h4 className="font-semibold text-gray-900">{storeName}</h4>
          </div>

          <div className="divide-y divide-gray-50 mb-4">
            {items.map(item => (
              <div key={item.productId} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400 capitalize">Tipe: {item.type} | Jumlah: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          {/* Dinamis Kondisi Berdasarkan Tipe Produk */}
          {items.some(i => i.type === 'physical') && (
            <div className="bg-slate-50 p-3 rounded-lg mt-3 text-xs">
              <span className="font-semibold text-gray-700 block mb-2">🚚 Opsi Pengiriman Kurir Toko (Fisik)</span>
              <select 
                className="w-full border border-gray-200 p-2 rounded bg-white"
                onChange={(e) => setShippingMethod(prev => ({ ...prev, [storeName]: e.target.value }))}
              >
                <option value="">-- Pilih Jasa Kirim --</option>
                <option value="jne_reg">JNE REG (2-3 Hari) - Rp 12.000</option>
                <option value="jnt_express">J&T Express (1-2 Hari) - Rp 15.000</option>
                <option value="gosend">GoSend SameDay (6 Jam) - Rp 20.000</option>
              </select>
            </div>
          )}

          {items.some(i => i.type === 'service') && (
            <div className="bg-teal-50/50 p-3 rounded-lg mt-3 text-xs border border-teal-100/30">
              <span className="font-semibold text-teal-700 block mb-2">📅 Atur Jadwal Layanan Jasa</span>
              <input 
                type="datetime-local" 
                className="w-full border border-teal-200 p-2 rounded bg-white text-teal-800"
                onChange={(e) => setBookingSchedules(prev => ({ ...prev, [storeName]: e.target.value }))}
              />
            </div>
          )}

          {items.every(i => i.type === 'digital') && (
            <div className="bg-blue-50/50 p-3 rounded-lg mt-3 text-xs border border-blue-100/40 text-blue-700 flex items-center gap-2">
              <span>⚡</span>
              <span><strong>Item Digital:</strong> Tidak membutuhkan kurir fisik. Download link instan akan tertera setelah pembayaran tuntas.</span>
            </div>
          )}
        </div>
      ))}
      <button className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition">
        Buat Pesanan & Bayar (Rp {items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('id-ID')})
      </button>
    </div>
  );
}`
  },
  {
    id: 'midtrans-pay',
    phase: 4,
    phaseTitle: 'Fase 4: Integrasi Eksternal',
    title: 'Midtrans Snap Gateway',
    description: 'Integrasi sistem pembayaran virtual account dan e-wallet otomatis. Menerima server notification, update database state, dan memicu pelepasan atau penahanan dana di escrow.',
    status: 'planned',
    affectedFiles: ['backend/src/orders/orders.controller.ts', 'backend/src/orders/orders.service.ts'],
    implementationGuide: 'Instal `midtrans-client`. Dapatkan token SNAP pembayaran dari API server saat checkout berhasil, kemudian render Snap popup / redirect di client side.',
    templateLabel: 'NestJS Midtrans Payment Service',
    templateCode: `// payment.service.ts
import { Injectable } from '@nestjs/common';
// @ts-ignore
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PaymentService {
  private snap: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || 'SERVER_KEY_MOCK',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || 'CLIENT_KEY_MOCK'
    });
  }

  async createTransaction(orderId: string, amount: number, customerDetails: any) {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      credit_card: {
        secure: true
      }
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      };
    } catch (error) {
      throw new Error('Gagal berinteraksi dengan gateway Midtrans: ' + error.message);
    }
  }

  async handleWebhookNotification(notificationPayload: any) {
    const statusResponse = await this.snap.transaction.notification(notificationPayload);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalPaymentStatus = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') finalPaymentStatus = 'challenge';
      else if (fraudStatus === 'accept') finalPaymentStatus = 'paid';
    } else if (transactionStatus === 'settlement') {
      finalPaymentStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      finalPaymentStatus = 'failed';
    }

    return { orderId, paymentStatus: finalPaymentStatus };
  }
}`
  }
];

export const GENERAL_GUIDELINES = `
# Pedoman Umum Integrasi & Rule Pengembangan

Dalam Mireng Project, CLAUDE & AI Asisten lainnya diharuskan:
1. **Paham Hybrid Model**: Bedakan status & alur logika tiap item kurir fisik, download digital, dan durasi jasa.
2. **TypeORM Migrations Manual**: Sifat auto synchronize = false di PostgreSQL diaktifkan di production. Semua model entity baru wajib dibuatkan SQL script DDL di direktori /database.
3. **No Over-Engineering**: Pastikan kode ringkas, clean, modular, dan sesuai modul NestJS + Next.js standar.
`;
