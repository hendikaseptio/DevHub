import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<import('firebase/auth').User | null>} */
export const user = writable(null);
export const authLoading = writable(true);

export const theme = writable('system'); // 'light', 'dark', 'system'
export const accentColor = writable('indigo'); // 'indigo', 'emerald', 'rose', 'amber'
