import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
  props: {
    locale: document.documentElement.lang || 'en'
  }
});

export default app;
