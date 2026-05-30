import { el } from '../util/dom.js';
import { download } from '../io/export.js';
import { toast } from './toast.js';
// Copy / download / search helpers for a response body.
export function responseTools(res) {
  const copy = el('button', { class: 'btn btn-ghost', text: 'Copy', onclick: () => { navigator.clipboard?.writeText(res.body); toast('Copied'); } });
  const save = el('button', { class: 'btn btn-ghost', text: 'Download', onclick: () => download('response.txt', res.body, 'text/plain') });
  const search = el('input', { class: 'input', placeholder: 'Find in body…', style: 'width:160px',
    oninput: (e) => highlight(e.target.value) });
  let target = null;
  function highlight(q) {
    if (!target) target = document.querySelector('#resp pre.code');
    if (!target) return;
    const text = res.body;
    if (!q) { target.textContent = text; return; }
    target.innerHTML = text.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<mark style="background:var(--warn);color:#000">$1</mark>');
  }
  return el('div', { style: 'display:flex;gap:6px;align-items:center' }, [search, copy, save]);
}
