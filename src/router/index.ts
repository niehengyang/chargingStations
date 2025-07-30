import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import List from '@/views/stations/List.vue';
import Index from '@/views/home/Index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Index
  },
  {
    path: '/list',
    name: 'List',
    component: List
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
