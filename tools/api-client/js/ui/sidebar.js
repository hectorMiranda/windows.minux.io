import { el, clear } from '../util/dom.js';
import { walk } from '../model/collection.js';
// Renders collections tree + recent history. onOpen(request), onNew().
export function sidebar(container, state, handlers) {
  clear(container);
  const head = el('div', { style: 'display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--border)' }, [
    el('strong', { text: 'Collections', style: 'flex:1' }),
    el('button', { class: 'btn btn-ghost', title: 'New collection', text: '+', onclick: () => handlers.onNewCollection() }),
  ]);
  const tree = el('div', { class: 'pane', style: 'padding:6px 0' });
  for (const col of state.collections) tree.append(renderNode(col, 0));
  function renderNode(node, depth) {
    const isReq = node.type === 'request' || node.method;
    const row = el('div', { class: 'tree-row', style: `padding-left:${8 + depth * 14}px`,
      onclick: () => { if (isReq) handlers.onOpen(node); } }, [
      isReq ? el('span', { class: `method method-${(node.method||'get').toLowerCase()}`, text: node.method || 'GET' })
            : el('span', { text: '▸', style: 'color:var(--fg-dim)' }),
      el('span', { text: ' ' + node.name }),
    ]);
    const box = el('div', {}, [row]);
    if (!isReq) for (const c of node.children || []) box.append(renderNode(c, depth + 1));
    return box;
  }
  const histHead = el('div', { style: 'padding:10px 12px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)' },
    [el('strong', { text: 'History' })]);
  const hist = el('div', { class: 'pane', style: 'padding:6px 0' });
  for (const h of (state.history || []).slice(0, 25)) {
    hist.append(el('div', { class: 'tree-row', style: 'padding-left:10px', onclick: () => handlers.onOpenHistory(h) }, [
      el('span', { class: `method method-${(h.method||'get').toLowerCase()}`, text: h.method }),
      el('span', { style: 'color:var(--fg-dim);font-size:12px', text: ' ' + (h.url || '').slice(0, 32) }),
    ]));
  }
  container.append(head, tree, histHead, hist);
}
