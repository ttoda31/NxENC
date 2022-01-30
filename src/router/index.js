import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/nxenc',
    name: 'NxEnc',
    component: () => import(/* webpackChunkName: "nxenc" */ '../views/NxEnc.vue')
  },
  {
    path: '/noenc',
    name: 'NoEnc',
    component: () => import(/* webpackChunkName: "noenc" */ '../views/NoEnc.vue')
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
