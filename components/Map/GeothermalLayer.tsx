'use client';

import { GeoJSON } from 'react-leaflet';
import { useGeothermal } from '@/hooks/useGeothermal';
import { useMapStore } from '@/store/mapStore';
import L from 'leaflet';
import type { Feature, Polygon } from 'geojson';

interface GeothermalProperties {
  id: string;
  name: string;
  province: string;
  potentialMW: number;
  status: 'eksplorasi' | 'eksploitasi' | 'potensial';
}

export function GeothermalLayer() {
  const showGeothermal = useMapStore((s) => s.showGeothermal);
  const { geojsonData, isLoading, error } = useGeothermal();

  if (!showGeothermal || isLoading || error || !geojsonData) return null;

  // Custom styling for geothermal polygons based on their status
  const styleFeature = (feature?: Feature<Polygon, GeothermalProperties>): L.PathOptions => {
    if (!feature || !feature.properties) return {};
    const status = feature.properties.status;

    let color = '#d946ef'; // fuchsia-500 (default potensial)
    let fillOpacity = 0.2;
    let dashArray: string | undefined = '4, 4';

    if (status === 'eksploitasi') {
      color = '#7c3aed'; // violet-600
      fillOpacity = 0.5;
      dashArray = undefined;
    } else if (status === 'eksplorasi') {
      color = '#a855f7'; // purple-500
      fillOpacity = 0.35;
      dashArray = undefined;
    }

    return {
      color,
      weight: 1.5,
      opacity: 0.8,
      fillColor: color,
      fillOpacity,
      dashArray,
    };
  };

  // Popup configuration for each geothermal area polygon
  const onEachFeature = (feature: Feature<Polygon, GeothermalProperties>, layer: L.Layer) => {
    const props = feature.properties;
    if (props) {
      const statusLabel =
        props.status === 'eksploitasi' ? 'Eksploitasi (Produksi)' :
        props.status === 'eksplorasi' ? 'Eksplorasi (Drilling)' : 'Potensial';

      const statusColor =
        props.status === 'eksploitasi' ? 'text-violet-400' :
        props.status === 'eksplorasi' ? 'text-purple-400' : 'text-fuchsia-400';

      const popupContent = `
        <div class="font-sans text-xs p-1 text-slate-100 select-none bg-slate-950 rounded border border-slate-800">
          <div class="font-bold text-slate-200 text-sm mb-1">${props.name}</div>
          <div class="text-[10px] text-slate-400">Provinsi: <span class="text-slate-300 font-medium">${props.province}</span></div>
          <div class="text-[10px] text-slate-400 mt-0.5">Estimasi Potensi: <span class="text-emerald-400 font-bold">${props.potentialMW} MW</span></div>
          <div class="text-[10px] text-slate-400 mt-0.5">Status: <span class="${statusColor} font-bold">${statusLabel}</span></div>
        </div>
      `;
      layer.bindPopup(popupContent, {
        className: 'custom-geothermal-popup',
        maxWidth: 240,
      });
    }
  };

  // Justified casting to satisfy react-leaflet typings with GeoJSON features
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataTyped = geojsonData as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleTyped = styleFeature as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeatureTyped = onEachFeature as any;

  return (
    <GeoJSON
      data={dataTyped}
      style={styleTyped}
      onEachFeature={onEachFeatureTyped}
    />
  );
}
