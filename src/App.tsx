import React, { useState } from 'react';
import ProjectOverview from './components/ProjectOverview';
import DatabaseVisualizer from './components/DatabaseVisualizer';
import ApiExplorer from './components/ApiExplorer';
import RoadmapCopilot from './components/RoadmapCopilot';
import HybridCheckout from './components/HybridCheckout';

import { 
  Terminal, 
  Database, 
  Server, 
  Compass, 
  ShoppingCart, 
  AlertCircle, 
  Layers, 
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'api' | 'roadmap' | 'checkout'>('overview');

  // Multi-tab specification
  const tabs = [
    { id: 'overview', name: 'Ringkasan Sistem', icon: Terminal, description: 'Tech stack, visi platform, dan aturan pengembangan' },
    { id: 'database', name: 'Visualizer Database', icon: Database, description: '29 Tabel relasional PostgreSQL, DDL & TypeORM' },
    { id: 'api', name: 'Rute API & Guards', icon: Server, description: 'Modular NestJS controllers, guards, & playground' },
    { id: 'roadmap', name: 'Peta Jalan & Copilot', icon: Compass, description: 'Penyelesaian Fase 3 & template kode siap pakai' },
    { id: 'checkout', name: 'Simulator Checkout', icon: ShoppingCart, description: 'Alur transaksi hybrid multi-vendor & escrow' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Dynamic Upper Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-150/80 px-3 py-2.5 md:px-6 md:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base md:text-lg font-display tracking-wider shadow-sm shrink-0">
            MR
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-slate-950 font-display text-xs md:text-base tracking-tight truncate">Mireng DevSpace &amp; Studio</h1>
              <span className="text-[8px] md:text-[9px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.2 rounded-full font-bold uppercase shrink-0">
                JUNI 2026
              </span>
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-400 truncate hidden sm:block">Interactive workspace for Mireng hybrid multi-vendor Indonesian marketplace</p>
            <p className="text-[9px] text-slate-400 truncate block sm:hidden">Mireng Hybrid Marketplace Developer Portal</p>
          </div>
        </div>

        {/* Global summary stats bar */}
        <div className="flex flex-wrap gap-1.5 md:gap-3 font-mono text-[9px] md:text-[10px] items-center text-slate-500">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 md:px-2 md:py-1 shrink-0">
            <Layers className="w-3 h-3 text-indigo-500" />
            <span>29 Tables</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 md:px-2 md:py-1 shrink-0">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>NestJS API</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 md:px-2 md:py-1 shrink-0">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>NextJS Client</span>
          </div>
          <a
            href="https://github.com/pelangiaurora/mireng"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-indigo-600 border border-slate-150/75 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 md:px-2 md:py-1 rounded transition ml-auto md:ml-0 shrink-0"
          >
            <span>Open Git</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2.5 py-4 md:px-6 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Navigation panel */}
        <nav className="lg:col-span-3 space-y-2.5 w-full overflow-hidden">
          <div className="hidden lg:block pb-1 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
            Developer Menu
          </div>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-0 gap-1.5 lg:space-y-1 no-scrollbar w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl text-left border text-xs font-semibold select-none transition-all ${
                    activeTab === tab.id
                      ? 'bg-white border-indigo-500 shadow-xs text-indigo-900 ring-1 ring-indigo-500'
                      : 'bg-white border-slate-150/70 hover:bg-slate-50 hover:border-slate-250 text-slate-600'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-display text-[11px] md:text-xs">{tab.name}</span>
                    <span className="hidden xl:block text-[9px] text-slate-400 font-normal leading-tight mt-0.5">{tab.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 gap-3 items-start text-xs text-indigo-900 leading-relaxed font-sans mt-3">
            <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Panduan Cepat Mireng Studio:</strong>
              <p className="mt-1 text-[11px] text-indigo-800/90 leading-normal">
                Gunakan menu di atas untuk menjelajahi tumpukan tech stack Mireng secara interaktif. Anda dapat dengan mudah menyalin kode TypeORM, DDL PostgreSQL, menguji rute Webhook secara langsung, dan menyimulasikan sistem pelepasan dana Escrow platform.
              </p>
            </div>
          </div>
        </nav>

        {/* Tab display zone */}
        <main className="lg:col-span-9 bg-white border border-slate-150/80 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-2xs min-h-[480px] w-full overflow-hidden">
          {activeTab === 'overview' && <ProjectOverview />}
          {activeTab === 'database' && <DatabaseVisualizer />}
          {activeTab === 'api' && <ApiExplorer />}
          {activeTab === 'roadmap' && <RoadmapCopilot />}
          {activeTab === 'checkout' && <HybridCheckout />}
        </main>
      </div>

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-[10px] text-slate-400 font-mono">
        Mireng Marketplace Ecosystem Dashboard Hub • Juni 2026 • Dirancang dengan dedikasi tinggi & ketepatan visual yang rapi
      </footer>
    </div>
  );
}
