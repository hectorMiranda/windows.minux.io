import { el, clear } from '../util/dom.js';
import { METHODS } from '../model/request.js';
import { kvTable } from './kvtable.js';
import { AUTH_TYPES } from '../http/auth.js';

// Renders the request editor for `req`; calls onSend() and onChange().
export function requestEditor(req, { onSend, onChange, onSave }) {
  const root = el('div', { class: 'split' });
  let activeTab = 'params';

  const method = el('select', { class: 'select method', style: 'width:110px',
    onchange: (e) => { req.method = e.target.value; onChange(); paint(); } },
    METHODS.map((m) => el('option', { value: m, ...(m === req.method ? { selected: true } : {}) }, m)));
  const url = el('input', { class: 'input', placeholder: 'https://{{base_url}}/path', value: req.url,
    oninput: (e) => { req.url = e.target.value; onChange(); },
    onkeydown: (e) => { if (e.key === 'Enter') onSend(); } });
  const sendBtn = el('button', { class: 'btn btn-primary', text: 'Send', onclick: () => onSend() });
  const saveBtn = el('button', { class: 'btn', text: 'Save', title: 'Save to collection (Ctrl+S)', onclick: () => onSave?.() });
  const bar = el('div', { style: 'display:flex;gap:8px;padding:12px 16px' }, [method, url, sendBtn, saveBtn]);

  const tabbar = el('div', { class: 'tabs' });
  const panel = el('div', { class: 'pane', style: 'padding:12px 16px' });
  const TABS = [['params','Params'],['headers','Headers'],['body','Body'],['auth','Auth'],['scripts','Scripts']];

  function paint() {
    clear(tabbar);
    for (const [id, label] of TABS) {
      tabbar.append(el('button', { class: `tab ${activeTab === id ? 'active' : ''}`,
        onclick: () => { activeTab = id; paint(); } }, label));
    }
    clear(panel);
    panel.append(renderTab());
  }
  function renderTab() {
    if (activeTab === 'params') return kvTable(req.params, (v) => { req.params = v; onChange(); });
    if (activeTab === 'headers') return kvTable(req.headers, (v) => { req.headers = v; onChange(); }, { keyPlaceholder: 'Header' });
    if (activeTab === 'body') return bodyEditor();
    if (activeTab === 'auth') return authEditor();
    return scriptEditor();
  }
  function bodyEditor() {
    const b = req.body;
    const modeSel = el('select', { class: 'select', style: 'width:auto;margin-bottom:8px',
      onchange: (e) => { b.mode = e.target.value; onChange(); paint(); } },
      ['none','raw','urlencoded','form'].map((m) => el('option', { value: m, ...(m === b.mode ? { selected: true } : {}) }, m)));
    const box = el('div', {}, [modeSel]);
    if (b.mode === 'raw') {
      const ta = el('textarea', { class: 'input', value: b.raw, placeholder: '{ }',
        oninput: (e) => { b.raw = e.target.value; onChange(); } });
      box.append(ta);
    } else if (b.mode === 'urlencoded') { box.append(kvTable(b.urlencoded, (v) => { b.urlencoded = v; onChange(); })); }
    else if (b.mode === 'form') { box.append(kvTable(b.form, (v) => { b.form = v; onChange(); })); }
    return box;
  }
  function authEditor() {
    const a = req.auth;
    const sel = el('select', { class: 'select', style: 'width:auto;margin-bottom:8px',
      onchange: (e) => { req.auth = { type: e.target.value }; onChange(); paint(); } },
      AUTH_TYPES.map((t) => el('option', { value: t, ...(t === a.type ? { selected: true } : {}) }, t)));
    const box = el('div', {}, [sel]);
    const field = (label, key, type = 'text') => {
      const inp = el('input', { class: 'input', type, value: a[key] || '', placeholder: label,
        oninput: (e) => { a[key] = e.target.value; onChange(); } });
      return el('label', { style: 'display:block;margin:6px 0' }, [el('span', { text: label, style: 'color:var(--fg-dim)' }), inp]);
    };
    if (a.type === 'bearer') box.append(field('Token', 'token'));
    if (a.type === 'basic') { box.append(field('Username', 'username')); box.append(field('Password', 'password', 'password')); }
    if (a.type === 'apikey' || a.type === 'header') { box.append(field('Key', 'key')); box.append(field('Value', 'value')); }
    return box;
  }
  function scriptEditor() {
    const pre = el('textarea', { class: 'input', value: req.preRequest, placeholder: '// pre-request script',
      oninput: (e) => { req.preRequest = e.target.value; onChange(); } });
    const test = el('textarea', { class: 'input', value: req.tests, placeholder: '// tests: mx.test(...)',
      oninput: (e) => { req.tests = e.target.value; onChange(); } });
    return el('div', {}, [el('div', { text: 'Pre-request', style: 'color:var(--fg-dim);margin:4px 0' }), pre,
      el('div', { text: 'Tests', style: 'color:var(--fg-dim);margin:8px 0 4px' }), test]);
  }
  root.append(bar, tabbar, panel);
  paint();
  return root;
}
