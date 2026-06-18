import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckSquare, 
  Square, 
  Play, 
  Check, 
  Copy, 
  FileCode, 
  Database,
  Lock,
  CreditCard,
  UserCheck,
  ShoppingBag,
  Truck,
  Terminal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  PlayCircle
} from 'lucide-react';

interface TaskStep {
  id: string;
  number: number;
  title: string;
  category: string;
  description: string;
  affectedFiles: string[];
  checklist: string[];
  errorHandling: string;
  nestjsBoilerplate: string;
  nestjsLabel: string;
  ddlMigration: string;
  mockEndpoint: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    payload?: string;
    response: string;
  };
}

const MIRENG_STEPS: TaskStep[] = [
  {
    id: 'step-1',
    number: 1,
    title: 'Inisialisasi NestJS & PostgreSQL Connection',
    category: 'Backend Setup',
    description: 'Setup server utama NestJS, konfigurasi TypeORM untuk PostgreSQL dev & production, serta membuat inisialisasi awal driver database tanpa sinkronisasi otomatis.',
    affectedFiles: ['src/app.module.ts', 'src/config/database.config.ts', 'ormconfig.ts', 'package.json'],
    checklist: [
      'Membuat project NestJS baru dan menginstal dependensi pg & TypeORM.',
      'Membuat file konfigurasi database modular dan mematikan auto synchronization.',
      'Menguji koneksi ke database PostgreSQL serta memastikan pooling koneksi aktif.',
      'Membuat skema inisialisasi awal (UUID extension) di database.'
    ],
    errorHandling: 'Gagal koneksi database biasanya disebabkan oleh driver pg yang belum terinstall atau string koneksi (DATABASE_URL) salah format. TypeORM akan mogok startup jika synchronize bernilai true tetapi di database produksi ada dependensi class yang berbeda. Selalu pastikan synchronize: false di production.',
    nestjsLabel: 'database.config.ts & app.module.ts',
    nestjsBoilerplate: `// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Wajib false untuk production keamanan data
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20, // Connection pool size limit
    idleTimeoutMillis: 30000,
  }
}));

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
  ],
})
export class AppModule {}`,
    ddlMigration: `-- Inisialisasi awal database PostgreSQL Mireng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema migration placeholder untuk inisialisasi driver
CREATE TABLE "migrations_tracker" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL
);`,
    mockEndpoint: {
      method: 'GET',
      path: '/api/health',
      response: '{\n  "status": "healthy",\n  "database": "connected (PostgreSQL v16)",\n  "timestamp": "2026-06-18T13:50:00.000Z",\n  "pool": { "total": 20, "active": 2 }\n}'
    }
  },
  {
    id: 'step-2',
    number: 2,
    title: 'Sistem Registrasi & JWT Auth Guard dengan Multi-Role',
    category: 'Mekanisme Keamanan',
    description: 'Bentuk otentikasi pendaftaran akun aman menggunakan bcrypt hashing, penerbitan JWT Bearer Token, dan penjagaan rute end-user berdasarkan role (user, seller, admin).',
    affectedFiles: ['src/auth/user.entity.ts', 'src/auth/auth.controller.ts', 'src/auth/guards/roles.guard.ts', 'src/auth/strategies/jwt.strategy.ts'],
    checklist: [
      'Membuat skema table users dengan enkripsi password (bcrypt).',
      'Memasang JWT Passport Strategy untuk membaca Authorization header.',
      'Membuat Roles decorator (@UserRole) dan Guard khusus.',
      'Menguji login dan mengembalikan JWT token bersangkutan.'
    ],
    errorHandling: 'Error yang sering terjadi adalah UnauthorizedException saat token kadaluarsa atau rahasia kunci JWT berbeda antara pembuat token dan verifikator. Pastikan JWT_SECRET terisi aman di file .env dan terbaca dengan benar di module.',
    nestjsLabel: 'auth.controller.ts',
    nestjsBoilerplate: `// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Get('dashboard-stats')
  async getDashboardStats(@Req() req) {
    return { message: 'Akses diijinkan untuk ' + req.user.role };
  }
}`,
    ddlMigration: `-- Membuat tabel Users untuk multi-role
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20),
  "role" VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  "kyc_status" VARCHAR(20) DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
  "kyc_data" JSONB,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/auth/login',
      payload: '{\n  "email": "tony@mireng.com",\n  "password": "rahasia_terjamin"\n}',
      response: '{\n  "user": {\n    "id": "e30e181c-cb8e-4a6c-9cff-a620d43f01fd",\n    "name": "Tony",\n    "email": "tony@mireng.com",\n    "role": "seller",\n    "kyc_status": "verified"\n  },\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzMGUxODFjLWNiOGUtNGE2Yy05Y2ZmLWE2MjBkNDNmMDFmZCIsImVtYWlsIjoidG9ueUBtaXJlbmcuY29tIiwicm9sZSI6InNlbGxlciJ9..."\n}'
    }
  },
  {
    id: 'step-3',
    number: 3,
    title: 'Manajemen Toko Penjual & KYC Status',
    category: 'Sistem Penjual',
    description: 'Proses pembukaan toko oleh pengguna terverifikasi, verifikasi administrasi status KYC, pengisian link rekening bank penjual, dan pengaturan neraca saldo toko.',
    affectedFiles: ['src/stores/store.entity.ts', 'src/stores/stores.controller.ts', 'src/stores/stores.service.ts'],
    checklist: [
      'Menyusun skema table stores berelevansi 1:1 ke table users.',
      'Membuat rute pendaftaran toko barunya: /stores/register.',
      'Sistem KYC verifikator admin untuk mengubah status dari unverified menjadi verified.',
      'Membuat guard khusus penjamin hak akses toko milik sendiri.'
    ],
    errorHandling: 'Relasi OneToOne TypeORM bisa memicu error "duplicate key error" jika satu user mencoba mendaftarkan toko berkali-kali. Pakai relasi UNIQUE index dan pasang check constraint di level Controller.',
    nestjsLabel: 'stores.service.ts',
    nestjsBoilerplate: `// src/stores/stores.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async activeStore(userId: string, storeName: string, description: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User tidak terdaftar');
    if (user.kyc_status !== 'verified') {
      throw new BadRequestException('Akun Anda belum lolos administrasi verifikasi KYC');
    }

    const existStore = await this.storeRepo.findOneBy({ user_id: userId });
    if (existStore) throw new BadRequestException('Setiap user hanya diijinkan memiliki satu toko');

    const newStore = this.storeRepo.create({
      user_id: userId,
      name: storeName,
      description,
      balance: 0,
      is_verified: true
    });

    user.role = 'seller';
    await this.userRepo.save(user);
    return this.storeRepo.save(newStore);
  }
}`,
    ddlMigration: `-- Membuat tabel Stores untuk Multi-Vendor
