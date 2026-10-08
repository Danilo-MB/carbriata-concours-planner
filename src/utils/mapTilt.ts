/** Maps a screen point back onto a CSS-tilted map container. */
export function tiltedContainerPoint(container: HTMLElement, clientX: number, clientY: number): {x: number;y: number;} {
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const box = layoutOrigin(container);
  const origin = cssOrigin(container, width, height);
  const matrix = new DOMMatrix(getComputedStyle(container).transform);

  if (matrix.isIdentity) {
    return {
      x: clientX - box.left - container.clientLeft,
      y: clientY - box.top - container.clientTop
    };
  }

  const vx = clientX - (box.left + origin.x);
  const vy = clientY - (box.top + origin.y);
  const local = undoPerspective(matrix, vx, vy);

  return {
    x: local.x + origin.x - container.clientLeft,
    y: local.y + origin.y - container.clientTop
  };
}

function layoutOrigin(container: HTMLElement): {left: number;top: number;} {
  const parent = container.offsetParent as HTMLElement | null;
  if (!parent) {
    const rect = container.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }
  const parentRect = parent.getBoundingClientRect();
  return {
    left: parentRect.left + container.offsetLeft,
    top: parentRect.top + container.offsetTop
  };
}

function cssOrigin(container: HTMLElement, width: number, height: number): {x: number;y: number;} {
  const [x = '50%', y = '50%'] = getComputedStyle(container).transformOrigin.split(' ');
  return { x: cssLength(x, width), y: cssLength(y, height) };
}

function cssLength(value: string, size: number): number {
  if (value.endsWith('%')) return parseFloat(value) / 100 * size;
  return parseFloat(value);
}

/**
 * Inverse of a CSS transform that may include perspective.
 * `vx`/`vy` are visual offsets from the transform origin.
 */
function undoPerspective(matrix: DOMMatrix, vx: number, vy: number): {x: number;y: number;} {
  const { m11, m12, m14, m21, m22, m24, m41, m42, m44 } = matrix;
  const a1 = m11 - vx * m14;
  const b1 = m21 - vx * m24;
  const c1 = vx * m44 - m41;
  const a2 = m12 - vy * m14;
  const b2 = m22 - vy * m24;
  const c2 = vy * m44 - m42;
  const det = a1 * b2 - b1 * a2;
  if (Math.abs(det) < 1e-8) return { x: vx, y: vy };
  return {
    x: (c1 * b2 - b1 * c2) / det,
    y: (a1 * c2 - c1 * a2) / det
  };
}
