// Global keyboard shortcuts. Returns an unbind function.
export function bindShortcuts(map) {
  function handler(e) {
    const mod = e.ctrlKey || e.metaKey;
    const key = `${mod ? 'mod+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;
    const fn = map[key];
    if (fn) { e.preventDefault(); fn(e); }
  }
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
export const SHORTCUTS = [
  ['mod+enter', 'Send request'],
  ['mod+s', 'Save request'],
  ['mod+n', 'New request'],
  ['mod+k', 'Command palette'],
  ['mod+/', 'Keyboard help'],
];
