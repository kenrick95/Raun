import { readable, writable } from 'svelte/store';
import { debounce, splitArrayIntoChunks } from '../utils/debounce';

/**
 * ORES v3 Endpoint
 *
 * @see https://ores.wikimedia.org/v3/
 *
 * GET Query parameters
 *
 * - models=damaging
 * - revids=revid|revid
 */
const ENDPOINT = 'https://ores.wikimedia.org/v3/scores/{PROJECT}/';

/**
 * @var {Object} revScores
 * {
 *   [dbname + revid: string]: score,
 * }
 */
let revScores = {};
export const Ores = readable(revScores, (set) => {
  async function processQueueChunk(dbName, revidsToQuery) {
    const response = await fetch(
      ENDPOINT.replace('{PROJECT}', dbName) +
        '?models=damaging&revids=' +
        revidsToQuery.join('|')
    );
    if (!response.ok) {
      console.warn('[ORES] error', response);
      return;
    }
    const data = await response.json();
    if (data.error) {
      console.warn('[ORES] error data', data);
      return;
    }
    for (const revid of revidsToQuery) {
      const value = data[dbName]['scores'][revid]['damaging']['score'];
      if (value != null) {
        revScores[revid] = value.probability.true;
      } else {
        console.warn('[ORES] error data value', data, value);
      }
    }
  }
  async function processQueue(revidsToQuery) {
    // Group by dbName
    const groupedRevIds = {};
    for (const data of revidsToQuery) {
      const { revid, dbName } = data;
      if (groupedRevIds.hasOwnProperty(dbName)) {
        groupedRevIds[dbName].push(revid);
      } else {
        groupedRevIds[dbName] = [revid];
      }
    }

    // Process by dbname
    for (const [dbName, revidsToQuery] of Object.entries(groupedRevIds)) {
      const chunkedRevids = splitArrayIntoChunks(revidsToQuery, 100);
      for (const revids of chunkedRevids) {
        await processQueueChunk(dbName, revids);
      }
    }
  }

  async function flushQueue(queue) {
    if (!queue || queue.length < 1) {
      return;
    }
    const revidsToQuery = [];
    for (const data of queue) {
      const { revid, dbName } = data;
      if (!revScores.hasOwnProperty(dbName + '' + revid)) {
        revidsToQuery.push({ revid, dbName });
      }
    }
    if (!revidsToQuery || revidsToQuery.length < 1) {
      return;
    }
    // Flush the queue
    OresQueue.set([]);

    await processQueue(revidsToQuery);

    set(revScores);
  }
  const handleQueueSubscribed = debounce(flushQueue, 2000, {
    maxDebounceCount: 10
  });
  OresQueue.subscribe(handleQueueSubscribed);
});

/**
 * Write revid here
 *
 * New events at the front
 *
 * { revid, dbName }
 */
export const OresQueue = writable([]);
