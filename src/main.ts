import { createApp } from 'vue';
import './style.css';
import store from './store/index';
import App from './App.vue';
import router from './router/index'


const app = createApp(App);
app.use(store).use(router).mount('#app');
