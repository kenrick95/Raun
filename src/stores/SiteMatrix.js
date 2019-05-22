import { readable } from 'svelte/store';

const ENDPOINT = 'api/sitematrix';

export const SiteMatrix = readable([], async (set) => {
  const response = await fetch(ENDPOINT);
  const data = await response.json();
  set(data);
});