CREATE TABLE "stores" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "logo_url" VARCHAR(255),
  "is_verified" BOOLEAN DEFAULT false,
  "balance" DECIMAL(15,2) DEFAULT 0.00,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/stores/register',
      payload: '{\n  "name": "Mireng Goreng Gurih Sidoarjo",\n  "description": "Menyediakan aneka camilan mireng khas resep nusantara"\n}',
      response: '{\n  "id": "c0559f23-952b-4ba5-b09e-dc39832cb36a",\n  "user_id": "e30e181c-cb8e-4a6c-9cff-a620d43f01fd",\n  "name": "Mireng Goreng Gurih Sidoarjo",\n  "description": "Menyediakan aneka miring khas",\n  "is_verified": true,\n  "balance": 0,\n  "created_at": "2026-06-18T13:55:00.000Z"\n}'
    }
  },
  {
    id: 'step-4',
    number: 4,
    title: 'Model Katalog Produk Hybrid (Fisik, Digital, & Jasa)',
    category: 'Katalog Marketplace',
    description: 'Memformulasikan data produk unik Mireng yang menggabungkan dimensi kargo fisik, file link Cloudflare R2 untuk digital, serta jadwal booking kalender untuk penyedia jasa.',
    affectedFiles: ['src/products/product.entity.ts', 'src/products/products.controller.ts', 'src/products/dto/create-product.dto.ts'],
    checklist: [
      'Membuat kolom type: Enum ("physical", "digital", "service") pada tabel.',
      'Sediakan validasi dimensi kargo hanya wajib terisi pabila tipe berupa physical.',
      'Gunakan middleware aman pengunggah file digital terisolasi.',
      'Sajikan endpoint query pencarian dengan filter tipe: GET /products?type=digital.'
    ],
    errorHandling: 'Error fatal biasaya terjadi saat produk digital diakses umum sebelum order dibayar. Simpan file asli di folder privat atau S3/R2 presigned URL tertutup, dan berikan akses via controller aman yang memvalidasi hak pembayaran.',
    nestjsLabel: 'product.entity.ts',
    nestjsBoilerplate: `// src/products/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../stores/entities/store.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  store_id: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  name: string;

  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 'physical' }) // physical | digital | service
  type: string;

  @Column({ nullable: true })
  digital_file_url: string; // Link cloudflare R2 bertenaga download aman

  @Column({ nullable: true })
  weight_g: number; // Untuk integrasi RajaOngkir ongkos kirim

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length_cm: number; width_cm: number; height_cm: number };

  @Column({ default: 0 })
  stock: number;

  @CreateDateColumn()
  created_at: Date;
}`,
    ddlMigration: `-- Membuat tabel Products untuk skema Hybrid
CREATE TABLE "products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "name" VARCHAR(200) NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "type" VARCHAR(20) DEFAULT 'physical' CHECK (type IN ('physical', 'digital', 'service')),
  "digital_file_url" VARCHAR(255),
  "weight_g" INTEGER,
  "dimensions" JSONB,
  "stock" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'GET',
      path: '/products?type=digital',
      response: '[\n  {\n    "id": "e993358c-859a-4bc4-b778-5db0969bd3ff",\n    "name": "E-Book Resep Rahasia Mireng Crispy v2",\n    "price": 45000,\n    "type": "digital",\n    "digital_file_url": "https://r2.mireng.com/secure-token/resep-miring.pdf",\n    "stock": 99999\n  }\n]'
    }
  },
  {
    id: 'step-5',
    number: 5,
    title: 'Zustand Core Cart (Multi-Store Grouping)',
    category: 'Frontend & Integrasi',
    description: 'Membangun logic state management frontend Next.js menggunakan Zustand, agar item pesanan dari banyak toko dapat terkelompok rapi dan terorganisir per vendor.',
    affectedFiles: ['frontend/src/store/useCartStore.ts', 'frontend/src/components/CartList.tsx'],
    checklist: [
      'Inisialisasi Zustand persist store agar data belanja aman saat tab tertutup.',
      'Sifat pengelompokan otomatis: iterasi array items berdasarkan id_toko sebagai header.',
      'Implementasi handler tambah kuantitas diiringi pengecekan sisa stock di backend.',
      'Terapkan batasan pembatalan item keranjang yang interaktif.'
    ],
    errorHandling: 'Karena Next.js mendaki SSR (Server Side Rendering), state Zustand yang dibaca dari localStorage bisa menyebabkan "hydration mismatch" jika langsung dirender. Pastikan state dimuat setelah browser terpasang (useEffect/isMounted hook).',
    nestjsLabel: 'useCartStore.ts (Next.js/React)',
    nestjsBoilerplate: `// frontend/src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'physical' | 'digital' | 'service';
  storeId: string;
  storeName: string;
  weight_g: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  getGrouped: () => Record<string, CartItem[]>;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((s) => {
        const idx = s.items.findIndex(i => i.id === item.id);
        if (idx > -1) {
          const updated = [...s.items];
          updated[idx].quantity += item.quantity;
          return { items: updated };
        }
        return { items: [...s.items, item] };
      }),
      removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
      updateQty: (id, qty) => set((s) => ({
        items: s.items.map(i => i.id === id ? { ...i, quantity: qty } : i)
      })),
      getGrouped: () => {
        const groups: Record<string, CartItem[]> = {};
        get().items.forEach(item => {
          if (!groups[item.storeName]) groups[item.storeName] = [];
          groups[item.storeName].push(item);
        });
        return groups;
      },
      clear: () => set({ items: [] })
    }),
    { name: 'mireng-cart-v1' }
  )
);`,
    ddlMigration: `-- No database required (Zustand Local Storage Client Engine)`,
    mockEndpoint: {
      method: 'GET',
      path: '/api/cart-precheck',
      response: '{\n  "canCheckout": true,\n  "stockCheck": [\n    { "id": "e993358c-859a-4bc4-b778-5db0969bd3ff", "requested": 1, "available": 500, "status": "IN_STOCK" }\n  ],\n  "message": "Seluruh item di keranjang Anda siap diproses ke pengiriman."\n}'
    }
  },
  {
    id: 'step-6',
    number: 6,
    title: 'Integrasi RajaOngkir API Ongkos Kirim',
    category: 'Logistik Kurir',
    description: 'Sinkronisasi backend Mireng ke platform RajaOngkir untuk melakukan kalkulasi otomatis total ongkos kirim berdasarkan berat akumulatif produk fisik.',
    affectedFiles: ['src/shipping/shipping.service.ts', 'src/shipping/shipping.controller.ts'],
    checklist: [
      'Hubungkan NestJS HTTPService ke endpoint resmi RajaOngkir API.',
      'Identifikasi koordinat asal seller (origin) dan regional tujuan buyer.',
      'Dapatkan jumlah berat barang fisik secara akumulatif dalam sekali order.',
      'Return daftar kurir (JNE, POS, TIKI) beserta tarif resminya.'
    ],
    errorHandling: 'API key limit pada versi Free RajaOngkir membatasi pencarian area hanya sampai tingkat Kota/Satu origin. Pastikan penanganan fallback jika API drop, beri harga flat standar daerah agar alur checkout pembeli tidak terhenti total.',
    nestjsLabel: 'shipping.service.ts',
    nestjsBoilerplate: `// src/shipping/shipping.service.ts
