import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import List from '@/views/stations/List.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'List',
    component: List
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
