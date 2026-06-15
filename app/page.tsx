'use client';

import { useVolcanoes } from '@/hooks/useVolcanoes';
import { MapContainer } from '@/components/Map/MapContainer';
import { useMapStore } from '@/store/mapStore';
import { LEVEL_CONFIG, VolcanoLevel } from '@/lib/types';

export default function Home() {
  const { volcanoes, isLoading, refresh } = useVolcanoes();
  const { selectedVolcano, setSelectedVolcano } = useMapStore();

  // Count volcanoes per alert level
  const stats = {
    [VolcanoLevel.NORMAL]: 0,
    [VolcanoLevel.WASPADA]: 0,
    [VolcanoLevel.SIAGA]: 0,
    [VolcanoLevel.AWAS]: 0,
  };

  volcanoes.forEach((v) => {
    if (v.level in stats) {
      stats[v.level as VolcanoLevel]++;
    }
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-orange-500 animate-pulse inline-block" />
            GeoWatch Indonesia
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-serif italic">
            Peta Interaktif Gunung Api Aktif & Potensi Panas Bumi
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
              </svg>
            )}
            Segarkan Data
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative bg-slate-900 p-4 h-[65vh] md:h-auto flex flex-col gap-4">
          {/* Status Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(LEVEL_CONFIG).map(([level, config]) => {
              const count = stats[Number(level) as VolcanoLevel] || 0;
              return (
                <div
                  key={level}
                  className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-3 transition-all"
                >
                  <span className="text-xl md:text-2xl font-bold font-mono" style={{ color: config.color }}>
                    {count}
                  </span>
                  <span className="text-[9px] md:text-xs text-slate-400 font-medium">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <MapContainer />
          </div>
        </div>

        {/* Sidebar / Detailed Info Panel */}
        <aside className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-none shrink-0">
          {selectedVolcano ? (
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mb-2"
                    style={{
                      backgroundColor: LEVEL_CONFIG[selectedVolcano.level].color + '22',
                      color: LEVEL_CONFIG[selectedVolcano.level].color,
                      border: `1px solid ${LEVEL_CONFIG[selectedVolcano.level].color}44`,
                    }}
                  >
                    Level {selectedVolcano.level}: {LEVEL_CONFIG[selectedVolcano.level].label}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-100">{selectedVolcano.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedVolcano.regency}, {selectedVolcano.province}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVolcano(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Volcano Stats */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 block">Ketinggian</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {selectedVolcano.elevation.toLocaleString('id-ID')} mdpl
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Koordinat</span>
                  <span className="font-mono text-slate-200">
                    {selectedVolcano.lat.toFixed(4)}, {selectedVolcano.lng.toFixed(4)}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-900">
                  <span className="text-slate-500 block">Geothermal</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1.5 mt-0.5">
                    {selectedVolcano.isGeothermal ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                        Ya (Memiliki potensi panas bumi)
                      </>
                    ) : (
                      'Tidak terdeteksi'
                    )}
                  </span>
                </div>
              </div>

              {/* Alert Description */}
              <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-lg text-xs text-slate-400 font-serif leading-relaxed">
                <span className="text-slate-200 font-sans font-bold block mb-1">Status Aktivitas:</span>
                {LEVEL_CONFIG[selectedVolcano.level].description}
              </div>

              {/* Report Actions */}
              <div className="mt-auto pt-4 flex flex-col gap-2">
                <a
                  href={selectedVolcano.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 bg-orange-600 hover:bg-orange-500 text-xs font-semibold rounded-lg text-white shadow-lg transition-colors"
                >
                  Lihat Detail Laporan PVMBG
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 select-none">
              <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="font-bold text-slate-400 text-sm">Gunung Api Belum Dipilih</h3>
              <p className="text-xs text-slate-650 max-w-xs mt-1.5 px-4 font-serif">
                Silakan klik salah satu kotak gunung api di peta untuk melihat informasi aktivitas vulkanik secara terperinci.
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
