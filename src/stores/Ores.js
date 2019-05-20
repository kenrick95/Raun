import { readable, writable } from 'svelte/store';
import { ProjectName, ProjectSubdomain } from './GlobalConfig';
import { debounce } from '../utils/debounce';

const ENDPOINT = 'https://ores.wikimedia.org/v3/scores/{PROJECT}/';

// ?models=damaging
// ?revids = revid|revid

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

        const response = await fetch(
          ENDPOINT.replace('{PROJECT}', dbName) +
            '?models=damaging&revids=' +
            revidsToQuery.join('|')
        );
        const data = await response.json();
        for (const revid of revidsToQuery) {
          const value = data[dbName]['scores'][revid]['damaging']['score'];
          revScores[revid] = value.probability.true;
        }

        set(revScores);
      }
      const handleQueueSubscribed = debounce(flushQueue, 2000, { maxDebounceCount: 10 });
      OresQueue.subscribe(handleQueueSubscribed);
    });
  });
});

// Write revid here
export const OresQueue = writable([]);
