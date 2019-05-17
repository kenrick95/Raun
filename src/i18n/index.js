import { readable } from 'svelte/store';

const ENDPOINT = 'messages/{LOCALE}.json';
let messages = {};

function createT() {
  const { subscribe } = readable(
    {},
    //@ts-ignore
    async (set) => {
      const response = await fetch(ENDPOINT.replace('{LOCALE}', window.LOCALE));
      messages = await response.json();
      set(messages);
    }
  );
  return {
    subscribe
  };
}
export const t = createT();
