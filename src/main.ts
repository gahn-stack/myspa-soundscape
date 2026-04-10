import '@/assets/styles/index.css';
import { createPinia } from 'pinia';
import { type Component, createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import router from './router';

const app = createApp(App as Component);
app.use(createPinia());
app.use(i18n);
app.use(router);
app.mount('#app');
