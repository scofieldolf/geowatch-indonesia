// lib/types.ts

export enum VolcanoLevel {
  NORMAL  = 1,
  WASPADA = 2,
  SIAGA   = 3,
  AWAS    = 4,
}

export const LEVEL_CONFIG = {
  [VolcanoLevel.NORMAL]: {
    color: '#22c55e',
    label: 'Normal',
    labelEn: 'Normal',
    description: 'Aktivitas gunung api dasar atau normal. Tidak ada gejala peningkatan aktivitas vulkanik.',
    cssClass: 'level-normal',
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
  },
  [VolcanoLevel.WASPADA]: {
    color: '#eab308',
    label: 'Waspada',
    labelEn: 'Advisory',
    description: 'Mulai menunjukkan aktivitas di atas level normal, baik kegempaan maupun gejala vulkanik lainnya.',
    cssClass: 'level-waspada',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
  },
  [VolcanoLevel.SIAGA]: {
    color: '#f97316',
    label: 'Siaga',
    labelEn: 'Watch',
    description: 'Peningkatan aktivitas vulkanik yang jelas dan dapat berlanjut menjadi letusan/erupsi.',
    cssClass: 'level-siaga',
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
  },
  [VolcanoLevel.AWAS]: {
    color: '#ef4444',
    label: 'Awas',
    labelEn: 'Warning',
    description: 'Gunung api menunjukkan peningkatan aktivitas yang sangat signifikan dan mengarah pada letusan utama.',
    cssClass: 'level-awas',
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
  },
} as const;

export interface Volcano {
  id: string;           // Unique code (e.g. "MER" for Merapi)
  name: string;         // e.g. "Gunung Merapi"
  province: string;     // e.g. "Jawa Tengah / DIY"
  regency: string;      // e.g. "Sleman / Magelang / Klaten"
  lat: number;          // Latitude
  lng: number;          // Longitude
  elevation: number;    // Elevation in meters above sea level (mdpl)
  level: VolcanoLevel;  // 1-4 alert level
  lastReport: string;   // ISO date string
  reportUrl: string;    // Direct URL to report details
  isGeothermal: boolean; // True if this volcano or area has geothermal potential
  gvpId?: string;       // Smithsonian GVP ID (optional)
}

export interface GeothermalArea {
  id: string;
  name: string;
  province: string;
  potentialMW: number;  // Estimated MW capacity
  status: 'eksplorasi' | 'eksploitasi' | 'potensial';
  coordinates: [number, number][]; // Polygon coords
}

export interface MAGMAStatusResponse {
  volcanoes: Volcano[];
  fetchedAt: string;
  source: 'magma_live' | 'fallback_static';
}
