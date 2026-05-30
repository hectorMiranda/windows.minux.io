import { el } from '../util/dom.js';
const wrap = () => document.getElementById('toasts');
export function toast(msg, kind = 'info', ms = 2600) {
  const node = el('div', { class: `toast ${kind === 'error' ? 'err' : ''}`, text: msg });
  wrap().append(node);
  setTimeout(() => { node.style.opacity = '0'; setTimeout(() => node.remove(), 200); }, ms);
}
export function status(msg) { const s = document.getElementById('status-msg'); if (s) s.textContent = msg; }
