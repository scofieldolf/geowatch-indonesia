'use client';

import { Rectangle, Tooltip } from 'react-leaflet';
import { Volcano, LEVEL_CONFIG } from '@/lib/types';
import { useMapStore } from '@/store/mapStore';

// 0.3 degrees covers roughly 33km x 33km grid box around the volcano center
const GRID_BOX_SIZE = 0.3;

interface Props {
  volcanoes: Volcano[];
}

export function VolcanoGrid({ volcanoes }: Props) {
  const { setSelectedVolcano, selectedVolcano } = useMapStore();

  return (
    <>
      {volcanoes.map((volcano) => {
        // Calculate rectangle bounds around the coordinates
        const halfSize = GRID_BOX_SIZE / 2;
        const bounds: [[number, number], [number, number]] = [
          [volcano.lat - halfSize, volcano.lng - halfSize],
          [volcano.lat + halfSize, volcano.lng + halfSize],
        ];

        const config = LEVEL_CONFIG[volcano.level];
        const isSelected = selectedVolcano?.id === volcano.id;

        return (
          <Rectangle
            key={volcano.id}
            bounds={bounds}
            pathOptions={{
              color: isSelected ? '#ffffff' : config.color,
              fillColor: config.color,
              fillOpacity: isSelected ? 0.8 : 0.5,
              weight: isSelected ? 3 : 1.5,
              dashArray: isSelected ? '4, 4' : undefined,
            }}
            eventHandlers={{
              click: () => {
                setSelectedVolcano(volcano);
              },
            }}
          >
            {/* Tooltip on hover */}
            <Tooltip
              direction="top"
              offset={[0, -5]}
              opacity={0.9}
              className="custom-map-tooltip"
            >
              <div className="text-[11px] p-0.5 select-none font-sans text-slate-100">
                <div className="font-bold text-slate-200">{volcano.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tingkat Aktivitas: <span className="font-semibold" style={{ color: config.color }}>{config.label}</span>
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Elevasi: {volcano.elevation.toLocaleString('id-ID')} mdpl
                </div>
              </div>
            </Tooltip>
          </Rectangle>
        );
      })}
    </>
  );
}
