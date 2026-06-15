'use client';

import { LEVEL_CONFIG } from '@/lib/types';
import { useMapStore } from '@/store/mapStore';

export function MapLegend() {
  const showGeothermal = useMapStore((s) => s.showGeothermal);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-slate-700/80 backdrop-blur-md p-3 rounded-lg shadow-xl max-w-xs text-[10px] select-none text-slate-200">
      <h3 className="font-semibold text-slate-100 mb-2 border-b border-slate-700/50 pb-1">
        Tingkat Aktivitas Gunung Api
      </h3>
      <div className="space-y-1.5 mb-3">
        {Object.entries(LEVEL_CONFIG).map(([level, config]) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm border border-white/10 shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-200">{config.label}</span>
              <span className="text-slate-500 font-normal text-[9px]">(Level {level})</span>
            </div>
          </div>
        ))}
      </div>

      {showGeothermal && (
        <>
          <h3 className="font-semibold text-slate-100 mb-2 border-b border-slate-700/50 pb-1 pt-1">
            Potensi Panas Bumi (Geothermal)
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-violet-500/50 bg-violet-600/50 shrink-0" />
              <span className="text-slate-350">Eksploitasi (Produksi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-purple-400/50 bg-purple-500/35 shrink-0" />
              <span className="text-slate-355">Eksplorasi (Drilling)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-dashed border-fuchsia-400/50 bg-fuchsia-500/20 shrink-0" />
              <span className="text-slate-360">Potensial</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
