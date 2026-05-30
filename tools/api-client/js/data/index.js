// Reference datasets used for tooltips, validation hints and dropdowns.
import { HTTP_STATUS } from './http-status.js';
import { MIME_TYPES } from './mime-types.js';
import { HEADER_REFERENCE } from './header-reference.js';
export { HTTP_STATUS, MIME_TYPES, HEADER_REFERENCE };
export function statusInfo(code) { return HTTP_STATUS.find((s) => s.code === code) || null; }
export function mimeFor(ext) { const m = MIME_TYPES.find((x) => x.ext === ext); return m ? m.type : null; }
export function headerInfo(name) { return HEADER_REFERENCE.find((h) => h.name.toLowerCase() === String(name).toLowerCase()) || null; }
