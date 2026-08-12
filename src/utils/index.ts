/**
 * Format coordinates for display (e.g. 14.3° N, 120.4° E)
 */
export function formatCoordinates(lat?: number | '', lng?: number | ''): string {
  if (lat === '' || lat === undefined || lng === '' || lng === undefined) {
    return 'Coordinates Pending';
  }
  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

/**
 * Class name joiner utility
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
