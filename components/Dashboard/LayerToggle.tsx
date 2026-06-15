'use client';

import { useMapStore } from '@/store/mapStore';

export function LayerToggle() {
  const showGeothermal = useMapStore((s) => s.showGeothermal);
  const toggleGeothermal = useMapStore((s) => s.toggleGeothermal);

  return (
    <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg select-none">
      <span className="text-xs font-semibold text-slate-300">Potensi Panas Bumi</span>
      <button
        onClick={toggleGeothermal}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
          showGeothermal ? 'bg-violet-600' : 'bg-slate-600'
        }`}
        aria-label="Toggle geothermal layer"
      >
        <span
          className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ease-in-out ${
            showGeothermal ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
