import { el, $ } from '../util/dom.js';
export function modal({ title, body, onOk, okLabel = 'OK' }) {
  const backdrop = el('div', { class: 'modal-backdrop' });
  const close = () => backdrop.remove();
  const box = el('div', { class: 'modal' }, [
    el('h3', { text: title, style: 'margin-bottom:12px' }),
    typeof body === 'string' ? el('div', { html: body }) : body,
    el('div', { style: 'display:flex;gap:8px;justify-content:flex-end;margin-top:16px' }, [
      el('button', { class: 'btn', text: 'Cancel', onclick: close }),
      el('button', { class: 'btn btn-primary', text: okLabel, onclick: () => { if (onOk?.(backdrop) !== false) close(); } }),
    ]),
  ]);
  backdrop.append(box);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.body.append(backdrop);
  const f = $('input,textarea,select', box); f?.focus();
  return { close, root: backdrop };
}
export function prompt(title, value = '') {
  return new Promise((resolve) => {
    const input = el('input', { class: 'input', value });
    modal({ title, body: input, onOk: () => resolve(input.value) });
  });
}
