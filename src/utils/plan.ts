import { featureKinds } from '../data/featureKinds';
import type { Category, FeatureKind, PlanFeature } from '../types/plan';

export const fallbackCategory: Category = {
  id: 'uncategorized',
  name: 'Uncategorized',
  color: '#868E96',
  icon: 'pin'
};

export function pickCategory(categories: Category[], kind: FeatureKind): Category {
  return categories.find((c) => c.kindHint === kind) ?? categories[0] ?? fallbackCategory;
}

export function nextFeatureName(features: PlanFeature[], kind: FeatureKind): string {
  const count = features.filter((f) => f.kind === kind).length + 1;
  return `${featureKinds[kind].label} ${count}`;
}

export function countByKind(features: PlanFeature[]): Record<FeatureKind, number> {
  return features.reduce<Record<FeatureKind, number>>(
    (acc, f) => {
      acc[f.kind] += 1;
      return acc;
    },
    { area: 0, line: 0, point: 0 }
  );
}

export function summarizeKinds(features: PlanFeature[]): string {
  const counts = countByKind(features);
  const parts = (Object.keys(counts) as FeatureKind[]).
  filter((k) => counts[k] > 0).
  map((k) => `${counts[k]} ${counts[k] === 1 ? featureKinds[k].label.toLowerCase() : featureKinds[k].plural}`);
  return parts.length ? parts.join(' · ') : 'No elements yet';
}

export const UNLIMITED_TIER_EMAIL = 'dmarinobata@gmail.com';

export function isUnlimitedUser(user: { email?: string; role?: string; isAdmin?: boolean } | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  return email === UNLIMITED_TIER_EMAIL;
}

export function canSharePlan(user: { email?: string; role?: string; isAdmin?: boolean } | null | undefined): boolean {
  return isUnlimitedUser(user);
}

export function canExportGeoJSON(user: { email?: string; role?: string; isAdmin?: boolean } | null | undefined): boolean {
  return isUnlimitedUser(user);
}

export function canDeleteProject(
  project: { id: string; userId?: string; authorEmail?: string; isLocalOnly?: boolean },
  user: { id?: string; email?: string; role?: string; isAdmin?: boolean } | null
): boolean {
  // If this is a guest draft stored only on this browser, guest can discard it
  if (project.isLocalOnly) return true;

  // For any cloud or shared project, a user must be logged in
  if (!user) return false;

  // Admin (Danilo) can delete any project
  if (user.isAdmin || user.role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  if (
    email === UNLIMITED_TIER_EMAIL ||
    email.startsWith('danilo') ||
    email.includes('danilo') ||
    email === 'admin@mapflex.app'
  ) {
    return true;
  }

  // Author of the project can delete their own project
  if (project.userId && project.userId === user.id) return true;
  if (project.authorEmail && project.authorEmail.toLowerCase() === email) return true;

  return false;
}

export function canEditProject(
  project: { id: string; userId?: string; authorEmail?: string; isLocalOnly?: boolean },
  user: { id?: string; email?: string; role?: string; isAdmin?: boolean } | null | undefined
): boolean {
  // If this is a draft newly created by a guest in this browser, they can work on it
  if (project.isLocalOnly) return true;

  // Unauthenticated users cannot edit existing maps (only visitor mode)
  if (!user) return false;

  // Logged-in users can edit
  return true;
}