import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home-view',
      component: require('@/components/Home').default
    },
    {
      path: '/invoice',
      name: 'invoice',
      component: require('@/components/Invoice').default
    },
    {
      path: '/funds',
      name: 'funds',
      component: require('@/components/Funds').default
    },    
    {
      path: '/contactinfo',
      name: 'ContactInfo',
      component: require('@/components/ContactInfo').default
    },
    {
      path: '/attachments',
      name: 'Attachments',
      component: require('@/components/Attachments').default
    },
    {
      path: '/giftdata',
      name: 'Gift Data',
      component: require('@/components/Giftdata').default
    },
    {
      path: '/config',
      name: 'Config',
      component: require('@/components/Config').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
