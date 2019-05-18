import { readable } from 'svelte/store';
import { Locale } from './GlobalConfig';

const ENDPOINT = 'messages/{LOCALE}.json';
let messages = {};

export const t = readable({}, (set) => {
  Locale.subscribe(async (locale) => {
    const response = await fetch(ENDPOINT.replace('{LOCALE}', locale));
    messages = await response.json();
    set(messages);
  });
});
