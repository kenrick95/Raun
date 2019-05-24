import { readable } from 'svelte/store';
import { DbNames } from './GlobalConfig';

const ENDPOINT_ADMIN = './api/get_sysops';
const ENDPOINT_EDITORS = './api/get_editors';

/**
 * Store have this shape:
 * {
 *   [dbName: string]: Set<string>
 * }
 */
function createStore(ENDPOINT) {
  return readable({}, (set) => {
    DbNames.subscribe(async (dbNames) => {
      const response = await fetch(ENDPOINT + '?dbname=' + dbNames.join('|'));
      const data = await response.json();

      const admins = {};
      for (const dbName of dbNames) {
        const adminUsernames = data[dbName].map((user) => user.name);
        admins[dbName] = new Set(adminUsernames);
      }
      set(admins);
    });
  });
}

export const Admins = createStore(ENDPOINT_ADMIN);

export const Editors = createStore(ENDPOINT_EDITORS);
