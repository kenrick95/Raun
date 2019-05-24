import { writable } from "svelte/store";

export const DeferImmediateCommitEvents = writable(true);
export const DisplayEventsFromBot = writable(false);