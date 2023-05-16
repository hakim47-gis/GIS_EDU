import Vue from 'vue'
import Router from 'vue-router'
import Index from "@/components/Index"
import XiBeiDiQv from '@/components/XiBeiDiQv'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '简介',
      component: Index
    },
    {
      path: '/xibeidiqv',
      name: '西北地区',
      component: XiBeiDiQv
    }
  ]
})


