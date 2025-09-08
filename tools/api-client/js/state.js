// Central observable store. Minimal pub/sub; the UI subscribes to slices.
import * as storage from './storage.js';
import { newCollection } from './model/collection.js';
import { newEnvironment } from './model/environment.js';

const listeners = new Set();
export const state = {
  collections: storage.load('collections', []),
  environments: storage.load('environments', []),
  activeEnvId: storage.load('activeEnvId', null),
  history: storage.load('history', []),
  theme: storage.load('theme', 'dark'),
  openRequest: null,
};

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit() { for (const fn of listeners) fn(state); }

export function persist() {
  storage.save('collections', state.collections);
  storage.save('environments', state.environments);
  storage.save('activeEnvId', state.activeEnvId);
  storage.save('history', state.history.slice(0, 200));
  storage.save('theme', state.theme);
}
export function update(mutator) { mutator(state); persist(); emit(); }

export function ensureSeed() {
  if (state.collections.length === 0) state.collections.push(newCollection('My Workspace'));
  if (state.environments.length === 0) {
    const e = newEnvironment('Local');
    e.values.push({ enabled: true, key: 'base_url', value: 'http://localhost:3000' });
    state.environments.push(e);
    state.activeEnvId = e.id;
  }
  persist();
}
