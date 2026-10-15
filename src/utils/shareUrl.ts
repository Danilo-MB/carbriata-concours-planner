import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import type { PlanFeature, Project } from '../types/plan';

function uint8ArrayToBase64Url(u8: Uint8Array): string {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Strips huge base64 data URLs to prevent overflowing browser URL length limits
 * while preserving standard URLs, sample street views, coordinates, notes, waypoints.
 */
function sanitizeFeatureForUrl(feature: PlanFeature): PlanFeature {
  const sanitized = { ...feature };

  if (sanitized.images && sanitized.images.length > 0) {
    sanitized.images = sanitized.images.map((img) => {
      // Keep regular URL paths or small data URLs
      if (!img.startsWith('data:') || img.length < 3000) {
        return img;
      }
      return '';
    }).filter(Boolean);
  }

  if (sanitized.routeWaypoints && sanitized.routeWaypoints.length > 0) {
    sanitized.routeWaypoints = sanitized.routeWaypoints.map((wp) => {
      if (wp.image && wp.image.startsWith('data:') && wp.image.length > 3000) {
        return {
          ...wp,
          image: ''
        };
      }
      return wp;
    });
  }

  return sanitized;
}

/**
 * Serializes and compresses a project into a compact URL-safe base64 string.
 */
export function encodeProjectForUrl(project: Project): string {
  try {
    const compactProject: Project = {
      ...project,
      features: (project.features || []).map(sanitizeFeatureForUrl)
    };

    const json = JSON.stringify(compactProject);
    const u8 = strToU8(json);
    const compressed = zlibSync(u8, { level: 9 });
    return uint8ArrayToBase64Url(compressed);
  } catch (err) {
    console.error('Failed to encode project for URL:', err);
    return '';
  }
}

/**
 * Parses and decompresses a project from a URL hash, query param, or raw token.
 */
export function decodeProjectFromUrl(input: string): Project | null {
  if (!input) return null;

  try {
    let token = input.trim();

    // If input is a full URL or hash, extract the param
    if (token.includes('#')) {
      const hashPart = token.split('#')[1] || '';
      const params = new URLSearchParams(hashPart);
      token = params.get('p') || params.get('plan') || hashPart.replace(/^p=|^plan=/, '');
    } else if (token.includes('?')) {
      const searchPart = token.split('?')[1] || '';
      const params = new URLSearchParams(searchPart);
      token = params.get('p') || params.get('plan') || token;
    } else if (token.startsWith('p=') || token.startsWith('plan=')) {
      token = token.replace(/^p=|^plan=/, '');
    }

    if (!token) return null;

    const u8 = base64UrlToUint8Array(token);
    const decompressed = unzlibSync(u8);
    const json = strFromU8(decompressed);
    const project = JSON.parse(json) as Project;

    // Validate minimal project shape
    if (
      project &&
      typeof project.id === 'string' &&
      typeof project.name === 'string' &&
      project.center &&
      Array.isArray(project.features)
    ) {
      return project;
    }

    return null;
  } catch (err) {
    console.warn('Could not decode project from URL payload:', err);
    return null;
  }
}

/**
 * Returns portable visitor and embed URLs.
 */
export function getShareUrls(project: Project, customOrigin?: string): { visitorUrl: string; embedUrl: string; bareVisitorUrl: string } {
  const origin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://mapflex.app');
  const encoded = encodeProjectForUrl(project);

  const bareVisitorUrl = `${origin}/view/${project.id}`;
  const visitorUrl = encoded ? `${bareVisitorUrl}#p=${encoded}` : bareVisitorUrl;
  const embedUrl = encoded ? `${origin}/embed/${project.id}#p=${encoded}` : `${origin}/embed/${project.id}`;

  return { visitorUrl, embedUrl, bareVisitorUrl };
}
