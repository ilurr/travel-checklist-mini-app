import { createRouter, createWebHashHistory } from 'vue-router'
import PackingPage from '../views/PackingPage.vue'
import SharedView from '../views/SharedView.vue'

const routes = [
  { path: '/', name: 'home', component: PackingPage },
  { path: '/shared/:id', name: 'shared', component: SharedView },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
