import { readable } from 'svelte/store';
import { Locale } from './GlobalConfig';
import English from '../../messages/en.json';

const ENDPOINT = 'messages/{LOCALE}.json';
let messages = {};
let currentLocale = 'en';

export const t = readable(English, (set) => {
  Locale.subscribe(async (locale) => {
    if (locale !== currentLocale) {
      const response = await fetch(ENDPOINT.replace('{LOCALE}', locale));
      messages = await response.json();
      set(messages);
    }
  });
});
