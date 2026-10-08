import type { Project } from '../types/plan';

export function toGeoJSON(project: Project) {
  const categories = new Map(project.categories.map((c) => [c.id, c]));
  return {
    type: 'FeatureCollection',
    name: project.name,
    features: project.features.map((f) => {
      const positions = f.coords.map(([lat, lng]) => [lng, lat]);
      const geometry =
      f.kind === 'point' ?
      { type: 'Point', coordinates: positions[0] } :
      f.kind === 'line' ?
      { type: 'LineString', coordinates: positions } :
      { type: 'Polygon', coordinates: [[...positions, positions[0]]] };
      const category = categories.get(f.categoryId);
      return {
        type: 'Feature',
        id: f.id,
        geometry,
        properties: {
          name: f.name,
          layer: category?.name ?? '',
          color: category?.color ?? '',
          notes: f.notes
        }
      };
    })
  };
}

export function geojsonFileName(project: Project): string {
  const slug = project.name.
  toLowerCase().
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^a-z0-9]+/g, '-').
  replace(/(^-|-$)/g, '');
  return `${slug || 'plan'}.geojson`;
}

export function downloadTextFile(fileName: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}