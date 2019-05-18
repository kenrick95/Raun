import { readable, writable } from 'svelte/store';
import { ProjectName, ProjectSubdomain } from './GlobalConfig';
import { debounce } from '../utils/debounce';

const ENDPOINT = 'https://ores.wikimedia.org/v3/{PROJECT}/';

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
        const revidsToQuery = [];
        for (const revid of revids) {
          if (!revScores.hasOwnProperty(revid)) {
            revidsToQuery.push(revid);
          }
        }
        const response = await fetch(
          ENDPOINT.replace('{PROJECT}', dbName) +
            '?models=damaging&revids=' +
            revidsToQuery.join('|')
        );
        const data = await response.json();
        for (const revid of revidsToQuery) {
          // TODO depend on `data` structure
          revScores[revid] = data[revid].probability.true;
        }

        set(revScores);
        // Flush the queue
        OresQueue.set([]);
      }
      const handleQueueSubscribed = debounce(flushQueue, 200);
      OresQueue.subscribe(handleQueueSubscribed);
    });
  });
});

// Write revid here
export const OresQueue = writable([]);
