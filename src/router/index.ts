import { createRouter, createWebHashHistory } from 'vue-router'
import HttpClient from '../views/HttpClient.vue'

const routes = [
  {
    path: '/',
    name: 'HttpClient',
    component: HttpClient
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router