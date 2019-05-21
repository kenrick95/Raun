import { readable, writable } from 'svelte/store';
import { ProjectName, ProjectSubdomain } from './GlobalConfig';
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
 *   [revid: number]: score,
 * }
 */
let revScores = {};
export const Ores = readable(revScores, (set) => {
  ProjectName.subscribe((projectName) => {
    ProjectSubdomain.subscribe((projectSubdomain) => {
      const dbName =
        projectSubdomain === 'www'
          ? projectName + 'wiki'
          : projectSubdomain + 'wiki';

      async function processQueueChunk(revidsToQuery) {
        const response = await fetch(
          ENDPOINT.replace('{PROJECT}', dbName) +
            '?models=damaging&revids=' +
            revidsToQuery.join('|')
        );
        if (!response.ok) {
          console.warn('[ORES] error', response);
        }
        const data = await response.json();
        for (const revid of revidsToQuery) {
          const value = data[dbName]['scores'][revid]['damaging']['score'];
          if (value != null) {
            revScores[revid] = value.probability.true;
          } else {
            console.warn('[ORES] error data', data);
          }
        }
      }
      async function processQueue(revidsToQuery) {
        const chunkedRevids = splitArrayIntoChunks(revidsToQuery, 100);
        for (const revids of chunkedRevids) {
          await processQueueChunk(revids);
        }
      }

      async function flushQueue(revids) {
        if (!revids || revids.length < 1) {
          return;
        }
        const revidsToQuery = [];
        for (const revid of revids) {
          if (!revScores.hasOwnProperty(revid)) {
            revidsToQuery.push(revid);
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
  });
});

/**
 * Write revid here
 *
 * New events at the front
 */
export const OresQueue = writable([]);
