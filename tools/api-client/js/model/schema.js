// Version tag + lightweight validation/migration for persisted documents.
export const SCHEMA_VERSION = 1;
export function validateCollection(c) {
  const errors = [];
  if (!c || typeof c !== 'object') errors.push('not an object');
  if (c && c.type !== 'collection') errors.push('root.type must be \'collection\'');
  if (c && !Array.isArray(c.children)) errors.push('children must be an array');
  return { ok: errors.length === 0, errors };
}
export function migrate(doc) {
  let d = doc;
  if (!d.schemaVersion) d = { ...d, schemaVersion: SCHEMA_VERSION };
  return d;
}
