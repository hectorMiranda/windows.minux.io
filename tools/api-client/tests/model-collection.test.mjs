import { test, ok, eq } from './harness.mjs';
import { newCollection, newFolder, findNode, removeNode } from '../js/model/collection.js';
test('tree find/remove', () => {
  const c = newCollection('c'); const f = newFolder('f'); c.children.push(f);
  ok(findNode(c, f.id));
  removeNode(c, f.id); eq(c.children.length, 0);
});
