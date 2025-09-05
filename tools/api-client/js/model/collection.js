import { uuid } from '../util/uuid.js';
// A collection is a tree of folders and requests. Cleaner than Postman's:
// every node has a stable id, a type, and an ordered children array.
export function newCollection(name = 'New Collection') {
  return { id: uuid(), type: 'collection', name, description: '', children: [], variables: [] };
}
export function newFolder(name = 'New Folder') {
  return { id: uuid(), type: 'folder', name, children: [] };
}
export function walk(node, fn, parent = null) {
  fn(node, parent);
  for (const c of node.children || []) walk(c, fn, node);
}
export function findNode(root, id) {
  let found = null;
  walk(root, (n) => { if (n.id === id) found = n; });
  return found;
}
export function removeNode(root, id) {
  walk(root, (n) => {
    if (!n.children) return;
    const idx = n.children.findIndex((c) => c.id === id);
    if (idx >= 0) n.children.splice(idx, 1);
  });
}
