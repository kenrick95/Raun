// Locale, ProjectSubdomain, ProjectName
import { writable } from 'svelte/store';

export const Locale = writable(window.LOCALE);
export const ProjectSubdomain = writable(window.PROJECT_SUBDOMAIN);
export const ProjectName = writable(window.PROJECT_NAME);
