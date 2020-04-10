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
const ENDPOINT_SCORES = 'https://ores.wikimedia.org/v3/scores/{PROJECT}/';

const ENPOINT_MODELS = 'https://ores.wikimedia.org/v3/scores/';

const modelsToUse = {};

async function initModels() {
  const response = await fetch(ENPOINT_MODELS);
  const data = await response.json();
  for (const dbName in data) {
    if (data[dbName]['models']['damaging']) {
      modelsToUse[dbName] = 'damaging';
    } else if (data[dbName]['models']['reverted']) {
      modelsToUse[dbName] = 'reverted';
    }
  }
}

/**
 * @var {Object} revScores
 * {
 *   [dbname + revid: string]: score,
 * }
 */
let revScores = {};
export const Ores = readable(revScores, async (set) => {
  await initModels();

  async function processQueueChunk(dbName, revidsToQuery) {
    const model = modelsToUse[dbName];
    if (!model) {
      console.warn('[ORES] dbName is not supported by ORES', dbName);
    }
    const response = await fetch(
      ENDPOINT_SCORES.replace('{PROJECT}', dbName) +
        '?models=' +
        model +
        '&revids=' +
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
      const value = data[dbName]['scores'][revid][modelsToUse[dbName]]['score'];
      if (value != null) {
        revScores[revid] = value.probability.true;
      } else {
        console.warn('[ORES] error data value', data, dbName, revid);
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
    if (revidsToQuery.length < 1) {
      return;
    }
    // Flush the queue
    OresQueue.set([]);

    await processQueue(revidsToQuery);

    set(revScores);
  }
  const handleQueueSubscribed = debounce(flushQueue, 2000, {
    maxDebounceCount: 10,
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
