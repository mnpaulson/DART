import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import App from './App'
import router from './router'
import store from './store'
import Sky from "../sky.js"
import { credentials } from "../credentials.js"

Vue.component('Snackbar', require('./components/Snackbar.vue').default);


Vue.use(Sky, credentials);

// Vue.use(Vuetify)
Vue.use(Vuetify, {
  theme: {
    primary: '#6cc5e7',
    secondary: '#779a1b',
    accent: '#0b5157',
    success: '#94d621',
    info: '#eda918'
  }
})

var Snackbar = {
  status: null,
  msg: null,
  type: null,
  setAlert(status, type, msg) {
      this.status = status;
      this.msg = msg;
      this.type = type;       
  }
};

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false



/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  data: {
    Sky: Sky,
    Snackbar: Snackbar
  },
  template: '<App/>'
}).$mount('#app')
