import { el, clear } from '../util/dom.js';
import { languages, generate } from '../codegen/index.js';
import { toast } from './toast.js';
export function codegenPanel(req, scope) {
  const sel = el('select', { class: 'select', style: 'width:auto' },
    languages().map((l) => el('option', { value: l.id }, l.label)));
  const code = el('pre', { class: 'code', style: 'padding:12px;background:var(--input);border-radius:6px;max-height:50vh;overflow:auto' });
  const copy = el('button', { class: 'btn', text: 'Copy', onclick: () => { navigator.clipboard?.writeText(code.textContent); toast('Copied'); } });
  function paint() { try { code.textContent = generate(sel.value, req, scope); } catch (e) { code.textContent = '// ' + e.message; } }
  sel.onchange = paint; paint();
  return el('div', {}, [el('div', { style: 'display:flex;gap:8px;margin-bottom:8px' }, [sel, copy]), code]);
}
