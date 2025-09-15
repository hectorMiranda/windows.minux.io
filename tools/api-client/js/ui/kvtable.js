import { el, clear } from '../util/dom.js';
// Reusable enabled/key/value/description editor used for params, headers, forms.
export function kvTable(rows, onChange, opts = {}) {
  const root = el('div', { class: 'kvtable' });
  function render() {
    clear(root);
    const list = rows.length ? rows : [];
    list.forEach((row, idx) => root.append(renderRow(row, idx)));
    root.append(blankRow());
  }
  function renderRow(row, idx) {
    const cb = el('input', { type: 'checkbox', ...(row.enabled !== false ? { checked: true } : {}),
      onchange: (e) => { row.enabled = e.target.checked; onChange(rows); } });
    const key = el('input', { class: 'input', placeholder: opts.keyPlaceholder || 'key', value: row.key || '',
      oninput: (e) => { row.key = e.target.value; onChange(rows); } });
    const val = el('input', { class: 'input', placeholder: opts.valPlaceholder || 'value', value: row.value || '',
      oninput: (e) => { row.value = e.target.value; onChange(rows); } });
    const del = el('button', { class: 'btn btn-ghost', text: '×', title: 'Remove',
      onclick: () => { rows.splice(idx, 1); onChange(rows); render(); } });
    return el('div', { class: 'kv-row' }, [cb, key, val, del]);
  }
  function blankRow() {
    const key = el('input', { class: 'input', placeholder: '+ add', oninput: (e) => {
      rows.push({ enabled: true, key: e.target.value, value: '' }); onChange(rows); render();
      const inputs = root.querySelectorAll('.kv-row input.input'); inputs[(rows.length - 1) * 2]?.focus();
    } });
    return el('div', { class: 'kv-row' }, [el('span'), key, el('span'), el('span')]);
  }
  render();
  return root;
}
