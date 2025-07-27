import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import Test from '@/views/test/test.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Test',
    component: Test
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