import { Injectable, HttpService } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShippingService {
  constructor(private readonly httpService: HttpService) {}

  async calculateCost(originCityId: string, destinationCityId: string, weightG: number, courier: string) {
    const url = 'https://api.rajaongkir.com/starter/cost';
    const headers = {
      'key': process.env.RAJAONGKIR_API_KEY,
      'content-type': 'application/x-www-form-urlencoded'
    };
    
    const body = new URLSearchParams({
      origin: originCityId,
      destination: destinationCityId,
      weight: weightG.toString(),
      courier: courier
    });

    try {
      const resp = await firstValueFrom(this.httpService.post(url, body.toString(), { headers }));
      const results = resp.data.rajaongkir.results;
      return results[0]?.costs.map(c => ({
        service: c.service,
        description: c.description,
        cost: c.cost[0]?.value || 0,
        etd: c.cost[0]?.etd || '2-3 hari'
      })) || [];
    } catch (e) {
      // Fallback service jika API bermasalah
      return [{ service: 'FLAT_REG', description: 'Ekspedisi Standard', cost: 15000, etd: '3-4 hari' }];
    }
  }
}`,
    ddlMigration: `-- No database table required. Directly call via NestJS service integrations.`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/shipping/calculate',
      payload: '{\n  "origin": "444",\n  "destination": "115",\n  "weight": 1200,\n  "courier": "jne"\n}',
      response: '[\n  { "service": "REG", "description": "Layanan Reguler JNE", "cost": 18000, "etd": "2-3 hari" },\n  { "service": "YES", "description": "Layanan Besok Sampai JNE", "cost": 36000, "etd": "1-1 hari" }\n]'
    }
  },
  {
    id: 'step-7',
    number: 7,
    title: 'Sistem Escrow Vault (Rekening Bersama)',
    category: 'Mekanisme Keuangan',
    description: 'Mekanisme krusial untuk transaksi marketplace: uang pembeli ditahan sementara di rekening bersama (escrow) dan baru dicairkan ke saldo toko penjual setelah konfirmasi barang diterima.',
    affectedFiles: ['src/orders/entities/order.entity.ts', 'src/orders/orders.service.ts', 'src/stores/store.entity.ts'],
    checklist: [
      'Membuat status kolom escrow: "held" (ditahan), "released" (dicairkan), atau "refunded" (dikembalikan).',
      'Buat endpoint konfirmasi barang sampai: POST /orders/:id/confirm-delivery.',
      'Tambahkan nominal belanja dikurangi biaya aplikasi platform ke saldo toko seller.',
      'Sediakan logs aktivitas ledger untuk mencatat riwayat pemindahan dana.'
    ],
    errorHandling: 'Pastikan menggunakan PostgreSQL Database TRANSACTION (commit/rollback) agar penambahan saldo penjual dan perubahan berstatus escrow dijalankan bersama secara "atomic". Jika salah satu gagal, batalkan seluruhnya demi integritas sistem keuangan.',
    nestjsLabel: 'orders.service.ts (Escrow Release)',
    nestjsBoilerplate: `// src/orders/orders.service.ts (Escrow Manager)
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async releaseOrderEscrow(orderId: string, buyerId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId, buyer_id: buyerId },
        relations: ['store']
      });

      if (!order) throw new BadRequestException('Pesanan tidak ditemukan');
      if (order.escrow_status !== 'held') {
        throw new BadRequestException('Dana order ini tidak sedang ditahan di Escrow');
      }

      // Ubah status escrow & kirim
      order.escrow_status = 'released';
      order.shipping_status = 'delivered';
      await queryRunner.manager.save(order);

      // Mutasi penambahan saldo dompet toko penjual
      const store = order.store;
      store.balance = Number(store.balance) + Number(order.original_total);
      await queryRunner.manager.save(store);

      await queryRunner.commitTransaction();
      return { success: true, escrow_status: 'released', current_store_balance: store.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}`,
    ddlMigration: `-- Memperluas skema orders dengan status Escrow
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "escrow_status" VARCHAR(20) DEFAULT 'held';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_status" VARCHAR(20) DEFAULT 'none';`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/orders/e30-release-escrow',
      response: '{\n  "success": true,\n  "order_id": "89f33b1e-9273-455c-a567-2d43e590fa11",\n  "escrow_status": "released",\n  "shipping_status": "delivered",\n  "released_balance": 45000,\n  "recipient_store": "Mireng Goreng Gurih Sidoarjo",\n  "current_store_balance": 45000,\n  "message": "Transaksi berhasil dikonfirmasi. Dana Rp 45.000 telah masuk ke saldo toko."\n}'
    }
  },
  {
    id: 'step-8',
    number: 8,
    title: 'Integrasi Midtrans Gateway & Sinkronisasi Webhook',
    category: 'Integrasi Eksternal',
    description: 'Menghubungkan invoice tagihan order dengan Midtrans Payment Gateway, memperoleh token popup SNAP, dan memasang webhook listener aman dari server Midtrans.',
    affectedFiles: ['src/payment/payment.service.ts', 'src/payment/payment.controller.ts'],
    checklist: [
      'Pasang SDK midtrans-client dan muat kunci sandbox.',
      'Buat rute token SNAP pesanan: /payment/charge.',
      'Buat rute Webhook callback: POST /payment/webhook.',
      'Gunakan verifikasi Signature Key resmi untuk memastikan request murni diutus Midtrans.'
    ],
    errorHandling: 'Spoofing webhook merupakan penipuan siber: penyerang memicu POST buatan ke endpoint /payment/webhook seolah-olah order sudah lunas. Anda WAJIB menjamin signature_key yang dikirim dicocokkan dengan SHA512 hash order_id + status_id + server_key!',
    nestjsLabel: 'payment.service.ts (Midtrans Notification)',
    nestjsBoilerplate: `// src/payment/payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  
  verifyWebhookSignature(payload: {
    order_id: string;
    statusCode: string;
    gross_amount: string;
    signature_key: string;
  }): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const rawMaterial = payload.order_id + payload.statusCode + payload.gross_amount + serverKey;
    
    const calculatedHash = crypto
      .createHash('sha512')
      .update(rawMaterial)
      .digest('hex');

    if (calculatedHash !== payload.signature_key) {
      throw new BadRequestException('Verifikasi tanda tangan Webhook palsu / spoofing!');
    }
    return true;
  }
}`,
    ddlMigration: `-- Memastikan kolom invoice dan tagihan tersedia
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "midtrans_id" VARCHAR(100);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method" VARCHAR(50);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/payment/webhook',
      payload: '{\n  "order_id": "89f33b1e",\n  "statusCode": "200",\n  "gross_amount": "45000.00",\n  "signature_key": "SHA512_ENCRYPTED_SIGNATURE_HERE",\n  "transaction_status": "settlement"\n}',
      response: '{\n  "status": "success",\n  "action": "order_marked_as_paid",\n  "order_id": "89f33b1e",\n  "payment_status": "paid",\n  "escrow_vault_status": "locked_under_held"\n}'
    }
  },
  {
    id: 'step-9',
    number: 9,
    title: 'Program Kemitraan Mireng Affiliate & Referrals Engine',
    category: 'Pertumbuhan & Marketing',
    description: 'Sistem bagi-bagi komisi rujukan belanja model Shopee Affiliate. Memungkinkan kontributor melacak tautan promosi kustom produk, menghitung persentase bayaran, dan mendeteksi self-referral (fraud) otomatis.',
    affectedFiles: ['src/affiliate/affiliate.service.ts', 'src/affiliate/entities/affiliate-log.entity.ts'],
    checklist: [
      'Membuat logger tautan kustom pembuat referral produk.',
      'Menyediakan pencegah self-referral (pembeli dilarang mencairkan rujukan lewat akun yang sama / sandi sama).',
      'Mengkalkulasikan komisi flat 5% untuk ditambahkan ke ledger afiliasi setelah order dilepas escrow.',
      'Sediakan log statistik klik dan dashboard performa konversi.'
    ],
    errorHandling: 'Self-referral fraud merugikan platform: pembeli nakal mendaftar akun tumbal lalu belanja memakai link referral sendiri untuk mencuri diskon / komisi. Atasi dengan membandingkan alamat IP, alamat pengiriman barang, serta nomor rekening bank milik pembeli vs perujuk.',
    nestjsLabel: 'affiliate.service.ts',
    nestjsBoilerplate: `// src/affiliate/affiliate.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAffiliateLog } from './entities/user-affiliate-logs.entity';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(UserAffiliateLog)
    private affiliateLogRepo: Repository<UserAffiliateLog>,
  ) {}

  async trackClick(referralCode: string, ipAddress: string) {
    const log = await this.affiliateLogRepo.findOneBy({ referral_code: referralCode });
    if (!log) throw new BadRequestException('Kode rujukan tidak valid!');
    
    // Tingkatkan jumlah klik
    log.total_clicks += 1;
    return this.affiliateLogRepo.save(log);
  }

  async validateReferralPayout(referrerId: string, buyerId: string, bankAccountReferrer: string, bankAccountBuyer: string) {
    if (referrerId === buyerId) {
      throw new BadRequestException('Self-Referral Terdeteksi: Anda dilarang memperoleh komisi dari rujukan milik Anda sendiri.');
    }
    if (bankAccountReferrer === bankAccountBuyer) {
      throw new BadRequestException('Indikasi Akun Gandar: Kemiripan rekening bank terdeteksi sebagai eksploitasi fraud.');
    }
    return true;
  }
}`,
    ddlMigration: `-- Membuat tabel pencatatan click & referral
