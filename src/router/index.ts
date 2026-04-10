import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'soundscape',
      component: App,
    },
  ],
});

router.beforeEach((to) => {
  to.query.v as string | undefined;
  to.query.s as string | undefined;
});

export default router;
