import Vue from 'vue';
import VueApollo from 'vue-apollo'
import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css'

import vuetify from './plugins/vuetify'
import App from './App.vue';
import router from './router';
import store from './store/store';

import { createProvider } from './vue-apollo'

Vue.config.productionTip = false;

Vue.use(VueApollo)
Vue.use(Vuesax, {

})

new Vue({
    router,
    store,
    vuetify,
    apolloProvider: createProvider(),
    render: h => h(App)
} as any).$mount('#app');
