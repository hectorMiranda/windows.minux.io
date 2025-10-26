import { state, update, ensureSeed, subscribe } from './state.js';
import { newRequest } from './model/request.js';
import { newCollection } from './model/collection.js';
import { envScope } from './model/environment.js';
import { historyEntry } from './model/history.js';
import { send } from './http/client.js';
import { resolveDynamic } from './util/dynamic-vars.js';
import { runScript } from './scripting/sandbox.js';
import { sidebar } from './ui/sidebar.js';
import { requestEditor } from './ui/request-editor.js';
import { responseViewer } from './ui/response-viewer.js';
import { responseTools } from './ui/response-tools.js';
import { codegenPanel } from './ui/codegen-panel.js';
import { commandPalette } from './ui/command-palette.js';
import { keyboardHelp } from './ui/keyboard-help.js';
import { environmentManager } from './ui/environment-manager.js';
import { testResults } from './ui/test-results.js';
import { toast, status } from './ui/toast.js';
import { prompt, modal } from './ui/modal.js';
import { bindShortcuts } from './ui/keyboard.js';
import { el, clear } from './util/dom.js';

const THEMES = ['dark','light','midnight','nord','solarized','dracula','github','gruvbox'];
function loadStyles() {
  const add = (href) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); };
  for (const t of THEMES) if (t !== 'dark' && t !== 'light') add(`css/themes/${t}.css`);
}
function scope() {
  const base = Object.assign({}, ...state.environments.filter((e)=>e.id===state.activeEnvId).map(envScope));
  return new Proxy(base, { get: (t, k) => (k in t ? t[k] : undefined) });
}
function withDynamics(req) {
  const clone = structuredClone(req);
  clone.url = resolveDynamic(clone.url);
  for (const h of clone.headers || []) h.value = resolveDynamic(h.value);
  if (clone.body?.raw) clone.body.raw = resolveDynamic(clone.body.raw);
  return clone;
}

let current = null, lastResponse = null, lastTests = [];

function renderMain() {
  const main = document.getElementById('main');
  clear(main);
  if (!current) { main.append(el('div', { style: 'margin:auto;color:var(--fg-dim)', text: 'Press Ctrl+N to begin · Ctrl+K for commands' })); return; }
  main.append(requestEditor(current, { onChange: () => {}, onSend: doSend, onSave: doSave }));
  const resp = el('div', { class: 'split', id: 'resp', style: 'border-top:1px solid var(--border)' });
  if (lastResponse) {
    const head = el('div', { style: 'display:flex;justify-content:flex-end;padding:6px 16px' }, [responseTools(lastResponse)]);
    resp.append(head, responseViewer(lastResponse));
    if (lastTests.length) resp.append(testResults(lastTests));
  }
  main.append(resp);
}

async function doSend() {
  if (!current) return;
  status('Sending…');
  const sc = scope();
  runScript(current.preRequest, { request: current, response: null, env: sc });
  try {
    const res = await send(withDynamics(current), sc);
    lastResponse = res;
    lastTests = runScript(current.tests, { request: current, response: res, env: sc }).results;
    update((s) => s.history.unshift(historyEntry(current, res)));
    status(res.networkError ? 'Network error' : `${res.status} · ${Math.round(res.durationMs)}ms`);
    if (res.networkError) toast(res.error, 'error');
  } catch (e) { toast(String(e.message || e), 'error'); }
  renderMain(); renderSidebar();
}
async function doSave() {
  if (!current) return;
  const name = await prompt('Save request as', current.name); if (name == null) return;
  current.name = name;
  update((s) => { let c = s.collections[0] || s.collections[s.collections.push(newCollection('My Workspace')) - 1];
    if (!find(c, current.id)) c.children.push(current); });
  toast('Saved'); renderSidebar();
}
function find(n, id){ if(n.id===id) return n; for(const c of n.children||[]){ const r=find(c,id); if(r) return r; } return null; }
function openRequest(r){ current = r; lastResponse = null; lastTests = []; renderMain(); }

function renderSidebar() {
  sidebar(document.getElementById('sidebar'), state, {
    onOpen: openRequest,
    onOpenHistory: (h) => openRequest(newRequest({ name: h.url, method: h.method, url: h.snapshot?.url || h.url, headers: h.snapshot?.headers || [], body: h.snapshot?.body || { mode: 'none' } })),
    onNewCollection: async () => { const n = await prompt('Collection name', 'New Collection'); if (n) { update((s) => s.collections.push(newCollection(n))); renderSidebar(); } },
  });
}
function showCodegen() { if (!current) return toast('Open a request first', 'error'); modal({ title: 'Generate code', body: codegenPanel(current, scope()), okLabel: 'Close' }); }

function setupTopbar() {
  const envSel = document.getElementById('env-select'), themeSel = document.getElementById('theme-select');
  function fillEnv() { clear(envSel); envSel.append(el('option', { value: '', text: 'No environment' }));
    for (const e of state.environments) envSel.append(el('option', { value: e.id, ...(e.id === state.activeEnvId ? { selected: true } : {}) }, e.name)); }
  envSel.onchange = (e) => update((s) => s.activeEnvId = e.target.value || null);
  for (const t of THEMES) themeSel.append(el('option', { value: t, ...(t === state.theme ? { selected: true } : {}) }, t));
  themeSel.onchange = (e) => { document.documentElement.dataset.theme = e.target.value; update((s) => s.theme = e.target.value); };
  document.getElementById('btn-new-request').onclick = () => openRequest(newRequest());
  fillEnv(); subscribe(fillEnv);
}
function commands() {
  return [
    { title: 'New request', run: () => openRequest(newRequest()) },
    { title: 'Send request', run: doSend },
    { title: 'Generate code…', run: showCodegen },
    { title: 'Manage environments…', run: () => environmentManager(state, () => update(() => {})) },
    { title: 'Keyboard shortcuts', run: keyboardHelp },
    ...THEMES.map((t) => ({ title: `Theme: ${t}`, run: () => { document.documentElement.dataset.theme = t; update((s) => s.theme = t); } })),
  ];
}
function main() {
  loadStyles(); ensureSeed();
  document.documentElement.dataset.theme = state.theme || 'dark';
  setupTopbar(); renderSidebar(); renderMain();
  bindShortcuts({
    'mod+enter': doSend, 'mod+s': (e) => { doSave(); }, 'mod+n': () => openRequest(newRequest()),
    'mod+k': () => commandPalette(commands()), 'mod+/': keyboardHelp,
  });
  status('Ready.');
}
main();
