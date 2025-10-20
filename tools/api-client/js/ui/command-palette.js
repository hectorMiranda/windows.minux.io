import { el, clear } from '../util/dom.js';
// Fuzzy command palette (Ctrl+K).
export function commandPalette(commands) {
  const backdrop = el('div', { class: 'modal-backdrop' });
  const input = el('input', { class: 'input', placeholder: 'Type a command…' });
  const list = el('div', { style: 'max-height:50vh;overflow:auto;margin-top:8px' });
  const box = el('div', { class: 'modal', style: 'min-width:480px' }, [input, list]);
  let filtered = commands; let active = 0;
  function score(c, q) { const i = c.title.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? -1 : 1000 - i; }
  function render() {
    clear(list);
    filtered.forEach((c, idx) => list.append(el('div', {
      class: 'tree-row', style: idx === active ? 'background:var(--btn)' : '',
      onclick: () => { close(); c.run(); } }, c.title)));
  }
  function close() { backdrop.remove(); }
  input.oninput = () => {
    const q = input.value.trim();
    filtered = !q ? commands : commands.map((c) => [score(c, q), c]).filter(([s]) => s >= 0).sort((a, b) => b[0] - a[0]).map(([, c]) => c);
    active = 0; render();
  };
  input.onkeydown = (e) => {
    if (e.key === 'ArrowDown') { active = Math.min(active + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); render(); }
    else if (e.key === 'Enter') { close(); filtered[active]?.run(); }
    else if (e.key === 'Escape') close();
  };
  backdrop.append(box); backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.body.append(backdrop); input.focus(); render();
  return { close };
}
