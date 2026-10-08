export interface ColorPreset {
  hex: string;
  label: string;
}

export const OFFICIAL_PALETTE: ColorPreset[] = [
  { hex: '#D4AF37', label: 'Oro Carbriata' },
  { hex: '#10B981', label: 'Verde British' },
  { hex: '#EF4444', label: 'Rojo Corsa' },
  { hex: '#0284C7', label: 'Azul Podio' },
  { hex: '#8B5CF6', label: 'Púrpura VIP' },
  { hex: '#F59E0B', label: 'Ámbar Gastronomía' },
  { hex: '#14B8A6', label: 'Turquesa Marítimo' },
  { hex: '#EC4899', label: 'Rosa Eventos' },
  { hex: '#F97316', label: 'Naranja Logística' },
  { hex: '#64748B', label: 'Gris Titanio' },
  { hex: '#1E293B', label: 'Negro Carbón' },
  { hex: '#F8FAFC', label: 'Blanco Nieve' }
];

const LOCAL_STORAGE_KEY = 'carbriata_user_color_presets';

export function getUserColorPresets(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserColorPreset(hex: string): string[] {
  try {
    const clean = hex.trim().toUpperCase();
    let current = getUserColorPresets().filter((c) => c !== clean);
    current.unshift(clean);
    if (current.length > 12) current = current.slice(0, 12);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch {
    return [];
  }
}

export function clearUserColorPresets(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // no-op
  }
}
