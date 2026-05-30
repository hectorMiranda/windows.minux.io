import { el } from '../util/dom.js';
import { modal } from './modal.js';
export const VERSION = '0.1.0';
export function about() {
  modal({ title: 'Minux API Studio', okLabel: 'Close', body: el('div', {}, [
    el('p', { text: `Version ${VERSION}` }),
    el('p', { style: 'color:var(--fg-dim);margin-top:6px', text: 'An open, file-based, hackable API workbench for the Minux platform.' }),
  ]) });
}