CREATE TABLE "user_affiliate_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referrer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "referral_code" VARCHAR(50) UNIQUE NOT NULL,
  "total_clicks" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/affiliate/track-conversion',
      payload: '{\n  "referral_code": "mire-ton-192a",\n  "buyer_id": "buyer-uuid-99a",\n  "referrer_id": "e30e181c-cb8e-4a6c-9cff-a620d43f01fd"\n}',
      response: '{\n  "referral_valid": true,\n  "commission_rate": "5%",\n  "product_price": 249000,\n  "action": "commission_logged_to_escrow",\n  "potential_payout_idr": 12450,\n  "message": "Rujukan affiliate berhasil diverifikasi, komisi Rp 12.450 dicatat menunggu order dilepas escrow."\n}'
    }
  },
  {
    id: 'step-10',
    number: 10,
    title: 'Sistem Dompet Koin & Klaim Gamifikasi Harian (Loyalty Coins)',
    category: 'Retensi Pembeli',
    description: 'Sistem loyalti loyalty koin yang gamified (skema beruntun bertingkat) guna menjaga tingkat keaktifan harian pembeli. Koin dapat dipotongkan langsung di kasir checkout.',
    affectedFiles: ['src/coins/coins.service.ts', 'src/coins/entities/coin-ledger.entity.ts'],
    checklist: [
      'Membuat daily login check-in checker dengan insentif kelipatan beruntun (day-1: 100, day-2: 200, DST).',
      'Integrasikan koin sebagai nominal potongan (1 koin = 1 IDR) pada kalkulasi checkout.',
      'Penyetelan limitasi pemotongan koin maksimal 25% dari grand total belanja untuk mengamankan margin cashflow.',
      'Sajikan rekam jejak ledger koin secara mendetail.'
    ],
    errorHandling: 'Gunakan isolasi baris database (SELECT FOR UPDATE) atau database constraints koin tidak boleh negatif, guna menghindari celah eksploitasi "double-spend" koin saat user checkout super cepat di dua tab bersamaan.',
    nestjsLabel: 'coins.service.ts',
    nestjsBoilerplate: `// src/coins/coins.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserCoinLedger } from './entities/user-coin-ledger.entity';

@Injectable()
export class CoinsService {
  constructor(private dataSource: DataSource) {}

  async claimDailyCoins(userId: string, currentStreak: number) {
    return this.dataSource.transaction(async (manager) => {
      // Skema insentif koin harian bertingkat
      const coinReward = Math.min(100 * (currentStreak + 1), 1000); 

      const ledgerEntry = manager.create(UserCoinLedger, {
        user_id: userId,
        amount: coinReward,
        transaction_type: 'check_in',
        description: \`Klaim koin harian berturut-turut hari ke-\${currentStreak + 1}\`
      });

      await manager.save(ledgerEntry);
      return { success: true, claimed_amount: coinReward };
    });
  }
}`,
    ddlMigration: `-- Membuat tabel buku tabungan koin
CREATE TABLE "user_coin_ledger" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount" INTEGER NOT NULL,
  "transaction_type" VARCHAR(50) NOT NULL,
  "description" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/coins/check-in',
      payload: '{\n  "user_id": "buyer-uuid-99a",\n  "current_streak": 3\n}',
      response: '{\n  "success": true,\n  "claimed_coins": 400,\n  "next_day_reward": 500,\n  "streak_days": 4,\n  "message": "Buku cek-in berhasil dicatat harian! Anda mendapatkan 400 Koin."\n}'
    }
  },
  {
    id: 'step-11',
    number: 11,
    title: 'Dompet Saldo Penjual, Escrow Release & SMS/OTP Withdrawal Authorization',
    category: 'Seller Keuangan',
    description: 'Proses pemindahan dana escrow yang otomatis dilepas ke dompet saldo penjual (store.balance) setelah buyer klik rilis, dilengkapi verifikasi SMS/OTP aman saat checkout penarikan bank.',
    affectedFiles: ['src/stores/seller-wallet.service.ts', 'src/stores/entities/store-wallet-ledger.entity.ts'],
    checklist: [
      'Pelepasan otomatis dana pesanan ke saldo toko setelah komplain masa garansi 2x24 jam kedaluwarsa.',
      'Membuat verifikator OTP SMS/Whatsapp sebelum berkas ditarik dikirim ke kliring mitra perbankan.',
      'Sistem menghitung biaya komisi potongan level admin (misal 2% tier pro) secara waktu nyata.',
      'Menampilkan riwayat penarikan bank bersertifikasi.'
    ],
    errorHandling: 'Kebocoran dana penarikan: pastikan saldo mencukupi berdasar decimal casting presisi tinggi di database relasional. Transaksi penarikan WAJIB bertanda tangan OTP sah, dan status penarikan dijamin berlabel "pending" sampai pihak bank melepaskan respon sukses.',
    nestjsLabel: 'seller-wallet.service.ts',
    nestjsBoilerplate: `// src/stores/seller-wallet.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreWalletLedger } from './entities/store-wallet-ledger.entity';

@Injectable()
export class SellerWalletService {
  constructor(private dataSource: DataSource) {}

  async requestWithdrawal(storeId: string, amount: number) {
    return this.dataSource.transaction(async (manager) => {
      const store = await manager.findOne(Store, { where: { id: storeId } });
      if (!store || Number(store.balance) < amount) {
        throw new BadRequestException('Saldo toko Anda tidak mencukupi untuk melakukan pencairan ini.');
      }

      // Potong saldo sementara
      store.balance = Number(store.balance) - amount;
      await manager.save(store);

      // Catat mutasi penahanan withdrawal
      const log = manager.create(StoreWalletLedger, {
        store_id: storeId,
        amount: -amount,
        type: 'withdrawal',
        reference_id: 'pending_otp'
      });
      await manager.save(log);

      return { success: true, otp_sent: true, hash: 'otp_auth_token_9901a' };
    });
  }
}`,
    ddlMigration: `-- Membuat tabel mutasi log denda belanja & saldo
CREATE TABLE "store_wallet_ledger" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "amount" DECIMAL(12,2) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "reference_id" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/seller/wallet/withdraw',
      payload: '{\n  "store_id": "c0559f23-952b-4ba5-b09e-dc39832cb36a",\n  "amount": 500000,\n  "destination_bank": "BCA",\n  "account_number": "812002199"\n}',
      response: '{\n  "success": true,\n  "withdrawal_id": "wd-723a-f1",\n  "otp_sent_to": "0812****120",\n  "status": "pending_otp_verification",\n  "amount_requested": 500000,\n  "admin_fee_flat": 6500,\n  "message": "OTP verifikasi keamanan dikirim via SMS. Saldo Anda ditahan sementara hingga OTP sah dimasukkan."\n}'
    }
  },
  {
    id: 'step-12',
    number: 12,
    title: 'Mireng Live Streaming & Real-Time Product Pinning',
    category: 'Video Interaktif',
    description: 'Portal live streaming mandiri di mana penjual mempromosikan barang lewat feed video langsung dan membubuhkan keranjang kuning pembelian instan serta voucher live diskon tambahan.',
    affectedFiles: ['src/live/live-shopping.service.ts', 'src/live/entities/live-stream.entity.ts'],
    checklist: [
      'Gunakan WebSockets (Gateway) untuk mendistribusikan sinyal live chat & pinned product real-time.',
      'Sematkan produk ke area keranjang penonton live shopping (Keranjang Kuning).',
      'Atur pengembalian data live session aktif di halaman visual depan pembeli.',
      'Sajikan tombol interaksi suka (like counter) & deteksi jumlah pemirsa serentak.'
    ],
    errorHandling: 'Sinyal WebSocket putus-nyambung: pastikan penonton otomatis me-reconnect otomatis ke room live server. Hindari menyimpan chat buffer di database utama (PostgreSQL) terlalu ketat, utamakan log in-memory/Redis, atau tulis ke DB dalam batch berkala untuk memangkas I/O.',
    nestjsLabel: 'live-shopping.service.ts',
    nestjsBoilerplate: `// src/live/live-shopping.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreLiveSession } from './entities/store-live-sessions.entity';

@Injectable()
export class LiveShoppingService {
  constructor(
    @InjectRepository(StoreLiveSession)
    private liveRepo: Repository<StoreLiveSession>,
  ) {}

  async pinProductToLive(sessionId: string, storeId: string, productId: string) {
    const session = await this.liveRepo.findOneBy({ id: sessionId, store_id: storeId });
    if (!session) throw new BadRequestException('Sesi live streaming tidak ditemukan atau akses ditolak!');
    
    session.pinned_product_id = productId;
    await this.liveRepo.save(session);
    
    // Kirim event penyiaran WebSocket ke seluruh penonton live
    return { success: true, pinned_product_id: productId };
  }
}`,
    ddlMigration: `-- Membuat tabel sesi video live streaming seller
CREATE TABLE "store_live_sessions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
  "title" VARCHAR(150) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'live',
  "viewer_count" INTEGER DEFAULT 0,
  "pinned_product_id" UUID REFERENCES "products"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/seller/live/pin-product',
      payload: '{\n  "session_id": "liv-sidoarjo-04b12",\n  "product_id": "prod-1"\n}',
      response: '{\n  "broadcast_event": "PINNED_PRODUCT_CHANGED",\n  "session_id": "liv-sidoarjo-04b12",\n  "pinned_product": {\n    "id": "prod-1",\n    "name": "Mireng Instan Goreng (Fisik)",\n    "price": 15000,\n    "discount_flash_live": "10%"\n  },\n  "timestamp": "2026-06-18T13:59:00.000Z"\n}'
    }
  },
  {
    id: 'step-13',
    number: 13,
    title: 'Admin System: Biaya Layanan, PPN & Dispute Resolution Board',
    category: 'Admin & Platform',
    description: 'Pusat kemudi admin platform marketplace untuk menyetel presentase komisi potongan toko (Admin fee) per kategori / rentang tier seller, hitungan PPN 11% otomatis, dan penanganan arbitrase jika terjadi sengketa barang belanja.',
    affectedFiles: ['src/admin/admin-settlement.service.ts', 'src/admin/entities/platform-fee.entity.ts'],
    checklist: [
      'Gunakan tabel fee platform per-merchant tier: Standard (1%), Pro (2%), Enterprise (3.5%).',
      'Hitung tarif PPN 11% dari potongan komisi admin, lalu masukkan ke ledger rekonsiliasi perpajakan.',
      'Sediakan console panel dispute resolution: Admin berhak melepaskan dana escrow ke seller atau me-refund kembali ke pembeli jika terbukti terjadi kecurangan transfer.',
      'Sistem mencatat audit log segala aksi komando admin.'
    ],
    errorHandling: 'Sengketa COD atau barang hilang: pastikan platform escrow tidak melepaskan dana selama status dispute bernilai true. Admin ditunjuk sebagai dewan juri penengah arbitrase bersertifikat untuk memilah berkas pengiriman resi JNE vs bukti video unboxing dari pembeli sebelum mengutus pelepasan dana.',
    nestjsLabel: 'admin-settlement.service.ts',
    nestjsBoilerplate: `// src/admin/admin-settlement.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class AdminSettlementService {
  constructor(private dataSource: DataSource) {}

  async resolveDispute(orderId: string, decision: 'refund_to_buyer' | 'release_to_seller') {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId } });
      if (!order) throw new BadRequestException('Order tidak ditemukan!');
      if (order.escrow_status !== 'held') {
        throw new BadRequestException('Pesanan ini sudah tidak dapat diarbitrase karena dana telah mengalir.');
      }

      if (decision === 'refund_to_buyer') {
        order.escrow_status = 'refunded';
        order.shipping_status = 'cancelled';
        // Logic refund dana bank pembeli
      } else {
        order.escrow_status = 'released';
        // Logic transfer ke store balance milik seller
      }

      await manager.save(order);
      return { success: true, escrow_final_state: order.escrow_status };
    });
  }
}`,
    ddlMigration: `-- Membuat tabel konfigurasi fee
