// lib/volcanoes-static.ts
import fallbackData from '@/public/data/volcanoes-fallback.json';
import { Volcano, VolcanoLevel } from './types';

interface FallbackVolcano {
  id: string;
  name: string;
  province: string;
  regency: string;
  lat: number;
  lng: number;
  elevation: number;
  level: number;
  lastReport: string;
  reportUrl: string;
  isGeothermal: boolean;
  gvpId?: string;
}

export function getFallbackVolcanoes(): Volcano[] {
  return (fallbackData as unknown as FallbackVolcano[]).map((v) => ({
    id: v.id,
    name: v.name,
    province: v.province,
    regency: v.regency,
    lat: v.lat,
    lng: v.lng,
    elevation: v.elevation,
    level: v.level as VolcanoLevel,
    lastReport: v.lastReport,
    reportUrl: v.reportUrl,
    isGeothermal: v.isGeothermal,
    gvpId: v.gvpId,
  }));
}
