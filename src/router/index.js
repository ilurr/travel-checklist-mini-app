import { createRouter, createWebHashHistory } from 'vue-router'
import PackingPage from '../views/PackingPage.vue'

const routes = [
  { path: '/', name: 'home', component: PackingPage },
  { path: '/shared/:id', name: 'shared', component: PackingPage },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