CREATE TABLE "platform_fee_settings" (
  "id" SERIAL PRIMARY KEY,
  "seller_tier" VARCHAR(50) UNIQUE NOT NULL,
  "commission_rate_percent" DECIMAL(4,2) NOT NULL,
  "vat_rate_percent" DECIMAL(4,2) DEFAULT 11.00,
  "updated_at" TIMESTAMP DEFAULT now()
);`,
    mockEndpoint: {
      method: 'POST',
      path: '/api/admin/system/adjust-fees',
      payload: '{\n  "seller_tier": "pro",\n  "commission_rate_percent": 2.25,\n  "vat_rate_percent": 11.00\n}',
      response: '{\n  "success": true,\n  "seller_tier": "pro",\n  "previous_rate": "2.00%",\n  "new_rate": "2.25%",\n  "vat_retained_rate": "11.00%",\n  "message": "Konfigurasi komisi platform berhasil diperbarui oleh Admin Super. Merchant tier Pro sekarang dipotong 2.25% per transaksi."\n}'
    }
  }
];

export default function RoadmapCopilot() {
  const [activeStepId, setActiveStepId] = useState<string>('step-1');
  const [isCheckedList, setIsCheckedList] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<'nestjs' | 'ddl' | null>(null);
  const [playgroundLogs, setPlaygroundLogs] = useState<string[]>([]);
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load checklist states from local storage for persistence
  useEffect(() => {
    const saved = localStorage.getItem('mireng-checklist-tracker');
    if (saved) {
      try {
        setIsCheckedList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const currentStep = MIRENG_STEPS.find(s => s.id === activeStepId) || MIRENG_STEPS[0];

  const handleToggleCheck = (key: string) => {
    const updated = { ...isCheckedList, [key]: !isCheckedList[key] };
    setIsCheckedList(updated);
    localStorage.setItem('mireng-checklist-tracker', JSON.stringify(updated));
  };

  const handleCopyCode = (text: string, type: 'nestjs' | 'ddl') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Simulate endpoint hit
  const simulateApiCall = () => {
    setIsSimulating(true);
    setPlaygroundResponse(null);
    setPlaygroundLogs([
      `⚡ [HTTP CLIENT] Mengirim ${currentStep.mockEndpoint.method} ke endpoint: ${currentStep.mockEndpoint.path}`,
      currentStep.mockEndpoint.payload ? `📦 [PAYLOAD] Menyisipkan request body:\n${currentStep.mockEndpoint.payload}` : `🔓 [INFO] Request tanpa payload`
    ]);

    setTimeout(() => {
      setPlaygroundLogs(prev => [
        ...prev,
        `📡 [ROUTER] Route matching berhasil ditemukan...`,
        `🔐 [AUTH GUARD] Memvalidasi hak akses token dan role...`,
        `🧬 [ORCHESTRATOR] Memulai pemanggilan method di NestJS controller untuk ${currentStep.category}...`
      ]);
    }, 500);

    setTimeout(() => {
      setPlaygroundLogs(prev => [
        ...prev,
        `🛒 [SERVICE] Bisnis logika berhasil tuntas tanpa exception!`,
        `✨ [JSON RESPONSE] Memberi status 201/200 OK standar.`
      ]);
      setPlaygroundResponse(currentStep.mockEndpoint.response);
      setIsSimulating(false);
    }, 1500);
  };

  // Calculate current progress of user
  const totalTasks = MIRENG_STEPS.reduce((sum, s) => sum + s.checklist.length, 0);
  const completedTasks = MIRENG_STEPS.reduce((sum, s) => {
    let completedCount = 0;
    s.checklist.forEach((_, tIdx) => {
      if (isCheckedList[`${s.id}-${tIdx}`]) completedCount++;
    });
    return sum + completedCount;
  }, 0);
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Top Banner Progress Tracker */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="space-y-1 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 border border-indigo-400/20 rounded-md bg-indigo-500/10 text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">
              STUDIO STEP BUILDER
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Panduan Pengembangan Terstruktur Mireng
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Gunakan asisten interaktif ini untuk memandu Anda membongkar, mengulas, dan mengimplementasi Mireng step-by-step tanpa melompati alur fundamental. Centang kemajuan Anda untuk menyimpan progres pengerjaan di peramban lokal Anda.
          </p>
        </div>

        {/* Global Progress Radial / Bar */}
        <div className="w-full md:w-56 bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Total Progres:</span>
            <span className="font-bold text-emerald-400">{overallPercentage}% ({completedTasks}/{totalTasks} Tugas)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Guide Sidebar */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-2.5 shadow-3xs">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-500" /> Jalur Langkah-demi-Langkah
            </h3>
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {MIRENG_STEPS.map((step) => {
                const stepCompletedCount = step.checklist.filter((_, tIdx) => isCheckedList[`${step.id}-${tIdx}`]).length;
                const isStepFullyDone = stepCompletedCount === step.checklist.length;
                const progressColor = isStepFullyDone ? 'text-emerald-600' : stepCompletedCount > 0 ? 'text-amber-500' : 'text-slate-400';

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStepId(step.id);
                      setPlaygroundLogs([]);
                      setPlaygroundResponse(null);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left text-xs transition-all duration-200 select-none ${
                      activeStepId === step.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                        : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                      activeStepId === step.id 
                        ? 'bg-white text-indigo-600' 
                        : isStepFullyDone 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.number}
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <span className={`text-[9px] font-mono tracking-wider font-semibold block uppercase ${
                        activeStepId === step.id ? 'text-indigo-200' : 'text-indigo-500'
                      }`}>
                        {step.category}
                      </span>
                      <h4 className="font-display font-bold leading-tight truncate">{step.title}</h4>
                      <div className="flex justify-between items-center pt-1 text-[9px] font-mono">
                        <span className={activeStepId === step.id ? 'text-indigo-200' : 'text-slate-400'}>
                          Sub-tugas: {stepCompletedCount}/{step.checklist.length}
                        </span>
                        {stepCompletedCount > 0 && (
                          <span className={`font-bold ${activeStepId === step.id ? 'text-white' : progressColor}`}>
                            {isStepFullyDone ? 'SELESAI' : 'PROGRES'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-amber-900 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-[11px] font-display">Mengapa manual & tidak digabung?</strong>
              <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                Mengintegrasikan seluruh sistem secara sekaligus memicu error routing dan bug database relasional jika data tidak konsisten. Dengan metode terstruktur ini, pastikan tabel database dan controller divalidasi satu-persatu secara matang.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Step Work Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-6 space-y-4 shadow-3xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase">
                  Langkah {currentStep.number} dari {MIRENG_STEPS.length}
                </span>
                <h3 className="font-bold text-slate-900 text-sm md:text-base font-display mt-2">{currentStep.title}</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 capitalize bg-slate-100 p-1 px-2.5 rounded-lg border border-slate-200/50">
                {currentStep.category}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed leading-normal">{currentStep.description}</p>

            {/* Affected files code listing */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block tracking-wider">
                📁 Berkas Yang Dibuat/Diedit Pada Repositori Utama:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentStep.affectedFiles.map((f, fIdx) => (
                  <code key={fIdx} className="bg-slate-50 text-indigo-600 border border-slate-150 rounded-md p-1 px-2 text-[10px] font-mono font-semibold">
                    {f}
                  </code>
                ))}
              </div>
            </div>

            {/* Checklist tasks tracker */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block font-display">📝 Daftar Tugas Mandiri (Centang Bila Sudah Dilakukan) :</span>
              <div className="space-y-2">
                {currentStep.checklist.map((task, tIdx) => {
                  const storageKey = `${currentStep.id}-${tIdx}`;
                  const isChecked = !window ? false : !!isCheckedList[storageKey];
                  return (
                    <button
                      key={tIdx}
                      onClick={() => handleToggleCheck(storageKey)}
                      className="w-full flex items-start gap-2.5 text-left text-xs bg-white p-2.5 rounded-lg border border-slate-150/70 hover:border-slate-350 transition-colors select-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`leading-normal ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                        {task}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error prevention guidelines */}
            <div className="p-4 bg-rose-50/30 border border-rose-100/40 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-rose-800 font-display flex items-center gap-1.5">
                🛡️ Panduan Keamanan & Pencegahan Error
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {currentStep.errorHandling}
              </p>
            </div>
          </div>

          {/* NestJS Code Sample & PostgreSQL DDL tab panel */}
          <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                💾 FILE BLUEPRINT: {currentStep.nestjsLabel}
              </span>
              <button
                onClick={() => handleCopyCode(currentStep.nestjsBoilerplate, 'nestjs')}
                className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition"
              >
                {copiedText === 'nestjs' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedText === 'nestjs' ? 'Tersalin!' : 'Salin Blueprint'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-auto max-h-[380px] leading-relaxed select-all">
              <code>{currentStep.nestjsBoilerplate}</code>
            </pre>
          </div>

          {/* DDL PostgreSQL Migration Script */}
          {currentStep.ddlMigration !== '-- No database required (Zustand Local Storage Client Engine)' && 
           currentStep.ddlMigration !== '-- No database table required. Directly call via NestJS service integrations.' && (
            <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-slate-400" /> FILE DDL SQL: migration.sql
                </span>
                <button
                  onClick={() => handleCopyCode(currentStep.ddlMigration, 'ddl')}
                  className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition"
                >
                  {copiedText === 'ddl' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedText === 'ddl' ? 'Tersalin!' : 'Salin DDL SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-auto max-h-[200px] leading-relaxed select-all">
                <code>{currentStep.ddlMigration}</code>
              </pre>
            </div>
          )}

          {/* Dynamic Mock API testing box */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-6 space-y-4 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-slate-800 text-sm font-bold font-display flex items-center gap-1.5">
                  <PlayCircle className="w-4.5 h-4.5 text-indigo-500" /> Simulator Pengujian Endpoint Rute
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">Ujilah response JSON dan alur integrasi handler API di bawah ini sebelum Anda mengkodekannya di NestJS Anda.</p>
              </div>
              <button
                onClick={simulateApiCall}
                disabled={isSimulating}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 px-4 rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Sedang Tes...' : 'Verifikasi Rute'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Terminal Logs log */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                  📟 Log Analisis REST Client:
                </span>
                <div className="bg-slate-950 border border-slate-800 text-zinc-300 font-mono text-[9px] p-3 rounded-lg h-[180px] overflow-y-auto leading-relaxed shadow-inner">
                  {playgroundLogs.map((log, lIdx) => (
                    <div key={lIdx}>
                      <span className="text-zinc-500 select-none">❯ </span>{log}
                    </div>
                  ))}
                  {playgroundLogs.length === 0 && (
                    <div className="text-zinc-500 h-full flex items-center justify-center text-center">
                      Belum memulai request. Klik tombol &quot;Verifikasi Rute&quot; di atas untuk mensimulasikan alur handler controller data.
                    </div>
                  )}
                </div>
              </div>

              {/* JSON simulatedResponse output */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                  📦 Hasil standard JSON Response:
                </span>
                <div className="bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[10px] p-3 rounded-lg h-[180px] overflow-y-auto shadow-inner">
                  {playgroundResponse ? (
                    <pre className="select-all">{playgroundResponse}</pre>
                  ) : (
                    <div className="text-zinc-600 h-full flex items-center justify-center text-center">
                      {isSimulating ? 'Memuat response...' : 'Standard JSON Response akan tercetak di sini.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

