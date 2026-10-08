import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { categoryColors } from '../data/categoryColors';
import { createId } from '../utils/id';
import { rectFromCorners, translate } from '../utils/geo';
import { nextFeatureName, pickCategory } from '../utils/plan';
import { useLatestRef } from './useLatestRef';
import type { Basemap, Category, FeatureKind, LatLng, MapView, PanelView, PlanFeature, Project, Tool } from '../types/plan';

type ProjectUpdater = (fn: (p: Project) => Project) => void;

const toolShortcuts: Record<string, Tool> = { v: 'select', a: 'area', r: 'rectangle', l: 'line', m: 'point' };

export function useEditor(project: Project, update: ProjectUpdater) {
  const [tool, setToolState] = useState<Tool>('select');
  const [draft, setDraft] = useState<LatLng[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelView>('elements');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);

  const selected = project.features.find((f) => f.id === selectedId) ?? null;
  const visibleFeatures = useMemo(
    () => project.features.filter((f) => !project.hiddenCategoryIds.includes(f.categoryId)),
    [project.features, project.hiddenCategoryIds]
  );
  const canFinish = tool === 'area' ? draft.length >= 3 : tool === 'line' ? draft.length >= 2 : false;

  const setTool = (next: Tool) => {
    setToolState(next);
    setDraft([]);
    if (next !== 'select') {
      setSelectedId(null);
      setSheetOpen(false);
    }
  };

  const select = (id: string | null) => setSelectedId(id);

  const createFeature = (kind: FeatureKind, coords: LatLng[]) => {
    const category = pickCategory(project.categories, kind);
    const feature: PlanFeature = {
      id: createId(),
      kind,
      coords,
      name: nextFeatureName(project.features, kind),
      categoryId: category.id,
      notes: '',
      images: [],
      createdAt: Date.now()
    };
    update((p) => ({
      ...p,
      features: [...p.features, feature],
      hiddenCategoryIds: p.hiddenCategoryIds.filter((id) => id !== category.id)
    }));
    setToolState('select');
    setDraft([]);
    setSelectedId(feature.id);
    setAutoFocusId(feature.id);
    setSheetOpen(true);
  };

  const handleMapClick = (point: LatLng) => {
    if (tool === 'point') createFeature('point', [point]);else
    if (tool === 'rectangle') {
      if (draft.length === 0) setDraft([point]);else
      createFeature('area', rectFromCorners(draft[0], point));
    } else if (tool === 'area' || tool === 'line') setDraft((d) => [...d, point]);
  };

  const finishDraft = () => {
    if (!canFinish) return;
    createFeature(tool === 'area' ? 'area' : 'line', draft);
  };
  const undoDraftPoint = () => setDraft((d) => d.slice(0, -1));
  const cancelDraft = () => setTool('select');

  const updateFeature = (id: string, patch: Partial<PlanFeature>) =>
  update((p) => ({ ...p, features: p.features.map((f) => f.id === id ? { ...f, ...patch } : f) }));

  const setGeometry = (id: string, coords: LatLng[]) => updateFeature(id, { coords });

  const duplicateFeature = (id: string) => {
    const source = project.features.find((f) => f.id === id);
    if (!source) return;
    const copy: PlanFeature = {
      ...source,
      id: createId(),
      name: `${source.name} (copy)`,
      coords: translate(source.coords, -0.00012, 0.00015),
      images: source.images ? [...source.images] : [],
      createdAt: Date.now()
    };
    update((p) => ({ ...p, features: [...p.features, copy] }));
    setSelectedId(copy.id);
    setAutoFocusId(copy.id);
  };

  const deleteFeature = (id: string) => {
    const index = project.features.findIndex((f) => f.id === id);
    const feature = project.features[index];
    if (!feature) return;
    update((p) => ({ ...p, features: p.features.filter((f) => f.id !== id) }));
    if (selectedId === id) setSelectedId(null);
    toast(`Deleted “${feature.name}”`, {
      action: {
        label: 'Undo',
        onClick: () =>
        update((p) => {
          const features = [...p.features];
          features.splice(Math.min(index, features.length), 0, feature);
          return { ...p, features };
        })
      }
    });
  };

  const deleteAllFeatures = () => {
    if (project.features.length === 0) {
      toast('No hay elementos para borrar');
      return;
    }
    const previous = [...project.features];
    update((p) => ({ ...p, features: [] }));
    setSelectedId(null);
    toast(`Se borraron todos los elementos (${previous.length})`, {
      action: {
        label: 'Deshacer',
        onClick: () => update((p) => ({ ...p, features: previous }))
      }
    });
  };

  const toggleLayer = (id: string) =>
  update((p) => ({
    ...p,
    hiddenCategoryIds: p.hiddenCategoryIds.includes(id) ?
    p.hiddenCategoryIds.filter((x) => x !== id) :
    [...p.hiddenCategoryIds, id]
  }));

  const addLayer = (): string => {
    const id = createId();
    const color = categoryColors[project.categories.length % categoryColors.length];
    update((p) => ({ ...p, categories: [...p.categories, { id, name: 'New layer', color, icon: 'pin' }] }));
    return id;
  };

  const updateLayer = (id: string, patch: Partial<Category>) =>
  update((p) => ({ ...p, categories: p.categories.map((c) => c.id === id ? { ...c, ...patch } : c) }));

  const deleteLayer = (id: string) => {
    if (project.categories.length <= 1) return;
    const index = project.categories.findIndex((c) => c.id === id);
    const category = project.categories[index];
    const fallback = project.categories.find((c) => c.id !== id);
    if (!category || !fallback) return;
    const moved = project.features.filter((f) => f.categoryId === id).map((f) => f.id);
    update((p) => ({
      ...p,
      categories: p.categories.filter((c) => c.id !== id),
      features: p.features.map((f) => f.categoryId === id ? { ...f, categoryId: fallback.id } : f),
      hiddenCategoryIds: p.hiddenCategoryIds.filter((x) => x !== id)
    }));
    toast(`Deleted layer “${category.name}”`, {
      description: moved.length ? `${moved.length} elements moved to ${fallback.name}` : undefined,
      action: {
        label: 'Undo',
        onClick: () =>
        update((p) => {
          const categories = [...p.categories];
          categories.splice(Math.min(index, categories.length), 0, category);
          return {
            ...p,
            categories,
            features: p.features.map((f) => moved.includes(f.id) ? { ...f, categoryId: id } : f)
          };
        })
      }
    });
  };

  const saveCenter = (view: MapView) => {
    update((p) => ({ ...p, center: view }));
    toast.success('Map center saved', { description: 'This plan will open at the current view.' });
  };

  const setBasemap = (basemap: Basemap) => update((p) => ({ ...p, basemap }));

  const keyboard = useLatestRef({ tool, draft, selectedId, finishDraft, cancelDraft, undoDraftPoint, deleteFeature, setTool });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
      !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const k = keyboard.current;
      if (e.key === 'Escape') {
        if (typing) {
          target?.blur();
          return;
        }
        if (k.tool !== 'select') k.cancelDraft();else
        if (k.selectedId) setSelectedId(null);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        k.finishDraft();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (k.tool !== 'select' && k.draft.length > 0) k.undoDraftPoint();else
        if (k.selectedId) k.deleteFeature(k.selectedId);
      } else {
        const next = toolShortcuts[e.key.toLowerCase()];
        if (next) k.setTool(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboard]);

  return {
    tool,
    setTool,
    draft,
    canFinish,
    handleMapClick,
    finishDraft,
    undoDraftPoint,
    cancelDraft,
    selectedId,
    selected,
    select,
    visibleFeatures,
    updateFeature,
    setGeometry,
    duplicateFeature,
    deleteFeature,
    deleteAllFeatures,
    toggleLayer,
    addLayer,
    updateLayer,
    deleteLayer,
    saveCenter,
    setBasemap,
    panel,
    setPanel,
    sheetOpen,
    setSheetOpen,
    autoFocusId,
    clearAutoFocus: () => setAutoFocusId(null)
  };
}

export type Editor = ReturnType<typeof useEditor>;