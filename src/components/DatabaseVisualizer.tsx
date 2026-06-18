import React, { useState } from 'react';
import { MIRENG_TABLES, DatabaseTable } from '../data';
import { Database, Table, Code, FileText, Check, Copy, HelpCircle, Key, Link2 } from 'lucide-react';

export default function DatabaseVisualizer() {
  const [selectedTable, setSelectedTable] = useState<DatabaseTable>(MIRENG_TABLES[0]);
  const [activeCodeTab, setActiveCodeTab] = useState<'entity' | 'ddl'>('entity');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTables = MIRENG_TABLES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in p-1">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm md:text-base font-display flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" /> Skema Database (v3)
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">29 TABEL</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Pilihlah salah satu tabel fondasi di bawah untuk melihat kolom detail, entity class TypeORM, dan DDL migration script.
          </p>

          <input 
            type="text" 
            placeholder="Cari tabel database..." 
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredTables.map((table) => (
              <button
                key={table.name}
                onClick={() => {
                  setSelectedTable(table);
                  setCopied(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors border ${
                  selectedTable.name === table.name
                    ? 'bg-indigo-500 text-white font-semibold border-indigo-500 shadow-xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Table className={`w-3.5 h-3.5 ${selectedTable.name === table.name ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-mono">{table.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 rounded-full ${
                  selectedTable.name === table.name ? 'bg-indigo-600 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {table.fields.length} kolom
                </span>
              </button>
            ))}
            {filteredTables.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">Tidak ada tabel yang cocok</div>
            )}
          </div>
        </div>

        {/* Database Rule Panel */}
        <div className="rounded-xl border border-amber-100/30 bg-amber-50/20 p-4 space-y-2">
          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Aturan Migrasi PostgreSQL
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Mireng menonaktifkan <code className="bg-amber-100 text-amber-800 font-mono px-1 rounded text-[10px]">synchronize: true</code> di TypeORM untuk menjaga integritas data produksi. <strong>Gunakan file manual SQL/migrasi</strong> di folder database untuk perubahan skema!
          </p>
        </div>
      </div>

      {/* Main Details */}
      <div className="lg:col-span-8 space-y-6">
        {/* Table Spec summary */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-mono text-base md:text-lg">table: "{selectedTable.name}"</span>
              <span className="text-[10px] uppercase font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">FOUNDATION TABLE</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{selectedTable.description}</p>
          </div>

          {/* Fields list */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs w-full">
            <div className="overflow-x-auto w-full">
              <div className="min-w-[540px]">
                <div className="bg-slate-50/70 border-b border-slate-100 grid grid-cols-12 px-4 py-2.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                  <span className="col-span-4 flex items-center gap-1"><Key className="w-3.5 h-3.5 text-slate-400" /> Kolom</span>
                  <span className="col-span-3">Tipe Data</span>
                  <span className="col-span-5">Deskripsi Peran</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
                  {selectedTable.fields.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 px-4 py-3 text-xs text-slate-700 hover:bg-slate-50/50 transition-colors items-start">
                      <div className="col-span-4 font-mono font-semibold text-indigo-600 flex flex-col gap-0.5 pr-2 truncate">
                        <span>{f.name}</span>
                        {f.constraints && <span className="text-[9px] text-slate-400 bg-slate-100/30 self-start px-1 rounded-sm uppercase tracking-wide font-mono scale-95 origin-left">{f.constraints}</span>}
                      </div>
                      <span className="col-span-3 font-mono text-slate-500 font-semibold pr-2 select-all">{f.type}</span>
                      <span className="col-span-5 text-slate-500 leading-normal text-[11px]">{f.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Generator & Explanations */}
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCodeTab('entity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCodeTab === 'entity'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> TypeORM Entity (TypeScript)
              </button>
              <button
                onClick={() => setActiveCodeTab('ddl')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCodeTab === 'ddl'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> PostgreSQL DDL Migration
              </button>
            </div>

            <button
              onClick={() => handleCopy(activeCodeTab === 'entity' ? selectedTable.entityCode : selectedTable.migrationCode)}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-auto max-h-[380px] leading-relaxed">
            <code>{activeCodeTab === 'entity' ? selectedTable.entityCode : selectedTable.migrationCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
