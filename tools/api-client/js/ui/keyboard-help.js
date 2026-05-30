import { el } from '../util/dom.js';
import { SHORTCUTS } from './keyboard.js';
import { modal } from './modal.js';
export function keyboardHelp() {
  const body = el('div', {});
  for (const [keys, desc] of SHORTCUTS) {
    body.append(el('div', { style: 'display:flex;justify-content:space-between;padding:5px 0' }, [
      el('span', { text: desc }),
      el('kbd', { style: 'font-family:var(--font-mono);background:var(--btn);padding:2px 7px;border-radius:4px',
        text: keys.replace('mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl') }),
    ]));
  }
  modal({ title: 'Keyboard shortcuts', body, okLabel: 'Close' });
}
