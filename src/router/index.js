import Vue from 'vue'
import Router from 'vue-router'
import Index from "@/components/Index"
import XiBeiDiQv from '@/components/XiBeiDiQv'
import Query from "@/components/course/Query"
import Render from "@/components/course/Render"

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
    },
    {
      path: '/query',
      name: 'openlayers查询',
      component: Query
    },
    {
      path: '/render',
      name: 'openlayers渲染',
      component: Render
    },
  ]
})


