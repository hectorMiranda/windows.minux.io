import { el, clear } from '../util/dom.js';
import { kvTable } from './kvtable.js';
import { newEnvironment } from '../model/environment.js';
import { modal } from './modal.js';
// Full CRUD editor for environments.
export function environmentManager(state, onChange) {
  const body = el('div', { style: 'min-width:520px' });
  function paint() {
    clear(body);
    const list = el('div', { style: 'display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap' });
    for (const e of state.environments) {
      list.append(el('button', { class: 'btn', text: e.name, onclick: () => edit(e) }));
    }
    list.append(el('button', { class: 'btn btn-primary', text: '+ New',
      onclick: () => { const e = newEnvironment(); state.environments.push(e); onChange(); edit(e); } }));
    body.append(list);
  }
  function edit(e) {
    clear(body);
    const name = el('input', { class: 'input', value: e.name, oninput: (ev) => { e.name = ev.target.value; onChange(); } });
    body.append(el('label', { text: 'Name' }), name, el('div', { style: 'height:8px' }),
      kvTable(e.values, (v) => { e.values = v; onChange(); }),
      el('button', { class: 'btn', text: '← Back', style: 'margin-top:10px', onclick: paint }));
  }
  paint();
  modal({ title: 'Environments', body, okLabel: 'Done' });
}
