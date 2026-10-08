let lastX = -1;
let lastY = -1;
let listening = 0;

function remember(event: MouseEvent | PointerEvent) {
  lastX = event.clientX;
  lastY = event.clientY;
}

export function isTrashHot(): boolean {
  const el = document.querySelector('[data-plan-trash]');
  if (!el || lastX < 0) return false;
  const rect = el.getBoundingClientRect();
  return lastX >= rect.left && lastX <= rect.right && lastY >= rect.top && lastY <= rect.bottom;
}

export function watchTrashPointer(): () => void {
  listening += 1;
  if (listening === 1) {
    window.addEventListener('pointermove', remember, true);
    window.addEventListener('mousemove', remember, true);
  }
  return () => {
    listening -= 1;
    if (listening === 0) {
      window.removeEventListener('pointermove', remember, true);
      window.removeEventListener('mousemove', remember, true);
      lastX = -1;
      lastY = -1;
    }
  };
}
