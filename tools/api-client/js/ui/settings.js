import { el } from '../util/dom.js';
import { modal } from './modal.js';
// Persisted user settings (timeout, follow redirects, wrap).
export const DEFAULT_SETTINGS = { timeoutMs: 30000, followRedirects: true, wrapBody: true, prettyJson: true };
export function settingsDialog(settings, onSave) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const num = el('input', { class: 'input', type: 'number', value: s.timeoutMs, oninput: (e) => s.timeoutMs = +e.target.value });
  const follow = el('input', { type: 'checkbox', ...(s.followRedirects ? { checked: true } : {}), onchange: (e) => s.followRedirects = e.target.checked });
  const wrap = el('input', { type: 'checkbox', ...(s.wrapBody ? { checked: true } : {}), onchange: (e) => s.wrapBody = e.target.checked });
  const body = el('div', {}, [
    el('label', {}, ['Timeout (ms)', num]),
    el('label', { style: 'display:flex;gap:8px;margin-top:8px' }, [follow, 'Follow redirects']),
    el('label', { style: 'display:flex;gap:8px;margin-top:8px' }, [wrap, 'Wrap response body']),
  ]);
  modal({ title: 'Settings', body, onOk: () => onSave(s) });
}
