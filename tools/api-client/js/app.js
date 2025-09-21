import { state, update, ensureSeed, subscribe } from './state.js';
import { newRequest } from './model/request.js';
import { newCollection } from './model/collection.js';
import { envScope } from './model/environment.js';
import { historyEntry } from './model/history.js';
import { send } from './http/client.js';
import { sidebar } from './ui/sidebar.js';
import { requestEditor } from './ui/request-editor.js';
import { responseViewer } from './ui/response-viewer.js';
import { toast, status } from './ui/toast.js';
import { prompt } from './ui/modal.js';
import { bindShortcuts } from './ui/keyboard.js';
import { el, clear } from './util/dom.js';

const THEMES = ['dark','light','midnight','nord','solarized','dracula','github','gruvbox'];

function loadStyles() {
  const add = (href) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); };
  add('css/code.css');
  for (const t of THEMES) if (t !== 'dark' && t !== 'light') add(`css/themes/${t}.css`);
}

function activeEnv() { return state.environments.find((e) => e.id === state.activeEnvId) || null; }
function scope() { return Object.assign({}, ...state.environments.filter((e)=>e.id===state.activeEnvId).map(envScope)); }

let current = null;     // request being edited
let lastResponse = null;

function renderMain() {
  const main = document.getElementById('main');
  clear(main);
  if (!current) { main.append(el('div', { style: 'margin:auto;color:var(--fg-dim)', text: 'Press Ctrl+N or + Request to begin.' })); return; }
  const editor = requestEditor(current, {
    onChange: () => {},
    onSend: doSend,
    onSave: doSave,
  });
  const respHolder = el('div', { class: 'split', id: 'resp', style: 'border-top:1px solid var(--border)' });
  if (lastResponse) respHolder.append(responseViewer(lastResponse));
  main.append(editor, respHolder);
}

async function doSend() {
  if (!current) return;
  status('Sending…');
  try {
    const res = await send(current, scope());
    lastResponse = res;
    update((s) => { s.history.unshift(historyEntry(current, res)); });
    status(res.networkError ? 'Network error' : `${res.status} in ${Math.round(res.durationMs)}ms`);
    if (res.networkError) toast(res.error, 'error');
  } catch (e) { toast(String(e.message || e), 'error'); status('Error'); }
  renderMain(); renderSidebar();
}

async function doSave() {
  if (!current) return;
  const name = await prompt('Save request as', current.name);
  if (name == null) return;
  current.name = name;
  update((s) => {
    let col = s.collections[0]; if (!col) { col = newCollection('My Workspace'); s.collections.push(col); }
    const existing = findReq(col, current.id);
    if (!existing) col.children.push(current); 
  });
  toast('Saved'); renderSidebar();
}
function findReq(node, id){ if(node.id===id) return node; for(const c of node.children||[]) { const r=findReq(c,id); if(r) return r; } return null; }

function openRequest(req) { current = req; lastResponse = null; renderMain(); }

function renderSidebar() {
  sidebar(document.getElementById('sidebar'), state, {
    onOpen: (req) => openRequest(req),
    onOpenHistory: (h) => openRequest(newRequest({ name: h.url, method: h.method, url: h.snapshot?.url || h.url,
      headers: h.snapshot?.headers || [], body: h.snapshot?.body || { mode: 'none' } })),
    onNewCollection: async () => { const n = await prompt('Collection name', 'New Collection'); if (n) update((s) => s.collections.push(newCollection(n))); renderSidebar(); },
  });
}

function setupTopbar() {
  const envSel = document.getElementById('env-select');
  const themeSel = document.getElementById('theme-select');
  function fillEnv() {
    clear(envSel);
    envSel.append(el('option', { value: '', text: 'No environment' }));
    for (const e of state.environments) envSel.append(el('option', { value: e.id, ...(e.id === state.activeEnvId ? { selected: true } : {}) }, e.name));
  }
  envSel.onchange = (e) => update((s) => { s.activeEnvId = e.target.value || null; });
  for (const t of THEMES) themeSel.append(el('option', { value: t, ...(t === state.theme ? { selected: true } : {}) }, t));
  themeSel.onchange = (e) => { document.documentElement.dataset.theme = e.target.value; update((s) => s.theme = e.target.value); };
  document.getElementById('btn-new-request').onclick = () => openRequest(newRequest());
  fillEnv();
  subscribe(fillEnv);
}

function main() {
  loadStyles();
  ensureSeed();
  document.documentElement.dataset.theme = state.theme || 'dark';
  setupTopbar();
  renderSidebar();
  renderMain();
  bindShortcuts({
    'mod+enter': doSend,
    'mod+s': doSave,
    'mod+n': () => openRequest(newRequest()),
  });
  status('Ready.');
}
main();
