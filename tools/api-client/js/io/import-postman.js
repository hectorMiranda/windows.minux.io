import { newCollection, newFolder } from '../model/collection.js';
import { newRequest } from '../model/request.js';
// Import a Postman Collection v2.1 document into our cleaner tree.
export function importPostman(doc) {
  const col = newCollection(doc.info?.name || 'Imported');
  col.description = doc.info?.description || '';
  (doc.item || []).forEach((it) => col.children.push(convert(it)));
  return col;
}
function convert(item) {
  if (item.request) {
    const r = item.request;
    const url = typeof r.url === 'string' ? r.url : (r.url?.raw || '');
    const req = newRequest({ name: item.name, method: r.method || 'GET', url });
    req.headers = (r.header || []).map((h) => ({ enabled: !h.disabled, key: h.key, value: h.value }));
    if (r.body?.raw) req.body = { mode: 'raw', raw: r.body.raw, rawType: 'json' };
    return req;
  }
  const folder = newFolder(item.name || 'Folder');
  (item.item || []).forEach((c) => folder.children.push(convert(c)));
  return folder;
}
