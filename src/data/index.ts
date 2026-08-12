/**
 * Historical Tsunami Benchmark Reference Dataset (Static Reference for Phase 1 Integration)
 * Source: NOAA NCEI Historical Tsunami Database / USGS Science Data
 */

export interface HistoricalBenchmarkRecord {
  id: string;
  year: number;
  date: string;
  location: string;
  region: string;
  magnitude: number;
  depthKm: number;
  maxWaterHeightM: number;
  fatalitiesEstimate: string;
  tsunamiSourceType: string;
  summary: string;
}

export interface BuoyStationRecord {
  id: string;
  code: string;
  stationName: string;
  oceanRegion: string;
  latitude: number;
  longitude: number;
  status: 'AWAITING_INTEGRATION' | 'OFFLINE' | 'ONLINE';
}

export const HISTORICAL_BENCHMARK_EVENTS: HistoricalBenchmarkRecord[] = [
  {
    id: 'hist-2004-sumatra',
    year: 2004,
    date: '2004-12-26',
    location: 'Off West Coast of Northern Sumatra, Indonesia',
    region: 'Indian Ocean',
    magnitude: 9.1,
    depthKm: 30,
    maxWaterHeightM: 50.9,
    fatalitiesEstimate: '227,898',
    tsunamiSourceType: 'Megathrust Subduction Earthquake',
    summary: 'The 2004 Indian Ocean tsunami was caused by a massive Mw 9.1 megathrust earthquake rupturing ~1,300 km along the Sunda trench. Generated widespread trans-oceanic tsunami waves.'
  },
  {
    id: 'hist-2011-tohoku',
    year: 2011,
    date: '2011-03-11',
    location: 'Near East Coast of Honshu, Japan',
    region: 'Pacific Ocean',
    magnitude: 9.1,
    depthKm: 29,
    maxWaterHeightM: 40.5,
    fatalitiesEstimate: '19,759',
    tsunamiSourceType: 'Megathrust Subduction Earthquake',
    summary: 'The Great East Japan earthquake generated huge tsunami waves that struck Tohoku coast within 20-30 minutes, exceeding coastal flood defenses.'
  },
  {
    id: 'hist-1960-valdivia',
    year: 1960,
    date: '1960-05-22',
    location: 'Valdivia, Southern Chile',
    region: 'Southeast Pacific',
    magnitude: 9.5,
    depthKm: 25,
    maxWaterHeightM: 25.0,
    fatalitiesEstimate: '6,000',
    tsunamiSourceType: 'Megathrust Subduction Earthquake',
    summary: 'Largest recorded earthquake in modern history. Tsunami crossed the Pacific Ocean, affecting Hawaii, Japan, and the Philippines.'
  },
  {
    id: 'hist-2022-tonga',
    year: 2022,
    date: '2022-01-15',
    location: 'Hunga Tonga-Hunga Ha′apai, Tonga',
    region: 'South Pacific',
    magnitude: 5.8,
    depthKm: 0,
    maxWaterHeightM: 19.8,
    fatalitiesEstimate: '6',
    tsunamiSourceType: 'Submarine Volcanic Eruption & Atmospheric Pressure Wave',
    summary: 'Violent submarine volcanic eruption created a global tsunami through coupled ocean acoustic waves and atmospheric lamb waves.'
  }
];

export const DART_BUOY_STATION_PLACEHOLDERS: BuoyStationRecord[] = [
  { id: 'buoy-1', code: 'DART-21413', stationName: 'Off Tohoku', oceanRegion: 'Northwest Pacific', latitude: 38.5, longitude: 145.2, status: 'AWAITING_INTEGRATION' },
  { id: 'buoy-2', code: 'DART-52406', stationName: 'West Mariana', oceanRegion: 'Philippine Sea', latitude: 18.0, longitude: 135.0, status: 'AWAITING_INTEGRATION' },
  { id: 'buoy-3', code: 'DART-53401', stationName: 'East Sunda Strait', oceanRegion: 'Indian Ocean', latitude: -6.1, longitude: 104.8, status: 'AWAITING_INTEGRATION' },
  { id: 'buoy-4', code: 'DART-46404', stationName: 'Oregon Margin', oceanRegion: 'Northeast Pacific', latitude: 45.8, longitude: -128.8, status: 'AWAITING_INTEGRATION' },
];
