import { el, clear } from '../util/dom.js';
import { bytes, ms } from '../util/format.js';
import { tryParse, pretty, isJsonContentType } from '../util/json.js';
import { headerGet } from '../http/headers.js';

export function responseViewer(res) {
  const root = el('div', { class: 'split' });
  let tab = 'body';
  const statusKind = res.networkError ? 'err' : res.status < 300 ? 'ok' : res.status < 400 ? 'warn' : 'err';
  const meta = el('div', { style: 'display:flex;gap:16px;padding:10px 16px;align-items:center;border-bottom:1px solid var(--border)' }, [
    el('span', { class: 'badge', style: `background:var(--${statusKind});color:#06121f`,
      text: res.networkError ? 'ERR' : `${res.status} ${res.statusText || ''}`.trim() }),
    el('span', { style: 'color:var(--fg-dim)', text: ms(res.durationMs) }),
    el('span', { style: 'color:var(--fg-dim)', text: bytes(res.size) }),
  ]);
  const tabbar = el('div', { class: 'tabs' });
  const panel = el('div', { class: 'pane', style: 'padding:0' });

  function paint() {
    clear(tabbar);
    for (const [id, label] of [['body','Body'],['headers',`Headers (${Object.keys(res.headers||{}).length})`],['raw','Raw']]) {
      tabbar.append(el('button', { class: `tab ${tab === id ? 'active' : ''}`, onclick: () => { tab = id; paint(); } }, label));
    }
    clear(panel); panel.append(render());
  }
  function render() {
    if (res.networkError) return el('pre', { class: 'code err', style: 'padding:16px;color:var(--err)', text: res.error });
    if (tab === 'headers') {
      const t = el('table', { style: 'width:100%;border-collapse:collapse' });
      for (const [k, v] of Object.entries(res.headers || {})) {
        t.append(el('tr', {}, [el('td', { style: 'padding:4px 16px;color:var(--accent);vertical-align:top', text: k }),
          el('td', { style: 'padding:4px 16px;word-break:break-all', text: v })]));
      }
      return t;
    }
    if (tab === 'raw') return el('pre', { class: 'code', style: 'padding:16px;white-space:pre-wrap;word-break:break-all', text: res.body });
    const ct = headerGet(res.headers || {}, 'content-type') || '';
    if (isJsonContentType(ct)) {
      const p = tryParse(res.body);
      if (p.ok) return el('pre', { class: 'code', style: 'padding:16px', text: pretty(p.value) });
    }
    return el('pre', { class: 'code', style: 'padding:16px;white-space:pre-wrap;word-break:break-all', text: res.body });
  }
  root.append(meta, tabbar, panel);
  paint();
  return root;
}
