import { el } from '../util/dom.js';
export function testResults(results) {
  const root = el('div', { style: 'padding:12px 16px' });
  if (!results.length) { root.append(el('div', { class: 'fg-dim', text: 'No tests defined.' })); return root; }
  for (const r of results) {
    root.append(el('div', { style: `padding:4px 0;color:${r.passed ? 'var(--ok)' : 'var(--err)'}` },
      `${r.passed ? '✓' : '✗'} ${r.name}${r.error ? ' — ' + r.error : ''}`));
  }
  const passed = results.filter((r) => r.passed).length;
  root.append(el('div', { style: 'margin-top:8px;color:var(--fg-dim)', text: `${passed}/${results.length} passed` }));
  return root;
}
