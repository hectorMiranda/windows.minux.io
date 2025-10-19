import { newCollection, newFolder } from '../model/collection.js';
import { newRequest } from '../model/request.js';
// Build a collection from an OpenAPI 3 paths object.
export function importOpenApi(doc) {
  const base = (doc.servers?.[0]?.url) || '{{base_url}}';
  const col = newCollection(doc.info?.title || 'OpenAPI');
  col.description = doc.info?.description || '';
  for (const [path, methods] of Object.entries(doc.paths || {})) {
    const folder = newFolder(path);
    for (const [method, op] of Object.entries(methods)) {
      if (!['get','post','put','patch','delete','head','options'].includes(method)) continue;
      folder.children.push(newRequest({ name: op.summary || `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(), url: base + path }));
    }
    col.children.push(folder);
  }
  return col;
}
