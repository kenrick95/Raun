import { writable } from 'svelte/store';

export const Locale = writable(window.LOCALE);
export const DbNames = writable(window.DBNAMES);